// Funcionalidad para el menú móvil
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Cerrar menú al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });
    
    // Inicializar testimonios
    initTestimonials();
    
    // Animación de scroll suave para los enlaces de navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Formulario de contacto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Aquí iría la lógica para enviar el formulario
            // Por ahora, solo mostraremos un mensaje de éxito
            
            const formData = new FormData(contactForm);
            let formValues = {};
            
            formData.forEach((value, key) => {
                formValues[key] = value;
            });
            
            console.log('Formulario enviado:', formValues);
            
            // Mostrar mensaje de éxito
            alert('¡Gracias por contactarnos! Te responderemos a la brevedad.');
            contactForm.reset();
        });
    }
    
    // Efecto de aparición al hacer scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Elementos a observar
    const animatedElements = document.querySelectorAll('.benefit-card, .product-card, .presentation-card, .testimonial-content, .gallery-item, .performance-data');
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Efecto de navegación fija con cambio de color al hacer scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
});

// Añadir clase para animaciones CSS
document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loaded');
    
    // Inicializar selector de formatos
    initFormatSelector();
});

// Funcionalidad para el formulario de pedido
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM para formularios
    const toggleOrderFormBtn = document.getElementById('toggleOrderForm');
    const toggleOrderFormFromBtn = document.getElementById('toggleOrderFormFromBtn');
    const orderFormContainer = document.getElementById('orderFormContainer');
    const toggleDistribuidorFormBtn = document.getElementById('toggleDistribuidorForm');
    const distribuidorFormContainer = document.getElementById('distribuidorFormContainer');
    const closeDistribuidorFormBtn = document.getElementById('closeDistribuidorForm');
    const orderForm = document.getElementById('orderForm');
    
    // Función para cerrar todos los formularios
    function closeAllForms() {
        // Ocultar formulario de pedido
        if (orderFormContainer) {
            orderFormContainer.classList.remove('active');
            if (toggleOrderFormBtn) {
                toggleOrderFormBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Haz tu pedido';
            }
        }
        
        // Ocultar formulario de distribuidores
        if (distribuidorFormContainer) {
            distribuidorFormContainer.classList.remove('active');
            distribuidorFormContainer.style.display = 'none';
        }
    }
    
    // Mostrar/ocultar el formulario de pedido desde el botón principal
    if (toggleOrderFormBtn && orderFormContainer) {
        toggleOrderFormBtn.addEventListener('click', function() {
            // Cerrar otros formularios primero
            closeAllForms();
            
            // Mostrar u ocultar el formulario de pedidos
            orderFormContainer.classList.toggle('active');
            
            // Cambiar el texto del botón según el estado
            if (orderFormContainer.classList.contains('active')) {
                toggleOrderFormBtn.innerHTML = '<i class="fas fa-times"></i> Cerrar formulario';
            } else {
                toggleOrderFormBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Haz tu pedido';
            }
            
            // Desplazarse al formulario si está visible
            if (orderFormContainer.classList.contains('active')) {
                setTimeout(() => {
                    orderFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    }
    
    // Mostrar/ocultar el formulario de pedido desde el botón de la sección de presentaciones
    if (toggleOrderFormFromBtn && orderFormContainer) {
        toggleOrderFormFromBtn.addEventListener('click', function() {
            // Cerrar otros formularios primero
            closeAllForms();
            
            // Mostrar formulario de pedidos
            orderFormContainer.classList.add('active');
            
            if (toggleOrderFormBtn) {
                toggleOrderFormBtn.innerHTML = '<i class="fas fa-times"></i> Cerrar formulario';
            }
            
            // Si estamos en la sección de presentaciones, ir a la sección de contacto
            document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
            
            // Desplazarse al formulario
            setTimeout(() => {
                orderFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        });
    }
    
    // Mostrar/ocultar el formulario de distribuidores
    if (toggleDistribuidorFormBtn && distribuidorFormContainer) {
        toggleDistribuidorFormBtn.addEventListener('click', function() {
            // Cerrar otros formularios primero
            closeAllForms();
            
            // Mostrar formulario de distribuidores
            distribuidorFormContainer.style.display = 'block';
            distribuidorFormContainer.classList.add('active');
            
            // Desplazarse al formulario
            setTimeout(() => {
                distribuidorFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        });
    }
    
    // Cerrar formulario de distribuidores
    if (closeDistribuidorFormBtn && distribuidorFormContainer) {
        closeDistribuidorFormBtn.addEventListener('click', function() {
            distribuidorFormContainer.classList.remove('active');
            
            // Ocultar con un pequeño retraso para permitir la animación
            setTimeout(() => {
                distribuidorFormContainer.style.display = 'none';
            }, 300);
        });
    }
    
    // Añadir animación a elementos con efecto "fade-in-up" al hacer scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar las tarjetas de fichas técnicas
    const techCards = document.querySelectorAll('.tech-card');
    techCards.forEach(card => {
        card.classList.add('fade-in-up');
        observer.observe(card);
    });
    
    // Observar las tarjetas de beneficios para veterinarias
    const benefitCards = document.querySelectorAll('.veterinaria-benefit-card');
    benefitCards.forEach(card => {
        card.classList.add('fade-in-up');
        observer.observe(card);
    });
    
    // Cerrar formularios al hacer clic fuera de ellos
    document.addEventListener('click', function(event) {
        if (orderFormContainer && orderFormContainer.classList.contains('active')) {
            // Verificar si el clic fue fuera del formulario y no en el botón de toggle
            if (!orderFormContainer.contains(event.target) && 
                event.target !== toggleOrderFormBtn && 
                !toggleOrderFormBtn.contains(event.target) &&
                event.target !== toggleOrderFormFromBtn && 
                !toggleOrderFormFromBtn.contains(event.target)) {
                
                orderFormContainer.classList.remove('active');
                toggleOrderFormBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Haz tu pedido';
            }
        }
    });
    
    // Procesar el formulario de pedido - Netlify Forms + interactividad
    if (orderForm) {
        // Elementos del formulario de pedidos
        const cantidadInput = document.getElementById('cantidad');
        const btnMinus = document.querySelector('.quantity-btn.minus');
        const btnPlus = document.querySelector('.quantity-btn.plus');
        const orderSummary = document.getElementById('orderSummary');
        const formSuccess = document.getElementById('formSuccess');
        
        // Opciones de precio
        const option1kg = document.getElementById('option1kg');
        const optionPromo = document.getElementById('optionPromo');
        const option12kg = document.getElementById('option12kg');
        
        // Opciones de tipo
        const tipoMono = document.getElementById('tipoMono');
        const tipoPoli = document.getElementById('tipoPoli');
        const tipoMixto = document.getElementById('tipoMixto');
        
        // Controles de cantidad +/-
        if (btnMinus && btnPlus && cantidadInput) {
            btnMinus.addEventListener('click', function() {
                const currentValue = parseInt(cantidadInput.value);
                if (currentValue > 1) {
                    cantidadInput.value = currentValue - 1;
                    updateOrderSummary();
                }
            });
            
            btnPlus.addEventListener('click', function() {
                const currentValue = parseInt(cantidadInput.value);
                cantidadInput.value = currentValue + 1;
                updateOrderSummary();
            });
            
            cantidadInput.addEventListener('change', updateOrderSummary);
        }
        
        // Actualizar resumen al cambiar opciones
        if (option1kg && optionPromo && option12kg) {
            option1kg.addEventListener('change', updateOrderSummary);
            optionPromo.addEventListener('change', updateOrderSummary);
            option12kg.addEventListener('change', updateOrderSummary);
        }
        
        if (tipoMono && tipoPoli && tipoMixto) {
            tipoMono.addEventListener('change', updateOrderSummary);
            tipoPoli.addEventListener('change', updateOrderSummary);
            tipoMixto.addEventListener('change', updateOrderSummary);
        }
        
        // Función para actualizar el resumen del pedido
        function updateOrderSummary() {
            if (!orderSummary) return;
            
            const cantidad = parseInt(cantidadInput.value);
            let precio = 84900; // Precio base 1kg
            let presentacion = '1kg';
            let tipo = 'Monogástricos';
            
            // Determinar precio según opción seleccionada
            if (optionPromo.checked) {
                precio = 229900;
                presentacion = 'Promoción 3+1';
            } else if (option12kg.checked) {
                precio = 559900;
                presentacion = '12kg';
            }
            
            // Determinar tipo según opción seleccionada
            if (tipoPoli.checked) {
                tipo = 'Poligástricos';
            } else if (tipoMixto.checked) {
                tipo = 'Mixto (Mono/Poli)';
            }
            
            // Calcular total
            const total = precio * cantidad;
            
            // Formatear números a moneda colombiana
            const formatter = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
            });
            
            // Actualizar el resumen
            let summaryHtml = `<p>${cantidad}x BGOR ${tipo} ${presentacion}</p>`;
            
            // Si es mixto y es más de 1 unidad, aclarar
            if (tipoMixto.checked && cantidad > 1) {
                summaryHtml = `<p>${cantidad}x BGOR Mixto ${presentacion} (${cantidad/2} Mono + ${cantidad/2} Poli)</p>`;
            }
            
            summaryHtml += `<p class="total">Total: ${formatter.format(total)}</p>`;
            
            orderSummary.innerHTML = summaryHtml;
        }
        
        // Inicializar resumen del pedido
        updateOrderSummary();
        
        // Manejar envío del formulario con Netlify Forms
        orderForm.addEventListener('submit', function(e) {
            // Permitimos que Netlify procese el formulario, pero mostramos confirmación
            e.preventDefault();
            
            // Mostrar mensaje de éxito
            formSuccess.classList.add('visible');
            
            // Enviar el formulario después de 2 segundos
            setTimeout(() => {
                orderForm.submit();
            }, 2000);
        });
    }
});

// Función para inicializar el carrusel de testimonios con Swiper
function initTestimonials() {
    // Inicializar Swiper
    const swiper = new Swiper('.testimonial-slider', {
        loop: true,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        effect: 'slide',
        slidesPerView: 1,
        spaceBetween: 30,
        centeredSlides: true,
    });
}

// Función para inicializar el selector de formatos
function initFormatSelector() {
    // Elementos DOM
    const formatQuantityInputs = document.querySelectorAll('.format-quantity-input');
    const formatMinusBtns = document.querySelectorAll('.format-minus');
    const formatPlusBtns = document.querySelectorAll('.format-plus');
    const productTypeOptions = document.querySelectorAll('input[name="productType"]');
    const orderSummaryTable = document.getElementById('orderSummaryTable');
    const orderTotalAmount = document.getElementById('orderTotalAmount');
    
    // Formatos y precios
    const formats = {
        '1kg': { name: 'Unidad (1kg)', price: 84900 },
        'promo': { name: 'Promoción "Paga 3 lleva 4"', price: 229900 },
        '12kg': { name: 'Balde (12kg)', price: 559900 }
    };
    
    // Event listeners para botones de cantidad
    formatMinusBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.dataset.format;
            const inputEl = document.querySelector(`.format-quantity-input[data-format="${format}"]`);
            if (inputEl) {
                const currentValue = parseInt(inputEl.value) || 0;
                if (currentValue > 0) {
                    inputEl.value = currentValue - 1;
                    updateOrderSummary();
                }
            }
        });
    });
    
    formatPlusBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.dataset.format;
            const inputEl = document.querySelector(`.format-quantity-input[data-format="${format}"]`);
            if (inputEl) {
                const currentValue = parseInt(inputEl.value) || 0;
                inputEl.value = currentValue + 1;
                updateOrderSummary();
            }
        });
    });
    
    // Event listeners para inputs de cantidad
    formatQuantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            // Asegurar valor mínimo 0
            if (parseInt(this.value) < 0 || isNaN(parseInt(this.value))) {
                this.value = 0;
            }
            updateOrderSummary();
        });
    });
    
    // Event listeners para opciones de tipo
    productTypeOptions.forEach(option => {
        option.addEventListener('change', updateOrderSummary);
    });
    
    // Función para actualizar resumen de pedido
    function updateOrderSummary() {
        // Obtener tipo de producto seleccionado
        const productType = document.querySelector('input[name="productType"]:checked').value;
        let productTypeText = '';
        
        switch(productType) {
            case 'monogastricos':
                productTypeText = 'Monogástricos';
                break;
            case 'poligastricos':
                productTypeText = 'Poligástricos';
                break;
            case 'mixed':
                productTypeText = 'Mitad Mono/Poli';
                break;
        }
        
        // Recopilar cantidades
        let orderItems = [];
        let totalAmount = 0;
        
        formatQuantityInputs.forEach(input => {
            const format = input.dataset.format;
            const quantity = parseInt(input.value) || 0;
            
            if (quantity > 0) {
                const formatInfo = formats[format];
                const itemTotal = quantity * formatInfo.price;
                
                orderItems.push({
                    name: `${quantity}x ${formatInfo.name} - ${productTypeText}`,
                    price: itemTotal
                });
                
                totalAmount += itemTotal;
            }
        });
        
        // Actualizar HTML del resumen
        if (orderItems.length === 0) {
            orderSummaryTable.innerHTML = '<p class="empty-cart-message">Agrega productos a tu pedido</p>';
        } else {
            let html = '';
            
            orderItems.forEach(item => {
                html += `
                <div class="summary-item">
                    <span class="summary-item-name">${item.name}</span>
                    <span class="summary-item-price">${formatPrice(item.price)}</span>
                </div>
                `;
            });
            
            orderSummaryTable.innerHTML = html;
        }
        
        // Actualizar total
        orderTotalAmount.textContent = formatPrice(totalAmount);
        
        // Actualizar datos del formulario de pedido (para cuando se envíe)
        updateOrderFormData(orderItems, totalAmount, productTypeText);
    }
    
    // Formatear precios en formato de moneda colombiana
    function formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    }
    
    // Actualizar datos ocultos en el formulario de pedido
    function updateOrderFormData(items, total, type) {
        // Esta función pasará los datos seleccionados al formulario principal cuando
        // el usuario haga clic en "Haz tu pedido"
        
        // Evento para cuando se abre el formulario de pedido
        const toggleOrderFormFromBtn = document.getElementById('toggleOrderFormFromBtn');
        if (toggleOrderFormFromBtn) {
            toggleOrderFormFromBtn.addEventListener('click', function() {
                // Si hay productos en el carrito, pre-rellenar el formulario de pedido
                if (items.length > 0) {
                    // Actualizar el resumen del formulario de pedido
                    const orderSummary = document.getElementById('orderSummary');
                    if (orderSummary) {
                        let summaryHtml = '';
                        items.forEach(item => {
                            summaryHtml += `<p>${item.name}</p>`;
                        });
                        summaryHtml += `<p class="total">Total: ${formatPrice(total)}</p>`;
                        orderSummary.innerHTML = summaryHtml;
                    }
                    
                    // Seleccionar el tipo de producto correcto en el formulario
                    const tipoMono = document.getElementById('tipoMono');
                    const tipoPoli = document.getElementById('tipoPoli');
                    const tipoMixto = document.getElementById('tipoMixto');
                    
                    if (tipoMono && tipoPoli && tipoMixto) {
                        if (type === 'Monogástricos') {
                            tipoMono.checked = true;
                        } else if (type === 'Poligástricos') {
                            tipoPoli.checked = true;
                        } else if (type === 'Mitad Mono/Poli') {
                            tipoMixto.checked = true;
                        }
                    }
                }
            });
        }
    }
    
    // Inicializar resumen
    updateOrderSummary();
}