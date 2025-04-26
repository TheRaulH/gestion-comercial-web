// models/usuarioModel.js
const { pool } = require("../config/db");
const { hashPassword } = require("../utils/passwordUtils");

class Usuario {
  // Crear un nuevo usuario
  static async crear(userData) {
    try {
      const { nombre, email, password, es_administrador = false } = userData;
      const password_hash = await hashPassword(password);

      const [result] = await pool.execute(
        "INSERT INTO usuarios (nombre, email, password_hash, es_administrador) VALUES (?, ?, ?, ?)",
        [nombre, email, password_hash, es_administrador]
      );

      return { id: result.insertId, nombre, email, es_administrador };
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los usuarios
  static async obtenerTodos() {
    try {
      const [usuarios] = await pool.query(
        "SELECT id_usuario, nombre, email, es_administrador, activo FROM usuarios"
      );
      return usuarios;
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario por ID
  static async obtenerPorId(id) {
    try {
      const [usuarios] = await pool.execute(
        "SELECT id_usuario, nombre, email, es_administrador, activo FROM usuarios WHERE id_usuario = ?",
        [id]
      );

      return usuarios.length ? usuarios[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario por email
  static async obtenerPorEmail(email) {
    try {
      const [usuarios] = await pool.execute(
        "SELECT * FROM usuarios WHERE email = ?",
        [email]
      );

      return usuarios.length ? usuarios[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario
  static async actualizar(id, userData) {
    try {
      const { nombre, email, es_administrador, activo } = userData;

      const [result] = await pool.execute(
        "UPDATE usuarios SET nombre = ?, email = ?, es_administrador = ?, activo = ? WHERE id_usuario = ?",
        [nombre, email, es_administrador, activo, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar contraseña de usuario
  static async cambiarPassword(id, nuevaPassword) {
    try {
      const password_hash = await hashPassword(nuevaPassword);

      const [result] = await pool.execute(
        "UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?",
        [password_hash, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar usuario (desactivar)
  static async eliminar(id) {
    try {
      const [result] = await pool.execute(
        "UPDATE usuarios SET activo = 0 WHERE id_usuario = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Usuario;
