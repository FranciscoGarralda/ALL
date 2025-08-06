const express = require('express');
const { Client, Movement } = require('../models');
const { protect } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/clients
// @desc    Get all clients for user
router.get('/', async (req, res) => {
  try {
    const clients = await Client.findAll({
      where: { userId: req.user.id },
      order: [['apellido', 'ASC'], ['nombre', 'ASC']]
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
router.post('/', async (req, res) => {
  try {
    const client = await Client.create({
      ...req.body,
      userId: req.user.id
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

// @route   PUT /api/clients/:id
// @desc    Update client
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
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
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
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
        userId: req.user.id,
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