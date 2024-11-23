const utils = require("../utils/utils");
const pm2 = require("./pm2-controller");
const fs = require("fs")
const path = require("path")

async function getList(req, res){
    try{
        let dirFiles = fs.readdirSync( path.join(__dirname, "..", "projects") );
        let files = {};
        for(let f of dirFiles){
            let content = fs.readFileSync( path.join(__dirname, "..", "projects", f), "utf-8" );
            files[f] = JSON.parse(content)
        }
        res.json({projects: files, pm2: await pm2._getAll()});
    }catch(err){
        utils.writeLog("project.getList", err.toString(), true);
        res.json({ error: err.toString() });
    }
}

function create(req, res){
    try{
        let { name, domain } = req.body;

        let projectPath = path.join(__dirname, "..", "projects", name);
        if( fs.existsSync(projectPath) ) throw "Project name already exist";
        
        let project = {
            id: utils.UUID(),
            name: name,
            domain: domain,
            actions: {
                /*
                name (str): {
                    url: str,
                    method: str,
                    params: obj
                }
                */
            }
        };
        fs.writeFileSync( projectPath, JSON.stringify(project, null, 2) );
        utils.writeLog("project.create", projectName);
        res.json(project);
    }catch(err){
        utils.writeLog("project.create", err.toString(), true);
        res.json({ error: err.toString() });
    }
}

function updateActions(req, res){
    try{
        let { projectName, actions } = req.body;
        let filePath = path.join(__dirname, "..", "projects", projectName + ".json");
        let project = JSON.parse(fs.readFileSync( filePath, "utf-8" ));
        
        project.actions = actions;
        fs.writeFileSync( filePath, JSON.stringify(project, null, 2) );
        utils.writeLog("project.updateActions", "save actions " + projectName);
        res.send("ok");
    }catch(err){
        utils.writeLog("project.updateActions", err.toString(), true);
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
}

module.exports = {
    getList,
    create,
    updateActions,
    deleteOne
};