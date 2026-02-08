// Función para descargar el formato de seguimiento en PDF
function descargarFormato() {
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        alert('Error al cargar la librería de PDF. Por favor, recarga la página.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuración
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin; // Ancho máximo respetando márgenes
    let currentY = margin;

    // Colores corporativos BGOR
    const primaryColor = [255, 107, 0]; // Naranja BGOR #FF6B00
    const textColor = [51, 51, 51];
    const grayColor = [128, 128, 128];

    // Función auxiliar para agregar texto centrado
    function addCenteredText(text, y, fontSize, color, isBold = false) {
        doc.setFontSize(fontSize);
        doc.setTextColor(color[0], color[1], color[2]);
        if (isBold) {
            doc.setFont(undefined, 'bold');
        } else {
            doc.setFont(undefined, 'normal');
        }
        const textWidth = doc.getTextWidth(text);
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, y);
        return y + fontSize / 2 + 3;
    }

    // Función para agregar línea horizontal respetando márgenes
    function addLine(y, color = grayColor) {
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        return y + 5;
    }

    // Función para agregar campo de formulario
    function addFormField(label, y, height = 8) {
        doc.setFontSize(10);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont(undefined, 'bold');
        doc.text(label, margin, y);

        // Dibujar rectángulo para el campo respetando márgenes
        doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.setLineWidth(0.3);
        doc.rect(margin, y + 2, maxWidth, height);

        return y + height + 8;
    }

    // Función para agregar tabla respetando márgenes
    function addTable(headers, rows, y, rowHeight = 8) {
        const colWidth = maxWidth / headers.length;

        // Headers con color naranja BGOR
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(margin, y, maxWidth, rowHeight, 'F');

        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');

        headers.forEach((header, i) => {
            const x = margin + (i * colWidth) + 2;
            doc.text(header, x, y + 5.5);
        });

        y += rowHeight;

        // Rows
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont(undefined, 'normal');
        doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2]);

        rows.forEach((row, rowIndex) => {
            // Alternar color de fondo
            if (rowIndex % 2 === 1) {
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, y, maxWidth, rowHeight, 'F');
            }

            row.forEach((cell, colIndex) => {
                const x = margin + (colIndex * colWidth) + 2;
                doc.text(cell, x, y + 5.5);
            });

            // Dibujar línea de separación respetando márgenes
            doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

            y += rowHeight;
        });

        return y + 5;
    }

    // === PÁGINA 1: INFORMACIÓN GENERAL ===

    // Logo y título
    currentY = addCenteredText('B-GOR', currentY, 24, primaryColor, true);
    currentY = addCenteredText('Formato de Seguimiento - Garantía 45 Días', currentY, 16, textColor, true);
    currentY = addCenteredText('Poligástricos y Monogástricos', currentY, 12, grayColor);
    currentY = addLine(currentY, primaryColor);

    // Información del productor
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN DEL PRODUCTOR', margin, currentY);
    currentY += 8;

    currentY = addFormField('Nombre completo:', currentY);
    currentY = addFormField('Identificación (CC/NIT):', currentY);
    currentY = addFormField('Nombre del predio:', currentY);
    currentY = addFormField('Ubicación (Municipio, Departamento):', currentY);
    currentY = addFormField('Teléfono de contacto:', currentY);
    currentY = addFormField('Email:', currentY);
    currentY += 5;

    // Información del producto
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN DEL PRODUCTO', margin, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont(undefined, 'normal');
    doc.text('Tipo de producto:  [ ] Poligástricos    [ ] Monogástricos', margin, currentY);
    currentY += 8;

    currentY = addFormField('Fecha de compra:', currentY);
    currentY = addFormField('Número de guía:', currentY);
    currentY = addFormField('Cantidad adquirida:', currentY);
    currentY += 5;

    // Información de los animales
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN DE LOS ANIMALES', margin, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont(undefined, 'normal');
    doc.text('Especie:  [ ] Bovinos  [ ] Porcinos  [ ] Equinos  [ ] Ovinos  [ ] Caprinos  [ ] Aves', margin, currentY);
    currentY += 8;

    currentY = addFormField('Número total de animales en el lote:', currentY);
    currentY = addFormField('Peso promedio inicial (kg):', currentY);
    currentY = addFormField('Edad promedio:', currentY);

    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont(undefined, 'normal');
    doc.text('Propósito:  [ ] Leche  [ ] Carne  [ ] Levante  [ ] Reproducción', margin, currentY);
    currentY += 10;

    // === PÁGINA 2: DOSIFICACIÓN Y MEDICIONES ===
    doc.addPage();
    currentY = margin;

    // Título de página con color naranja
    currentY = addCenteredText('DOSIFICACIÓN Y REGISTRO DE SEGUIMIENTO', currentY, 14, primaryColor, true);
    currentY = addLine(currentY, primaryColor);

    // Instrucciones de dosificación
    doc.setFontSize(11);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('DOSIFICACIÓN REQUERIDA:', margin, currentY);
    currentY += 7;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('• Poligástricos: 1.5 gramos por cada 10 kg de peso vivo', margin + 5, currentY);
    currentY += 6;
    doc.text('• Monogástricos: 1.0 gramo por cada 10 kg de peso vivo', margin + 5, currentY);
    currentY += 10;

    currentY = addFormField('Dosis diaria por animal (gramos):', currentY);
    currentY = addFormField('Dosis total diaria para el lote (gramos):', currentY);
    currentY = addFormField('Forma de suministro:', currentY);
    currentY += 5;

    // Indicadores a medir
    doc.setFontSize(11);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('INDICADORES A MEDIR (Marque los que aplicarán):', margin, currentY);
    currentY += 7;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('[ ] Producción de leche (litros/día)', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Ganancia de peso (kg)', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Consumo de alimento (kg/día)', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Condición corporal (escala 1-5)', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Recuperación posparto (días)', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Desempeño del lote', margin + 5, currentY);
    currentY += 10;

    // Mediciones iniciales
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('MEDICIONES DÍA 0 (INICIO)', margin, currentY);
    currentY += 7;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('Fecha de inicio: _________________', margin, currentY);
    currentY += 10;

    currentY = addFormField('Producción de leche promedio (litros/día):', currentY, 6);
    currentY = addFormField('Peso promedio del lote (kg):', currentY, 6);
    currentY = addFormField('Consumo de alimento promedio (kg/día):', currentY, 6);
    currentY = addFormField('Condición corporal promedio (1-5):', currentY, 6);
    currentY = addFormField('Otros indicadores:', currentY, 12);

    // === PÁGINA 3: TABLA DE SEGUIMIENTO SEMANAL ===
    doc.addPage();
    currentY = margin;

    currentY = addCenteredText('REGISTRO SEMANAL DE MEDICIONES', currentY, 14, primaryColor, true);
    currentY = addLine(currentY, primaryColor);

    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont(undefined, 'normal');
    doc.text('Complete las mediciones cada semana durante los 45 días.', margin, currentY);
    currentY += 8;

    // Tabla para vacas de ordeño (producción de leche)
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('PRODUCCIÓN DE LECHE (Vacas de Ordeño)', margin, currentY);
    currentY += 7;

    const lecheHeaders = ['Semana', 'Fecha', 'ID', 'L/día', 'Obs'];
    const lecheRows = [];
    for (let i = 1; i <= 7; i++) {
        lecheRows.push([`S${i}`, '', '', '', '']);
    }
    currentY = addTable(lecheHeaders, lecheRows, currentY);

    // Tabla para ganado de levante (peso)
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('GANANCIA DE PESO (Ganado de Levante)', margin, currentY);
    currentY += 7;

    const pesoHeaders = ['Semana', 'Fecha', 'Peso (kg)', 'Ganancia', 'Obs'];
    const pesoRows = [];
    for (let i = 1; i <= 7; i++) {
        pesoRows.push([`S${i}`, '', '', '', '']);
    }
    currentY = addTable(pesoHeaders, pesoRows, currentY);

    // === PÁGINA 4: RESULTADOS FINALES ===
    doc.addPage();
    currentY = margin;

    currentY = addCenteredText('MEDICIONES DÍA 45 (FINAL) Y RESULTADOS', currentY, 14, primaryColor, true);
    currentY = addLine(currentY, primaryColor);

    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont(undefined, 'normal');
    doc.text('Fecha de finalización: _________________', margin, currentY);
    currentY += 10;

    // Mediciones finales
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('MEDICIONES FINALES:', margin, currentY);
    currentY += 7;

    currentY = addFormField('Producción de leche promedio (litros/día):', currentY, 6);
    currentY = addFormField('Peso promedio del lote (kg):', currentY, 6);
    currentY = addFormField('Consumo de alimento promedio (kg/día):', currentY, 6);
    currentY = addFormField('Condición corporal promedio (1-5):', currentY, 6);
    currentY = addFormField('Otros indicadores:', currentY, 12);
    currentY += 5;

    // Comparación de resultados
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('COMPARACIÓN DE RESULTADOS:', margin, currentY);
    currentY += 7;

    const resultHeaders = ['Indicador', 'Día 0', 'Día 45', 'Mejora', '¿Mejoró?'];
    const resultRows = [
        ['Leche', '', '', '', '[ ] Sí  [ ] No'],
        ['Peso', '', '', '', '[ ] Sí  [ ] No'],
        ['Consumo', '', '', '', '[ ] Sí  [ ] No'],
        ['Cond. Corp.', '', '', '', '[ ] Sí  [ ] No']
    ];
    currentY = addTable(resultHeaders, resultRows, currentY, 10);

    // Declaración
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('DECLARACIÓN:', margin, currentY);
    currentY += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const declaracion = 'Declaro que la información contenida en este formato es verídica y que he seguido las instrucciones de dosificación indicadas por BGOR durante los 45 días del periodo de garantía.';
    const splitDeclaracion = doc.splitTextToSize(declaracion, maxWidth);
    doc.text(splitDeclaracion, margin, currentY);
    currentY += splitDeclaracion.length * 5 + 10;

    currentY = addFormField('Firma del productor:', currentY, 15);
    currentY = addFormField('Fecha:', currentY, 6);

    // Footer en todas las páginas
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.setFont(undefined, 'normal');

        const footerText = 'BGOR - Garantía de Satisfacción 45 Días | www.bgor.com.co';
        const footerWidth = doc.getTextWidth(footerText);
        const footerX = (pageWidth - footerWidth) / 2;
        doc.text(footerText, footerX, pageHeight - 10);

        const pageText = `Página ${i} de ${totalPages}`;
        const pageTextWidth = doc.getTextWidth(pageText);
        doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 10);
    }

    // Guardar el PDF
    doc.save('BGOR_Formato_Seguimiento_Garantia_45_Dias.pdf');

    // Mostrar mensaje de éxito
    mostrarMensajeExito();
}

// Función para mostrar mensaje de éxito
function mostrarMensajeExito() {
    // Crear el elemento del mensaje
    const mensaje = document.createElement('div');
    mensaje.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #FF6B00;
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        font-family: 'Roboto', sans-serif;
        animation: slideIn 0.3s ease-out;
    `;

    mensaje.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 1.5rem;"></i>
        <div>
            <strong style="display: block; margin-bottom: 5px;">¡Descarga exitosa!</strong>
            <span style="font-size: 0.9rem;">El formato de seguimiento se ha descargado correctamente.</span>
        </div>
    `;

    // Agregar la animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(mensaje);

    // Remover el mensaje después de 4 segundos
    setTimeout(() => {
        mensaje.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(mensaje);
        }, 300);
    }, 4000);
}

// Smooth scroll para enlaces internos
document.addEventListener('DOMContentLoaded', function() {
    // Agregar smooth scroll a todos los enlaces que apuntan a anclas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Animación de entrada para las tarjetas
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar todas las tarjetas de términos
    document.querySelectorAll('.termino-card').forEach(card => {
        observer.observe(card);
    });
});
