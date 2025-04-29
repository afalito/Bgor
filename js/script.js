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
});

// Funcionalidad para el formulario de pedido
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM para formularios
    const toggleOrderFormBtn = document.getElementById('toggleOrderForm');
    const toggleOrderFormFromBtn = document.getElementById('toggleOrderFormFromBtn');
    const orderFormContainer = document.getElementById('orderFormContainer');
    const toggleContactFormBtn = document.getElementById('toggleContactForm');
    const contactFormContainer = document.getElementById('contactFormContainer');
    const orderForm = document.getElementById('orderForm');
    
    // Mostrar/ocultar el formulario de pedido desde el botón principal
    if (toggleOrderFormBtn && orderFormContainer) {
        toggleOrderFormBtn.addEventListener('click', function() {
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
            orderFormContainer.classList.add('active');
            
            if (toggleOrderFormBtn) {
                toggleOrderFormBtn.innerHTML = '<i class="fas fa-times"></i> Cerrar formulario';
            }
            
            setTimeout(() => {
                orderFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            
            // Si estamos en la sección de presentaciones, ir a la sección de contacto
            document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Mostrar/ocultar el formulario de contacto para veterinarias
    if (toggleContactFormBtn && contactFormContainer) {
        toggleContactFormBtn.addEventListener('click', function() {
            // Mostrar el formulario que estaba oculto con display: none
            contactFormContainer.style.display = 'block';
            
            // Desplazarse al formulario
            setTimeout(() => {
                contactFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        });
    }
    
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