export  function renderMunicipios(option) {
    fetch("srcFrontEnd/municipios.json")
        .then(r => r.json())
        .then(d => {
             let dep  
             let mun
            if(option == "addCliente"){
                dep =document.getElementById("departamento_cliente"),
                mun = document.getElementById("municipio_cliente");
            }else if(option == "addUser"){
                dep =document.getElementById("registerDepartamento"),
                mun = document.getElementById("registerMunicipio");

            }else if(option == "actUser")
                dep =document.getElementById("changeUserDepartamento"),
                mun = document.getElementById("changeUserMunicipio");
            

            dep.innerHTML += d.map(e => `<option>${e.department}</option>`).join("");

            dep.onchange = () => {
                const sel = d.find(e => e.department === dep.value);
                mun.innerHTML = "<option>Selecciona un municipio</option>" +
                    sel.municipalities.map(m => `<option value="${m.id}" >${m.name}</option>`).join("");
                mun.disabled = !sel;
            };
        });

}