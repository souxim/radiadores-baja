document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Clave única global para que no se confunda entre páginas
    let carrito = JSON.parse(localStorage.getItem('BajaMex_Cart_Storage')) || [];
    
    // Obtener elementos de la pantalla
    const contadorVisual = document.getElementById('cart-count');
    const listaCarrito = document.getElementById('lista-carrito');
    const carritoVacioMensaje = document.getElementById('carrito-vacio');
    const contenedorTabla = document.getElementById('contenedor-tabla-carrito');
    const totalPrecioVisual = document.getElementById('total-precio');

    // Función para actualizar el número rojo flotante
    function actualizarContador() {
        if (contadorVisual) {
            const totalPiezas = carrito.reduce((total, producto) => total + producto.cantidad, 0);
            contadorVisual.textContent = totalPiezas;
        }
    }

    // 2. Lógica para añadir productos (index.html y tienda.html)
    const botonesAñadir = document.querySelectorAll('.add-to-cart-btn');
    
    botonesAñadir.forEach(boton => {
        boton.addEventListener('click', (e) => {
            if (boton.id === 'btn-vaciar' || boton.id === 'btn-pagar' || boton.closest('#contenedor-tabla-carrito')) {
                return; 
            }

            e.preventDefault(); 
            
            const tarjeta = boton.closest('.product-card');
            if (!tarjeta) return; 

            const sku = tarjeta.querySelector('.sku').textContent;
            const titulo = tarjeta.querySelector('.product-title').textContent;
            const precioTexto = tarjeta.querySelector('.price').textContent;
            
            const precioNumero = parseFloat(precioTexto.replace(/[^0-9.-]+/g,""));

            const productoSeleccionado = {
                sku: sku,
                titulo: titulo,
                precio: precioNumero,
                cantidad: 1
            };

            const existe = carrito.find(item => item.sku === sku);
            
            if (existe) {
                existe.cantidad++;
            } else {
                carrito.push(productoSeleccionado);
            }

            // Guardar con la nueva clave global
            localStorage.setItem('BajaMex_Cart_Storage', JSON.stringify(carrito));
            
            actualizarContador();
            alert(`¡Agregado con éxito!\n${titulo}`);
        });
    });

    // 3. Lógica para dibujar la tabla de cotización (carrito.html)
    function renderizarCarrito() {
        if (!listaCarrito) return; 

        if (carrito.length === 0) {
            if (carritoVacioMensaje) carritoVacioMensaje.style.display = 'block';
            if (contenedorTabla) contenedorTabla.style.display = 'none';
        } else {
            if (carritoVacioMensaje) carritoVacioMensaje.style.display = 'none';
            if (contenedorTabla) contenedorTabla.style.display = 'block';
            listaCarrito.innerHTML = ''; 

            let totalAcumulado = 0;

            carrito.forEach((producto, indice) => {
                const subtotal = producto.precio * producto.cantidad;
                totalAcumulado += subtotal;

                const fila = document.createElement('tr');
                fila.style.borderBottom = '1px solid #81919d';
                fila.innerHTML = `
                    <td style="padding: 12px; font-weight: bold; color: #000;">${producto.titulo}</td>
                    <td style="padding: 12px; color: #000;">${producto.sku}</td>
                    <td style="padding: 12px; color: #000;">$${producto.precio.toLocaleString('es-MX')}</td>
                    <td style="padding: 12px; color: #000;">${producto.cantidad}</td>
                    <td style="padding: 12px; font-weight: bold; color: #000;">$${subtotal.toLocaleString('es-MX')}</td>
                    <td style="padding: 12px;"><button class="btn-eliminar" data-indice="${indice}" style="background:#d32f2f; color:white; border:none; padding:5px 10px; cursor:pointer; font-weight:bold;">Eliminar</button></td>
                `;
                listaCarrito.appendChild(fila);
            });

            if (totalPrecioVisual) {
                totalPrecioVisual.textContent = `$${totalAcumulado.toLocaleString('es-MX')} + IVA`;
            }
        }
    }

    // Botones de la página del carrito
    if (listaCarrito) {
        listaCarrito.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-eliminar')) {
                const indice = e.target.getAttribute('data-indice');
                carrito.splice(indice, 1); 
                localStorage.setItem('BajaMex_Cart_Storage', JSON.stringify(carrito)); 
                renderizarCarrito(); 
                actualizarContador(); 
            }
        });
    }

    const btnVaciar = document.getElementById('btn-vaciar');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm("¿Seguro que deseas vaciar tu lista de cotización?")) {
                carrito = [];
                localStorage.setItem('BajaMex_Cart_Storage', JSON.stringify(carrito));
                renderizarCarrito();
                actualizarContador();
            }
        });
    }

    const btnPagar = document.getElementById('btn-pagar');
    if (btnPagar) {
        btnPagar.addEventListener('click', (e) => {
            e.preventDefault();
            alert("¡Muchas gracias!\nTu solicitud de cotización ha sido enviada a Radiadores Baja Mex. Pronto nos pondremos en contacto.");
            carrito = [];
            localStorage.setItem('BajaMex_Cart_Storage', JSON.stringify(carrito));
            window.location.href = 'index.html';
        });
    }

    // ==========================================================================
    // LÓGICA CORREGIDA PARA LA BARRA DE BÚSQUEDA
    // ==========================================================================
    const barraBusqueda = document.getElementById('search-input');
    const tarjetasProductos = document.querySelectorAll('.product-card');

    if (barraBusqueda) {
        barraBusqueda.addEventListener('input', (e) => {
            const textoBuscado = e.target.value.toLowerCase().trim();

            tarjetasProductos.forEach(tarjeta => {
                const titulo = tarjeta.querySelector('.product-title').textContent.toLowerCase();
                const sku = tarjeta.querySelector('.sku').textContent.toLowerCase();

                if (titulo.includes(textoBuscado) || sku.includes(textoBuscado)) {
                    tarjeta.style.display = 'block'; 
                } else {
                    tarjeta.style.display = 'none'; // <- Corregido aquí (tenía un .style repetido)
                }
            });
        });
    }

    // Ejecutar funciones de arranque
    actualizarContador();
    renderizarCarrito();
});