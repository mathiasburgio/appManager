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
                tbody += `<tr projectName="${px.name}">
                    <td>${px.name}</td>
                    <td class='text-right'>${px.monit.cpu}%</td>
                    <td class='text-right'>${parseInt(px.monit.memory / 1024 / 1024)}mb</td>
                    <td class='text-right'>${status}</td>
                </tr>`;
            }

            $("[name='project-list']").html(tbody);
            $("[name='project-list'] tbody tr").click(ev=>{
                let row =$(ev.currentTarget);
                let projectName = row.attr("projectName");
                $("[name='projects'] tbody tr").removeClass("table-info");
                row.addClass("table-info");
                this.currentProject = projectName;
            });

            //logueado
            $("main:eq(0)").addClass("d-none");
            $("main:eq(1)").removeClass("d-none");

        }catch(err){
            console.log(err);
            alert("ERROR, check console");
        }
    }
}