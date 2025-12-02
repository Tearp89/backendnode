// tests/archivos.create.ok.test.js
const fs = require('fs');

jest.mock('fs'); // no queremos tocar disco
jest.mock('../models', () => ({
  archivo: {
    create: jest.fn()
  }
}));

const { archivo } = require('../models');
const archivosController = require('../controllers/archivos.controller');

test('POST /api/archivos crea registro y devuelve 201', async () => {
  process.env.FILES_IN_BD = "false";

  const fakeFile = {
    mimetype: 'image/jpeg',
    filename: '1234-prueba.jpg',
    size: 12345
  };

  const req = { file: fakeFile, bitacora: jest.fn() };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  const next = jest.fn();

  archivo.create.mockResolvedValue({
    id: 10,
    mime: fakeFile.mimetype,
    indb: false,
    nombre: fakeFile.filename,
    size: fakeFile.size,
    datos: null
  });

  await archivosController.create(req, res, next);

  expect(archivo.create).toHaveBeenCalledWith({
    mime: fakeFile.mimetype,
    indb: false,
    nombre: fakeFile.filename,
    size: fakeFile.size,
    datos: null
  });

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({
    id: 10,
    mime: fakeFile.mimetype,
    indb: false,
    nombre: fakeFile.filename
  });
});
