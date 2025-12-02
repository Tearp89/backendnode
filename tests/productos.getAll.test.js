// tests/productos.getAll.test.js
jest.mock('../models', () => {
  const producto = { findAll: jest.fn() };
  const categoria = {}; // si no lo usas, puede ser vacío

  const Sequelize = {
    Op: { like: 'LIKE' }   // el valor puede ser cualquier cosa, sólo se usa como clave
  };

  return { producto, categoria, Sequelize };
});

const { producto } = require('../models');
const productosController = require('../controllers/productos.controller');


test('GET /api/productos devuelve 200 y lista de productos', async () => {
  producto.findAll.mockResolvedValue([
    { productoId: 1, titulo: 'Minecraft', precio: 55 },
    { productoId: 2, titulo: 'Until Then', precio: 40 }
  ]);

  const req = { query: {} };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  const next = jest.fn();

  await productosController.getAll(req, res, next);

  expect(producto.findAll).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith([
    { productoId: 1, titulo: 'Minecraft', precio: 55 },
    { productoId: 2, titulo: 'Until Then', precio: 40 }
  ]);
});
