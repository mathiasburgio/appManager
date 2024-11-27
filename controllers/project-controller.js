const fs = require("fs")
const os = require("os")
const path = require("path")
const fechas = require("../utils/fechas");
const utils = require("../utils/utils");

function _getList(){
    try{
        let dirFiles = fs.readdirSync( path.join(__dirname, "..", "projects") );
        let files = [];
        for(let f of dirFiles){
            let content = fs.readFileSync( path.join(__dirname, "..", "projects", f), "utf-8" );
            //files[f] = JSON.parse(content)
            files.push( JSON.parse(content) );
        }
        return files;
    }catch(err){
        utils.writeLog("project._getList", err.toString(), true);
        return [];
    }
}
function _getOne(name){
    let data = _getList();
    let proj = data.find(p=>p.name == name);
    return proj;
}
function create(req, res){
    let { name, domain } = req.body;
    let projectPath = path.join(__dirname, "..", "projects", name);
    name = name.replaceAll(" ", "");
    try{
        if( fs.existsSync(projectPath) ) throw "Project name already exist";
        let project = {
            id: utils.UUID(),
            name: name,
            domain: domain,
            path: path.join(process.env.WWW_PATH, name),
            installStatus: {
                dependencies: false,
                env: false,
                nginx: false
            },
            actions: {
                ping: {
                    url: "/ping",
                    method: "get",
                    params: {}
                }
                /*
                name (str): {
                    url: str,
                    method: str,
                    params: obj
                }
                */
            }
        };
        fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));
        res.end("ok");
    }catch(err){
        utils.writeLog("project.create", err.toString(), true);
        res.json({error: err});
        res.end();
    }
}
async function installDependencies(req, res){
    let { name } = req.body;
    let proj = _getOne(name);
    try{
        let resp = await utils.exec(`npm install ${proj.path}`)
        res.json({resp});
    }catch(err){
        utils.writeLog("project.installDependencies", err.toString(), true);
        res.json({error: err});
        res.end();
    }
}
function updateOne(req, res){
    try{
        let { project } = req.body;
        let projectPath = path.join(__dirname, "..", "projects", proj.name);
        if( fs.existsSync(projectPath) == false ) throw "Project doesnt exist";
        fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));
        res.end("ok");
    }catch(err){
        utils.writeLog("project.updateOne", err.toString(), true);
        res.json({error: err});
        res.end();
    }
}
function getList(req, res){
    try{
        res.json(_getList());
    }catch(err){
        utils.writeLog("project.updateOne", err.toString(), true);
        res.json({error: err});
        res.end();
    }
}
function getOne(req, res){
    try{
        let {name} = req.body;
        res.json(_getOne(name));
    }catch(err){
        utils.writeLog("project.updateOne", err.toString(), true);
        res.json({error: err});
        res.end();
    }
}
module.exports = {
    getList,
    getOne,
    create,
    updateOne,
    installDependencies
}