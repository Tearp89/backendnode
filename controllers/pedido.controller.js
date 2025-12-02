const { pedido, carrito, carritoproducto, producto, usuario } = require('../models')
const ClaimTypes = require('../config/claimtypes')

let self = {}

// GET: /api/pedidos
// Pedidos del usuario logueado
self.getMyOrders = async function (req, res, next) {
  try {
    const email = req.decodedToken[ClaimTypes.Name]

    const user = await usuario.findOne({ where: { email } })
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' })

    const orders = await pedido.findAll({
      where: { usuarioid: user.id },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: carrito,
          as: 'carrito',
          include: {
            model: producto,
            as: 'productos',
            attributes: ['id', 'titulo', 'precio'],
            through: {
              model: carritoproducto,
              attributes: ['id', 'cantidad', 'precioUnitario', 'subtotal']
            }
          }
        }
      ]
    })

    res.status(200).json(orders)
  } catch (error) {
    next(error)
  }
}

// GET: /api/pedidos/:id
// Detalle de un pedido (solo si es tuyo o, si luego quieres, lo limitas por rol en ruta)
self.getById = async function (req, res, next) {
  try {
    const pedidoId = req.params.id
    const email = req.decodedToken[ClaimTypes.Name]

    const user = await usuario.findOne({ where: { email } })
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' })

    const order = await pedido.findByPk(pedidoId, {
      include: [
        {
          model: carrito,
          as: 'carrito',
          include: {
            model: producto,
            as: 'productos',
            attributes: ['id', 'titulo', 'precio'],
            through: {
              model: carritoproducto,
              attributes: ['id', 'cantidad', 'precioUnitario', 'subtotal']
            }
          }
        }
      ]
    })

    if (!order) return res.status(404).json({ mensaje: 'Pedido no encontrado' })

    // Verificar que el pedido es del usuario logueado
    if (order.usuarioid !== user.id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver este pedido' })
    }

    res.status(200).json(order)
  } catch (error) {
    next(error)
  }
}

// GET: /api/pedidos/admin/todos
// Listado de todos los pedidos (solo Admin - control en ruta)
self.getAll = async function (req, res, next) {
  try {
    const orders = await pedido.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: usuario,
          as: 'usuario',
          attributes: ['id', 'email', 'nombre']
        },
        {
          model: carrito,
          as: 'carrito',
          include: {
            model: producto,
            as: 'productos',
            attributes: ['id', 'titulo', 'precio'],
            through: {
              model: carritoproducto,
              attributes: ['id', 'cantidad', 'precioUnitario', 'subtotal']
            }
          }
        }
      ]
    })

    res.status(200).json(orders)
  } catch (error) {
    next(error)
  }
}

self.create = async function (req, res, next) {
  const t = await pedido.sequelize.transaction()
  try {
    const email = req.decodedToken[ClaimTypes.Name]
    const user = await usuario.findOne({ where: { email } })
    if (!user) {
      await t.rollback()
      return res.status(404).json({ mensaje: 'Usuario no encontrado' })
    }

    const { carritoId, productoId, cantidad } = req.body

    let cart
    let total = 0

    if (carritoId) {
      // caso: pedido desde carrito ACTIVO
      cart = await carrito.findByPk(carritoId, {
        include: {
          model: carritoproducto,
          as: 'carritoproductos'
        }
      })
      if (!cart) {
        await t.rollback()
        return res.status(404).json({ mensaje: 'Carrito no encontrado' })
      }

      total = await carritoproducto.sum('subtotal', { where: { carritoid: cart.id } })
      cart.estado = 'COMPLETADO'
      await cart.save({ transaction: t })
    } else if (productoId) {
      // caso: COMPRAR AHORA
      const cant = (!cantidad || cantidad <= 0) ? 1 : cantidad

      const prod = await producto.findByPk(productoId)
      if (!prod) {
        await t.rollback()
        return res.status(404).json({ mensaje: 'Producto no encontrado' })
      }

      const precioUnitario = Number(prod.precio)
      const subtotal = precioUnitario * cant
      total = subtotal

      cart = await carrito.create({
        usuarioid: user.id,
        estado: 'COMPLETADO'
      }, { transaction: t })

      await carritoproducto.create({
        carritoid: cart.id,
        productoid: prod.id,
        cantidad: cant,
        precioUnitario,
        subtotal
      }, { transaction: t })
    } else {
      await t.rollback()
      return res.status(400).json({ mensaje: 'Debe enviar carritoId o productoId' })
    }

    const order = await pedido.create({
      carritoid: cart.id,
      usuarioid: user.id,
      total,
      estado: 'CREADO'
    }, { transaction: t })

    req.bitacora && req.bitacora("pedido.crear", order.id)

    await t.commit()
    return res.status(201).json(order)
  } catch (error) {
    await t.rollback()
    next(error)
  }
}

module.exports = self
