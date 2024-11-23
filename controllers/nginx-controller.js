const utils = require("../utils/utils");
const fs = require("fs");
const path = require("path");

let defaultScript = `
server {
    server_name @DOMINIO@; #puede ser "www.mateflix.app mateflix.app" (sin comillas dobles) 
    location / {
        proxy_pass http//localhost:@PUERTO@; #cambiar por el puerto utilizado en node
        
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

async function crearProyecto(req, res) {
    try{
        let { dominio, puerto } = req.body;
    
        let comando = defaultScript;
        comando = comando.replace("@DOMINIO@", dominio);
        comando = comando.replace("@PUERTO@", puerto);
        
        let resp = await utils.exec(comando);

        let comando2 = `sudo ln -s /etc/nginx/sites-available/${dominio} /etc/nginx/sites-enabled/`;
        let resp2 = await utils.exec(comando2);

        let comando3 = `sudo nginx -t`;
        let resp3 = await utils.exec(comando3);
        res.send(resp3);

    }catch(err){
        utils.writeLog("nginx.crearProyecto", err.toString());
        res.json({ error: err.toString() });
    }
}
async function leer(req, res) {
    try{
        let { dominio } = req.body;
    
        let p = "/etc/nginx/sites-available/" + dominio;
        
        if(fs.existsSync(p) == false) throw "No existe el archivo de configuracion nginx";
        let content = fs.readFileSync(p, "utf-8");
        
        let comando = defaultScript;
        comando = comando.replace("@DOMINIO@", dominio);
        comando = comando.replace("@PUERTO@", puerto);
        
        let resp = await utils.exec(comando);

        let comando2 = `sudo ln -s /etc/nginx/sites-available/${dominio} /etc/nginx/sites-enabled/`;
        let resp2 = await utils.exec(comando2);

        let comando3 = `sudo nginx -t`;
        let resp3 = await utils.exec(comando3);
        res.send(resp3);

    }catch(err){
        utils.writeLog("nginx.crearProyecto", err.toString());
        res.json({ error: err.toString() });
    }
}
async function escribir(req, res) {
    
}
async function verificarIntegridad(req, res) {
    try{
        let resp = await utils.exec("sudo nginx -t");
        res.send(resp);
    }catch(err){
        utils.writeLog("nginx.verificarIntegridad", err.toString());
        res.json({ error: err.toString() });
    }
}
async function verificarEstado(req, res) {
    try{
        let resp = await utils.exec("sudo systemctl status nginx");
        res.send(resp);
    }catch(err){
        utils.writeLog("nginx.reiniciar", err.toString());
        res.json({ error: err.toString() });
    }
}
async function iniciar(req, res) {
    try{
        let respStart = await utils.exec("sudo systemctl start nginx");
        let respEnable = await utils.exec("sudo systemctl enable nginx");
        await verificarEstado();
    }catch(err){
        utils.writeLog("nginx.iniciar", err.toString());
        res.json({ error: err.toString() });
    }
}  
async function reiniciar(req, res) {
    try{
        let resp = await utils.exec("sudo systemctl restart nginx");
        await verificarEstado();
    }catch(err){
        utils.writeLog("nginx.reiniciar", err.toString());
        res.json({ error: err.toString() });
    }
}

module.exports = {
    crearProyecto,
    leer,
    escribir,
    verificarIntegridad,
    verificarEstado,
    iniciar,
    reiniciar
};