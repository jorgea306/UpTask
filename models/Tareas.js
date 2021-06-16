const Sequelize = require('sequelize'); 
const db = require('../config/db');
const Proyectos = require('./Proyectos');

//Definir el modelo
const Tareas = db.define('tareas', {
    id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    tarea: Sequelize.STRING(100),
    estado: Sequelize.INTEGER(1)
});

//Una tarea pertenece a un proyecto (relacion de las tablas)
Tareas.belongsTo(Proyectos);

module.exports = Tareas;
