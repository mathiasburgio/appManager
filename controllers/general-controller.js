const utils = require("../utils/utils.js");
const path = require("path");
const fs = require("fs");
const os = require("os");
const platform = os.platform(); // 'darwin', 'win32', 'linux', etc.

function _envDecoder(envPath){
    try{
        let obj = [];
        if(fs.existsSync( envPath ) == false) throw ".env file doesnt exist";

        let content = fs.readFileSync(envPath, "utf-8");
        let lines = content.split("\n");
        for(let line of lines){
            line = line.trim();
            if(line && !line.startsWith("#")){
                let prop = "";
                let val = "";
                let comment = "";
                
                let propVal = line.split("=");
                if(propVal.length == 2){
                    prop = propVal[0].trim();

                    let valComment = propVal[1].split("#");
                    val = valComment[0].trim();
                    if(valComment.length == 2) comment = valComment[1];
                }

                if(val.startsWith("\"")) val = val.substring(1);//remove start cuote
                if(val.endsWith("\";")) val = val.substring(0, val.length - 2);//remove end cuote and semicolon
                if(val.endsWith("\"")) val = val.substring(0, val.length - 1);//remove end cuote
                obj.push({
                    prop: prop,
                    val: val,
                    comment: comment
                })
            }
        }
        return obj;
    }catch(err){
        utils.writeLog("general._envDecoder", err.toString());
        return [{prop: "ERROR", val: err.toString()}];
    }
}
async function _changeStatus(newStatus, projectName){
    try{
        let resp = await utils.exec(`pm2 ${newStatus} ${projectName}`);
        return resp;
    }catch(err){
        return null;
    }
}
async function changeStatus(req, res){
    try{
        let {newStatus, projectName} = req.body;
        let resp = await _changeStatus(newStatus, projectName);
        res.end("ok");
    }catch(err){
        res.json({error: err});
    }
}
async function gitPull(req, res){
    try{
        let {projectName} = req.body;
        let projectPath = path.join(process.env.WWW_PATH, projectName);
        let resp = await utils.exec(`git pull ${projectPath}`);
        res.end(resp);
    }catch(err){
        res.json({error: err});
    }
}
async function projectsList(req, res){
    try{
        let resp = await utils.exec(`pm2 jlist`);
        resp = JSON.parse(resp);
        //let files = fs.readdirSync(path.join(__dirname, "projects"));
        for(let proj of resp){
            //let projectPath = path.join(process.env.WWW_PATH, proj.name);
            let envPath = path.join(process.env.WWW_PATH, proj.name, ".env");
            let nginxPath = path.join(`/etc/nginx/sites-available/${proj.name}`);
            proj.env = _envDecoder(envPath);
            if(fs.existsSync(nginxPath)) proj.nginx = fs.readFileSync(nginxPath, "utf-8");
        }
        res.json(resp);
    }catch(err){
        console.log(err);
        res.json({error: err});
    }
}
async function flushLogs(req, res){
    try{
        let {projectName} = req.body;
        let resp = await utils.exec(`pm2 flush ${projectName}`);
        res.end("ok");
    }catch(err){
        res.json({error: err});
    }
}
async function logs(req, res){
    try{
        let { projectName } = req.params;
        console.log(projectName);
        let resp = {
            err: await utils.exec(`pm2 logs ${projectName} --err --lines 1000 --nostream`),
            out: await utils.exec(`pm2 logs ${projectName} --out --lines 1000 --nostream`),
        };
        res.json(resp);
    }catch(err){
        console.log(err);
        res.json({error: err});
    }
}
/* function createProject(req, res){
    try{
        let {projectName, domain} = req.body;
        let projectPath = path.join(process.env.WWW_PATH, projectName);
        if(fs.existsSync(projectPath) == true) throw "Project already exist.";

        let project = {
            uuid: utils.UUID(),
            name: projectName,
            domain: domain
        };

        fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));
    }catch(err){

    }
}
 */
module.exports = {
    changeStatus,
    gitPull,
    projectsList,
    flushLogs,
    logs
}