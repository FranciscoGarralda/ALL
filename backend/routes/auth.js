const express = require('express');
const { check, validationResult } = require('express-validator');
const { User } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();

// TEMPORAL: Endpoint para crear admin
// @route   GET /api/auth/create-admin
// @access  Public (temporal)
router.get('/create-admin', async (req, res) => {
  try {
    // Verificar si ya existe
    const existing = await User.findOne({
      where: { username: 'FranciscoGarralda' }
    });
    
    if (existing) {
      return res.json({
        success: true,
        message: 'Admin ya existe'
      });
    }
    
    // Crear admin
    const admin = await User.create({
      name: 'Francisco Garralda',
      username: 'FranciscoGarralda',
      password: 'garralda1',
      role: 'admin',
      isActive: true
    });
    
    res.json({
      success: true,
      message: 'Admin creado exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear admin'
    });
  }
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  check('name', 'Nombre es requerido').notEmpty(),
  check('username', 'Nombre de usuario es requerido').notEmpty(),
  check('email', 'Por favor incluya un email válido').isEmail(),
  check('password', 'La contraseña debe tener 6 o más caracteres').isLength({ min: 6 })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, username, email, password } = req.body;

    // Check if user exists by email or username
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'usuario';
      return res.status(400).json({
        success: false,
        message: `El ${field} ya está registrado`
      });
    }

    // Create user
    const user = await User.create({
      name,
      username,
      email,
      password
    });

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  check('email', 'Por favor incluya un usuario válido').notEmpty(),
  check('password', 'Contraseña es requerida').notEmpty()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user by username (email field contains username)
    const user = await User.findOne({
      where: { username: email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario desactivado'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'username', 'email', 'role', 'isActive']
    });

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
router.put('/updatepassword', protect, [
  check('currentPassword', 'Contraseña actual es requerida').notEmpty(),
  check('newPassword', 'Nueva contraseña debe tener 6 o más caracteres').isLength({ min: 6 })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = await User.findByPk(req.user.id);

    // Check current password
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// TEMPORAL: Endpoint para crear admin
// @route   GET /api/auth/create-admin
// @access  Public (temporal)
router.get('/create-admin', async (req, res) => {
  try {
    // Verificar si ya existe
    const existing = await User.findOne({
      where: { username: 'FranciscoGarralda' }
    });
    
    if (existing) {
      return res.json({
        success: true,
        message: 'Admin ya existe'
      });
    }
    
    // Crear admin
    const admin = await User.create({
      name: 'Francisco Garralda',
      username: 'FranciscoGarralda',
      password: 'garralda1',
      role: 'admin',
      isActive: true
    });
    
    res.json({
      success: true,
      message: 'Admin creado exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear admin'
    });
  }
});

module.exports = router;