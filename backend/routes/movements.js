const express = require('express');
const { Movement } = require('../models');
const { protect } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/movements
// @desc    Obtener todos los movimientos del usuario
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      fecha, 
      operacion, 
      subOperacion, 
      cliente,
      moneda,
      estado = 'activo',
      limit = 1000,
      offset = 0 
    } = req.query;

    // Construir filtros
    const where = { 
      userId: req.user.id,
      estado 
    };

    if (fecha) where.fecha = fecha;
    if (operacion) where.operacion = operacion;
    if (subOperacion) where.subOperacion = subOperacion;
    if (cliente) where.cliente = { [Op.like]: `%${cliente}%` };
    if (moneda) where.moneda = moneda;

    const movements = await Movement.findAll({
      where,
      order: [['fecha', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Movement.count({ where });

    res.json({
      success: true,
      count: movements.length,
      total,
      data: movements
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos'
    });
  }
});

// @route   GET /api/movements/stats
// @desc    Obtener estadísticas de movimientos
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    const where = { 
      userId: req.user.id,
      estado: 'activo'
    };

    if (fechaInicio && fechaFin) {
      where.fecha = {
        [Op.between]: [fechaInicio, fechaFin]
      };
    }

    // Obtener estadísticas básicas
    const totalMovimientos = await Movement.count({ where });
    
    const movimientos = await Movement.findAll({ where });
    
    // Calcular totales por moneda
    const totalesPorMoneda = {};
    movimientos.forEach(mov => {
      if (mov.moneda && mov.monto) {
        if (!totalesPorMoneda[mov.moneda]) {
          totalesPorMoneda[mov.moneda] = {
            cantidad: 0,
            volumen: 0
          };
        }
        totalesPorMoneda[mov.moneda].cantidad++;
        totalesPorMoneda[mov.moneda].volumen += parseFloat(mov.monto);
      }
    });

    res.json({
      success: true,
      data: {
        totalMovimientos,
        totalesPorMoneda,
        periodo: { fechaInicio, fechaFin }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

// @route   GET /api/movements/:id
// @desc    Obtener un movimiento por ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const movement = await Movement.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimiento'
    });
  }
});

// @route   POST /api/movements
// @desc    Crear nuevo movimiento
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const movementData = {
      ...req.body,
      userId: req.user.id,
      por: req.user.name
    };

    const movement = await Movement.create(movementData);

    res.status(201).json({
      success: true,
      data: movement
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear movimiento',
      error: error.message
    });
  }
});

// @route   PUT /api/movements/:id
// @desc    Actualizar movimiento
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const movement = await Movement.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
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
// @desc    Eliminar movimiento (soft delete)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const movement = await Movement.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!movement) {
      return res.status(404).json({
        success: false,
        message: 'Movimiento no encontrado'
      });
    }

    // Soft delete - cambiar estado a inactivo
    await movement.update({ estado: 'inactivo' });

    res.json({
      success: true,
      message: 'Movimiento eliminado exitosamente'
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