-- 5 roles en el dbms
CREATE ROLE rol_cajero;
CREATE ROLE rol_vendedor;
CREATE ROLE rol_gerente_personal;
CREATE ROLE rol_responsable_marketing;
CREATE ROLE rol_gerente_financiero;

-- cajero: ventas y clientes
GRANT SELECT, INSERT, UPDATE ON cliente       TO rol_cajero;
GRANT SELECT, INSERT         ON venta         TO rol_cajero;
GRANT SELECT, INSERT         ON detalle_venta TO rol_cajero;
GRANT SELECT                 ON producto      TO rol_cajero;
GRANT SELECT                 ON empleado      TO rol_cajero;
GRANT SELECT                 ON rol           TO rol_cajero;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_cajero;

-- vendedor: productos ventas clientes
GRANT SELECT, INSERT, UPDATE ON producto          TO rol_vendedor;
GRANT SELECT, INSERT, UPDATE ON cliente           TO rol_vendedor;
GRANT SELECT, INSERT         ON venta             TO rol_vendedor;
GRANT SELECT, INSERT         ON detalle_venta     TO rol_vendedor;
GRANT SELECT                 ON categoria         TO rol_vendedor;
GRANT SELECT                 ON producto_categoria TO rol_vendedor;
GRANT SELECT                 ON empleado          TO rol_vendedor;
GRANT SELECT                 ON rol               TO rol_vendedor;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_vendedor;

-- gerente personal: empleados y roles
GRANT SELECT, INSERT, UPDATE, DELETE ON empleado TO rol_gerente_personal;
GRANT SELECT, INSERT, UPDATE, DELETE ON rol      TO rol_gerente_personal;
GRANT SELECT                         ON venta    TO rol_gerente_personal;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_gerente_personal;

-- responsable marketing: productos categorias proveedores
GRANT SELECT, INSERT, UPDATE, DELETE ON producto           TO rol_responsable_marketing;
GRANT SELECT, INSERT, UPDATE, DELETE ON categoria          TO rol_responsable_marketing;
GRANT SELECT, INSERT, UPDATE, DELETE ON producto_categoria TO rol_responsable_marketing;
GRANT SELECT, INSERT, UPDATE, DELETE ON proveedor          TO rol_responsable_marketing;
GRANT SELECT, INSERT, UPDATE, DELETE ON pedido_proveedor   TO rol_responsable_marketing;
GRANT SELECT, INSERT, UPDATE, DELETE ON detalle_pedido     TO rol_responsable_marketing;
GRANT SELECT                         ON venta              TO rol_responsable_marketing;
GRANT SELECT                         ON detalle_venta      TO rol_responsable_marketing;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_responsable_marketing;

-- gerente financiero: solo lectura
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rol_gerente_financiero;
REVOKE INSERT, UPDATE, DELETE ON empleado  FROM rol_gerente_financiero;
REVOKE INSERT, UPDATE, DELETE ON rol       FROM rol_gerente_financiero;
REVOKE INSERT, UPDATE, DELETE ON proveedor FROM rol_gerente_financiero;

-- asignar roles al usuario principal
GRANT rol_cajero                TO proy3;
GRANT rol_vendedor              TO proy3;
GRANT rol_gerente_personal      TO proy3;
GRANT rol_responsable_marketing TO proy3;
GRANT rol_gerente_financiero    TO proy3;
