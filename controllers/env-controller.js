const utils = require("../utils/utils");
const path = require("path");
const fs = require("fs");

function _cloneExample(project){
    try{
       
        if( fs.existsSync( path.join(project.path, ".env_example") ) ){
            fs.copyFileSync( path.join(project.path, ".env_example"), path.join(project.path, ".env"));
            return true;
        }else if( fs.existsSync( path.join(project.path, ".env-example") ) ){
            fs.copyFileSync( path.join(project.path, ".env-example"), path.join(project.path, ".env"));
            return true;
        }else{
            throw "Error not '.env-example' or '.env_example' file found";
        }
    }catch(err){
        utils.writeLog("env._cloneExample", err.toString());
    }
}
function _read(project){
    try{
        let obj = [];
        if(fs.existsSync( path.join(project.path, ".env") ) == false) return obj;

        let content = fs.readFileSync(path.join(project.path, ".env"), "utf-8");
        let lines = content.split("\n");
        for(let line of lines){
            line = line.trim();
            if(line){
                let prop = "";
                let val = "";
                let comment = "";
                
                let propVal = line.split("=");
                if(propVal == 2){
                    prop = propVal[0];

                    let valComment = val.split("#");
                    if(valComment == 2){
                        val = valComment[0];
                        comment = valComment[1];
                    }else{
                        val = propVal[1];
                    }
                }
                if(val.startsWith("\"")) val = val.substring(1);//remove start cuote
                if(val.endsWith("\";")) val = val.substring(0,-2);//remove end cuote and semicolon
                if(val.endsWith("\"")) val = val.substring(0,-1);//remove end cuote
                obj.push({
                    prop: prop,
                    val: val,
                    comment: comment
                })
            }
        }
        
        return obj;
    }catch(err){
        utils.writeLog("env._read", err.toString());
    }
}
function _write(project, content){
    try{
        let _content = "";
        for(let pvc of content){
            let line = `${pvc.prop}="${pvc.val}"; #${pvc.comment}\n`;
            _content += line;
        }
        fs.writeFileSync( path.join(project.path, ".env"), _content);
        return true;
    }catch(err){
        utils.writeLog("env._write", err.toString());
    }
}
function _setValue(project, prop, val, comment=""){
    prop = prop.toUpperCase();
    let data = _read(project);
    let index = data.findIndex(item=>item.prop == prop);
    if(index > -1){
        data[index].val = val;
    }else{
        data.push({ prop, val, comment });
    }
    _write(project, data);
}
function _getValue(project, prop){
    prop = prop.toUpperCase();
    let data = _read(project);
    let index = data.findIndex(item=>item.prop == prop);
    return index > -1 ? data[index] : null;
}

function read(req, res){
    try{
        let {project} = req.body;
        let content = _read(project);
        res.json({content});
    }catch(err){

    }

}
function write(req, res){
    try{
        let {project , content} = req.body;
        _write(project, content);
        res.send("ok");
    }catch(err){
        console.log(err);
    }
}

module.exports = {
    _cloneExample,
    _read,
    _write,
    _setValue,
    _getValue,
    read,
    write
}