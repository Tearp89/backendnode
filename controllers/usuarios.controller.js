const { usuario, rol, Sequelize } = require('../models')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

let self = {}

// GET: api/usuarios
self.getAll = async function (req, res, next) {
    try {
        const data = await usuario.findAll({
            raw: true,
            attributes: [
                'id',
                'email',
                'nombre',
                [Sequelize.col('rol.nombre'), 'rol']
            ],
            include: [{ model: rol, attributes: [] }]
        })

        res.status(200).json(data)

    } catch (error) {
        next(error)
    }
}

// GET: api/usuarios/email
self.get = async function (req, res, next) {
    try {
        const email = req.params.email

        const data = await usuario.findOne({
            where: { email: email },
            raw: true,
            attributes: [
                'id',
                'email',
                'nombre',
                [Sequelize.col('rol.nombre'), 'rol']
            ],
            include: [{ model: rol, attributes: [] }]
        })

        if (data)
            return res.status(200).json(data)

        res.status(404).send()

    } catch (error) {
        next(error)
    }
}

// POST: api/usuarios
self.create = async function (req, res, next) {
    try {
        const rolusuario = await rol.findOne({ where: { nombre: req.body.rol } });
        
        // 🚨 FIX 1: Validar que el rol exista
        if (!rolusuario) {
             // Si el rol no se encuentra (a pesar de la selección), devolvemos un 400
             return res.status(400).json({ error: 'El rol de usuario especificado no existe.' });
        }

        // 🚨 FIX 2: Validar que la contraseña existe antes de hashearla
        if (!req.body.password) {
             return res.status(400).json({ error: 'El campo contraseña es obligatorio.' });
        }
        
        // Calculamos el hash de la contraseña de forma segura
        const passwordHash = await bcrypt.hash(req.body.password, 10);
        
        const data = await usuario.create({
            id: crypto.randomUUID(),
            email: req.body.email,
            passwordHash: passwordHash, // Usamos la variable hasheada
            nombre: req.body.nombre,
            rolId: rolusuario.id, // Usamos el ID del rol encontrado
            protegido: 0
        });

        // Bitacora
        req.bitacora("usuarios.crear", data.email);

        res.status(201).json({
            id: data.id,
            email: data.email,
            nombre: data.nombre,
            rolid: rolusuario.nombre,
            protegido: 0
        });

    } catch (error) {
        // 🚨 FIX 3: Manejar errores de base de datos (duplicidad de email)
        if (error.name === 'SequelizeUniqueConstraintError' || error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: 'El correo electrónico ya existe o los datos de entrada son inválidos.' });
        }
        
        // Propaga el error para que siga siendo un 500 para fallos no controlados
        next(error);
    }
};


// PUT: api/usuarios/email
self.update = async function (req, res, next) {
    try {
        const email = req.params.email

        const rolusuario = await rol.findOne({ where: { nombre: req.body.rol } })
        req.body.rolid = rolusuario.id

        const data = await usuario.update(req.body, {
            where: { email: email },
        })

        if (data[0] === 0)
            return res.status(404).send()

        // Bitacora
        req.bitacora("usuarios.editar", email)

        res.status(204).send()

    } catch (error) {
        next(error)
    }
}

// DELETE: api/usuarios/email
self.delete = async function (req, res, next) {
    try {
        const email = req.params.email

        let data = await usuario.findOne({ where: { email: email } })

        // No se pueden eliminar usuarios protegidos
        if (data.protegido)
            return res.status(403).send()

        data = await usuario.destroy({ where: { email: email } })

        if (data === 1) {
            // Bitacora
            req.bitacora("usuarios.eliminar", email)
            return res.status(204).send() // Elemento eliminado
        }

        res.status(403).send()

    } catch (error) {
        next(error)
    }
}


module.exports = self
