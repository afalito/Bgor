# Integración de Wompi - Sistema de Pagos BGOR

## Resumen
Este documento explica la integración completa del sistema de pagos con Wompi para BGOR.com.co, incluyendo configuración, seguridad y funcionamiento.

---

## Arquitectura del Sistema

### Componentes principales:

1. **Frontend (Cliente)** - `/pagos/`
   - Página HTML con formulario de pago
   - JavaScript que interactúa con widget de Wompi
   - CSS con diseño profesional y sobrio

2. **Backend (Serverless)** - `/netlify/functions/`
   - Función serverless para generar firmas de integridad
   - Protege el secret de Wompi del lado del cliente

3. **Widget de Wompi**
   - Iframe seguro que procesa el pago
   - Manejado por Wompi (PCI DSS Nivel 1)

---

## Flujo de Pago Completo

```
1. Usuario llena formulario
   ↓
2. Frontend valida datos
   ↓
3. Frontend llama a Netlify Function
   ↓
4. Function genera firma SHA256 con integrity secret
   ↓
5. Frontend recibe firma segura
   ↓
6. Frontend abre widget de Wompi con firma
   ↓
7. Usuario completa pago en widget
   ↓
8. Wompi procesa transacción
   ↓
9. Widget retorna resultado al callback
   ↓
10. Frontend muestra mensaje apropiado
```

---

## Archivos del Sistema

### 1. `/pagos/index.html`
Página principal con formulario que captura:
- Nombre y apellido
- Correo electrónico
- Número de celular (10 dígitos)
- Valor a pagar (mínimo $1.000 COP)
- Aceptación de tratamiento de datos

**Características de confianza:**
- Información del beneficiario: FLUXON SAS (NIT 901.762.720-2)
- Mención de certificación PCI DSS nivel 1
- Alianza con Bancolombia
- Aviso de seguridad sobre pagos solo a persona jurídica

### 2. `/pagos/assets/css/styles.css`
Diseño profesional con paleta sobria:
- Colores principales: Grises (#2d3748, #4a5568, #718096)
- Color de acento: Naranja BGOR (#FF6B00) solo en botón principal
- Validación visual en inputs (verde=válido, rojo=inválido)
- Responsive design

### 3. `/pagos/assets/js/script.js`
Lógica del frontend:

**Funciones principales:**
- `generateReference()`: Genera referencia única para cada transacción
- `getSignature()`: Llama a Netlify Function para obtener firma
- `procesarPago()`: Orquesta todo el flujo de pago

**Validaciones:**
- Monto mínimo $1.000 COP
- Email válido
- Teléfono de 10 dígitos
- Campos requeridos completos
- Checkbox de tratamiento de datos

**Manejo de estados:**
- Loading overlay mientras procesa
- Mensaje si usuario cancela (cierra widget)
- Alert si hay error en la transacción

### 4. `/netlify/functions/generate-signature.js`
Función serverless que:
- Recibe: `reference` y `amountInCents`
- Genera SHA256: `reference + amountInCents + COP + integritySecret`
- Retorna: firma hexadecimal
- Valida: datos requeridos y tipos correctos
- Seguridad: CORS configurado, solo POST permitido

**Importante:** Esta función es crítica para la seguridad porque:
- Mantiene el integrity secret en el servidor
- Nunca expone el secret al cliente
- Valida todos los inputs antes de procesar

---

## Credenciales de Wompi (Producción)

### Clave Pública (Frontend)
```javascript
pub_prod_nEQz86DNHu6WNWkdW4FNNjJhox1YPcee
```
- Ubicación: `/pagos/assets/js/script.js`
- Uso: Inicializar widget de Wompi
- Seguridad: Puede estar en código público

### Clave Privada (No usada actualmente)
```
prv_prod_as43hciaCskfc1VBQ859IXUQcNDaWoMQ
```
- Uso: API de Wompi (consultas, reembolsos, etc.)
- No implementado en el sistema actual
- Guardar en variables de entorno si se usa en futuro

### Integrity Secret (Servidor)
```
prod_integrity_Graq3Qm7DEQxc3w1nM2JHiERyqZv9OE9
```
- **CRÍTICO:** Debe estar SOLO en variables de entorno de Netlify
- Uso: Generar firmas de integridad
- Nunca debe estar en código fuente

### Events Secret (No usado actualmente)
```
prod_events_ngFzWZ9qUaG72CtGbbO9UQUduDDknYs4
```
- Uso: Validar webhooks de Wompi
- No implementado en el sistema actual
- Guardar si se implementan notificaciones automáticas

---

## Variables de Entorno

### Configuración en Netlify

**Paso a paso:**

1. Ve a tu dashboard de Netlify: https://app.netlify.com
2. Selecciona el sitio **bgor.com.co**
3. Ve a: **Site settings → Environment variables**
4. Haz clic en **"Add a variable"**
5. Configura:

```
Key: WOMPI_INTEGRITY_SECRET
Value: prod_integrity_Graq3Qm7DEQxc3w1nM2JHiERyqZv9OE9
Scopes: Builds, Functions, Deploy Previews (todos)
Options: ✅ Contains secret values (IMPORTANTE: marcar esta opción)
```

6. Guarda y espera el redeploy automático

**¿Por qué marcar "Contains secret values"?**
- Enmascara el valor en la UI de Netlify
- Previene acceso vía API o CLI
- Solo el código en ejecución puede leerlo
- Mayor seguridad contra accesos no autorizados

### Configuración en GitHub (Opcional)

Si necesitas ejecutar GitHub Actions que interactúen con Wompi:

1. Ve a: **Repository → Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Configura:
   - Name: `WOMPI_INTEGRITY_SECRET`
   - Secret: `prod_integrity_Graq3Qm7DEQxc3w1nM2JHiERyqZv9OE9`

**Nota:** Actualmente no es necesario porque Netlify maneja todo el deployment.

---

## Seguridad Implementada

### 1. Integrity Signature
- SHA256 hash generado en servidor
- Incluye: referencia + monto + moneda + secret
- Wompi valida que la transacción no fue manipulada

### 2. Serverless Architecture
- Secret nunca llega al cliente
- Función aislada con acceso controlado
- CORS configurado apropiadamente

### 3. Validaciones
**Frontend:**
- Validación HTML5 nativa
- Validación JavaScript adicional
- Monto mínimo para prevenir abuso

**Backend:**
- Validación de tipos de datos
- Verificación de campos requeridos
- Logging para debugging

### 4. Headers de Seguridad (netlify.toml)
```toml
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: [configurado para Wompi]
```

### 5. Prevención de Secrets Expuestos
- `.gitignore` configurado para excluir `.env`
- `.env.example` solo tiene placeholders
- Netlify escanea y bloquea deploys con secrets expuestos

---

## Lecciones Aprendidas

### ❌ Error Común: Secret en .env.example
**Problema:** Poner el valor real del secret en `.env.example` causa que Netlify detecte "exposed secrets" y bloquee el deploy.

**Solución:** Usar solo placeholders en archivos versionados:
```
WOMPI_INTEGRITY_SECRET=your_wompi_integrity_secret_here
```

### ✅ Mejores Prácticas

1. **Nunca generar emails temporales raros**
   - Antes: `cliente3001234567@bgor.com.co`
   - Ahora: Usuario ingresa su email real

2. **Diseño sobrio genera más confianza**
   - Evitar saturación de colores
   - Usar grises profesionales
   - Naranja solo como acento

3. **Simplificar formulario aumenta conversión**
   - Solo campos esenciales: nombre, email, teléfono, valor
   - Sin selección de productos (se maneja por otro canal)
   - Sin dirección de envío (se maneja después)

4. **Manejar todos los estados del widget**
   - Usuario completa pago → Redireccionar según resultado
   - Usuario cierra widget → Mostrar mensaje de cancelación
   - Error de red → Mostrar mensaje de error

5. **Información de confianza clara**
   - NIT visible (901.762.720-2)
   - Certificaciones mencionadas (PCI DSS, Bancolombia)
   - Advertencia sobre pagos solo a persona jurídica

---

## Testing del Sistema

### 1. Verificar Integrity Secret en Netlify
```bash
# Debe devolver error si no está configurado:
curl https://bgor.com.co/.netlify/functions/generate-signature \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"reference":"TEST-123","amountInCents":100000}'
```

### 2. Test de Firma Local (Desarrollo)
```javascript
const crypto = require('crypto');

const reference = 'TEST-123';
const amountInCents = 100000;
const currency = 'COP';
const secret = 'prod_integrity_Graq3Qm7DEQxc3w1nM2JHiERyqZv9OE9';

const dataToSign = `${reference}${amountInCents}${currency}${secret}`;
const signature = crypto.createHash('sha256').update(dataToSign).digest('hex');

console.log('Signature:', signature);
```

### 3. Test de Pago en Producción
1. Ir a: https://bgor.com.co/pagos/
2. Llenar formulario con datos reales
3. Usar monto bajo (ej: $1.000)
4. Probar con tarjeta de prueba de Wompi
5. Verificar que aparece widget correctamente
6. Probar flujos:
   - Pago exitoso
   - Pago rechazado
   - Cancelar pago (cerrar widget)

---

## Monitoreo y Debugging

### Logs en Browser (Desarrollo)
```javascript
// En pagos/assets/js/script.js
console.log('Transacción:', transaction);
console.log('Pago cancelado por el usuario');
```

### Logs en Netlify Functions
1. Ve a: **Netlify Dashboard → Functions → generate-signature**
2. Click en cualquier invocación para ver logs
3. Verifica:
   - Parámetros recibidos
   - Firma generada
   - Errores si los hay

### Verificar Deploy
```bash
# Ver último commit en GitHub
git log --oneline -1

# Ver último commit deployado en Netlify
git ls-remote origin main
```

---

## Mantenimiento

### Actualizar Credentials
Si Wompi cambia tus credenciales:

1. **Public Key:**
   - Editar: `/pagos/assets/js/script.js`
   - Buscar: `WOMPI_PUBLIC_KEY`
   - Commit y push

2. **Integrity Secret:**
   - Ir a Netlify → Environment variables
   - Editar: `WOMPI_INTEGRITY_SECRET`
   - Guardar (redeploy automático)

3. **Nunca** hacer commit de secrets en el código

### Actualizar Precios
Actualmente el sistema pide al usuario el monto a pagar. Si quieres agregar selección de productos:

1. Agregar `<select>` en HTML con productos y precios
2. Actualizar JavaScript para calcular total automáticamente
3. Eliminar o hacer readonly el input de monto

---

## Troubleshooting

### Deploy Fallando: "Exposed Secrets Detected"
**Causa:** Secret real encontrado en archivos del repositorio.

**Solución:**
1. Buscar el secret: `grep -r "prod_integrity_" .`
2. Reemplazar con placeholder
3. Commit y push
4. Verificar que `.gitignore` incluya `.env`

### Widget de Wompi No Abre
**Causas posibles:**
1. Public key incorrecta → Verificar en `script.js`
2. Firma inválida → Verificar Netlify Function
3. CORS bloqueando → Verificar headers en `netlify.toml`
4. Secret no configurado → Verificar variables de entorno

**Debug:**
1. Abrir Developer Console
2. Buscar errores en red o JavaScript
3. Verificar que la función retorne signature válida

### Pago Se Queda Cargando
**Causa:** Usuario cierra widget sin completar pago.

**Solución:** Ya implementado en `script.js`:
```javascript
else {
    console.log('Pago cancelado por el usuario');
    alert('Pago cancelado. Si tienes alguna duda, contáctanos por WhatsApp.');
}
```

### Transacciones No Aparecen en Wompi
**Verificar:**
1. Credenciales son de producción (no sandbox)
2. Public key coincide con la cuenta correcta
3. Usuario completó el pago en el widget

---

## Roadmap Futuro

### Mejoras Potenciales:

1. **Página de Confirmación**
   - Crear `/pagos/confirmacion.html`
   - Mostrar estado de transacción
   - Incluir instrucciones de seguimiento

2. **Webhooks de Wompi**
   - Recibir notificaciones automáticas de pagos
   - Actualizar base de datos/CRM
   - Enviar emails de confirmación

3. **Integración con CRM**
   - Guardar transacciones en base de datos
   - Asociar pagos con pedidos
   - Tracking de envíos

4. **Reportes y Analytics**
   - Dashboard de ventas
   - Métodos de pago más usados
   - Tasas de conversión

5. **Link de Pago Directo**
   - Generar URLs con monto prefillado
   - Compartir por WhatsApp
   - Ejemplo: `bgor.com.co/pagos/?monto=89900&producto=mono-1kg`

---

## Contactos y Recursos

### Documentación Oficial de Wompi
- Docs: https://docs.wompi.co/
- Widget: https://docs.wompi.co/docs/en/checkout-widget
- API: https://docs.wompi.co/docs/en/api

### Soporte Wompi
- Email: soporte@wompi.co
- Dashboard: https://comercios.wompi.co/

### Información del Beneficiario
- **Razón Social:** FLUXON SAS
- **NIT:** 901.762.720-2
- **País:** Colombia
- **Producto:** BGOR Suplementos Nutricionales

---

## Resumen de Comandos Útiles

```bash
# Ver estado de git
git status

# Hacer commit
git add . && git commit -m "mensaje"

# Push a GitHub (trigger deploy en Netlify)
git push origin main

# Buscar secrets expuestos
grep -r "prod_integrity_" . --exclude-dir=.git

# Ver logs de Netlify Function (desde CLI)
netlify functions:log generate-signature

# Test local de Netlify Functions
netlify dev
```

---

## Checklist de Deploy

Antes de hacer deploy del sistema de pagos:

- [ ] Variable `WOMPI_INTEGRITY_SECRET` configurada en Netlify
- [ ] Checkbox "Contains secret values" marcado
- [ ] `.gitignore` incluye `.env` y `.env.local`
- [ ] `.env.example` solo tiene placeholders
- [ ] Public key correcta en `script.js`
- [ ] Netlify Functions configuradas en `netlify.toml`
- [ ] Headers de seguridad configurados
- [ ] Formulario valida todos los campos
- [ ] Manejo de cancelación implementado
- [ ] Pruebas realizadas en producción
- [ ] Información del beneficiario correcta (NIT visible)

---

**Última actualización:** 2026-02-09
**Autor:** Sistema implementado para BGOR.com.co
**Versión:** 1.0
