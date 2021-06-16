const Proyectos = require('../models/Proyectos');
const Tareas = require('../models/Tareas');

exports.proyectosHome = async(req, res) => {

    const usuarioId = res.locals.usuario.id;

    //consulta a la base de datos
    const proyectos = await Proyectos.findAll({where:{usuarioId}});

    //pasa los datos a la vista
    res.render('index', {
        nombrePagina: 'Proyectos',
        proyectos
    });
}

exports.formularioProyecto =  async(req, res) => {
    const usuarioId = res.locals.usuario.id;

    //consulta a la base de datos
    const proyectos = await Proyectos.findAll({where:{usuarioId}});

    res.render('nuevoProyecto', {
        nombrePagina: 'Nuevo Proyecto',
        proyectos
    });
}

exports.nuevoProyecto = async (req, res) => {
    const usuarioId = res.locals.usuario.id;

    //consulta a la base de datos
    const proyectos = await Proyectos.findAll({where:{usuarioId}});

    //Enviar a la consola lo que el usuario envia
    // console.log(req.body);

    //Validar que tengamos algo en el input
    const {nombre} = req.body;

    let errores = [];

    if (!nombre) {
        errores.push({'texto': 'Agrega un Nombre al Proyecto'})
    }

    //Si hay errores
    if (errores.length > 0) {
        res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo Proyecto',
            errores,
            proyectos
        })
    } else {
        //No hay errores
        //Insertar en la BD

        //Forma comun de hacerlo
        /*Proyectos.create({nombre})
            .then(() => console.log('Insertado Correctamente'))
            .catch(error => console.log(error))*/

        //Forma optima y correcta de hacerlo
        const usuarioId = res.locals.usuario.id;
        await Proyectos.create({nombre, usuarioId});
        res.redirect('/');
        
    }
}

exports.proyectosPorUrl = async(req, res, next) => {
    const usuarioId = res.locals.usuario.id;

    //consulta a la base de datos
    const proyectosPromise = Proyectos.findAll({where:{usuarioId}});


    const proyectoPromise = Proyectos.findOne({
        where: {
            url: req.params.url,
            usuarioId
        }
    });

    //Promise
    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

    //Consultar tareas del Proyecto actual
    const tareas = await Tareas.findAll({
        where: {
            proyectoId: proyecto.id
        }
    });

    if (!proyecto) return next();

    //render a la vista
    res.render('tareas', {
        nombrePagina: 'Tareas del Proyecto',
        proyecto,
        proyectos,
        tareas
    })
}

exports.formularioEditar = async(req, res) => {
    
    const usuarioId = res.locals.usuario.id;

    //consulta a la base de datos
    const proyectosPromise = Proyectos.findAll({where:{usuarioId}});

    const proyectoPromise = Proyectos.findOne({
        where: {
            id: req.params.id,
            usuarioId
        }
    });

    //Promise
    const [proyectos, proyecto] = await Promise.all([proyectosPromise, proyectoPromise]);

    //render a la vista
    res.render('nuevoProyecto', {
        nombrePagina: 'Editar Proyecto',
        proyectos,
        proyecto
    })
}

exports.actualizarProyecto = async (req, res) => {
    
    const usuarioId = res.locals.usuario.id;

    //consulta a la base de datos
    const proyectos = await Proyectos.findAll({where:{usuarioId}});

    //Enviar a la consola lo que el usuario envia
    // console.log(req.body);

    //Validar que tengamos algo en el input
    const {nombre} = req.body;

    let errores = [];

    if (!nombre) {
        errores.push({'texto': 'Agrega un Nombre al Proyecto'})
    }

    //Si hay errores
    if (errores.length > 0) {
        res.render('nuevoProyecto', {
            nombrePagina: 'Nuevo Proyecto',
            errores,
            proyectos
        })
    } else {
        //No hay errores
        //Insertar en la BD

        //Forma comun de hacerlo
        /*Proyectos.create({nombre})
            .then(() => console.log('Insertado Correctamente'))
            .catch(error => console.log(error))*/

        //Forma optima y correcta de hacerlo
        await Proyectos.update(
            {nombre: nombre},
            {where: {id: req.params.id}}
        );
        res.redirect('/');
        
    }
}
 
exports.eliminarProyecto = async (req, res, next) => {
    //req contiene la informacion y se puede usar query o params para leer los datos que estas enviando al servidor
    const {urlProyecto} = req.query;
    const resultado = await Proyectos.destroy({where: {url: urlProyecto}});

    if (!resultado) {
        return next();
    }

    res.status(200).send('Proyecto Eliminado Correctamente');
}