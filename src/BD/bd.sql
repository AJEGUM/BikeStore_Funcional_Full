-- CREATE DATABASE bikestore;
USE bikestore;

-- Tabla: productos
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) ,
    precio_venta DECIMAL(10,2)  CHECK (precio_venta >= 0),
    descripcion VARCHAR(500),
    imagen VARCHAR(255),
    categoria VARCHAR(100),
    marca VARCHAR(100)
);

-- Tabla: stocks (1:1 con productos)
CREATE TABLE stocks (
    id_stock INT AUTO_INCREMENT PRIMARY KEY,
    stock INT CHECK (stock >= 0),
	stock_minimo INT DEFAULT 0 CHECK (stock_minimo >= 0),
    estado ENUM('disponible', 'agotado') DEFAULT 'disponible',
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_producto INT UNIQUE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);

-- Tabla: usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) ,
    apellido VARCHAR(100) ,
    telefono VARCHAR(20)  ,
    email VARCHAR(100) ,
    clave VARCHAR(255) ,
    rol ENUM('cliente', 'admin', 'super_usuario') DEFAULT 'cliente',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: ventas
CREATE TABLE ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
	cantidad_productos INT  CHECK (cantidad_productos > 0),
    precio_productos DECIMAL(10,2)  CHECK (precio_productos >= 0),
    metodo_pago ENUM('visa', 'mastercard', 'maestro', 'paypal') ,
    numero_tarjeta VARCHAR(50),
    fecha_venta DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Tabla: detalles_venta (relación N:M entre productos y ventas)
CREATE TABLE detalles_venta (
    id_detalle_venta INT AUTO_INCREMENT PRIMARY KEY,
    cantidad_producto INT  CHECK (cantidad_producto > 0),
    precio_unitario DECIMAL(10,2)  CHECK (precio_unitario >= 0),
    id_producto INT,
    id_venta INT,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta)
);


/*Consultas*/
/*UPDATE usuarios
SET rol = 'admin'
WHERE id_usuario = 1;*/

Select * From usuarios;