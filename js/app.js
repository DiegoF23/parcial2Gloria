const API_URL = "http://localhost:3000";

const contenedorDepartamentos = document.getElementById("contenedor-departamentos");

document.addEventListener("DOMContentLoaded", iniciarApp);

async function iniciarApp() {
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