# Autorización de Apertura de Paquete - BGOR

Esta página permite generar autorizaciones oficiales de FLUXON SAS para que los clientes puedan abrir sus paquetes contraentrega antes de pagar.

## Características

- ✅ Formulario intuitivo y fácil de usar
- ✅ Generación automática de PDF corporativo
- ✅ Diseño responsive (mobile-first)
- ✅ Texto personalizado según transportadora (Servientrega / Interrapidisimo)
- ✅ Firma digital de Carlos Arguello (Gerente General)
- ✅ Logo y sello de FLUXON SAS
- ✅ Validación de datos en tiempo real

## Acceso

La página está disponible en: `bgor.com.co/autorizacionapertura`

## Configuración del Sello

Para que el sello de FLUXON SAS aparezca en el PDF, debes colocar la imagen del sello en:

```
autorizacionapertura/assets/sello-fluxon.png
```

La imagen debe ser:
- Formato: PNG con fondo transparente
- Tamaño recomendado: 500x500 px
- Nombre del archivo: `sello-fluxon.png`

Si no se encuentra el sello, el sistema usará el logo de BGOR como respaldo.

## Estructura de Archivos

```
autorizacionapertura/
├── index.html          # Página principal
├── styles.css          # Estilos personalizados
├── script.js           # Lógica y generación de PDF
├── assets/             # Recursos (sello)
│   └── sello-fluxon.png
└── README.md           # Este archivo
```

## Tecnologías Utilizadas

- HTML5 + CSS3
- JavaScript (ES6+)
- jsPDF 2.5.1 (generación de PDFs)
- jsPDF-AutoTable 3.5.31 (tablas en PDF)
- Font Awesome 6.0 (iconos)
- Google Fonts (Roboto, Dancing Script)

## Mantenimiento

Para actualizar el contenido del PDF, edita el archivo `script.js` en las funciones:
- `getTextoTransportadora()` - Texto específico por transportadora
- `generarPDF()` - Estructura del documento PDF

---

Desarrollado para BGOR - Fluxon SAS
