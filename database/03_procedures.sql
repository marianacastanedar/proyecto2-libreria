-- sp1: registrar venta completa con rollback en exception
CREATE OR REPLACE FUNCTION fn_registrar_venta(
    p_nit         VARCHAR,
    p_metodo_pago VARCHAR,
    p_id_empleado INTEGER,
    p_productos   JSONB
) RETURNS TABLE(id_venta INTEGER, mensaje TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_cliente  INTEGER;
    v_id_venta    INTEGER;
    v_subtotal    DECIMAL(10,2) := 0;
    v_item        JSONB;
    v_id_producto INTEGER;
    v_cantidad    INTEGER;
    v_precio      DECIMAL(10,2);
    v_stock       INTEGER;
BEGIN
    -- buscar o crear cliente
    SELECT id INTO v_id_cliente FROM cliente WHERE nit = p_nit;
    IF NOT FOUND THEN
        INSERT INTO cliente (nit, nombre)
        VALUES (p_nit, 'Cliente ' || p_nit)
        RETURNING id INTO v_id_cliente;
    END IF;

    -- verificar stock y calcular subtotal
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_productos)
    LOOP
        v_id_producto := (v_item->>'id_producto')::INTEGER;
        v_cantidad    := (v_item->>'cantidad')::INTEGER;
        v_precio      := (v_item->>'precio_unitario')::DECIMAL;

        SELECT stock INTO v_stock FROM producto WHERE id = v_id_producto;
        IF v_stock < v_cantidad THEN
            RAISE EXCEPTION 'stock insuficiente para producto id %', v_id_producto;
        END IF;

        v_subtotal := v_subtotal + (v_precio * v_cantidad);
    END LOOP;

    -- insertar venta
    INSERT INTO venta (fecha, metodo_pago, subtotal, total, id_empleado, id_cliente)
    VALUES (NOW(), p_metodo_pago, v_subtotal, v_subtotal, p_id_empleado, v_id_cliente)
    RETURNING id INTO v_id_venta;

    -- insertar detalles y descontar stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_productos)
    LOOP
        v_id_producto := (v_item->>'id_producto')::INTEGER;
        v_cantidad    := (v_item->>'cantidad')::INTEGER;
        v_precio      := (v_item->>'precio_unitario')::DECIMAL;

        INSERT INTO detalle_venta (cantidad, precio_unitario, id_venta, id_producto)
        VALUES (v_cantidad, v_precio, v_id_venta, v_id_producto);

        UPDATE producto SET stock = stock - v_cantidad WHERE id = v_id_producto;
    END LOOP;

    RETURN QUERY SELECT v_id_venta, 'venta registrada'::TEXT;

EXCEPTION WHEN OTHERS THEN
    -- rollback implicito del bloque
    RETURN QUERY SELECT 0::INTEGER, ('error: ' || SQLERRM)::TEXT;
END;
$$;

-- sp2: buscar o crear cliente, procedure con inout
CREATE OR REPLACE PROCEDURE sp_crear_o_buscar_cliente(
    IN    p_nit        VARCHAR,
    IN    p_nombre     VARCHAR,
    INOUT p_id_cliente INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT id INTO p_id_cliente FROM cliente WHERE nit = p_nit;
    IF NOT FOUND THEN
        INSERT INTO cliente (nit, nombre)
        VALUES (p_nit, COALESCE(p_nombre, 'Cliente ' || p_nit))
        RETURNING id INTO p_id_cliente;
    END IF;
EXCEPTION WHEN OTHERS THEN
    p_id_cliente := 0;
    RAISE WARNING 'error sp_crear_o_buscar_cliente: %', SQLERRM;
END;
$$;

-- sp3: verificar y actualizar stock
CREATE OR REPLACE FUNCTION fn_verificar_stock(
    p_id_producto INTEGER,
    p_cantidad    INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_stock  INTEGER;
    v_nombre VARCHAR;
BEGIN
    SELECT stock, nombre INTO v_stock, v_nombre
    FROM producto WHERE id = p_id_producto;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'producto id % no existe', p_id_producto;
    END IF;

    IF v_stock < p_cantidad THEN
        RAISE EXCEPTION 'stock insuficiente para "%": disponible %, requerido %',
            v_nombre, v_stock, p_cantidad;
    END IF;

    UPDATE producto SET stock = stock - p_cantidad WHERE id = p_id_producto;
    RETURN TRUE;

EXCEPTION WHEN OTHERS THEN
    RAISE;
END;
$$;

-- sp4: cancelar pedido proveedor
CREATE OR REPLACE FUNCTION fn_cancelar_pedido(
    p_id_pedido INTEGER
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado VARCHAR;
BEGIN
    SELECT estado INTO v_estado FROM pedido_proveedor WHERE id = p_id_pedido;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'pedido id % no existe', p_id_pedido;
    END IF;

    IF v_estado = 'cancelado' THEN
        RETURN 'pedido ya cancelado';
    END IF;

    IF v_estado = 'recibido' THEN
        RAISE EXCEPTION 'no se puede cancelar pedido ya recibido';
    END IF;

    UPDATE pedido_proveedor SET estado = 'cancelado' WHERE id = p_id_pedido;
    RETURN 'pedido cancelado';

EXCEPTION WHEN OTHERS THEN
    RETURN 'error: ' || SQLERRM;
END;
$$;

-- sp5: reporte ventas por rango de fechas
CREATE OR REPLACE FUNCTION fn_reporte_ventas_periodo(
    p_fecha_inicio DATE,
    p_fecha_fin    DATE
) RETURNS TABLE(
    empleado     TEXT,
    rol          TEXT,
    num_ventas   BIGINT,
    total_ventas NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        (e.nombre || ' ' || e.apellido)::TEXT,
        r.nombre::TEXT,
        COUNT(v.id),
        COALESCE(SUM(v.total), 0)
    FROM empleado e
    JOIN rol r ON e.id_rol = r.id
    LEFT JOIN venta v ON v.id_empleado = e.id
        AND v.fecha::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY e.id, e.nombre, e.apellido, r.nombre
    ORDER BY total_ventas DESC;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'error en reporte: %', SQLERRM;
END;
$$;
