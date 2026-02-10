// Decodificar datos de pago desde Base64
function decodePaymentData() {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('d');

    if (!encoded) {
        // Fallback para URLs antiguas sin codificar
        return {
            status: params.get('status') || 'pending',
            ref: params.get('ref') || 'N/A',
            amount: null
        };
    }

    try {
        const decoded = JSON.parse(atob(encoded));
        return {
            status: decoded.s || 'pending',
            ref: decoded.r || 'N/A',
            amount: decoded.a || null
        };
    } catch (error) {
        console.error('Error decodificando datos:', error);
        return {
            status: 'pending',
            ref: 'N/A',
            amount: null
        };
    }
}

// Configuración de estados
const ESTADOS = {
    success: {
        icon: 'fas fa-check-circle',
        iconClass: 'success',
        titulo: '¡Pago Exitoso!',
        mensaje: 'Tu pago ha sido procesado correctamente. Te enviaremos la confirmación de tu pedido en breve.',
        instrucciones: [
            'Guarda tu número de referencia para futuras consultas',
            'Contacta con nosotros por WhatsApp con tu referencia de pago',
            'Te confirmaremos los detalles de tu pedido y el envío en las próximas horas'
        ]
    },
    pending: {
        icon: 'fas fa-clock',
        iconClass: 'pending',
        titulo: 'Pago en Proceso',
        mensaje: 'Tu pago está siendo verificado. Esto puede tomar unos minutos.',
        instrucciones: [
            'Guarda tu número de referencia para futuras consultas',
            'Contacta con nosotros por WhatsApp con tu referencia de pago',
            'Te confirmaremos el estado de tu pedido una vez verificado el pago'
        ]
    },
    declined: {
        icon: 'fas fa-times-circle',
        iconClass: 'declined',
        titulo: 'Pago No Procesado',
        mensaje: 'Tu pago no pudo ser procesado. Por favor intenta nuevamente o contacta con tu entidad bancaria.',
        instrucciones: [
            'Verifica que tu tarjeta tenga fondos disponibles',
            'Contacta con nosotros por WhatsApp si necesitas ayuda',
            'Puedes intentar realizar el pago nuevamente'
        ]
    }
};

// Formatear monto en COP
function formatAmount(amount) {
    if (!amount) return null;
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

// Actualizar contenido de la página
function actualizarContenido() {
    const params = decodePaymentData();
    const estado = ESTADOS[params.status] || ESTADOS.pending;

    // Actualizar icono
    const estadoIcon = document.getElementById('estadoIcon');
    estadoIcon.innerHTML = `<i class="${estado.icon}"></i>`;
    estadoIcon.className = `estado-icon ${estado.iconClass}`;

    // Actualizar título y mensaje
    document.getElementById('titulo').textContent = estado.titulo;
    document.getElementById('mensaje').textContent = estado.mensaje;

    // Actualizar referencia
    document.getElementById('refNumber').textContent = params.ref;

    // Actualizar monto si existe
    const montoElement = document.getElementById('montoNumber');
    if (params.amount && montoElement) {
        const formattedAmount = formatAmount(params.amount);
        montoElement.textContent = formattedAmount;
        document.getElementById('montoBox').style.display = 'block';
    }

    // Actualizar instrucciones
    const instruccionesHtml = estado.instrucciones
        .map(instruccion => `<li>${instruccion}</li>`)
        .join('');

    const instruccionesContainer = document.getElementById('instrucciones');
    instruccionesContainer.querySelector('ul').innerHTML = instruccionesHtml;

    // Actualizar enlace de WhatsApp con la referencia
    const btnWhatsapp = document.getElementById('btnWhatsapp');
    const mensaje = encodeURIComponent(`Hola, acabo de realizar un pago en BGOR. Mi referencia es: ${params.ref}`);
    btnWhatsapp.href = `https://wa.me/573022491916?text=${mensaje}`;

    // Si el pago fue declinado, cambiar el texto del botón
    if (params.status === 'declined') {
        btnWhatsapp.innerHTML = '<i class="fab fa-whatsapp"></i> Contactar Soporte';
    }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', actualizarContenido);
