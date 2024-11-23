const utils = require("../utils/utils");
const path = require("path");
const fs = require("fs");

function clonarExample(req, res){
    try{
        let {proyecto, directorio} = req.body;
    
        if( fs.existsSync( path.join(directorio, ".env") ) ){
            throw "Ya existe el archivo .env";
        }
    
        if( fs.existsSync( path.join(directorio, ".env_example") ) ){
            fs.copyFileSync( path.join(directorio, ".env_example"), path.join(directorio, ".env"));
        }else if( fs.existsSync( path.join(directorio, ".env-example") ) ){
            fs.copyFileSync( path.join(directorio, ".env-example"), path.join(directorio, ".env"));
        }else{
            throw "No se encontro el archivo '.env-example' ni '.env_example'";
        }

        let env = fs.readFileSync( path.join(directorio, ".env"));
        res.json(env);
    }catch(err){
        utils.writeLog("env.clonarExample", err.toString());
        res.json({ error: err.toString() });
    }
}
function leer(req, res){
    try{
        let {proyecto, directorio} = req.body;
        if( fs.existsSync( path.join(directorio, ".env") ) == false ) throw "No existe el archivo .env";

        let env = fs.readFileSync( path.join(directorio, ".env"));
        res.json(env);
    }catch(err){
        utils.writeLog("env.leer", err.toString());
        res.json({ error: err.toString() });
    }
}
function escribir(req, res){
    try{
        let {proyecto, directorio, contenido} = req.body;
        if( fs.existsSync( path.join(directorio, ".env") ) == false ) throw "No existe el archivo .env";
        fs.writeFileSync( path.join(directorio, ".env"), contenido);
        res.send("ok");
        
    }catch(err){
        utils.writeLog("env.escribir", err.toString());
        res.json({ error: err.toString() });
    }
}

module.exports = {
    clonarExample,
    leer,
    escribir
}