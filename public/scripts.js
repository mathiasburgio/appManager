class MainScript{
    constructor(){

        this.projects = [];
        this.currentProject = null;

        $("#login [name='show-password']").mousedown(ev=>{
            $("#login [name='password']").prop("type", "text");
        }).mouseup(ev=>{
            $("#login [name='password']").prop("type", "password");
        }).mouseout(ev=>{
            $("#login [name='password']").prop("type", "password");
        })

        $("#login [name='login']").click(ev=>{
            let ele = $(ev.currentTarget);
            this.login(ele);
        })

        $("[name='logout']").click(ev=>{
            this.logout();
        })
        
        //pm2 [stop|start|restart] project
        $("[change-status]").click(ev=>{
            let newStatus = $(ev.currentTarget).attr("change-status");
            if(!this.currentProject){
                modal.mensaje("No project selected");
                return;
            }
            if(this.currentProject.name == "appManager"){
                modal.mensaje("To make changes to appManager, you must do so from the terminal/console.")
                return;
            }
            this.changeStatus(newStatus);
        })

        $("[name='git-pull']").click(ev=>{
            if(!this.currentProject){
                modal.mensaje(`No project selected`);
                return;
            }
            if(this.currentProject.name == "appManager"){
                modal.mensaje("To make changes to appManager, you must do so from the terminal/console.")
                return;
            }
            this.gitPull();
        })

        $("[name='show-nginx-file'").click(ev=>{
            if(!this.currentProject){
                modal.mensaje(`No project selected`);
                return;
            }
            this.showNginxFile();
        })
        $("[name='show-env'").click(ev=>{
            if(!this.currentProject){
                modal.mensaje(`No project selected`);
                return;
            }
            this.showEnv();
        })
        $("[name='flush-logs'").click(ev=>{
            if(!this.currentProject){
                modal.mensaje(`No project selected`);
                return;
            }
            if(this.currentProject.name == "appManager"){
                modal.mensaje("To make changes to appManager, you must do so from the terminal/console.")
                return;
            }
            this.flushLogs();
        })

        modal.async_esperando("validating...").then(ret=>{
            $.get({url: "/user/is-logged"}).then(ret=>{
                if(ret?.isLogged == true){
                    console.log("Is logged!");
                    this.listProjects();
                }
                modal.ocultar();
            })
        })
    }
    async login(){
        try{
            await modal.async_esperando("Validating data...");

            let data = {
                email: $("#login [name='email']").val(),
                password: $("#login [name='password']").val(),
            };

            let resp = await $.post({
                url: "/user/login",
                data: data
            });
            modal.ocultar(()=>{
                console.log(resp);
                if(resp == "ok") window.location.reload();
            });
        }catch(err){
            console.log(err);
            modal.ocultar(()=>{
                modal.mensaje(err.toString());
            })
        }
    }
    async logout(){
        let resp = await modal.pregunta(`Are you sure about logout?`);
        if(!resp) return;
        window.location.href = "/user/logout";
    }
    async listProjects(){
        try{
            this.clearProject();
            
            let resp = await $.get({
                url: "/general/projects-list"
            });
            console.log(resp)
            this.projects = resp;
    
            let tbody = "";
            for(let px of this.projects){
                let status = `<span class='badge badge-${px.pm2_env.status == "online" ? "success" : "danger"}'>${ px.pm2_env.status }</span>`;
                tbody += `<tr class="cp" projectName="${px.name}">
                    <td>${px.name}</td>
                    <td class='text-right'>${px.pm2_env.restart_time}%</td>
                    <td class='text-right'>${px.monit.cpu}%</td>
                    <td class='text-right'>${parseInt(px.monit.memory / 1024 / 1024)}mb</td>
                    <td class='text-right'>${status}</td>
                </tr>`;
            }

            $("[name='project-list'] tbody").html(tbody);
            $("[name='project-list'] tbody tr").click(ev=>{
                let row =$(ev.currentTarget);
                let projectName = row.attr("projectName");
                this.selectProject(projectName);
            });

            //logueado
            $("main:eq(0)").addClass("d-none");
            $("main:eq(1)").removeClass("d-none");

        }catch(err){
            console.log(err);
            alert("ERROR, check console");
        }
    }
    clearProject(){
        this.currentProject = null;
        $("[name='project-list'] tbody tr").removeClass("table-info");
        $("h3[name='project-name']").html("...");
        $("[name='nginx-file']").addClass("d-none").val("");
        $("[name='err-log']").addClass("d-none").val("");
        $("[name='out-log']").addClass("d-none").val("");
        $("[name='env-table']").addClass("d-none").find("tbody").html("");
        $("[name='btn-status']").html("Status: ?")
        this.showElement(null);
    }
    selectProject(projectName){
        this.clearProject();
        $("[name='project-list'] [projectName='" + projectName + "']").addClass("table-info");
        this.currentProject = this.projects.find(p=>p.name == projectName);
        $("h3[name='project-name']").html(projectName);

        let btnStatusText = `Status: <span class='badge badge-${(this.currentProject.pm2_env.status == "online" ? "success" : "danger")}'>${this.currentProject.pm2_env.status}</span>`;
        $("[name='btn-status']").html(btnStatusText)
    }
    async changeStatus(newStatus){
        let askResponse = await modal.pregunta(`Confirm execute <b>${newStatus}</b> on <b>${this.currentProject.name}</b>?`);
        if(!askResponse) return;

        await modal.async_esperando("Updating...");
        let resp = await $.post({
            url: "/general/change-status",
            data: {
                newStatus: newStatus, 
                projectName: this.currentProject.name
            }
        })
        console.log(resp);
        let saveProjectName = this.currentProject.name;
        
        $(".modal-body").html("Listing projects...");
        await this.listProjects()
        this.selectProject(saveProjectName);
        modal.ocultar();
    }
    async gitPull(){
        let resp = await modal.pregunta(`Confirm <b>git pull</b> on <b>${this.currentProject.name}</b>?`);
        if(!resp) return;
        await modal.async_esperando(`Making git pull and waiting 3 seconds...`);
        let ret = await $.post({
            url: "/general/git-pull",
            data:{ projectName: this.currentProject.name}
        })
        console.log(ret);
        setTimeout(()=>{
            modal.ocultar(()=>{
                modal.mensaje(`<b>Response</b><textarea class='form-control' readonly style='min-height:400px'>${ret}</textarea>`);
            })
        }, 3000);
    } 
    async flushLogs(){
        let resp = await modal.pregunta(`Confirm <b>flush logs</b> on <b>${this.currentProject.name}</b>?`);
        if(!resp) return;
        await modal.async_esperando(`Clearing logs...`);
        let ret = await $.post({
            url: "/general/flush-logs",
            data:{ projectName: this.currentProject.name}
        })
        console.log(ret);
        $("[name='log-viewer'] textarea").val("Nothing to see here...");
        modal.ocultar();
    } 
    async getLogs(err=false){
        let ret = await $.post({
            url: "/general/flush-logs",
            data:{ projectName: this.currentProject.name}
        })
        console.log(ret);
        this.currentProject.logs = ret;
    }
    showNginxFile(){
        $("[name='nginx-file'] textarea").val(this.currentProject?.nginx || `/etc/nginx/sites-available/${this.currentProject.name} not founded`);
        this.showElement("nginx-file");
    }
    showEnv(){
        $("[name='env-table'] tbody").html("");     
        let tbody = this.currentProject.env.reduce((acc, item)=>{
            if(item.prop.trim() == "") return acc;
            acc += `<tr>
            <td>${item.prop}</td>
            <td>${item.val}</td>
            <td>${item.comment || ""}</td>
            </tr>`;
            return acc;
        }, "");
        $("[name='env-table'] tbody").html(tbody);
        this.showElement("env-table");
    }
    showElement(name = null){
        $("[name='nginx-file']").addClass("d-none");
        $("[name='log-viewer']").addClass("d-none");
        $("[name='env-table']").addClass("d-none");

        if(!name) return;
        $("[name='" + name + "']").removeClass("d-none");
    }
}