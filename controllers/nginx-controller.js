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

async function _createConfigFile(domain, port) {
    try{
        let command1 = defaultScript;
        command1 = command1.replace("@DOMAIN@", domain);
        command1 = command1.replace("@PORT@", port);
        
        let resp1 = await utils.exec(command1);

        let command2 = `sudo ln -s /etc/nginx/sites-available/${domain} /etc/nginx/sites-enabled/`;
        let resp2 = await utils.exec(command2);

        let command3 = `sudo nginx -t`;
        let resp3 = await utils.exec(command3);
        
        return {command1: resp1, command2: resp2, command3: resp3};
    }catch(err){
        utils.writeLog("nginx.crearProyecto", err.toString());
        res.json({ error: err.toString() });
    }
}
async function read(req, res) {
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
async function write(req, res) {
    
}
async function restart(req, res) {
    try{
        let resp1 = await utils.exec("nginx -t");
        if(resp1.indexOf("syntax is ok") > 0 && resp1.indexOf("test is successful") > 0){
            let resp2 = await utils.exec("systemctl restart nginx");
            return {resp1, resp2};
        }
        return {resp1};
    }catch(err){
        utils.writeLog("nginx.restart", err.toString());
        res.json({ error: err.toString() });
    }
}

module.exports = {
    _createConfigFile,
    read,
    write,
    restart
};