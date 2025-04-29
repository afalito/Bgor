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
    // Elementos del DOM
    const toggleOrderFormBtn = document.getElementById('toggleOrderForm');
    const orderFormContainer = document.getElementById('orderFormContainer');
    const orderForm = document.getElementById('orderForm');
    
    // Mostrar/ocultar el formulario de pedido
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
    
    // Procesar el formulario de pedido - ahora manejado por Netlify Forms
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            // No vamos a prevenir el comportamiento por defecto para que Netlify procese el formulario
            // e.preventDefault();
            
            // Podemos agregar código aquí para tracking o validaciones adicionales
            console.log('Formulario enviado a Netlify');
            
            // Nota: El redireccionamiento ocurrirá automáticamente a la página de éxito de Netlify
            // o podemos configurar redirecciones personalizadas en Netlify
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