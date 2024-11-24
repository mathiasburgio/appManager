const express = require("express")
const app = express();
const session = require("express-session");
const FileStore = require('session-file-store')(session);
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const favicon = require('serve-favicon');
const fechas = require("./utils/fechas.js");
const utils = require("./utils/utils")
const fs = require("fs");
const os = require("os");


require('dotenv').config();


//verifico la carpeta de proyectos
if(fs.existsSync(path.join(__dirname, "projects")) == false){
    fs.mkdirSync( path.join(__dirname, "projects") );
}

//sessions
app.use(session({
    secret: process.env?.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge : Number(process.env?.SESSION_MAXAGE) || (1000 * 60 * 60 * 24 * 5),//5 días
        sameSite: true,
        //secure : !(process.env.NODE_ENV == 'development') // true ssl
    },
    store: new FileStore({})
}));

app.use( favicon(__dirname + "/public/resources/icon.ico") );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next)=>{
    
    let email = req.session?.data?.email;
    if(email && email === process.env.EMAIL_SUPER_ADMIN && req.body?.proyectoId){
        let p = path.join(__dirname, "proyectos", req.body.proyectoId);
        if(fs.existsSync(p)){
            let proyecto = fs.readFileSync( path.join(__dirname, "proyectos", req.body.proyectoId), "utf-8" );
            req.proyecto = JSON.parse(proyecto);
        }
    }
    next();
});

app.use("/", express.static( path.join(__dirname, "public") ));

app.use(require("./routes/user-routes.js"))
app.use(require("./routes/env-routes.js"))
app.use(require("./routes/project-routes.js"))
/* app.use(require("./routes/pm2-routes.js")) */

//cors
if(process.env?.CORS === "true") app.use(cors());

//ping para control
app.get("/ping", (req, res)=>{
    res.send("pong");
    res.end();
})

//manejo de index
app.get("/", (req, res)=>{
    const index = path.join(__dirname, "public", "index.html");
    res.status(200).sendFile(index);
})

//manejo de 404
app.use((req, res, next) => {
    res.status(404).send("Erro 404 - Recurso no encontrado");
})

//inicio el servidor
app.listen(Number(process.env.PORT), async ()=>{
    console.log("Escuchando en http://localhost:" + process.env.PORT)
})