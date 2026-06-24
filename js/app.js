const API_URL = "http://localhost:3000";

const contenedorDepartamentos = document.getElementById("contenedor-departamentos");
const contenedorEmpleados = document.getElementById("contenedor-empleados");
const contenedorAsistencias = document.getElementById("contenedor-asistencias");
const formDepartamento = document.getElementById("form-departamento");
const inputDepartamentoId = document.getElementById("departamento-id");
const inputDepartamentoNombre = document.getElementById("departamento-nombre");
const inputDepartamentoResponsable = document.getElementById("departamento-responsable");
const btnCancelarDepartamento = document.getElementById("btn-cancelar-departamento");

document.addEventListener("DOMContentLoaded", iniciarApp);

async function iniciarApp() {
    formDepartamento.addEventListener("submit", guardarDepartamento);
    btnCancelarDepartamento.addEventListener("click",cancelarEdicionDepartamento);

    await cargarDatos();
}

async function cargarDatos() {
    await cargarDepartamentos();
    await cargarEmpleados();
    await cargarAsistencias();
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

                <button class="btn-edit" onclick="editarDepartamento(${departamento.id})">Editar</button>
                <button  class="btn-danger" onclick="eliminarDepartamento(${departamento.id})">Eliminar</button>
            </div>
        `;
       
    });
}

async function cargarEmpleados() {
    try {
        const responseEmpleados = await axios.get(`${API_URL}/empleados`);
        const empleados = responseEmpleados.data;

        const responseDepartamentos = await axios.get(`${API_URL}/departamentos`);
        const departamentos = responseDepartamentos.data;

        renderizarEmpleados(empleados, departamentos);
    } catch (error) {
        console.error("Error al cargar empleados:", error);
    }
}

function renderizarEmpleados(empleados, departamentos) {
    contenedorEmpleados.innerHTML = "";

    empleados.forEach(function(empleado) {
        const departamento = departamentos.find(function(item) {
            return item.id === empleado.departamentoId;
        });

        const nombreDepartamento = departamento ? departamento.nombre : "Sin departamento";

        contenedorEmpleados.innerHTML += `
            <div class="card">
                <h3>${empleado.nombre}</h3>
                <p>Cargo: ${empleado.cargo}</p>
                <p>Departamento: ${nombreDepartamento}</p>
                <p>Fecha de ingreso: ${empleado.fechaIngreso}</p>
            </div>
        `;
    });
}

async function cargarAsistencias() {
    try {
        const responseAsistencias = await axios.get(`${API_URL}/asistencias`);
        const asistencias = responseAsistencias.data;

        const responseEmpleados = await axios.get(`${API_URL}/empleados`);
        const empleados = responseEmpleados.data;

        renderizarAsistencias(asistencias, empleados);
    } catch (error) {
        console.error("Error al cargar asistencias:", error);
    }
}

function renderizarAsistencias(asistencias, empleados) {
    contenedorAsistencias.innerHTML = "";

    asistencias.forEach(function(asistencia) {
        const empleado = empleados.find(function(item) {
            return item.id === asistencia.empleadoId;
        });

        const nombreEmpleado = empleado ? empleado.nombre : "Empleado eliminado";

        contenedorAsistencias.innerHTML += `
            <div class="card">
                <h3>${nombreEmpleado}</h3>
                <p>Fecha: ${asistencia.fecha}</p>
                <p>Estado: ${asistencia.estado}</p>
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

        await cargarDatos();
    } catch (error) {
        console.error("Error al guardar departamento:", error);
    }
}

async function editarDepartamento(id) {
    try {
        const response = await axios.get(`${API_URL}/departamentos/${id}`);
        const departamento = response.data;

        inputDepartamentoId.value = departamento.id;
        inputDepartamentoNombre.value = departamento.nombre;
        inputDepartamentoResponsable.value = departamento.responsable;
    } catch (error) {
        console.error("Error al cargar departamento para editar:", error);
    }
}

function cancelarEdicionDepartamento() {
    formDepartamento.reset();
    inputDepartamentoId.value = "";
}

async function eliminarDepartamento(id) {
    const confirmar = confirm("¿Seguro que desea eliminar este departamento y todos sus datos asociados?");

    if (!confirmar) {
        return;
    }

    try {
        const responseEmpleados = await axios.get(`${API_URL}/empleados?departamentoId=${id}`);
        const empleados = responseEmpleados.data;

        for (const empleado of empleados) {
            const responseAsistencias = await axios.get(`${API_URL}/asistencias?empleadoId=${empleado.id}`);
            const asistencias = responseAsistencias.data;

            for (const asistencia of asistencias) {
                await axios.delete(`${API_URL}/asistencias/${asistencia.id}`);
            }

            await axios.delete(`${API_URL}/empleados/${empleado.id}`);
        }

        await axios.delete(`${API_URL}/departamentos/${id}`);

        await cargarDatos();
    } catch (error) {
        console.error("Error al eliminar departamento:", error);
    }
}