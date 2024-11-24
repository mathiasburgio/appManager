const utils = require("../utils/utils");
const path = require("path");
const fs = require("fs");
const projectController = require("./project-controller");

async function _clone(token, url, projectName){
    let execResp = null;
    try{
        let newFolderName = path.join(process.env.WWW_PATH, projectName);
        if(token){
            execResp = await utils.exec(`git clone https://${token}:x-oauth-basic@${url} ${newFolderName}`)
        }else{
            execResp = await utils.exec(`git clone ${url} ${newFolderName}`)
        }

        return execResp;
    }catch(err){
        utils.writeLog("env.clonarExample", err.toString());
        return {error: execResp};
    }
}
function pull(req, res){
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
function rollback(req, res){

}

module.exports = {
    _clone,
    pull,
    rollback
}