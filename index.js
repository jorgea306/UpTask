const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

//helpers con algunas funciones 
const helpers = require('./helpers');

//Crear la conexion a la BD
const db = require('./config/db');


//Importa el modelo
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

db.sync()
.then(() => console.log('Conectado al Servidor'))
.catch(error => console.log(error) );

//crear una app de express
const app = express();

//Donde cargar los archivos estaticos
app.use(express.static('public'));

//habilitar Pug
app.set('view engine', 'pug');

//Habilitar bodyparser para leer datos del formulario
app.use(bodyParser.urlencoded({extended: true}));

//Añadir la carpeta de las vistas
app.set('views', path.join(__dirname, './views'));

//agregar flash messages
app.use(flash());

app.use(cookieParser());

//sesiones nos permiten navegar entre distintas paginas sin volvernos a autenticar
app.use(session({
    secret:'supersecreto',
    resave: false,
    saveUninitialized: false
}));

//arrancar una instancia de passport
app.use(passport.initialize());
app.use(passport.session());

//Pasar var dump a la aplicacion
app.use((req, res, next) =>{
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user} || null;
    //next lo que hace es que pase al siguiente Middleware, completa la accion y pasa a la siguiente bloque de codigo
    next();
});

const routes = require('./routes');
//rutas
app.use('/', routes());

//puerto que queremos que corra
app.listen(3000);

//mandamos a llamar al email
// require('./handlers/email');


