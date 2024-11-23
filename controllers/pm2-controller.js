const utils = require("../utils/utils");

async function _getAll(){
    let data = await utils.exec(`pm2 jlist`);
    return data;
}    
async function getAll(req, res){
    try{
        let data = _getAll();
        res.json(data);
    }catch(err){
        utils.writeLog("pm2.getAll", err.toString());
        res.json({ error: err.toString() });
    }
    
}
async function getData(req, res){
    try{
        const {processName} = req.body; 
        let allProjects = await _getAll();
        res.json(allProjects.find(p=>p.name==processName));
    }catch(err){
        utils.writeLog("pm2.getData", err.toString());
        res.json({ error: err.toString() });
    }
}
async function log(req, res){
    try{
        const {processName, error} = req.body; 
        let command = `pm2 logs ${processName}`;
        if( error ) command += " --err";
        let data = await utils.exec(command);
        res.json(data);
    }catch(err){
        utils.writeLog("pm2.log", err.toString());
        res.json({ error: err.toString() });
    }
}
async function createProcess(req, res){
    try{
        const { mainPath, processName} = req.body;
        //crea el proceso 
        let data1 = await utils.exec(`pm2 start "${mainPath}" --name ${processName}`);
        //guarda el estado para reinicios
        let data2 = await utils.exec(`pm2 save`);
        res.send("ok");
    }catch(err){
        utils.writeLog("pm2.createProcess", err.toString());
        res.json({ error: err.toString() });
    }
}
async function changeStatus(req, res){
    try{
        const { newStatus, processName } = req.body;
        let data = await utils.exec(`pm2 ${newStatus} ${processName}`);
        res.send("ok");
    }catch(err){
        utils.writeLog("pm2.changeStatus", err.toString());
        res.json({ error: err.toString() });
    }
}
async function flushLogs(req, res){
    try{
        let data = await utils.exec(`pm2 flush`);
        res.send("ok");
    }catch(err){
        utils.writeLog("pm2.flushLogs", err.toString());
        res.json({ error: err.toString() });
    }
}

module.exports = {
    _getAll,
    getAll,
    getData,
    log,
    createProcess,
    changeStatus,
    flushLogs
};