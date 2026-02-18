// Elementos del DOM
const form = document.getElementById('authorizationForm');
const loadingSpinner = document.getElementById('loadingSpinner');
const successMessage = document.getElementById('successMessage');
const downloadBtn = document.getElementById('downloadBtn');
const generateNewBtn = document.getElementById('generateNewBtn');

// Variable global para almacenar el PDF
let generatedPDF = null;

// Función para convertir imagen a Base64
async function getImageBase64(imagePath) {
    try {
        console.log('Intentando cargar imagen:', imagePath);
        const response = await fetch(imagePath);

        if (!response.ok) {
            console.error('Error en respuesta:', response.status, response.statusText);
            return null;
        }

        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log('Imagen cargada exitosamente:', imagePath);
                resolve(reader.result);
            };
            reader.onerror = (error) => {
                console.error('Error en FileReader:', error);
                reject(error);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error cargando imagen:', imagePath, error);
        return null;
    }
}

// Función para obtener la fecha actual en formato español
function getFechaActual() {
    const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    return `${dia} de ${mes} de ${año}`;
}

// Función para obtener el texto según la transportadora
function getTextoTransportadora(transportadora) {
    if (transportadora === 'Servientrega') {
        return 'En virtud de los términos y condiciones establecidos en el Contrato de Servicio de Servientrega, donde se establece que el pago contraentrega se realiza al momento de recibir el envío, y considerando que su servicio promueve opciones seguras y cómodas para las transacciones, solicitamos respetuosamente autorizar la inspección del contenido del paquete antes de efectuar el pago. Esta medida fomenta la confianza del destinatario al verificar la conformidad del producto, siempre bajo supervisión del mensajero y garantizando la integridad del servicio.';
    } else {
        return 'De acuerdo con los términos y condiciones del servicio de "Pago en Casa" de Inter Rapidísimo, y en línea con las prácticas promocionadas por su empresa para fomentar la confianza en las compras en línea, solicitamos la confirmación de autorización para abrir el paquete previo al pago. Esta práctica permite al destinatario validar el contenido en el momento de la recepción, minimizando riesgos y alineándose con el compromiso de Inter Rapidísimo por ofrecer soluciones innovadoras y seguras en el comercio electrónico.';
    }
}

// Función principal para generar el PDF
async function generarPDF(datos) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Cargar imágenes
    console.log('Iniciando carga de logo...');
    let logoFluxon = await getImageBase64('./assets/logo-fluxon-feria.png');
    if (!logoFluxon) {
        console.log('Intentando logo alternativo...');
        logoFluxon = await getImageBase64('./assets/logo-fluxon.png'); // Fallback
    }
    console.log('Logo cargado:', logoFluxon ? 'SÍ' : 'NO');

    const selloFluxon = datos.selloBase64;
    console.log('Sello recibido:', selloFluxon ? 'SÍ' : 'NO');

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = 15;

    // Logo de Fluxon como membrete (superior derecha, pequeño)
    if (logoFluxon) {
        const logoWidth = 35;
        const logoHeight = 10;
        const logoX = pageWidth - margin - logoWidth;
        doc.addImage(logoFluxon, 'PNG', logoX, yPosition, logoWidth, logoHeight);
    }
    yPosition += 20;

    // Título del documento
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AUTORIZACIÓN DE APERTURA DE PAQUETE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;

    // Fecha
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${getFechaActual()}`, margin, yPosition);
    yPosition += 10;

    // Destinatario
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Señores:', margin, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(datos.transportadora, margin, yPosition);
    yPosition += 10;

    // Párrafo introductorio
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const textoPrincipal = 'Mediante la presente, nosotros FLUXON SAS, identificados con NIT 901762720-2, en calidad de remitentes, autorizamos expresamente la apertura del paquete descrito a continuación, previo a la entrega y pago por parte del destinatario:';
    const lineasPrincipal = doc.splitTextToSize(textoPrincipal, contentWidth);
    doc.text(lineasPrincipal, margin, yPosition);
    yPosition += (lineasPrincipal.length * 4.5) + 6;

    // Título de la tabla
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('DATOS DEL ENVÍO:', margin, yPosition);
    yPosition += 6;

    // Tabla con los datos
    doc.autoTable({
        startY: yPosition,
        head: [['Concepto', 'Detalle']],
        body: [
            ['Número de guía', datos.guia],
            ['Destinatario', datos.nombre],
            ['Teléfono de contacto', datos.celular],
            ['Transportadora', datos.transportadora],
            ['Remitente', 'FLUXON SAS - NIT 901762720-2']
        ],
        theme: 'grid',
        headStyles: {
            fillColor: [255, 107, 0],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
        },
        bodyStyles: {
            fontSize: 10
        },
        columnStyles: {
            0: { cellWidth: 60, fontStyle: 'bold' },
            1: { cellWidth: 110 }
        },
        margin: { left: margin, right: margin }
    });

    yPosition = doc.lastAutoTable.finalY + 10;

    // Texto específico según transportadora
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const textoTransportadora = getTextoTransportadora(datos.transportadora);
    const lineasTransportadora = doc.splitTextToSize(textoTransportadora, contentWidth);
    doc.text(lineasTransportadora, margin, yPosition);
    yPosition += (lineasTransportadora.length * 4) + 6;

    // Párrafo de cierre
    doc.setFontSize(10);
    const textoCierre = 'El destinatario ha solicitado verificar el contenido antes de realizar el pago, por lo que autorizamos esta inspección sin que esto constituya alteración alguna a las condiciones del envío.';
    const lineasCierre = doc.splitTextToSize(textoCierre, contentWidth);
    doc.text(lineasCierre, margin, yPosition);
    yPosition += (lineasCierre.length * 4.5) + 8;

    // Agradecimiento
    const textoAgradecimiento = 'Agradecemos su colaboración y quedamos atentos ante cualquier inquietud.';
    doc.text(textoAgradecimiento, margin, yPosition);
    yPosition += 12;

    // Cordialmente
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Cordialmente,', margin, yPosition);
    yPosition += 15;

    // Posición de inicio para firma y sello (lado a lado)
    const firmaStartY = yPosition;

    // Firma manuscrita con estilo elegante (usando Times en negro)
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('Carlos Arguello', margin, yPosition);
    yPosition += 3;

    // Línea de firma
    doc.setLineWidth(0.3);
    doc.setDrawColor(100, 100, 100);
    doc.line(margin, yPosition, margin + 60, yPosition);
    yPosition += 6;

    // Datos del firmante
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Carlos Arguello', margin, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Gerente General', margin, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('FLUXON SAS', margin, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('NIT 901762720-2', margin, yPosition);

    // Sello (posicionado a la derecha de la firma)
    if (selloFluxon) {
        const selloSize = 45;
        const selloX = pageWidth - margin - selloSize - 10;
        const selloY = firmaStartY - 10;

        // Agregar sello con opacidad
        doc.addImage(selloFluxon, 'PNG', selloX, selloY, selloSize, selloSize);
    }

    return doc;
}

// Event Listener para el formulario
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obtener datos del formulario
    const formData = {
        nombre: document.getElementById('nombre').value.trim(),
        celular: document.getElementById('celular').value.trim(),
        guia: document.getElementById('guia').value.trim(),
        transportadora: document.getElementById('transportadora').value,
        selloBase64: null // Lo cargaremos dinámicamente
    };

    // Validaciones básicas
    if (!formData.nombre || !formData.celular || !formData.guia || !formData.transportadora) {
        alert('Por favor completa todos los campos');
        return;
    }

    // Mostrar loading
    form.style.display = 'none';
    loadingSpinner.style.display = 'block';

    try {
        // Cargar el sello de Fluxon SAS
        console.log('Iniciando carga del sello...');
        const selloPath = './assets/sello-fluxon.png';
        const sello = await getImageBase64(selloPath);

        if (sello) {
            console.log('Sello cargado correctamente');
            formData.selloBase64 = sello;
        } else {
            console.warn('No se pudo cargar el sello, intentando fallback...');
            // Fallback: usar el logo de BGOR
            formData.selloBase64 = await getImageBase64('../assets/images/logo.png');
        }

        // Simular proceso de validación (1.5 segundos)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generar PDF
        generatedPDF = await generarPDF(formData);

        // Ocultar loading y mostrar éxito
        loadingSpinner.style.display = 'none';
        successMessage.style.display = 'block';

    } catch (error) {
        console.error('Error generando PDF:', error);
        alert('Hubo un error al generar la autorización. Por favor intenta nuevamente.');
        loadingSpinner.style.display = 'none';
        form.style.display = 'block';
    }
});

// Event Listener para descargar PDF
downloadBtn.addEventListener('click', () => {
    if (generatedPDF) {
        const guia = document.getElementById('guia').value.trim();
        generatedPDF.save(`Autorizacion_Apertura_${guia}.pdf`);
    }
});

// Event Listener para generar nueva autorización
generateNewBtn.addEventListener('click', () => {
    form.reset();
    successMessage.style.display = 'none';
    form.style.display = 'block';
    generatedPDF = null;
});

// Validación del número de celular en tiempo real
document.getElementById('celular').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
});
