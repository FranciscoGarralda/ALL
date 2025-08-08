const express = require('express');
const { User } = require('../models');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación y rol admin
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/users
// @desc    Obtener todos los usuarios
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Obtener un usuario por ID
// @access  Private/Admin
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario'
    });
  }
});

// @route   POST /api/users
// @desc    Crear nuevo usuario
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      where: { username } 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya está en uso'
      });
    }

    const user = await User.create({
      name,
      username,
      email,
      password,
      role: role || 'user'
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Actualizar usuario
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir cambiar el password por esta ruta
    delete req.body.password;

    await user.update(req.body);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario'
    });
  }
});

// @route   PUT /api/users/:id/activate
// @desc    Activar/Desactivar usuario
// @access  Private/Admin
router.put('/:id/activate', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir desactivarse a sí mismo
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propia cuenta'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del usuario'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Eliminar usuario
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir eliminarse a sí mismo
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario'
    });
  }
});

module.exports = router;