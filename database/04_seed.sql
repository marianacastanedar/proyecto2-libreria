-- roles del negocio
INSERT INTO rol (nombre, horario, sueldo) VALUES
('cajero',                'Lunes a Sabado 9:00-18:00',  4500.00),
('vendedor',              'Lunes a Sabado 9:00-18:00',  4000.00),
('gerente_personal',      'Lunes a Viernes 8:00-17:00', 8000.00),
('responsable_marketing', 'Lunes a Viernes 8:00-17:00', 7500.00),
('gerente_financiero',    'Lunes a Viernes 8:00-17:00', 10000.00);

-- un usuario de prueba por rol
INSERT INTO empleado (nombre, apellido, direccion, password, id_rol) VALUES
('cajero_test',      'Test', 'Zona 1', 'pass123', 1),
('vendedor_test',    'Test', 'Zona 2', 'pass123', 2),
('rrhh_test',        'Test', 'Zona 3', 'pass123', 3),
('marketing_test',   'Test', 'Zona 4', 'pass123', 4),
('financiero_test',  'Test', 'Zona 5', 'pass123', 5);

-- empleados adicionales
INSERT INTO empleado (nombre, apellido, direccion, password, id_rol) VALUES
('Carlos',    'Mendez',    'Zona 1',  'pass123', 1),
('Maria',     'Lopez',     'Zona 10', 'pass123', 2),
('Jose',      'Garcia',    'Zona 5',  'pass123', 3),
('Ana',       'Martinez',  'Zona 7',  'pass123', 4),
('Luis',      'Hernandez', 'Zona 11', 'pass123', 5),
('Sofia',     'Perez',     'Zona 2',  'pass123', 1),
('Diego',     'Ramirez',   'Zona 13', 'pass123', 2),
('Valeria',   'Torres',    'Zona 6',  'pass123', 1),
('Andres',    'Flores',    'Zona 14', 'pass123', 2),
('Camila',    'Ruiz',      'Zona 3',  'pass123', 1),
('Pablo',     'Diaz',      'Zona 9',  'pass123', 2),
('Fernanda',  'Morales',   'Zona 15', 'pass123', 2),
('Roberto',   'Jimenez',   'Zona 4',  'pass123', 1),
('Isabella',  'Vargas',    'Zona 12', 'pass123', 2),
('Miguel',    'Castro',    'Zona 8',  'pass123', 2),
('Daniela',   'Ortiz',     'Zona 1',  'pass123', 1),
('Sebastian', 'Reyes',     'Zona 10', 'pass123', 2),
('Lucia',     'Mendoza',   'Zona 5',  'pass123', 4),
('Gabriel',   'Aguilar',   'Zona 7',  'pass123', 3),
('Natalia',   'Guzman',    'Zona 11', 'pass123', 2);

-- clientes
INSERT INTO cliente (nit, nombre, direccion) VALUES
('1234567-8', 'Juan Perez',     'Zona 1'),
('2345678-9', 'Laura Gomez',    'Zona 5'),
('3456789-0', 'Marco Solano',   'Zona 10'),
('4567890-1', 'Monica Galindo', 'Zona 7'),
('5678901-2', 'Carlos Vega',    'Zona 2'),
('6789012-3', 'Diana Pinto',    'Zona 11'),
('7890123-4', 'Andres Molina',  'Zona 13'),
('8901234-5', 'Rosa Castillo',  'Zona 6'),
('9012345-6', 'Fernando Rios',  'Zona 14'),
('0123456-7', 'Monica Herrera', 'Zona 3'),
('1357924-8', 'Pedro Salazar',  'Zona 9'),
('2468013-5', 'Carmen Ibarra',  'Zona 15'),
('3691472-6', 'Jorge Espinoza', 'Zona 4'),
('4812593-7', 'Rosa Melano',    'Zona 12'),
('5934826-1', 'Ernesto Pineda', 'Zona 8'),
('6057193-2', 'Mariana Cordova','Zona 1'),
('7180264-3', 'Alvaro Barrios', 'Zona 10'),
('8213475-4', 'Sandra Mejia',   'Zona 5'),
('9346586-5', 'Omar Pacheco',   'Zona 7'),
('0479697-6', 'Gloria Trejo',   'Zona 11'),
('1592708-7', 'Mario Escobar',  'Zona 2'),
('2615819-8', 'Silvia Cano',    'Zona 13'),
('3748920-9', 'Victor Zelaya',  'Zona 6'),
('4871031-0', 'Patricia Nava',  'Zona 14'),
('5994142-1', 'Eduardo Lara',   'Zona 3');

-- proveedores
INSERT INTO proveedor (nombre, telefono, correo, direccion) VALUES
('Editorial Anagrama',         '22341100', 'contacto@anagrama.com',   'Barcelona, España'),
('Ediciones Catedra',          '22341101', 'info@catedra.com',         'Madrid, España'),
('Fondo de Cultura Economica', '22341102', 'ventas@fce.com',           'Ciudad de Mexico'),
('Alianza Editorial',          '22341103', 'pedidos@alianza.com',      'Madrid, España'),
('Tusquets Editores',          '22341104', 'dist@tusquets.com',        'Barcelona, España'),
('Planeta Editorial',          '22341105', 'ventas@planeta.com',       'Barcelona, España'),
('Seix Barral',                '22341106', 'info@seixbarral.com',      'Barcelona, España'),
('Alfaguara',                  '22341107', 'pedidos@alfaguara.com',    'Madrid, España'),
('Debolsillo',                 '22341108', 'contacto@debolsillo.com',  'Madrid, España'),
('Penguin Random House',       '22341109', 'ventas@prh.com',           'Nueva York, EEUU'),
('Paidos Editorial',           '22341110', 'info@paidos.com',          'Barcelona, España'),
('Ediciones Siruela',          '22341111', 'pedidos@siruela.com',      'Madrid, España'),
('Grijalbo',                   '22341112', 'ventas@grijalbo.com',      'Barcelona, España'),
('Destino Editorial',          '22341113', 'info@destino.com',         'Barcelona, España'),
('Emece Editores',             '22341114', 'contacto@emece.com',       'Buenos Aires'),
('Sudamericana',               '22341115', 'pedidos@sudamericana.com', 'Buenos Aires'),
('Era Editorial',              '22341116', 'ventas@era.com',           'Ciudad de Mexico'),
('Siglo XXI',                  '22341117', 'info@siglo21.com',         'Ciudad de Mexico'),
('Lumen Editorial',            '22341118', 'pedidos@lumen.com',        'Barcelona, España'),
('Montena',                    '22341119', 'ventas@montena.com',       'Madrid, España'),
('Norma Editorial',            '22341120', 'contacto@norma.com',       'Bogota, Colombia'),
('Voluntad Editorial',         '22341121', 'info@voluntad.com',        'Bogota, Colombia'),
('Santillana',                 '22341122', 'pedidos@santillana.com',   'Madrid, España'),
('SM Editorial',               '22341123', 'ventas@sm.com',            'Madrid, España'),
('Vicens Vives',               '22341124', 'info@vicensvives.com',     'Barcelona, España');

-- categorias
INSERT INTO categoria (nombre) VALUES
('Ficcion'),('No ficcion'),('Poesia'),('Drama'),('Ciencia ficcion'),
('Terror'),('Romance'),('Historia'),('Filosofia'),('Psicologia'),
('Biografia'),('Autobiografia'),('Ensayo'),('Novela grafica'),('Infantil'),
('Juvenil'),('Clasicos'),('Literatura latinoamericana'),('Literatura europea'),
('Literatura anglosajona'),('Misterio'),('Thriller'),('Fantasia'),('Aventura'),
('Autoayuda'),('Ciencia'),('Arte');

-- productos
INSERT INTO producto (nombre, autor, isbn, editorial, anio, idioma, num_paginas, precio, stock) VALUES
('El extranjero',                     'Albert Camus',          '978-8420674592', 'Alianza',    1942, 'Espanol', 160,  89.00, 15),
('La peste',                          'Albert Camus',          '978-8420674608', 'Alianza',    1947, 'Espanol', 400,  95.00, 12),
('El mito de Sisifo',                 'Albert Camus',          '978-8420615929', 'Alianza',    1942, 'Espanol', 200,  85.00,  8),
('Crimen y castigo',                  'Fiodor Dostoievsky',    '978-8420674728', 'Alianza',    1866, 'Espanol', 720, 130.00, 10),
('El idiota',                         'Fiodor Dostoievsky',    '978-8420615882', 'Alianza',    1869, 'Espanol', 688, 125.00,  7),
('Los hermanos Karamazov',            'Fiodor Dostoievsky',    '978-8420615905', 'Alianza',    1880, 'Espanol',1000, 150.00,  5),
('La metamorfosis',                   'Franz Kafka',           '978-8437604572', 'Catedra',    1915, 'Espanol', 128,  79.00, 20),
('El proceso',                        'Franz Kafka',           '978-8437604589', 'Catedra',    1925, 'Espanol', 264,  89.00, 14),
('El castillo',                       'Franz Kafka',           '978-8437604596', 'Catedra',    1926, 'Espanol', 320,  95.00,  9),
('1984',                              'George Orwell',         '978-8499890944', 'Debolsillo', 1949, 'Espanol', 368,  99.00, 25),
('Rebelion en la granja',             'George Orwell',         '978-8499890951', 'Debolsillo', 1945, 'Espanol', 144,  79.00, 18),
('Cien anos de soledad',              'Gabriel Garcia Marquez','978-8497592208', 'Alfaguara',  1967, 'Espanol', 496, 120.00, 20),
('El amor en los tiempos del colera', 'Gabriel Garcia Marquez','978-8497592215', 'Alfaguara',  1985, 'Espanol', 496, 115.00, 15),
('Don Quijote de la Mancha',          'Miguel de Cervantes',   '978-8437622262', 'Catedra',    1605, 'Espanol',1376, 160.00,  6),
('Hamlet',                            'William Shakespeare',   '978-8437615752', 'Catedra',    1603, 'Espanol', 192,  75.00, 11),
('Romeo y Julieta',                   'William Shakespeare',   '978-8437615769', 'Catedra',    1597, 'Espanol', 208,  75.00, 13),
('El gran Gatsby',                    'F. Scott Fitzgerald',   '978-8490626054', 'Anagrama',   1925, 'Espanol', 208,  89.00, 16),
('Ficciones',                         'Jorge Luis Borges',     '978-8420633138', 'Alianza',    1944, 'Espanol', 224,  95.00, 10),
('Rayuela',                           'Julio Cortazar',        '978-8420633145', 'Alianza',    1963, 'Espanol', 600, 120.00,  8),
('Pedro Paramo',                      'Juan Rulfo',            '978-8437616858', 'Catedra',    1955, 'Espanol', 160,  79.00, 12),
('La casa de los espiritus',          'Isabel Allende',        '978-8497593601', 'Debolsillo', 1982, 'Espanol', 480, 110.00, 14),
('La insoportable levedad del ser',   'Milan Kundera',         '978-8490626061', 'Tusquets',   1984, 'Espanol', 320, 105.00,  9),
('Asi hablo Zaratustra',              'Friedrich Nietzsche',   '978-8437616865', 'Alianza',    1883, 'Espanol', 400,  95.00,  7),
('El ser y la nada',                  'Jean-Paul Sartre',      '978-8430916001', 'Alianza',    1943, 'Espanol', 720, 140.00,  4),
('Beloved',                           'Toni Morrison',         '978-8490628034', 'Ediciones B',1987, 'Espanol', 352,  99.00,  8),
('La divina comedia',                 'Dante Alighieri',       '978-8437623450', 'Catedra',    1320, 'Espanol', 960, 145.00,  5),
('En busca del tiempo perdido',       'Marcel Proust',         '978-8420615936', 'Alianza',    1913, 'Espanol', 800, 155.00,  3),
('Ulises',                            'James Joyce',           '978-8420615943', 'Alianza',    1922, 'Espanol',1000, 160.00,  4);

-- producto categoria
INSERT INTO producto_categoria (id_producto, id_categoria) VALUES
(1,1),(1,17),(1,19),(2,1),(2,17),(2,19),(3,9),(3,13),
(4,1),(4,17),(4,19),(5,1),(5,17),(6,1),(6,17),(7,1),(7,17),(7,19),
(8,1),(8,17),(9,1),(9,17),(10,1),(10,17),(10,20),(11,1),(11,17),(11,20),
(12,1),(12,17),(12,18),(13,1),(13,17),(13,18),(14,1),(14,17),(14,19),
(15,4),(15,17),(15,19),(16,4),(16,17),(16,19),(17,1),(17,17),(17,20),
(18,1),(18,17),(18,18),(19,1),(19,17),(19,18),(20,1),(20,17),(20,18),
(21,1),(21,17),(21,18),(22,1),(22,17),(22,19),(23,9),(23,17),(23,19),
(24,9),(24,13),(24,19),(25,1),(25,17),(25,20),(26,1),(26,17),(26,19),
(27,1),(27,17),(27,19),(28,1),(28,17),(28,19);

-- ventas
INSERT INTO venta (fecha, metodo_pago, subtotal, total, id_empleado, id_cliente) VALUES
('2026-01-05 10:30:00','efectivo', 89.00, 89.00,  6, 1),
('2026-01-07 11:00:00','tarjeta', 214.00,214.00,  7, 2),
('2026-01-10 14:15:00','efectivo', 99.00, 99.00, 14, 3),
('2026-01-12 09:45:00','tarjeta', 275.00,275.00, 16, 4),
('2026-01-15 16:00:00','efectivo', 79.00, 79.00, 19, 5),
('2026-01-18 12:30:00','tarjeta', 189.00,189.00, 20, 6),
('2026-01-20 10:00:00','efectivo',120.00,120.00,  6, 7),
('2026-01-22 15:45:00','tarjeta', 310.00,310.00,  7, 8),
('2026-01-25 11:30:00','efectivo', 95.00, 95.00, 14, 9),
('2026-01-28 13:00:00','tarjeta', 230.00,230.00, 16,10),
('2026-02-02 10:15:00','efectivo',105.00,105.00, 19,11),
('2026-02-05 14:30:00','tarjeta', 195.00,195.00, 20,12),
('2026-02-08 09:00:00','efectivo', 89.00, 89.00,  6,13),
('2026-02-10 16:45:00','tarjeta', 245.00,245.00,  7,14),
('2026-02-13 11:00:00','efectivo', 79.00, 79.00, 14,15),
('2026-02-15 13:30:00','tarjeta', 320.00,320.00, 16,16),
('2026-02-18 10:45:00','efectivo',110.00,110.00, 19,17),
('2026-02-20 15:00:00','tarjeta', 280.00,280.00, 20,18),
('2026-02-22 12:00:00','efectivo', 95.00, 95.00,  6,19),
('2026-02-25 14:00:00','tarjeta', 215.00,215.00,  7,20),
('2026-03-01 10:30:00','efectivo',130.00,130.00, 14,21),
('2026-03-05 11:45:00','tarjeta', 265.00,265.00, 16,22),
('2026-03-08 09:30:00','efectivo', 89.00, 89.00, 19,23),
('2026-03-10 16:00:00','tarjeta', 300.00,300.00, 20,24),
('2026-03-12 13:15:00','efectivo',155.00,155.00,  6,25);

-- detalle venta
INSERT INTO detalle_venta (cantidad, precio_unitario, id_venta, id_producto) VALUES
(1,89.00,1,1),(1,95.00,2,2),(1,119.00,2,12),(1,99.00,3,10),
(1,130.00,4,4),(1,145.00,4,26),(1,79.00,5,7),(1,95.00,6,18),
(1,94.00,6,3),(1,120.00,7,12),(1,160.00,8,10),(1,150.00,8,6),
(1,95.00,9,9),(1,115.00,10,13),(1,115.00,10,21),(1,105.00,11,22),
(1,95.00,12,8),(1,100.00,12,20),(1,89.00,13,17),(1,120.00,14,19),
(1,125.00,14,5),(1,79.00,15,11),(1,160.00,16,14),(1,160.00,16,28),
(1,110.00,17,21),(1,140.00,18,24),(1,140.00,18,23),(1,95.00,19,18),
(1,215.00,20,27),(1,130.00,21,4),(1,265.00,22,6),(1,89.00,23,1),
(1,300.00,24,28),(1,155.00,25,27);

-- pedidos proveedor
INSERT INTO pedido_proveedor (fecha, estado, id_proveedor) VALUES
('2026-01-03','recibido',4),('2026-01-06','recibido',1),('2026-01-09','recibido',9),
('2026-01-12','recibido',2),('2026-01-15','recibido',5),('2026-01-18','recibido',6),
('2026-01-21','recibido',7),('2026-01-24','recibido',8),('2026-01-27','recibido',10),
('2026-01-30','recibido',11),('2026-02-03','recibido',3),('2026-02-06','recibido',12),
('2026-02-09','recibido',4),('2026-02-12','recibido',1),('2026-02-15','recibido',2),
('2026-02-18','pendiente',5),('2026-02-21','pendiente',6),('2026-02-24','pendiente',7),
('2026-02-27','pendiente',8),('2026-03-02','pendiente',9),('2026-03-05','cancelado',10),
('2026-03-08','cancelado',11),('2026-03-11','pendiente',3),('2026-03-14','pendiente',4),
('2026-03-17','pendiente',1);

-- detalle pedido
INSERT INTO detalle_pedido (cantidad, precio_unitario, id_pedido, id_producto) VALUES
(10,60.00,1,1),(8,65.00,2,2),(15,68.00,3,10),(10,55.00,4,7),(6,70.00,5,4),
(12,58.00,6,11),(10,62.00,7,12),(8,60.00,8,17),(10,65.00,9,18),(5,72.00,10,6),
(12,55.00,11,20),(8,68.00,12,8),(10,60.00,13,3),(15,65.00,14,10),(6,85.00,15,14),
(10,62.00,16,19),(8,70.00,17,22),(12,58.00,18,13),(10,65.00,19,21),(5,72.00,20,5),
(8,60.00,21,15),(10,55.00,22,16),(6,68.00,23,24),(12,62.00,24,9),(8,75.00,25,27);
