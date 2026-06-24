const API_URL = "http://localhost:3000";

const contenedorDepartamentos = document.getElementById("contenedor-departamentos");
const contenedorEmpleados = document.getElementById("contenedor-empleados");

const formEmpleado = document.getElementById("form-empleado");
const inputEmpleadoId = document.getElementById("empleado-id");
const inputEmpleadoNombre = document.getElementById("empleado-nombre");
const inputEmpleadoCargo = document.getElementById("empleado-cargo");
const inputEmpleadoFecha = document.getElementById("empleado-fecha");
const selectEmpleadoDepartamento = document.getElementById("empleado-departamento");
const filtroDepartamento = document.getElementById("filtro-departamento");
const btnCancelarEmpleado = document.getElementById("btn-cancelar-empleado");


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

    formEmpleado.addEventListener("submit", guardarEmpleado);
    btnCancelarEmpleado.addEventListener("click", cancelarEdicionEmpleado);
    filtroDepartamento.addEventListener("change", cargarEmpleados);

    await cargarDatos();
}

async function cargarDatos() {
    await cargarDepartamentos();
     await cargarSelectDepartamentos();
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

async function cargarSelectDepartamentos() {
    try {
        const response = await axios.get(`${API_URL}/departamentos`);
        const departamentos = response.data;

        selectEmpleadoDepartamento.innerHTML = `
            <option value="">Seleccione departamento</option>
        `;

        filtroDepartamento.innerHTML = `
            <option value="">Todos los departamentos</option>
        `;

        departamentos.forEach(function(departamento) {
            selectEmpleadoDepartamento.innerHTML += `
                <option value="${departamento.id}">${departamento.nombre}</option>
            `;

            filtroDepartamento.innerHTML += `
                <option value="${departamento.id}">${departamento.nombre}</option>
            `;
        });
    } catch (error) {
        console.error("Error al cargar departamentos en selects:", error);
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
        let url = `${API_URL}/empleados`;

        if (filtroDepartamento.value !== "") {
            url = `${API_URL}/empleados?departamentoId=${filtroDepartamento.value}`;
        }

        const responseEmpleados = await axios.get(url);
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

    if (empleados.length === 0) {
        contenedorEmpleados.innerHTML = "<p>No hay empleados para mostrar.</p>";
        return;
    }

    empleados.forEach(function(empleado) {
        const departamento = departamentos.find(function(dep) {
            return dep.id === empleado.departamentoId;
        });

        const nombreDepartamento = departamento ? departamento.nombre : "Sin departamento";

        contenedorEmpleados.innerHTML += `
            <div class="card">
                <h3>${empleado.nombre}</h3>
                <p>Cargo: ${empleado.cargo}</p>
                <p>Departamento: ${nombreDepartamento}</p>
                <p>Fecha de ingreso: ${empleado.fechaIngreso}</p>

                <button class="btn-edit" onclick="editarEmpleado(${empleado.id})">Editar</button>
                <button class="btn-danger" onclick="eliminarEmpleado(${empleado.id})">Eliminar</button>
            </div>
        `;
    });
}


async function guardarEmpleado(event) {
    event.preventDefault();

    const nombre = inputEmpleadoNombre.value.trim();
    const cargo = inputEmpleadoCargo.value.trim();
    const fechaIngreso = inputEmpleadoFecha.value;
    const departamentoId = Number(selectEmpleadoDepartamento.value);

    if (nombre === "" || cargo === "" || fechaIngreso === "" || selectEmpleadoDepartamento.value === "") {
        alert("Complete todos los datos del empleado.");
        return;
    }

    const datosEmpleado = {
        nombre: nombre,
        cargo: cargo,
        fechaIngreso: fechaIngreso,
        departamentoId: departamentoId
    };

    try {
        if (inputEmpleadoId.value === "") {
            await axios.post(`${API_URL}/empleados`, datosEmpleado);
        } else {
            await axios.patch(`${API_URL}/empleados/${inputEmpleadoId.value}`, datosEmpleado);
        }

        formEmpleado.reset();
        inputEmpleadoId.value = "";

        await cargarEmpleados();
        await cargarDepartamentos();
    } catch (error) {
        console.error("Error al guardar empleado:", error);
    }
}


async function editarEmpleado(id) {
    try {
        const response = await axios.get(`${API_URL}/empleados/${id}`);
        const empleado = response.data;

        inputEmpleadoId.value = empleado.id;
        inputEmpleadoNombre.value = empleado.nombre;
        inputEmpleadoCargo.value = empleado.cargo;
        inputEmpleadoFecha.value = empleado.fechaIngreso;
        selectEmpleadoDepartamento.value = empleado.departamentoId;
    } catch (error) {
        console.error("Error al cargar empleado para editar:", error);
    }
}

function cancelarEdicionEmpleado() {
    formEmpleado.reset();
    inputEmpleadoId.value = "";
}


async function eliminarEmpleado(id) {
    const confirmar = confirm("¿Seguro que desea eliminar este empleado y sus asistencias?");

    if (!confirmar) {
        return;
    }

    try {
        const responseAsistencias = await axios.get(`${API_URL}/asistencias?empleadoId=${id}`);
        const asistencias = responseAsistencias.data;

        for (const asistencia of asistencias) {
            await axios.delete(`${API_URL}/asistencias/${asistencia.id}`);
        }

        await axios.delete(`${API_URL}/empleados/${id}`);

        await cargarEmpleados();
        await cargarDepartamentos();
        await cargarAsistencias();
    } catch (error) {
        console.error("Error al eliminar empleado:", error);
    }
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

    if (asistencias.length === 0) {
        contenedorAsistencias.innerHTML = "<p>No hay asistencias registradas.</p>";
        return;
    }

    asistencias.forEach(function(asistencia) {
        const empleado = empleados.find(function(emp) {
            return emp.id === asistencia.empleadoId;
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