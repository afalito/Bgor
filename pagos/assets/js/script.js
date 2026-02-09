// Configuración de Wompi
const WOMPI_PUBLIC_KEY = 'pub_prod_nEQz86DNHu6WNWkdW4FNNjJhox1YPcee';

// Elementos del DOM
const productSelect = document.getElementById('productType');
const quantityInput = document.getElementById('quantity');
const totalDisplay = document.getElementById('totalDisplay');
const paymentForm = document.getElementById('paymentForm');
const btnPagar = document.getElementById('btnPagar');
const loadingOverlay = document.getElementById('loadingOverlay');

// Función para formatear precio
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Función para calcular y mostrar el total
function updateTotal() {
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const price = parseInt(selectedOption.getAttribute('data-price')) || 0;
    const quantity = parseInt(quantityInput.value) || 1;
    const total = price * quantity;

    totalDisplay.textContent = formatPrice(total);
    return total;
}

// Event listeners para actualizar el total
productSelect.addEventListener('change', updateTotal);
quantityInput.addEventListener('input', updateTotal);

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

    // Mostrar loading
    loadingOverlay.style.display = 'flex';

    try {
        // Obtener datos del formulario
        const total = updateTotal();
        const amountInCents = total * 100; // Wompi requiere el monto en centavos
        const reference = generateReference();

        // Obtener la firma de seguridad
        const signature = await getSignature(reference, amountInCents);

        // Preparar datos del cliente
        const customerData = {
            email: document.getElementById('email').value,
            fullName: document.getElementById('fullName').value,
            phoneNumber: document.getElementById('phone').value,
            phoneNumberPrefix: '+57',
            legalId: document.getElementById('legalId').value,
            legalIdType: document.getElementById('idType').value
        };

        // Preparar datos de envío
        const shippingAddress = {
            addressLine1: document.getElementById('address').value,
            city: document.getElementById('city').value,
            phoneNumber: document.getElementById('phoneShipping').value,
            region: document.getElementById('region').value,
            country: 'CO'
        };

        // Datos del producto seleccionado
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const productName = selectedOption.text;

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
            customerData: customerData,
            shippingAddress: shippingAddress,
            taxInCents: {
                vat: 0,
                consumption: 0
            }
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

// Inicializar el total en carga
updateTotal();
