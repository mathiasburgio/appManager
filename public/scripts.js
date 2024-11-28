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

        $("[name='change-status']").click(ev=>{
            let newStatus = $(ev.currentTarget).attr("change-status");
            if(!this.currentProject){
                modal.mensaje("No project selected");
                return;
            }
            //if(this.currentProject.name == "appManager") return;
            this.changeStatus(newStatus);
        })
        $("[name='git-pull']").click(ev=>{
            if(!this.currentProject){
                modal.mensaje(`No project selected`);
                return;
            }
            this.gitPull();
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
            this.currentProject = null;
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
        $("[name='projects'] tbody tr").removeClass("table-info");
        $("h3[name='project-name']").html("...");
        $("[name='nginx-file']").addClass("d-none").val("");
        $("[name='err-log']").addClass("d-none").val("");
        $("[name='out-log']").addClass("d-none").val("");
        $("[name='env-table']").addClass("d-none").find("tbody").html("");
        $("[name='btn-status']").html("Status: ?")
    }
    selectProject(projectName){
        this.clearProject();
        $("[name='project-list'] [projectName='" + projectName + "']").addClass("table-info");
        this.currentProject = this.projects.find(p=>p.name == projectName);
        $("h3[name='project-name']").html(projectName);

        let btnStatusText = `Status: <span class='badge badge-${(this.project.pm2_env.status == "online" ? "success" : "danger")}'>${this.project.pm2_env.status}</span>`;
        $("[name='btn-status']").html(btnStatusText)
    }
    async changeStatus(projectName, newStatus){
        await modal.async_esperando("Updating...");
        let resp = await $.post({
            url: "/general/change-status",
            data: {
                newStatus: newStatus, 
                projectName: projectName
            }
        })
        console.log(resp);
        
        $(".modal-body").html("Listing projects...");
        await this.listProjects()
        selectProject(projectName);
        modal.ocultar();
    }
    async gitPull(){
        let resp = await modal.pregunta(`Confirm git pull on ${this.currentProject.name}`);
        if(!resp) return;
        await modal.async_esperando(`Making git pull and waiting 3 seconds...`);
        let ret = await $.post({
            url: "/general/git-pull",
            data:{ projectName: this.currentProject.name}
        })
        console.log(ret);
        setTimeout(()=>{
            modal.ocultar(()=>{
                modal.mensaje(ret);
            })
        }, 3000);
    } 
    async flushLogs(){
        let resp = await modal.pregunta(`Confirm flush logs on ${this.currentProject.name}`);
        if(!resp) return;
        await modal.async_esperando(`Cleaning logs...`);
        let ret = await $.post({
            url: "/general/flush-logs",
            data:{ projectName: this.currentProject.name}
        })
        console.log(ret);
        $("[name='logs']").val("Nothing to see here...");
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
    async getNginxFile(){
        $("[name='nginx-file']").val(this.currentProject.nginx);
        this.showElement("nginx-file");
    }
    showElement(name){
        $("[name='nginx-file']").addClass("d-none");
        $("[name='err-log']").addClass("d-none");
        $("[name='out-log']").addClass("d-none");
        $("[name='env-table']").addClass("d-none");

        $("[name='" + name + "']").removeClass("d-none");
    }
}