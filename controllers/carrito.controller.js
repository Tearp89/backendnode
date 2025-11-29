const { carrito, carritoproducto, producto, usuario, pedido, Sequelize } = require('../models')
const ClaimTypes = require('../config/claimtypes')

let self = {}

async function getOrCreateActiveCart(req) {
  const email = req.decodedToken[ClaimTypes.Name]

  const user = await usuario.findOne({ where: { email } })
  if (!user) throw new Error('Usuario no encontrado')

  let cart = await carrito.findOne({
    where: {
      usuarioid: user.id,
      estado: 'ACTIVO'
    }
  })

  if (!cart) {
    cart = await carrito.create({
      usuarioid: user.id,
      estado: 'ACTIVO'
    })
  }

  return { cart, user }
}

// GET: api/carrito
self.get = async function (req, res, next) {
  try {
    const email = req.decodedToken[ClaimTypes.Name]

    const user = await usuario.findOne({ where: { email } })
    if (!user) return res.status(404).send()

    const cart = await carrito.findOne({
      where: { usuarioid: user.id, estado: 'ACTIVO' },
      include: {
        model: producto,
        as: 'productos',
        attributes: [
          ['id', 'productoId'],
          'titulo',
          'descripcion',
          'precio',
          'archivoid'
        ],
        through: {
          model: carritoproducto,
          attributes: ['id', 'cantidad', 'precioUnitario', 'subtotal']
        }
      }
    })

    if (!cart)
      return res.status(200).json({ id: null, items: [], total: 0 })

    const total = cart.productos.reduce((acc, p) => {
      return acc + Number(p.carritoproducto.subtotal)
    }, 0)

    res.status(200).json({
      id: cart.id,
      items: cart.productos,
      total
    })
  } catch (error) {
    next(error)
  }
}

// POST: api/carrito/items
self.addItem = async function (req, res, next) {
  try {
    const { productoId, cantidad } = req.body

    const { cart } = await getOrCreateActiveCart(req)

    const prod = await producto.findByPk(productoId)
    if (!prod) return res.status(404).json({ mensaje: 'Producto no encontrado' })

    const cant = cantidad && cantidad > 0 ? cantidad : 1
    const precioUnitario = prod.precio
    const subtotal = Number(precioUnitario) * cant

    let item = await carritoproducto.findOne({
      where: {
        carritoid: cart.id,
        productoid: prod.id
      }
    })

    if (item) {
      item.cantidad += cant
      item.subtotal = Number(item.precioUnitario) * item.cantidad
      await item.save()
    } else {
      item = await carritoproducto.create({
        carritoid: cart.id,
        productoid: prod.id,
        cantidad: cant,
        precioUnitario,
        subtotal
      })
    }

    req.bitacora("carrito.agregar", `${cart.id}:${prod.id}`)
    res.status(201).json(item)
  } catch (error) {
    next(error)
  }
}

// PUT: api/carrito/items/:id
self.updateItem = async function (req, res, next) {
  try {
    const itemId = req.params.id
    const { cantidad } = req.body

    if (!cantidad || cantidad <= 0) {
      await carritoproducto.destroy({ where: { id: itemId } })
      req.bitacora("carrito.eliminarItem", itemId)
      return res.status(204).send()
    }

    let item = await carritoproducto.findByPk(itemId)
    if (!item) return res.status(404).send()

    item.cantidad = cantidad
    item.subtotal = Number(item.precioUnitario) * cantidad
    await item.save()

    req.bitacora("carrito.actualizarItem", itemId)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

// DELETE: api/carrito/items/:id
self.removeItem = async function (req, res, next) {
  try {
    const itemId = req.params.id

    const deleted = await carritoproducto.destroy({ where: { id: itemId } })
    if (deleted === 0) return res.status(404).send()

    req.bitacora("carrito.eliminarItem", itemId)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

// DELETE: api/carrito
self.clear = async function (req, res, next) {
  try {
    const { cart } = await getOrCreateActiveCart(req)

    await carritoproducto.destroy({ where: { carritoid: cart.id } })

    req.bitacora("carrito.vaciar", cart.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

// PATCH: api/carrito
self.checkout = async function (req, res, next) {
  try {
    const { cart, user } = await getOrCreateActiveCart(req)

    // 1. Obtener items del carrito
    const items = await carritoproducto.findAll({ where: { carritoid: cart.id } })
    if (items.length === 0)
      return res.status(400).json({ mensaje: 'El carrito está vacío' })

    // 2. Calcular total
    const total = items.reduce((acc, item) => {
      return acc + Number(item.subtotal)
    }, 0)

    // 3. Marcar carrito como COMPLETADO
    cart.estado = 'COMPLETADO'
    await cart.save()

    // 4. Crear pedido ligado a ese carrito
    const nuevoPedido = await pedido.create({
      carritoid: cart.id,
      usuarioid: user.id,
      total,
      estado: 'CREADO' // o PAGADO si quieres asumir pago inmediato
    })

    // Bitácora
    req.bitacora("carrito.checkout", cart.id)
    req.bitacora("pedido.crear", nuevoPedido.id)

    // 5. Responder con info del pedido
    res.status(200).json({
      mensaje: 'Compra realizada con éxito',
      pedidoId: nuevoPedido.id,
      total
    })
  } catch (error) {
    next(error)
  }
}


module.exports = self
