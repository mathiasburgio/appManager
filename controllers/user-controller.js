const path = require("path")
const fs = require("fs")
const utils = require("../utils/utils")

async function login(req, res){
    try{
        let {email, password} = req.body;
        
        let passwordPath = path.join(__dirname, "..", "password");
        
        if( fs.existsSync( passwordPath ) ){
            
            let _password = await fs.promises.readFile( passwordPath, "utf-8");
            let loginOk = false;
            if(email !== process.env.EMAIL_SUPER_ADMIN) throw "Combinación email/contraseña no válida";
            
            if(process.env.ENCRYPT_PASSWORD_SUPER_ADMIN === "true"){
                loginOk = ( await utils.comparePasswordHash(password, _password) );
            }else{
                loginOk = (password === _password);
            }

            if(loginOk){
                req.session.data = {email: email};
                req.session.save();
                utils.writeLog("user.login", "login ok");
                res.send("ok");
            }else{
                throw "Combinación email/contraseña no válida";
            }

        }else{
            let resp = await createUser(email || null, password || null);
            if(resp !== true) throw "Ocurrio un error";
            
            req.session.data = {email: email};
            req.session.save();
            utils.writeLog("user.login", "creó contraseña para usuario admin");
            res.send("ok");
        }
    }catch(err){
        utils.writeLog("user.login", err.toString(), true);
        res.json({ error: err.toString() });
    }
}
function logout(req, res){
    req.session.destroy();
    res.redirect("https://google.com");
}
async function createUser(email = "", password = ""){
    if(email != process.env.EMAIL_SUPER_ADMIN) throw "Email no válido";
    if(password.length < 8) throw "Contraseña no valida (minimo 8 caracteres)";

    let passwordPath = path.join(__dirname, "..", "password");
    if(process.env.ENCRYPT_PASSWORD_SUPER_ADMIN === "true"){
        let _password = await utils.getPasswordHash(password);
        fs.writeFileSync(passwordPath, _password);
    }else{
        fs.writeFileSync(passwordPath, password);
    }
    return true;
}

module.exports = {
    login,
    logout
};