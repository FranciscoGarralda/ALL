const express = require('express');
const { Client, Movement } = require('../models');
// const { protect } = require('../middleware/auth'); // TEMPORAL: Comentado
const { Op } = require('sequelize');

const router = express.Router();

// All routes require authentication
// router.use(protect); // TEMPORAL: Comentado

// @route   GET /api/clients
// @desc    Get all clients for user
// @access  Private -> TEMPORAL: Public
router.get('/', async (req, res) => {
  try {
    const clients = await Client.findAll({
      where: {
        // userId: req.user.id // TEMPORAL: No filtrar por usuario
      },
      order: [['nombre', 'ASC']]
    });
    
    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener clientes'
    });
  }
});

// @route   POST /api/clients
// @desc    Create new client
// @access  Private -> TEMPORAL: Public
router.post('/', async (req, res) => {
  try {
    const client = await Client.create({
      ...req.body,
      userId: 1 // TEMPORAL: Usuario por defecto
    });
    
    res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente'
    });
  }
});

// @route   GET /api/clients/:id
// @desc    Get client by ID
// @access  Private -> TEMPORAL: Public
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findOne({
      where: {
        id: req.params.id
        // userId: req.user.id // TEMPORAL: No filtrar por usuario
      }
    });
    
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente por ID'
    });
  }
});

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private -> TEMPORAL: Public
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findOne({
      where: {
        id: req.params.id
        // userId: req.user.id // TEMPORAL: No filtrar por usuario
      }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    await client.update(req.body);
    
    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cliente'
    });
  }
});

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private -> TEMPORAL: Public
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findOne({
      where: {
        id: req.params.id
        // userId: req.user.id // TEMPORAL: No filtrar por usuario
      }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    
    // Check if client has movements
    const movementCount = await Movement.count({
      where: {
        userId: 1, // TEMPORAL: Usuario por defecto
        cliente: `${client.nombre} ${client.apellido}`
      }
    });
    
    if (movementCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un cliente con movimientos asociados'
      });
    }
    
    await client.destroy();
    
    res.json({
      success: true,
      message: 'Cliente eliminado'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cliente'
    });
  }
});

module.exports = router;