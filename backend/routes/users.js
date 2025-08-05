const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/users/:id
// @desc    Get single user (admin only)
// @access  Private/Admin
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

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
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/users
// @desc    Create user (admin only)
// @access  Private/Admin
router.post('/', async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id', async (req, res, next) => {
  try {
    // Don't allow password update through this route
    delete req.body.password;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

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
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/users/:id/activate
// @desc    Activate/Deactivate user (admin only)
// @access  Private/Admin
router.put('/:id/activate', async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user,
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;