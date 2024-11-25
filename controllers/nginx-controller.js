const utils = require("../utils/utils");
const fs = require("fs");
const path = require("path");

let defaultScript = `
server {
    server_name @DOMAIN@; #puede ser "www.mateflix.app mateflix.app" (sin comillas dobles) 
    location / {
        proxy_pass http//localhost:@PORT@; #cambiar por el puerto utilizado en node
        
        proxy_http_version 1.1; #para soportar web sockets
        proxy_set_header Upgrade $http_upgrade; #para soportar web sockets
        proxy_set_header Connection 'upgrade'; #para soportar web sockets
        proxy_set_header Host $host; #para cuando se trabajan con multiples host / servidores virtuales
        proxy_cache_bypass $http_upgrade; #para q las conexiones con websocket no trabajen sobre el cache
        
        client_max_body_size 5M; #tamaño maximo de datos
        
        # Ajustar los tiempos de espera para evitar timeouts
        proxy_read_timeout 90s;
        proxy_connect_timeout 90s;
        proxy_send_timeout 90s;
    }
}`;

function _getFilesList(){
    let availables = fs.readdirSync( "/etc/nginx/sites-available" );
    let enabled = fs.readdirSync( "/etc/nginx/sites-available" );
    return {availables, enabled};
}

function _readFile(domain){
    let content = fs.readFile( path.join("/etc/nginx/sites-available/", domain), "utf-8" );
    return content;
}

function _defaultScript(domain="DOMAIN", port="PORT") {
    return defaultScript.replaceAll("@DOMAIN@", domain).replaceAll("@PORT@", port);
}

function getFilesList(req, res){
    try{
        res.json(_getFilesList());
    }catch(err){
        utils.writeLog("nginx.getFilesList", err.toString());
        return {error: err.toString()};
    }
}
function readFile(req, res){
    try{
        res.json({content: _readFile()});
    }catch(err){
        utils.writeLog("nginx.readFile", err.toString());
        return {error: err.toString()};
    }
}
function defaultScript(req, res){
    try{
        res.json({content: _defaultScript()});
    }catch(err){
        utils.writeLog("nginx.defaultScript", err.toString());
        return {error: err.toString()};
    }
}

module.exports = {
    _getFilesList,
    _readFile,
    _defaultScript,
    getFilesList,
    readFile,
    defaultScript
};