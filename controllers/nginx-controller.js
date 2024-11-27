const utils = require("../utils/utils");
const fs = require("fs");
const path = require("path");


function getFile(req, res){
    try{
        let {domain} = req.params;
        let p = path.join("/etc/nginx/sites-available/", domain);
        if(fs.existsSync(p) == true){
            let content = fs.readFileSync("/etc/nginx/sites-available/" + domain);
            res.json({content});
        }else{
            res.json({content: `'${p}' doesnt exist`});
        }
    }catch(err){
        utils.writeLog("nginx.getFile", err.toString(), true);
        res.json({error: err});
        res.end();
    }
}

module.exports = {
    getFile
};