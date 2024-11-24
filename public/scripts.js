class MainScript{
    constructor(){
        this.projects = [];
        this.pm2 = [];
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

        this.nginxEditor = CodeMirror.fromTextArea(document.querySelector('#nginx [name="code-editor"]'), {
            lineNumbers: true,
            mode: "javascript", // Puedes cambiar el lenguaje
            theme: "default",   // Cambia el tema si lo deseas
            tabSize: 2
        });
        //nginxEditor.setValue() || nginxEditor.getValue

        $.get({url: "/user/is-logged"}).then(ret=>{
            if(ret?.isLogged == true){
                console.log("Is logged!");
                this.listProjects();
            }
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
    createNewProject(){
        this.clearData();

    }
    async listProjects(){
        try{
            this.currentProject = null;
            let resp = await $.get({
                url: "/projects/get-list"
            });
            this.projects = resp.projects;
            this.pm2 = resp.pm2;
    
            let tbody = "";
            for(let px of this.pm2){
                let proj = this.projects.find(p=>p.name == px.name);

                let status = `<span class='badge badge-${px.pm2_env.status == "online" ? "success" : "danger"}'>${ px.pm2_env.status }</span>`;
                tbody += `<tr pm2="${px.pid}" proj="${proj ? proj.id : -1}">
                    <td>${px.name}</td>
                    <td class='text-right'>${px.monit.cpu}%</td>
                    <td class='text-right'>${parseInt(px.monit.memory / 1024 / 1024)}mb</td>
                    <td class='text-right'>${status}</td>
                </tr>`;
            }

            for(let proj of this.projects){
                let px = this.pm2.find(p=>p.nmae == px.name);
                if(!px){
                    let status = `<span class='badge badge-warning'>no pm2</span>`;
                    tbody += `<tr pm2="-1" proj="${proj.id}">
                        <td>${proj.name}</td>
                        <td class='text-right'>0%</td>
                        <td class='text-right'>0mb</td>
                        <td class='text-right'>${status}</td>
                    </tr>`;
                }
            }
    
            $("[name='projects'] tbody").html(tbody);
            $("[name='projects'] tbody tr").click(ev=>{
                let row =$(ev.currentTarget);
                let idd = row.attr("idd");
                $("[name='projects'] tbody tr").removeClass("table-info");
                row.addClass("table-info");
                this.selectProject( idd );
            });

            //logueado
            $("main:eq(0)").addClass("d-none");
            $("main:eq(1)").removeClass("d-none");

        }catch(err){
            console.log(err);
            alert("ERROR, check console")
        }
    }
    clearData(){
        this.currentProject = null;
        $("#tabs-headers .card-title").html("project");
    }
    async selectProject(projectId){
        this.currentProject = this.projects.find(p=>p.id == projectId);
        $("#tabs-headers .card-title").html(project.name);
        
        let nginx = await $.get({
            url: "/nginx/" + this.currentProject.id
        });
        let env = await $.get({
            url: "/env/" + this.currentProject.id
        });
    }
}