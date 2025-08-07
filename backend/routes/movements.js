const express = require('express');
const { Movement } = require('../models');
const { protect } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/movements
// @desc    Get all movements for user
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0, operacion, estado, cliente } = req.query;
    
    // Build where clause
    const where = {}; // TEMPORAL: No filtrar por usuario
    if (operacion) where.operacion = operacion;
    if (estado) where.estado = estado;
    if (cliente) where.cliente = { [Op.like]: `%${cliente}%` };
    
    const movements = await Movement.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha', 'DESC']]
    });
    
    const total = await Movement.count({ where });
    
    res.json({
      success: true,
      data: movements,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos'
    });
  }
});

// @route   POST /api/movements
// @desc    Create new movement
router.post('/', async (req, res) => {
  try {
    const movement = await Movement.create({
      ...req.body,
      userId: 1 // TEMPORAL: Usuario por defecto
    });
    
    res.status(201).json({
      success: true,
      data: movement
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear movimiento'
    });
  }
});

// @route   PUT /api/movements/:id
// @desc    Update movement
router.put('/:id', async (req, res) => {
  try {
    const movement = await Movement.findOne({
      where: {
        id: req.params.id
        // userId: req.user.id // TEMPORAL: No filtrar por usuario
      }
    });
    
    if (!movement) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado'
      });
    }
    
    await movement.update(req.body);
    
    res.json({
      success: true,
      data: movement
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar movimiento'
    });
  }
});

// @route   DELETE /api/movements/:id
// @desc    Delete movement
router.delete('/:id', async (req, res) => {
  try {
    const movement = await Movement.findOne({
      where: {
        id: req.params.id
        // userId: req.user.id // TEMPORAL: No filtrar por usuario
      }
    });
    
    if (!movement) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado'
      });
    }
    
    await movement.destroy();
    
    res.json({
      success: true,
      message: 'Movimiento eliminado'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar movimiento'
    });
  }
});

module.exports = router;