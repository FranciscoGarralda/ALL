const express = require('express');
const Movement = require('../models/Movement');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/movements
// @desc    Get all movements for logged in user
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    // Build query
    const query = { user: req.user.id };

    // Add filters if provided
    if (req.query.operacion) {
      query.operacion = req.query.operacion;
    }
    if (req.query.estado) {
      query.estado = req.query.estado;
    }
    if (req.query.cliente) {
      query.cliente = new RegExp(req.query.cliente, 'i');
    }
    if (req.query.startDate || req.query.endDate) {
      query.fecha = {};
      if (req.query.startDate) {
        query.fecha.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.fecha.$lte = new Date(req.query.endDate);
      }
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;

    // Execute query
    const movements = await Movement.find(query)
      .sort('-fecha')
      .limit(limit)
      .skip(startIndex);

    // Get total count
    const total = await Movement.countDocuments(query);

    res.json({
      success: true,
      count: movements.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: movements
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/movements/:id
// @desc    Get single movement
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const movement = await Movement.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!movement) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado'
      });
    }

    res.json({
      success: true,
      data: movement
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/movements
// @desc    Create new movement
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const movement = await Movement.create(req.body);

    res.status(201).json({
      success: true,
      data: movement
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/movements/:id
// @desc    Update movement
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    // Remove user field if present in body
    delete req.body.user;

    const movement = await Movement.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!movement) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado'
      });
    }

    res.json({
      success: true,
      data: movement
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/movements/:id
// @desc    Delete movement
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const movement = await Movement.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!movement) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado'
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

// @route   GET /api/movements/stats/summary
// @desc    Get movements summary statistics
// @access  Private
router.get('/stats/summary', protect, async (req, res, next) => {
  try {
    const stats = await Movement.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$moneda',
          totalMonto: { $sum: '$monto' },
          totalOperaciones: { $sum: 1 },
          avgMonto: { $avg: '$monto' }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;