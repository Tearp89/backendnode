const { carritoproducto, carrito, producto } = require('../models')

let self = {}

// ============================
// GET /api/carritoproductos
// ============================
self.getAll = async (req, res, next) => {
  try {
    const items = await carritoproducto.findAll({
      include: [
        { model: carrito, as: 'carrito' },
        { model: producto, as: 'producto' }
      ]
    })

    res.status(200).json(items)
  } catch (error) {
    next(error)
  }
}

// ============================
// GET /api/carritoproductos/:id
// ============================
self.getById = async (req, res, next) => {
  try {
    const item = await carritoproducto.findByPk(req.params.id, {
      include: [
        { model: carrito, as: 'carrito' },
        { model: producto, as: 'producto' }
      ]
    })

    if (!item)
      return res.status(404).json({ mensaje: 'Item no encontrado' })

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

// ============================
// POST /api/carritoproductos
// ============================
self.create = async (req, res, next) => {
  try {
    const { carritoid, productoid, cantidad } = req.body

    const cart = await carrito.findByPk(carritoid)
    if (!cart) return res.status(404).json({ mensaje: 'Carrito no existe' })

    const prod = await producto.findByPk(productoid)
    if (!prod) return res.status(404).json({ mensaje: 'Producto no existe' })

    const cant = cantidad && cantidad > 0 ? cantidad : 1
    const precioUnitario = prod.precio
    const subtotal = precioUnitario * cant

    const item = await carritoproducto.create({
      carritoid,
      productoid,
      cantidad: cant,
      precioUnitario,
      subtotal
    })

    res.status(201).json(item)
  } catch (error) {
    next(error)
  }
}

// ============================
// PUT /api/carritoproductos/:id
// ============================
self.update = async (req, res, next) => {
  try {
    const { cantidad } = req.body

    const item = await carritoproducto.findByPk(req.params.id)
    if (!item)
      return res.status(404).json({ mensaje: 'Item no encontrado' })

    item.cantidad = cantidad
    item.subtotal = Number(item.precioUnitario) * cantidad

    await item.save()

    res.status(200).json(item)
  } catch (error) {
    next(error)
  }
}

// ============================
// DELETE /api/carritoproductos/:id
// ============================
self.delete = async (req, res, next) => {
  try {
    const deleted = await carritoproducto.destroy({
      where: { id: req.params.id }
    })

    if (deleted === 0)
      return res.status(404).json({ mensaje: 'Item no encontrado' })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

module.exports = self
