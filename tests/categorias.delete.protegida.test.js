// tests/categorias.delete.protegida.test.js
jest.mock('../models', () => ({
  categoria: {
    findByPk: jest.fn(),
    destroy: jest.fn()
  }
}));

const { categoria } = require('../models');
const categoriasController = require('../controllers/categorias.controller');

test('DELETE /api/categorias/:id devuelve 400 si la categoría es protegida', async () => {
  categoria.findByPk.mockResolvedValue({
    id: 1,
    nombre: 'Default',
    protegida: true
  });

  const req = { params: { id: 1 } };
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  };
  const next = jest.fn();

  await categoriasController.delete(req, res, next);

  expect(categoria.findByPk).toHaveBeenCalledWith(1);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(categoria.destroy).not.toHaveBeenCalled();
});
