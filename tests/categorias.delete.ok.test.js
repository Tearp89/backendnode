const { categoria } = require('../models');
const categoriasController = require('../controllers/categorias.controller');

test('DELETE /api/categorias/:id elimina categoría no protegida y devuelve 204', async () => {
  // Mock de req, res, next
  const req = {
    params: { id: 2 },
    bitacora: jest.fn(),   // ❗ importante
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  const next = jest.fn();

  // Mocks de modelo
  categoria.findByPk = jest.fn().mockResolvedValue({
    id: 2,
    protegida: false,
  });

  categoria.destroy = jest.fn().mockResolvedValue(1);

  // Ejecutar controlador
  await categoriasController.delete(req, res, next);

  // Asserts
  expect(categoria.findByPk).toHaveBeenCalledWith(2);
  expect(categoria.destroy).toHaveBeenCalledWith({ where: { id: 2 } });
  expect(req.bitacora).toHaveBeenCalledWith('categoria.eliminar', 2);
  expect(res.status).toHaveBeenCalledWith(204);
  expect(res.send).toHaveBeenCalled();
});
