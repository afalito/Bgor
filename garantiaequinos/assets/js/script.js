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
    const maxWidth = pageWidth - 2 * margin;
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

    // Función para agregar línea horizontal
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

        doc.setDrawColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.setLineWidth(0.3);
        doc.rect(margin, y + 2, maxWidth, height);

        return y + height + 8;
    }

    // === PÁGINA 1: INFORMACIÓN GENERAL ===

    // Logo y título
    currentY = addCenteredText('B-GOR', currentY, 24, primaryColor, true);
    currentY = addCenteredText('Formato de Seguimiento - Garantía 30 Días', currentY, 16, textColor, true);
    currentY = addCenteredText('Equinos y Potros', currentY, 12, grayColor);
    currentY = addLine(currentY, primaryColor);

    // Información del propietario
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN DEL PROPIETARIO', margin, currentY);
    currentY += 8;

    currentY = addFormField('Nombre completo:', currentY);
    currentY = addFormField('Identificación (CC/NIT):', currentY);
    currentY = addFormField('Nombre del predio/caballeriza:', currentY);
    currentY = addFormField('Ubicación (Municipio, Departamento):', currentY);
    currentY = addFormField('Teléfono de contacto:', currentY);
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
    doc.text('Producto:  [ ] BGOR Equinos    [ ] BGOR Potros', margin, currentY);
    currentY += 8;

    currentY = addFormField('Fecha de compra:', currentY);
    currentY = addFormField('Número de guía:', currentY);
    currentY = addFormField('Cantidad adquirida:', currentY);
    currentY += 5;

    // Información del equino
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN DEL EQUINO/POTRO', margin, currentY);
    currentY += 8;

    currentY = addFormField('Nombre del equino:', currentY);
    currentY = addFormField('Raza:', currentY);
    currentY = addFormField('Edad:', currentY);
    currentY = addFormField('Sexo:', currentY);

    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont(undefined, 'normal');
    doc.text('Actividad:  [ ] Trabajo  [ ] Deporte  [ ] Recreación  [ ] Reproducción', margin, currentY);
    currentY += 10;

    // === PÁGINA 2: DOSIFICACIÓN Y MEDICIONES ===
    doc.addPage();
    currentY = margin;

    currentY = addCenteredText('DOSIFICACIÓN Y SEGUIMIENTO', currentY, 14, primaryColor, true);
    currentY = addLine(currentY, primaryColor);

    // Instrucciones de dosificación
    doc.setFontSize(11);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('DOSIFICACIÓN DIARIA:', margin, currentY);
    currentY += 7;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('• BGOR Potros: 25 gramos diarios', margin + 5, currentY);
    currentY += 6;
    doc.text('• BGOR Equinos (adultos): 50 gramos diarios', margin + 5, currentY);
    currentY += 10;

    currentY = addFormField('Dosis aplicada (gramos):', currentY);
    currentY = addFormField('Forma de suministro:', currentY);
    currentY += 5;

    // Indicadores a evaluar
    doc.setFontSize(11);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('INDICADORES A EVALUAR (Marque los que aplican):', margin, currentY);
    currentY += 7;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('[ ] Condición corporal', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Pelaje y brillo', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Energía y vitalidad', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Rendimiento deportivo/trabajo', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Recuperación muscular', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Apetito', margin + 5, currentY);
    currentY += 10;

    // Mediciones día 0
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

    currentY = addFormField('Peso (kg):', currentY, 6);
    currentY = addFormField('Condición corporal (1-5):', currentY, 6);
    currentY = addFormField('Observaciones generales:', currentY, 15);
    currentY += 5;

    // Fotografías
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('FOTOGRAFÍAS REQUERIDAS:', margin, currentY);
    currentY += 7;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('[ ] Foto frontal - Día 0', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Foto lateral derecha - Día 0', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Foto lateral izquierda - Día 0', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Foto trasera - Día 0', margin + 5, currentY);
    currentY += 10;

    // === PÁGINA 3: RESULTADOS FINALES ===
    doc.addPage();
    currentY = margin;

    currentY = addCenteredText('MEDICIONES DÍA 30 (FINAL) Y RESULTADOS', currentY, 14, primaryColor, true);
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

    currentY = addFormField('Peso (kg):', currentY, 6);
    currentY = addFormField('Condición corporal (1-5):', currentY, 6);
    currentY = addFormField('Observaciones generales:', currentY, 15);
    currentY += 5;

    // Fotografías finales
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('FOTOGRAFÍAS DÍA 30:', margin, currentY);
    currentY += 7;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('[ ] Foto frontal - Día 30', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Foto lateral derecha - Día 30', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Foto lateral izquierda - Día 30', margin + 5, currentY);
    currentY += 6;
    doc.text('[ ] Foto trasera - Día 30', margin + 5, currentY);
    currentY += 12;

    // Evaluación de mejora
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('EVALUACIÓN DE MEJORA:', margin, currentY);
    currentY += 7;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    const indicadores = [
        'Condición corporal',
        'Pelaje y brillo',
        'Energía y vitalidad',
        'Rendimiento',
        'Recuperación muscular',
        'Apetito'
    ];

    indicadores.forEach(indicador => {
        doc.text(`${indicador}:  [ ] Mejoró  [ ] Sin cambio  [ ] Empeoró`, margin + 5, currentY);
        currentY += 7;
    });

    currentY += 5;

    // Conclusión
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('CONCLUSIÓN GENERAL:', margin, currentY);
    currentY += 7;

    currentY = addFormField('¿Observó alguna mejora durante los 30 días?  [ ] Sí  [ ] No', currentY, 6);
    currentY = addFormField('Comentarios adicionales:', currentY, 20);
    currentY += 5;

    // Declaración
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('DECLARACIÓN:', margin, currentY);
    currentY += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const declaracion = 'Declaro que la información contenida en este formato es verídica y que he seguido las instrucciones de dosificación indicadas por BGOR durante los 30 días del periodo de garantía.';
    const splitDeclaracion = doc.splitTextToSize(declaracion, maxWidth);
    doc.text(splitDeclaracion, margin, currentY);
    currentY += splitDeclaracion.length * 5 + 10;

    currentY = addFormField('Firma del propietario:', currentY, 15);
    currentY = addFormField('Fecha:', currentY, 6);

    // Footer en todas las páginas
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.setFont(undefined, 'normal');

        const footerText = 'BGOR - Garantía de Satisfacción 30 Días | www.bgor.com.co';
        const footerWidth = doc.getTextWidth(footerText);
        const footerX = (pageWidth - footerWidth) / 2;
        doc.text(footerText, footerX, pageHeight - 10);

        const pageText = `Página ${i} de ${totalPages}`;
        const pageTextWidth = doc.getTextWidth(pageText);
        doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 10);
    }

    // Guardar el PDF
    doc.save('BGOR_Formato_Seguimiento_Garantia_30_Dias_Equinos.pdf');

    // Mostrar mensaje de éxito
    mostrarMensajeExito();
}

// Función para mostrar mensaje de éxito
function mostrarMensajeExito() {
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

    setTimeout(() => {
        mensaje.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(mensaje);
        }, 300);
    }, 4000);
}

// Smooth scroll para enlaces internos
document.addEventListener('DOMContentLoaded', function() {
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

    document.querySelectorAll('.termino-card').forEach(card => {
        observer.observe(card);
    });
});
