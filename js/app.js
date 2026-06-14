const API_URL = "http://localhost:3000";

const contenedorDepartamentos = document.getElementById("contenedor-departamentos");
const formDepartamento = document.getElementById("form-departamento");
const inputDepartamentoId = document.getElementById("departamento-id");
const inputDepartamentoNombre = document.getElementById("departamento-nombre");
const inputDepartamentoResponsable = document.getElementById("departamento-responsable");
const btnCancelarDepartamento = document.getElementById("btn-cancelar-departamento");

document.addEventListener("DOMContentLoaded", iniciarApp);

async function iniciarApp() {
    formDepartamento.addEventListener("submit", guardarDepartamento);
    //btnCancelarDepartamento.addEventListener("click",cancelarEdicionDepartamento);

    await cargarDepartamentos();
}

async function cargarDepartamentos() {
    try {
        const responseDepartamentos = await axios.get(`${API_URL}/departamentos`);
        const departamentos = responseDepartamentos.data;

        const responseEmpleados = await axios.get(`${API_URL}/empleados`);
        const empleados = responseEmpleados.data;

        renderizarDepartamentos(departamentos, empleados);
    } catch (error) {
        console.error("Error al cargar departamentos:", error);
    }
}

function renderizarDepartamentos(departamentos, empleados) {
    contenedorDepartamentos.innerHTML = "";

    departamentos.forEach(function(departamento) {
        const empleadosDelDepartamento = empleados.filter(function(empleado) {
            return empleado.departamentoId === departamento.id;
        });

        contenedorDepartamentos.innerHTML += `
            <div class="card">
                <h3>${departamento.nombre}</h3>
                <p>Responsable: ${departamento.responsable}</p>
                <p>Cantidad de empleados: ${empleadosDelDepartamento.length}</p>
            </div>
        `;
    });
}

async function guardarDepartamento(event) {
    event.preventDefault();

    const nombre = inputDepartamentoNombre.value.trim();
    const responsable = inputDepartamentoResponsable.value.trim();

    if (nombre === "" || responsable === "") {
        alert("Complete el nombre del departamento y el responsable.");
        return;
    }

    const datosDepartamento = {
        nombre: nombre,
        responsable: responsable
    };

    try {
        if (inputDepartamentoId.value === "") {
            await axios.post(`${API_URL}/departamentos`, datosDepartamento);
        } else {
            await axios.patch(`${API_URL}/departamentos/${inputDepartamentoId.value}`, datosDepartamento);
        }

        formDepartamento.reset();
        inputDepartamentoId.value = "";

        await cargarDepartamentos();
    } catch (error) {
        console.error("Error al guardar departamento:", error);
    }
}