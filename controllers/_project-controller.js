const utils = require("../utils/utils");
const pm2 = require("./pm2-controller");
const git = require("./git-controller");
const nginx = require("./nginx-controller");
const env = require("./env-controller");
const fs = require("fs")
const path = require("path")
const fechas = require("../utils/fechas");
const os = require("os");

/* function _getList(){
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
function _getOneByName(projectName){
    let data = _getList();
    let proj = data.find(p=>p.name == projectName);
    return proj;
}
function getList(req, res){
    try{
        let data = _getList();

        let pm2List = pm2._getAll();
        data.forEach(proj=>{
            let projPm2 = pm2List.find(p=>p.name == proj.name);
            if(projPm2) proj.pm2 = projPm2;
        });
        res.json({projects: data});
    }catch(err){
        utils.writeLog("project.getList", err.toString(), true);
        res.json({ error: err.toString() });
    }
}
function getOneByName(req, res){
    try{
        let {projectName} = req.body;
        let proj = _getOneByName(projectName);
        res.json({project: proj});
    }catch(err){
        utils.writeLog("project.getOneByName", err.toString(), true);
        res.json({ error: err.toString() });
    }
}
    */
async function create(req, res){
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendProgress = (message) => {
        res.write(`${message}<br>`);
    };

    let { name, domain, gitToken, gitUrl, port } = req.body;
    let projectPath = path.join(__dirname, "..", "projects", name);
    
    try{

        sendProgress("Creating project...");
        if( fs.existsSync(projectPath) ) throw "Project name already exist";

        let project = {
            id: utils.UUID(),
            name: name,
            domain: domain,
            path: path.join(process.env.WWW_PATH, name),
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

        //save project
        fs.writeFileSync( projectPath, JSON.stringify(project, null, 2) );
        sendProgress("Creating project...OK");
        
        //git
        sendProgress("Cloning repository...");
        let retGit = await git._clone(gitToken, gitUrl, name);

        if(retGit?.error) throw retGit.error;
        sendProgress("Cloning repository...OK");
        //project.path = path.join(process.env.WWW_PATH, retGit);

        //install dependencies
        sendProgress("Installing dependencies...");
        let retNpmInstall = await utils.exec(`npm install ${project.path}`);
        sendProgress("Installing dependencies...OK");

        //.env
        sendProgress("Cloning .env_example (or .env-example)...");
        let retCloneEnv = env._cloneExample(project);
        sendProgress("Cloning .env_example (or .env-example)...OK");

        //port
        sendProgress("Obtaining port...");
        if(port){
            env._setValue(project, "PORT", port);
        }else{
            port = env._getValue(project, "PORT");
        }
        if(!port) throw "No PORT detected for project";
        sendProgress(`Port will be ${port}`);

        //nginx
        sendProgress("Creating virtual server (nginx config file)...");
        let retNginx = nginx._createConfigFile(domain, port);
        sendProgress("Creating virtual server (nginx config file)...OK");

        //re-save project
        fs.writeFileSync( projectPath, JSON.stringify(project, null, 2) );
        utils.writeLog("project.create", project.name);
        
        sendProgress("Process finish!");
        res.end();
    }catch(err){
        console.log("--" + fechas.getNow(true) + "--");
        console.log(err);
        //borra el proceso si no finalizo correctamente
        fs.unlinkSync( projectPath );
        utils.writeLog("project.create", err.toString(), true);
        sendProgress("ERROR => " + err.toString());
        res.end();
    }
}
/*
function _update(project){
    let filePath = path.join(__dirname, "..", "projects", project.name + ".json");
    fs.writeFileSync( filePath, JSON.stringify(project, null, 2) );
    return project;
}
function updateOne(req, res){
    try{
        let {project} = req.body;
        _update(project);
    }catch(err){
        utils.writeLog("project.getOneByName", err.toString(), true);
        res.json({ error: err.toString() });
    }
}

async function deleteOne(req, res){
    try{
        let { projectName } = req.body;
        let filePath = path.join(__dirname, "..", "projects", projectName + ".json");
        let project = JSON.parse(fs.readFileSync( filePath, "utf-8" ));
        
        //borro el archivo de configuracion
        fs.unlinkSync( filePath );

        //borro los archivos de nginx
        fs.unlinkSync( path.join("etc", "ngixn", "sites-available", projectName));
        fs.unlinkSync( path.join("etc", "ngixn", "sites-enabled", projectName));

        //quito de pm2
        await utils.exec(`pm2 stop ${projectName}`);
        await utils.exec(`pm2 delete ${projectName}`);
        await utils.exec(`pm2 save`);

        //marco el proyecto como eliminado
        //para eliminarlo completamente debe de hacerse desde consola
        fs.renameSync(path.join(process.env.WWW_PATH, projectName), path.join(process.env.WWW_PATH, "DELETED_" + projectName));
        
        utils.writeLog("project.deleteOne", "delete " + projectName);
        res.send("ok");
    }catch(err){
        utils.writeLog("project.deleteOne", err.toString(), true);
        res.json({ error: err.toString() });
    }
} */

/* module.exports = {
    _getList,
    _getOneByName,
    _update,
    getList,
    getOneByName,
    create,
    updateOne,
    deleteOne
}; */