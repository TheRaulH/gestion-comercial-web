// config/dbInit.js
const { pool } = require("./db");
const { hashPassword } = require("../utils/passwordUtils");

// Función para crear las tablas
async function crearTablas() {
  try {
    // Crear tabla usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        es_administrador BOOLEAN NOT NULL DEFAULT 0,
        activo BOOLEAN NOT NULL DEFAULT 1
      )
    `);
    console.log("✓ Tabla usuarios creada o ya existente");

    // Crear tabla arqueos_caja
    await pool.query(`
      CREATE TABLE IF NOT EXISTS arqueos_caja (
        id_arqueo INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT NOT NULL,
        fecha_inicio DATETIME NOT NULL,
        fecha_fin DATETIME DEFAULT NULL,
        saldo_inicial DECIMAL(10,2) NOT NULL,
        ingresos DECIMAL(10,2) DEFAULT 0.00,
        egresos DECIMAL(10,2) DEFAULT 0.00,
        saldo_final DECIMAL(10,2) DEFAULT 0.00,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
      )
    `);
    console.log("✓ Tabla arqueos_caja creada o ya existente");

    // Crear tabla tipos_producto
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tipos_producto (
        id_tipo_producto INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL
      )
    `);
    console.log("✓ Tabla tipos_producto creada o ya existente");

    // Crear tabla productos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id_producto INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10,2) NOT NULL,
        stock_actual INT DEFAULT 0,
        id_tipo_producto INT NOT NULL,
        activo BOOLEAN NOT NULL DEFAULT 1,
        FOREIGN KEY (id_tipo_producto) REFERENCES tipos_producto(id_tipo_producto)
      )
    `);
    console.log("✓ Tabla productos creada o ya existente");

    // Crear tabla movimientos_inventario
    await pool.query(`
      CREATE TABLE IF NOT EXISTS movimientos_inventario (
        id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
        id_producto INT NOT NULL,
        tipo_movimiento ENUM('Ingreso', 'Egreso') NOT NULL,
        cantidad INT NOT NULL,
        fecha DATETIME NOT NULL,
        observaciones TEXT,
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
      )
    `);
    console.log("✓ Tabla movimientos_inventario creada o ya existente");

    // Crear tabla pedidos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id_pedido INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT NOT NULL,
        id_arqueo INT NOT NULL,
        fecha_pedido DATETIME NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        forma_pago ENUM('Efectivo', 'Tarjeta', 'QR') NOT NULL,
        estado ENUM('Pendiente', 'En cocina', 'Entregado', 'Cancelado') DEFAULT 'Pendiente',
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
        FOREIGN KEY (id_arqueo) REFERENCES arqueos_caja(id_arqueo)
      )
    `);
    console.log("✓ Tabla pedidos creada o ya existente");

    // Crear tabla detalle_pedidos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS detalle_pedidos (
        id_detalle INT AUTO_INCREMENT PRIMARY KEY,
        id_pedido INT NOT NULL,
        id_producto INT NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
      )
    `);
    console.log("✓ Tabla detalle_pedidos creada o ya existente");

    // Crear tabla movimientos_caja
    await pool.query(`
      CREATE TABLE IF NOT EXISTS movimientos_caja (
        id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
        id_arqueo INT NOT NULL,
        tipo ENUM('Ingreso', 'Egreso') NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        descripcion TEXT,
        fecha DATETIME NOT NULL,
        FOREIGN KEY (id_arqueo) REFERENCES arqueos_caja(id_arqueo)
      )
    `);
    console.log("✓ Tabla movimientos_caja creada o ya existente");

    console.log("✅ Todas las tablas creadas correctamente");
    return true;
  } catch (error) {
    console.error("Error al crear las tablas:", error);
    return false;
  }
}

// Función para crear usuarios iniciales
async function crearUsuariosIniciales() {
  try {
    // Comprobar si ya existen usuarios para no duplicar
    const [usuarios] = await pool.query(
      "SELECT COUNT(*) as count FROM usuarios"
    );

    if (usuarios[0].count === 0) {
      // Crear admin
      const adminPasswordHash = await hashPassword("admin123");
      await pool.query(
        `
        INSERT INTO usuarios (nombre, email, password_hash, es_administrador, activo)
        VALUES ('Administrador', 'admin@sistema.com', ?, 1, 1)
      `,
        [adminPasswordHash]
      );
      console.log("✓ Usuario administrador creado");

      // Crear usuario normal
      const userPasswordHash = await hashPassword("user123");
      await pool.query(
        `
        INSERT INTO usuarios (nombre, email, password_hash, es_administrador, activo)
        VALUES ('Usuario Normal', 'usuario@sistema.com', ?, 0, 1)
      `,
        [userPasswordHash]
      );
      console.log("✓ Usuario normal creado");

      console.log("✅ Usuarios iniciales creados correctamente");
      return true;
    } else {
      console.log(
        "ℹ️ Ya existen usuarios en la base de datos, omitiendo creación de usuarios iniciales"
      );
      return true;
    }
  } catch (error) {
    console.error("Error al crear usuarios iniciales:", error);
    return false;
  }
}
// Función para crear datos iniciales de tipos de producto y productos
async function crearDatosInicialesProductos() {
  try {
    // Comprobar si ya existen tipos de producto
    const [tipos] = await pool.query(
      "SELECT COUNT(*) as count FROM tipos_producto"
    );

    if (tipos[0].count === 0) {
      console.log("ℹ️ No existen tipos de producto, procediendo a crearlos..."); // Insertar tipos de producto

      await pool.query(`
        INSERT INTO tipos_producto (nombre) VALUES
        ('Platos Principales'),
        ('Guarniciones'),
        ('Bebidas')
      `);
      console.log("✓ Tipos de producto iniciales creados"); // Obtener los IDs de los tipos de producto recién insertados

      const [tiposInsertados] = await pool.query(
        "SELECT id_tipo_producto, nombre FROM tipos_producto WHERE nombre IN ('Platos Principales', 'Guarniciones', 'Bebidas')"
      );

      const tipoIds = {};
      tiposInsertados.forEach((tipo) => {
        tipoIds[tipo.nombre] = tipo.id_tipo_producto;
      }); // Comprobar si ya existen productos antes de insertar

      const [productos] = await pool.query(
        "SELECT COUNT(*) as count FROM productos"
      );

      if (productos[0].count === 0) {
        console.log("ℹ️ No existen productos, procediendo a crearlos..."); // Insertar productos de ejemplo, usando los IDs obtenidos
        await pool.query(
          `
          INSERT INTO productos (nombre, descripcion, precio, id_tipo_producto, stock_actual) VALUES
          ('Pollo a la Broster', 'Delicioso pollo frito crujiente', 35.00, ?, 100),
          ('Pollo al Spiedo', 'Pollo asado a las brasas', 32.00, ?, 80),
          ('Majadito Batido', 'Arroz con carne desmenuzada y plátano frito', 28.00, ?, 50),
          ('Lomito de Res', 'Tiras de lomito salteado con verduras', 40.00, ?, 40),
          ('Hamburguesa Clásica', 'Hamburguesa con carne, queso y vegetales', 20.00, ?, 120),
          ('Salchipapa Simple', 'Salchichas con papas fritas', 15.00, ?, 150),
          ('Papas Fritas', 'Porción de papas fritas', 10.00, ?, 200),
          ('Arroz', 'Porción de arroz', 8.00, ?, 180),
          ('Yuca Frita', 'Porción de yuca frita', 12.00, ?, 90),
          ('Coca-Cola', 'Refresco Coca-Cola', 7.00, ?, 300),
          ('Agua Mineral', 'Botella de agua', 5.00, ?, 250),
          ('Jugo Natural', 'Jugo del día (ej. Naranja)', 9.00, ?, 70)
        `,
          [
            tipoIds["Platos Principales"], // Pollo Broster
            tipoIds["Platos Principales"], // Pollo Spiedo
            tipoIds["Platos Principales"], // Majadito
            tipoIds["Platos Principales"], // Lomito
            tipoIds["Platos Principales"], // Hamburguesa
            tipoIds["Platos Principales"], // Salchipapa (considerado plato principal en algunos locales)
            tipoIds["Guarniciones"], // Papas Fritas
            tipoIds["Guarniciones"], // Arroz
            tipoIds["Guarniciones"], // Yuca Frita
            tipoIds["Bebidas"], // Coca-Cola
            tipoIds["Bebidas"], // Agua Mineral
            tipoIds["Bebidas"], // Jugo Natural
          ]
        );
        console.log("✓ Productos iniciales creados");
      } else {
        console.log(
          "ℹ️ Ya existen productos en la base de datos, omitiendo creación de productos iniciales"
        );
      }

      console.log("✅ Datos iniciales de productos creados correctamente");
      return true;
    } else {
      console.log(
        "ℹ️ Ya existen tipos de producto en la base de datos, omitiendo creación de datos iniciales de productos"
      );
      return true;
    }
  } catch (error) {
    console.error("Error al crear datos iniciales de productos:", error);
    return false;
  }
}

// Función para inicializar la base de datos
async function inicializarBaseDeDatos() {
  console.log("Inicializando base de datos...");

  // Crear primero la base de datos si no existe
  try {
    const connection = await pool.getConnection();
    // Comprobar si la base de datos existe o crearla
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
    );
    connection.release();
    console.log(
      `✓ Base de datos '${process.env.DB_NAME}' creada o ya existente`
    );
  } catch (error) {
    console.error("Error al crear la base de datos:", error);
    return false;
  }

  // Crear tablas
  const tablasCreadas = await crearTablas();
  if (!tablasCreadas) {
    return false;
  }

  // Crear usuarios iniciales
  const usuariosCreados = await crearUsuariosIniciales();
  if (!usuariosCreados) {
    return false;
  }

  // Crear datos iniciales de productos y tipos de producto
  const productosCreados = await crearDatosInicialesProductos();
  if (!productosCreados) {
    return false;
  }

  console.log("✅ Base de datos inicializada correctamente");
  return true;
}

module.exports = {
  inicializarBaseDeDatos,
};
