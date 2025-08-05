const express = require('express');
const Client = require('../models/Client');
const Movement = require('../models/Movement');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/clients
// @desc    Get all clients for logged in user
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const query = { user: req.user.id };

    // Add filters if provided
    if (req.query.tipoCliente) {
      query.tipoCliente = req.query.tipoCliente;
    }
    if (req.query.search) {
      query.$or = [
        { nombre: new RegExp(req.query.search, 'i') },
        { apellido: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') }
      ];
    }

    const clients = await Client.find(query).sort('nombre apellido');

    res.json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/clients/:id
// @desc    Get single client with statistics
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Get client statistics from movements
    const stats = await Movement.aggregate([
      { 
        $match: { 
          user: req.user._id,
          cliente: client.fullName
        } 
      },
      {
        $group: {
          _id: null,
          totalOperaciones: { $sum: 1 },
          volumenTotal: { $sum: '$monto' },
          ultimaOperacion: { $max: '$fecha' }
        }
      }
    ]);

    // Update client with latest stats
    if (stats.length > 0) {
      client.totalOperaciones = stats[0].totalOperaciones;
      client.volumenTotal = stats[0].volumenTotal;
      client.ultimaOperacion = stats[0].ultimaOperacion;
      await client.save();
    }

    res.json({
      success: true,
      data: client
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/clients
// @desc    Create new client
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const client = await Client.create(req.body);

    res.status(201).json({
      success: true,
      data: client
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    // Remove user field if present in body
    delete req.body.user;

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    // Check if client has movements
    const movementCount = await Movement.countDocuments({
      user: req.user._id,
      cliente: client.fullName
    });

    if (movementCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el cliente porque tiene ${movementCount} movimientos asociados`
      });
    }

    await client.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;