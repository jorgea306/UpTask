const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const crypto = require('crypto');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const bcrypt = require('bcrypt-nodejs');
const enviarEmail = require('../handlers/email');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son Obligatorios'
});

//Funcion para revisar si el usuario esta logeado o no
exports.usuarioAutenticado = (req, res, next) => {

    //si el usuario esta autenticado, adelante
    if (req.isAuthenticated()) {
        return next();
    }
    //sino esta autenticado, redirigir al formulario
    return res.redirect('/iniciar-sesion') 
}

//funcion para cerrar sesion
exports.cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/iniciar-sesion'); //al cerrar sesion nos lleva al login
    })
}

//genera un token si el usuario es valido
exports.enviarToken = async (req, res) => {
    //verificar que el usuario existe
    const {email} = req.body;
    const usuario = await Usuarios.findOne({where: {email}});

    //Si no existe el usuario
    if (!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/reestablecer')
    }

    //usuario existe
    //Generacion de token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expiracion = Date.now()+3600000;

    //guardar en la base de datos
    await usuario.save();

    //url de reset
    const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;
    
    //Envia el Correo con el Token
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reestablecer-password'
    });

    //terminar la ejecucion
    req.flash('correcto', 'Se envio un mensaje a tu correo');
    res.redirect('/iniciar-sesion');

}

exports.validarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token
        }
    })

    //Sino encuentra el usuario
    if (!usuario) {
        req.flash('error', 'No Valido');
        res.redirect('/reestablecer');
    }

    //Formulario para generar el password
    res.render('resetPassword', {
        nombrePagina: 'Reestablecer Contraseña'
    })
}

//cambia el password por uno nuevo
exports.actualizarPassword = async (req, res) => {

    //verifica el token valido pero tambien la fecha de expiracion
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token,
            expiracion: {
                [Op.gte]: Date.now()
            }
        }
    });

     //verificamos si el usuario existe
     if (!usuario) {
        req.flash('error', 'No Valido');
        res.redirect('/reestablecer');
    }

    //hashear el nuevo password
    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    //restablecer token y expiracion en null
    usuario.token = null;
    usuario.expiracion = null;

    //guardamos el nuevo password
    await usuario.save();

    //Mensaje y redireccion 
    req.flash('correcto', 'Tu Password se ha modificado correctamente');
    res.redirect('/iniciar-sesion')
}