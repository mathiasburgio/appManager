const utils = require("../utils/utils.js");
const path = require("path");
const fs = require("fs");
const os = require("os");
const pm2 = require("pm2");
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
        console.log(2);
        let resp = await utils.exec(`pm2 ${newStatus} ${projectName}`);
        console.log(3);
        console.log("_change status: " + resp)
        return resp;
    }catch(err){
        console.log(6);
        console.log(err);
        return null;
    }
}
async function _projectsList(){
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
        return resp;
    }catch(err){
        throw err;
    }
}
async function changeStatus(req, res){
    try{
        let {newStatus, projectName} = req.body;
        console.log(1, {newStatus, projectName});
        let resp = await _changeStatus(newStatus, projectName);
        console.log(10);
        res.end("ok");
    }catch(err){
        res.json({error: err});
    }
}
async function gitPull(req, res){
    try{
        let {projectName} = req.body;
        let projectPath = path.join(process.env.WWW_PATH, projectName);
        console.log({projectName, projectPath});
        // Agregar el directorio como seguro
        await utils.exec(`git config --global --add safe.directory ${projectPath}`);

        //ejecuta git pull
        let resp = await utils.exec(`cd ${projectPath} && git pull`);
        console.log(resp);
        res.end(resp);
    }catch(err){
        console.log(err);
        res.json({error: err});
    }
}
async function projectsList(req, res){
    try{
        let resp = await _projectsList();
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
        let projects = await _projectsList();
        let project = projects.find(p=>p.name == projectName);
        if(!project) throw "Project not finded";
        let errPath = project.pm2_env?.pm_err_log_path;
        let outPath = project.pm2_env?.pm_out_log_path;

        let resp = {};
        if(fs.existsSync(errPath)) resp.err = fs.readFileSync(errPath, "utf8").split('\n').slice(-1000).join('\n');;
        if(fs.existsSync(outPath)) resp.out = fs.readFileSync(outPath, "utf8").split('\n').slice(-1000).join('\n');;
        res.json(resp);
    }catch(err){
        console.log(err);
        res.json({error: err});
    }
}
module.exports = {
    changeStatus,
    gitPull,
    projectsList,
    flushLogs,
    logs
}