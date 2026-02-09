// Configuración de Wompi
const WOMPI_PUBLIC_KEY = 'pub_prod_nEQz86DNHu6WNWkdW4FNNjJhox1YPcee';

// Elementos del DOM
const paymentForm = document.getElementById('paymentForm');
const btnPagar = document.getElementById('btnPagar');
const loadingOverlay = document.getElementById('loadingOverlay');
const amountInput = document.getElementById('amount');
const phoneInput = document.getElementById('phone');

// Generar referencia única
function generateReference() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `BGOR-${timestamp}-${random}`;
}

// Función para obtener la firma desde Netlify Function
async function getSignature(reference, amountInCents) {
    try {
        const response = await fetch('/.netlify/functions/generate-signature', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reference: reference,
                amountInCents: amountInCents
            })
        });

        if (!response.ok) {
            throw new Error('Error al generar la firma de seguridad');
        }

        const data = await response.json();
        return data.signature;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Procesar el pago
async function procesarPago(event) {
    event.preventDefault();

    // Validar formulario
    if (!paymentForm.checkValidity()) {
        paymentForm.reportValidity();
        return;
    }

    // Validar términos y condiciones
    const acceptTerms = document.getElementById('acceptTerms');
    if (!acceptTerms.checked) {
        alert('Debes aceptar los términos y condiciones para continuar');
        return;
    }

    // Validar que el monto sea válido
    const amount = parseInt(amountInput.value);
    if (isNaN(amount) || amount < 1000) {
        alert('El valor mínimo de pago es $1.000 COP');
        return;
    }

    // Mostrar loading
    loadingOverlay.style.display = 'flex';

    try {
        // Obtener datos del formulario
        const amountInCents = amount * 100; // Wompi requiere el monto en centavos
        const reference = generateReference();
        const fullName = document.getElementById('fullName').value;
        const phone = phoneInput.value;

        // Obtener la firma de seguridad
        const signature = await getSignature(reference, amountInCents);

        // Generar email temporal basado en el teléfono
        const tempEmail = `cliente${phone}@bgor.com.co`;

        // Preparar datos del cliente (mínimos requeridos por Wompi)
        const customerData = {
            email: tempEmail,
            fullName: fullName,
            phoneNumber: phone,
            phoneNumberPrefix: '+57'
        };

        // Configurar checkout de Wompi
        const checkout = new WidgetCheckout({
            currency: 'COP',
            amountInCents: amountInCents,
            reference: reference,
            publicKey: WOMPI_PUBLIC_KEY,
            signature: {
                integrity: signature
            },
            redirectUrl: window.location.origin + '/pagos/confirmacion.html',
            customerData: customerData
        });

        // Abrir el widget de pago
        checkout.open(function(result) {
            // Callback cuando se cierra el widget
            loadingOverlay.style.display = 'none';

            if (result.transaction) {
                // Transacción procesada
                const transaction = result.transaction;
                console.log('Transacción:', transaction);

                // Redirigir según el estado
                if (transaction.status === 'APPROVED') {
                    window.location.href = '/pagos/confirmacion.html?status=success&ref=' + reference;
                } else if (transaction.status === 'DECLINED') {
                    window.location.href = '/pagos/confirmacion.html?status=declined&ref=' + reference;
                } else {
                    window.location.href = '/pagos/confirmacion.html?status=pending&ref=' + reference;
                }
            }
        });

    } catch (error) {
        console.error('Error al procesar el pago:', error);
        loadingOverlay.style.display = 'none';
        alert('Ocurrió un error al procesar tu pago. Por favor, intenta nuevamente o contáctanos por WhatsApp.');
    }
}

// Event listener para el formulario
paymentForm.addEventListener('submit', procesarPago);
