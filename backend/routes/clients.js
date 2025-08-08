const express = require('express');
const { Client, Movement } = require('../models');
const { protect } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/clients
// @desc    Obtener todos los clientes del usuario
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      search,
      tipo,
      estado = 'activo',
      limit = 100,
      offset = 0 
    } = req.query;

    // Construir filtros
    const where = { 
      userId: req.user.id,
      estado 
    };

    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { telefono: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (tipo) where.tipo = tipo;

    const clients = await Client.findAll({
      where,
      order: [['nombre', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Client.count({ where });

    res.json({
      success: true,
      count: clients.length,
      total,
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

// @route   GET /api/clients/:id
// @desc    Obtener un cliente por ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
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

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cliente'
    });
  }
});

// @route   POST /api/clients
// @desc    Crear nuevo cliente
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      userId: req.user.id
    };

    const client = await Client.create(clientData);

    res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cliente',
      error: error.message
    });
  }
});

// @route   PUT /api/clients/:id
// @desc    Actualizar cliente
// @access  Private
router.put('/:id', protect, async (req, res) => {
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
// @desc    Eliminar cliente
// @access  Private
router.delete('/:id', protect, async (req, res) => {
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

    // Verificar si tiene movimientos asociados
    const movementsCount = await Movement.count({
      where: {
        cliente: client.nombre,
        userId: req.user.id
      }
    });

    if (movementsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el cliente porque tiene ${movementsCount} movimientos asociados`
      });
    }

    // Eliminar físicamente si no tiene movimientos
    await client.destroy();

    res.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cliente'
    });
  }
});

// @route   GET /api/clients/:id/movements
// @desc    Obtener movimientos de un cliente
// @access  Private
router.get('/:id/movements', protect, async (req, res) => {
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

    const movements = await Movement.findAll({
      where: {
        cliente: client.nombre,
        userId: req.user.id,
        estado: 'activo'
      },
      order: [['fecha', 'DESC']]
    });

    res.json({
      success: true,
      count: movements.length,
      data: movements
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener movimientos del cliente'
    });
  }
});

module.exports = router;