const { exec  } = require('child_process');
const path = require("path")
const fs = require("fs")
const bcrypt = require("bcrypt");
const fechas = require("./fechas");
const uuid = require('uuid');

function _exec(command, parametters = []){
    return new Promise((resolve, reject)=>{
        // Ejecutar un comando (ejemplo: listar directorios)
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error: ${stderr}`);
                reject(err, stderr);
            }else{
                resolve(stdout);
            }
        });
    })
}
function writeLog(title="title", message="msg", error=false){
    let p = path.join(__dirname, "..", "log.txt");
    if(error) p = path.join(__dirname, "..", "log-error.txt");
    let text = fechas.getNow(true) + ` # ${title} # ${message}\n`;
    fs.appendFile(p, text, (err)=>{
        if(err) console.log(err);
    })
}
function encryptString(str, prefix=false){
    str = str.toString().trim();
    if(str == ""){return "";}
    let cipher = crypto.createCipheriv(crypto_options.algorithm, crypto_options.ENC_KEY, crypto_options.IV);
    let encrypted = cipher.update(str, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted + (prefix ? "__ENC__" : "");
}
function decryptString(str, prefix=false){
    str = str.toString().trim();
    if(prefix && str.substring(str.length - 7) != "__ENC__") return null;
    str = str.substring(0,str.length - 7);
    if(str == ""){return "";}
    let decipher = crypto.createDecipheriv(crypto_options.algorithm, crypto_options.ENC_KEY, crypto_options.IV);
    let decrypted = decipher.update(str, 'base64', 'utf8');
    return (decrypted + decipher.final('utf8'));
}
async function getPasswordHash(field_password){
    let salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(field_password, salt);
}
async function comparePasswordHash(field_password, bd_password){
    return await bcrypt.compare(field_password, bd_password);
}
function UUID(){
    return uuid.v4();
}
module.exports = {
    exec: _exec,
    writeLog,
    encryptString,
    decryptString,
    getPasswordHash,
    comparePasswordHash,
    UUID
};