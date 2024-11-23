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

        this.nginxEditor = CodeMirror.fromTextArea(document.querySelector('#nginx [name="code-editor"]'), {
            lineNumbers: true,
            mode: "javascript", // Puedes cambiar el lenguaje
            theme: "default",   // Cambia el tema si lo deseas
            tabSize: 2
        });
        //nginxEditor.setValue() || nginxEditor.getValue

        this.listProjects();
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
            this.projects = await $.get({
                url: "/projects/get-list"
            });
            console.log(this.projects)
    

            let ind = 0;
            let tbody = "";
            for(let p in this.projects){
                let project = this.projects[p];
                let status = `<span class='badge badge-danger'>${project.status}</span>`;
                if(project.status == "started") status = `<span class='badge badge-success'>${project.status}</span>`;
                acc += `<tr ind="${ind}" idd="${project.id}">
                    <td>${project.name}</td>
                    <td class='text-right'>${project.cpu}</td>
                    <td class='text-right'>${project.ram}</td>
                    <td class='text-right'>${status}</td>
                </tr>`;
                ind++;
                return acc;
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
            //no logueado
            $("main:eq(0)").removeClass("d-none");
            $("main:eq(1)").addClass("d-none");
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