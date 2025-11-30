// tests/archivos.create.noFile.test.js
jest.mock('../models', () => ({
  archivo: {}
}));

const archivosController = require('../controllers/archivos.controller');

test('POST /api/archivos devuelve 400 si no se envía archivo', async () => {
  const req = { file: undefined };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn()
  };
  const next = jest.fn();

  await archivosController.create(req, res, next);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith('El archivo es obligatorio.');
});
