class Utils{
    constructor(){
        this.isMobile = $(document).width() > 1024;
    }
    sleep(ms=1000){
        return new Promise(resolve=>{
            setTimeout(()=>resolve(true), ms);
        })
    }
    //pseudonimo
    async wait(ms){ return await this.sleep(ms) }
    sort(ar, prop, asc = true){
        ar.sort((a,b)=>{
            if(asc){
                if(a[prop] > b[prop]) return 1;
                if(a[prop] < b[prop]) return -1;
            }else{
                if(a[prop] > b[prop]) return -1;
                if(a[prop] < b[prop]) return 1;
            }
            return 0;
        });
    }
    getURL(prepend, id, title){
        let aux = this.simplifyString(id + "-" + title);
        return prepend + aux.replaceAll(" ", "-");
    }
    FD(object){
        let fd = new FormData();
        for(let prop in object){
            fd.append(prop, object[prop]);
        }
        return fd;
    }
    decimals(str, dec=2){
        str = str.toString();
        let separador_decimal = ",";
        let a = [];

        if(separador_decimal == "."){
            a = [".", ","];
        }else{
            a = [",", "."];
        }

        str = "" + str;
        str = str.replace(a[0], a[1]);
        if(str == ""){str = 0;}
        return  parseFloat( parseFloat(str).toFixed(dec) );
    }
    getUrlQuery(){
        let aux = window.location.href.split("#")[0];
        let query = aux.split("?");
        if(query.length > 1){
            let ret = {};
            let pares = query[0].split("&");
            for(let par of pares){
                let keyValue = par.split("=");
                if(keyValue.length == 2){
                    ret[par[0]] = par[1];
                }else{
                    ret[par[0]] = true;
                }
            }
            return ret;
        }
        return null;
    }
    copyToClipboard(val, contenedor=null){
        if(navigator?.clipboard?.writeText){
            navigator.clipboard.writeText(val);
        }else{
            let conte = document.querySelector("body");
            if(contenedor){
                if(typeof contenedor.length == "undefined"){//querySelector
                    conte = contenedor;
                }else{//jquery
                    conte = contenedor[0];
                }
            }
            let input = document.createElement("input");
            input.id = "textToClipbloar";
            input.value = val;
            conte.appendChild(input);
            input.select();
            document.execCommand("copy");
            input.remove();
        }
    }
    getUUID(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {  
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);  
            return v.toString(16);  
        });  
    }
    formatNumberWithSeparators(str, sdecimal=",", smiles="."){
        str = str.toString();
        let [enteros, decimales] = str.split(".");
        if(decimales && decimales.length > 2) decimales = decimales.substring(0,2);
        let numeroEntero = enteros.split("");
        numeroEntero.reverse();
        let aux = [];
        let tres = 3;
        numeroEntero.forEach(n=>{
            if(tres == 0){
                tres = 3;
                aux.push(smiles);
            }
            aux.push(n);
            tres--;
        })
        aux.reverse();

        if(decimales){
            return aux.join("") + sdecimal + decimales;
        }else{
            return aux.join("") + sdecimal + "00";
        }
    }
    getOptions({ar, text, value=null, selected=null}){
        let htmlOptions = "";
        for(let item of ar){
            let _selected = false;
            let _text;
            let _value;
            if(typeof ar[item] == "object"){
                _text = ar[item][text];
                _value = value ? ar[item][value] : _text;
            }else{
                _text = ar[item];
                _value = ar[item];
            }

            if(selected === _value) _selected = true;
            htmlOptions += `<option value='${_value}' ${_selected ? "selected" : ""}>${_text}</option>`;
        }
        return htmlOptions;
    }
    getRandomString(length= 8, characters= true, numbers= true){
        let caracteres = ""; 
        if(characters) caracteres += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if(numbers) caracteres += '0123456789';
        
        let cadenaAleatoria = '';
        for (let i = 0; i < length; i++) {
            const indice = Math.floor(Math.random() * caracteres.length);
            cadenaAleatoria += caracteres.charAt(indice);
        }
    
        return cadenaAleatoria;
    }
    simplifyString(str, noSpaces=false){
        str = str.replaceAll("á", "a");
        str = str.replaceAll("é", "e");
        str = str.replaceAll("í", "i");
        str = str.replaceAll("ó", "o");
        str = str.replaceAll("ú", "u");
        str = str.replaceAll("Á", "a");
        str = str.replaceAll("É", "e");
        str = str.replaceAll("Í", "i");
        str = str.replaceAll("Ó", "o");
        str = str.replaceAll("Ú", "u");
        str = str.replaceAll("ñ", "n");
        str = str.replaceAll("Ñ", "n");
        str = str.replace(/[^a-z0-9 -\_\.]/gi, '').toLowerCase().trim();
        if(noSpaces){
            return str.replaceAll(" ", "-")
        }else{
            return str
        }
    }
    validateString(str, validator){
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    
        if(validator == "email" || validator == "mail") return emailRegex.test(str);
        else if(validator == "uuid" || validator == "guid") return uuidRegex.test(str);
        else if(validator == "ip") return ipRegex.test(str);
        else return null;
    }
    uploadFileWithProgress({url, file, onProgress, onFinish}){
        const xhr = new XMLHttpRequest();
    
        xhr.open("POST", url, true);
        
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const percentComplete = (event.loaded / event.total) * 100;
                onProgress(percentComplete);
            }
        };
    
        xhr.onload = () => {
            if (xhr.status === 200 && onFinish) {
                onFinish(null, xhr.responseText);
            } else if (onFinish) {
                onFinish(new Error(`Upload failed with status ${xhr.status}`));
            }
        };
    
        xhr.onerror = () => {
            if (onFinish) onFinish(new Error("An error occurred during the upload"));
        };
    
        const formData = new FormData();
        formData.append("file", file);
        
        xhr.send(formData);
    }
    uploadFileButton({url, file, button, onFinish=null}){
        button.click(ev=>{
            button.addClass("disable");
            let text = button.html();
            this.uploadFileButton({
                url: url, 
                file: file,
                onProgress: porc =>{
                    button.html(`${text} ${porc.toFixed(0)}%`);
                },
                onFinish: (ret, responseText) =>{
                    if(onFinish) onFinish(ret, responseText, text);
                }
            })
        })
    }
    saveFile(content, name= "file.txt", type= "text/plain;charset=utf-8",) {
        let blob = new Blob([content], { type: type });
        saveAs(blob, name);
    }
    async ping(timeout=3000){
        try{
            let resp = await $.get({ 
                url: "/ping",
                timeout: timeout
            })
            if(resp === "pong") return true;
        }catch(err){
            return false;
        }finally{
            return false;
        }
    }
    arrayToObject(ar, id){
        if(typeof id == "undefined" || id === null) throw "arrayToObject param id must be and STRING or FUNCTION";
        let ret = {};
        if(typeof id == "function"){//a funcion debe retornar cual debe ser la "key" del objeto
            ar.forEach(item=>{
                ret[ id(item) ] = item;
            });
        }else{//se utiliza un campo del objeto como key. Ej "_id", "barcode", "dni"
            ar.forEach(item=>{
                ret[ item[id] ] = item;
            });
        }
        return ret;
    }
    bindShowPasswordEvent( buttonElement, inputElement ){
        const _showPassword = (show=false) => {
            if(show){
                buttonElement.find("i").addClass("fa-eye").removeClass("fa-eye-slash");
                buttonElement.addClass("btn-warning").removeClass("btn-light");
                inputElement.prop("type", "text");
            }else{
                buttonElement.find("i").addClass("fa-eye-slash").removeClass("fa-eye");
                buttonElement.addClass("btn-light").removeClass("btn-warning");
                inputElement.prop("type", "password");
            }
        }

        buttonElement.mousedown(ev=>{
            _showPassword(true);
        }).mouseup(ev=>{
            _showPassword(false);
        }).mouseleave(ev=>{
            _showPassword(false);
        });
        
    }
    getQR({text, size=128, color="#000000", background="#ffffff"}, container=null){
        $("#qr-temp").remove();
        $("body").append(`<div id='qr-temp' class='d-none'></div>`);
        let qrcode = new QRCode("qr-temp", {
            text: text,
            width: size,
            height: size,
            colorDark : color,
            colorLight : background,
            correctLevel : QRCode.CorrectLevel.H
        });
        let img = $("#qr-temp img");
        if(container) container.html(img);
        return { qrcode, img };
    }
    getBarcode(text, container=null){
        $("#barcode-temp").remove();
        $("body").append(`<img id='barcode-temp' class='d-none'>`);
        $("#barcode-temp").JsBarcode(text);
        let img = $("#barcode-temp");
        if(container){
            container.html( img );
            container.find("img").removeClass("d-none");
        }
        return img;
    }
}