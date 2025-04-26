// controllers/usuarioController.js
const Usuario = require("../models/usuarioModel");
const { comparePassword } = require("../utils/passwordUtils");
const jwt = require("jsonwebtoken");

// Generar token JWT
function generarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id_usuario,
      email: usuario.email,
      esAdmin: usuario.es_administrador,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
}

const usuarioController = {
  // Registrar un nuevo usuario
  async registrar(req, res) {
    try {
      const { nombre, email, password, es_administrador } = req.body;

      // Validar datos
      if (!nombre || !email || !password) {
        return res
          .status(400)
          .json({ mensaje: "Todos los campos son obligatorios" });
      }

      // Verificar si el email ya existe
      const usuarioExistente = await Usuario.obtenerPorEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({ mensaje: "El email ya está registrado" });
      }

      // Crear el usuario
      const usuario = await Usuario.crear({
        nombre,
        email,
        password,
        es_administrador,
      });

      res.status(201).json({
        mensaje: "Usuario registrado correctamente",
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
        },
      });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      res.status(500).json({ mensaje: "Error al registrar el usuario" });
    }
  },

  // Iniciar sesión
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validar datos
      if (!email || !password) {
        return res
          .status(400)
          .json({ mensaje: "Email y contraseña son obligatorios" });
      }

      // Buscar usuario por email
      const usuario = await Usuario.obtenerPorEmail(email);
      if (!usuario) {
        return res.status(401).json({ mensaje: "Credenciales inválidas" });
      }

      // Verificar si el usuario está activo
      if (!usuario.activo) {
        return res
          .status(401)
          .json({ mensaje: "Esta cuenta ha sido desactivada" });
      }

      // Verificar contraseña
      const passwordValida = await comparePassword(
        password,
        usuario.password_hash
      );
      if (!passwordValida) {
        return res.status(401).json({ mensaje: "Credenciales inválidas" });
      }

      // Generar token
      const token = generarToken(usuario);

      res.json({
        mensaje: "Inicio de sesión exitoso",
        usuario: {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          email: usuario.email,
          es_administrador: usuario.es_administrador,
        },
        token,
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ mensaje: "Error al iniciar sesión" });
    }
  },

  // Obtener todos los usuarios (solo administradores)
  async obtenerTodos(req, res) {
    try {
      const usuarios = await Usuario.obtenerTodos();
      res.json(usuarios);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ mensaje: "Error al obtener los usuarios" });
    }
  },

  // Obtener perfil del usuario autenticado
  async obtenerPerfil(req, res) {
    try {
      const usuario = await Usuario.obtenerPorId(req.usuario.id);

      if (!usuario) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      res.json({
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        es_administrador: usuario.es_administrador,
      });
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      res.status(500).json({ mensaje: "Error al obtener el perfil" });
    }
  },

  // Actualizar perfil de usuario
  async actualizarPerfil(req, res) {
    try {
      const { nombre, email } = req.body;
      const id = req.usuario.id;

      // Validar datos
      if (!nombre || !email) {
        return res
          .status(400)
          .json({ mensaje: "Nombre y email son obligatorios" });
      }

      // Verificar que el email no esté en uso por otro usuario
      const usuarioExistente = await Usuario.obtenerPorEmail(email);
      if (usuarioExistente && usuarioExistente.id_usuario !== id) {
        return res
          .status(400)
          .json({ mensaje: "El email ya está registrado por otro usuario" });
      }

      // Obtener datos actuales
      const usuarioActual = await Usuario.obtenerPorId(id);

      // Actualizar usuario
      const actualizado = await Usuario.actualizar(id, {
        nombre,
        email,
        es_administrador: usuarioActual.es_administrador,
        activo: usuarioActual.activo,
      });

      if (!actualizado) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      res.json({ mensaje: "Perfil actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      res.status(500).json({ mensaje: "Error al actualizar el perfil" });
    }
  },

  // Cambiar contraseña
  async cambiarPassword(req, res) {
    try {
      const { passwordActual, nuevaPassword } = req.body;
      const id = req.usuario.id;

      // Validar datos
      if (!passwordActual || !nuevaPassword) {
        return res
          .status(400)
          .json({ mensaje: "Ambas contraseñas son obligatorias" });
      }

      // Obtener usuario
      const usuario = await Usuario.obtenerPorId(id);
      if (!usuario) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      // Verificar contraseña actual
      const passwordValida = await comparePassword(
        passwordActual,
        usuario.password_hash
      );
      if (!passwordValida) {
        return res
          .status(401)
          .json({ mensaje: "La contraseña actual es incorrecta" });
      }

      // Cambiar contraseña
      await Usuario.cambiarPassword(id, nuevaPassword);

      res.json({ mensaje: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      res.status(500).json({ mensaje: "Error al cambiar la contraseña" });
    }
  },

  // Administrar usuarios (solo administradores)
  async gestionarUsuario(req, res) {
    try {
      const { id } = req.params;
      const { nombre, email, es_administrador, activo } = req.body;

      // Validar datos
      if (!nombre || !email) {
        return res
          .status(400)
          .json({ mensaje: "Nombre y email son obligatorios" });
      }

      // Verificar que el email no esté en uso por otro usuario
      const usuarioExistente = await Usuario.obtenerPorEmail(email);
      if (usuarioExistente && usuarioExistente.id_usuario != id) {
        return res
          .status(400)
          .json({ mensaje: "El email ya está registrado por otro usuario" });
      }

      // Actualizar usuario
      const actualizado = await Usuario.actualizar(id, {
        nombre,
        email,
        es_administrador:
          es_administrador === undefined ? false : es_administrador,
        activo: activo === undefined ? true : activo,
      });

      if (!actualizado) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      res.json({ mensaje: "Usuario actualizado correctamente" });
    } catch (error) {
      console.error("Error al gestionar usuario:", error);
      res.status(500).json({ mensaje: "Error al actualizar el usuario" });
    }
  },

  // Eliminar usuario (desactivar)
  async eliminarUsuario(req, res) {
    try {
      const { id } = req.params;

      // No permitir que un admin se elimine a sí mismo
      if (req.usuario.id == id) {
        return res.status(400).json({
          mensaje: "No puedes eliminar tu propia cuenta de administrador",
        });
      }

      const eliminado = await Usuario.eliminar(id);

      if (!eliminado) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      res.json({ mensaje: "Usuario desactivado correctamente" });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      res.status(500).json({ mensaje: "Error al desactivar el usuario" });
    }
  },
};

module.exports = usuarioController;
