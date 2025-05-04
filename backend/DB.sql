-- Crear tabla usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    es_administrador BOOLEAN NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT 1
);

-- Crear tabla arqueos_caja
CREATE TABLE arqueos_caja (
    id_arqueo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME DEFAULT NULL,
    saldo_inicial DECIMAL(10,2) NOT NULL,
    ingresos DECIMAL(10,2) DEFAULT 0.00,
    egresos DECIMAL(10,2) DEFAULT 0.00,
    saldo_final DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Crear tabla tipos_producto
CREATE TABLE tipos_producto (
    id_tipo_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- Crear tabla productos
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock_actual INT DEFAULT 0,
    id_tipo_producto INT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (id_tipo_producto) REFERENCES tipos_producto(id_tipo_producto)
);

-- Crear tabla movimientos_inventario
CREATE TABLE movimientos_inventario (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    tipo_movimiento ENUM('Ingreso', 'Egreso') NOT NULL,
    cantidad INT NOT NULL,
    fecha DATETIME NOT NULL,
    observaciones TEXT,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- Crear tabla pedidos
CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_arqueo INT NOT NULL,
    fecha_pedido DATETIME NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    forma_pago ENUM('Efectivo', 'Tarjeta', 'QR') NOT NULL,
    estado ENUM('Pendiente', 'En cocina', 'Entregado', 'Cancelado') DEFAULT 'Pendiente',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_arqueo) REFERENCES arqueos_caja(id_arqueo)
);

-- Crear tabla detalle_pedidos
CREATE TABLE detalle_pedidos (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- Crear tabla movimientos_caja
CREATE TABLE movimientos_caja (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_arqueo INT NOT NULL,
    tipo ENUM('Ingreso', 'Egreso') NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    fecha DATETIME NOT NULL,
    FOREIGN KEY (id_arqueo) REFERENCES arqueos_caja(id_arqueo)
);
