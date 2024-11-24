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

        $("[name='logout']").click(ev=>{
            this.logout();
        })

        $("[name='new-project']").click(ev=>{
            this.newProject();
        })

        this.nginxEditor = CodeMirror.fromTextArea(document.querySelector('#nginx [name="code-editor"]'), {
            lineNumbers: true,
            mode: "javascript", // Puedes cambiar el lenguaje
            theme: "default",   // Cambia el tema si lo deseas
            tabSize: 2
        });
        //nginxEditor.setValue() || nginxEditor.getValue

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
                url: "/project/get-list"
            });
            console.log(resp)
            this.projects = resp.projects;
    
            let tbody = "";
            for(let px of this.projects){

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
    newProject(){
        this.currentProject = null;
        $("[name='delete-project']").prop("disabled", true);
        $("[name='projects'] tbody tr").removeClass("table-info");

        $("#tabs-headers .card-title").html("project");
        
        $("#tabs #home [name='name']").prop("disabled", false).val("");
        $("#tabs #home [name='domain']").prop("disabled", false).val("");
        $("#tabs #home [name='save-data']").prop("disabled", false);
        
        $("#tabs #home [name='token-git']").prop("disabled", false).val("");
        $("#tabs #home [name='url-git']").prop("disabled", false).val("");
        $("#tabs #home [name='clone-repo']").prop("disabled", false);


        $("#tabs #home [name='clone-repo']").prop("disabled", false);
        $("#home-tab").click();

        $("#tabs #home [name='create-project']").click(ev=>{
            let ele = $(ev.currentTarget);
            
            let data = {
                name: $("#tabs #home [name='name']").val(),
                domain: $("#tabs #home [name='domain']").val(),
                gitToken: $("#tabs #home [name='git-token']").val(),
                gitUrl: $("#tabs #home [name='git-url']").val(),
            }

            try{
                modal.mostrar({
                    titulo: "Procesing",
                    cuerpo: "<div name='log'></div>",
                    fnMostrar2: async () =>{
                        const log = document.querySelector("#modal [name='log']");
                        
                        const response = await fetch('/project/create', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
        
                        const reader = response.body.getReader();
                        const decoder = new TextDecoder("utf-8");
        
                        while (true) {
                            const { value, done } = await reader.read();
                            if (done) break; // Finalizar cuando el servidor cierre la conexión
                            log.textContent += decoder.decode(value);
                        }

                    }
                })
                
    
                /* 
                $("#tabs #home [name='name']").prop("disabled", true);
                $("#tabs #home [name='domain']").prop("disabled", true);
                this.currentProject = resp.project; */
            }catch(err){
                console.log(err);
                modal.mensaje(err.toString());
                ele.prop("disabled", false);
            }
        });
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