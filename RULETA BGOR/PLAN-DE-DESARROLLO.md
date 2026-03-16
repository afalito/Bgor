# PLAN DE DESARROLLO — Ruleta BGOR Aniversario 2 Años
**URL destino:** `bgor.com.co/aniversario`
**Fecha inicio:** 2026-03-15
**Stack:** HTML/CSS/JS · Netlify · GitHub

---

## REFERENCIA RÁPIDA: Escalafones de premios

| Nivel | Compra mínima | Premios | Frecuencia |
|-------|--------------|---------|-----------|
| **1** | $149.900 | Parches homeopáticos | 95% |
|       |              | Descuento 10% | 5% |
| **2** | $249.900 | Set recipientes nevera | 17% |
|       |              | Espuma blanqueadora dental | 25% |
|       |              | Masajeador mariposa | 13% |
|       |              | Bono $20.000 | 10% |
|       |              | Bono $30.000 | 15% |
|       |              | Fumigadora 2L | 20% |
| **3** | $374.000 | Kzador | 24% |
|       |              | Fumigadora 2L | 24% |
|       |              | Kilo BGOR a elección | 23% |
|       |              | Vitalkor | 24% |
|       |              | Bono $40.000 | 5% |
|       |              | ★ Bono Moto DR SUZUKI 150 0km | TODOS |
|       |              | ★ Bono Sorteo Ternero | TODOS |

> ★ = Todos los del Nivel 3 reciben estos dos bonos SIEMPRE, además del premio de la ruleta.

---

## FASES DE DESARROLLO

---

### FASE 1 — Decisiones de diseño y arquitectura ✅ COMPLETADA
**Objetivo:** Antes de escribir código, definir exactamente cómo se ve y funciona la página.

- [x] Diseño de ruleta: **3 aros concéntricos en una sola rueda**
- [x] Persistencia: **localStorage** (suficiente para el perfil de usuario)
- [x] Mecánica de la página: la ruleta siempre asigna un premio para los 3 niveles simultáneamente. El usuario ve sus 3 posibles premios con el monto mínimo requerido para cada uno, y envía captura al asesor de WhatsApp. El asesor valida.
- [x] Nivel 3: además del premio de ruleta, **siempre** recibe Bono Moto DR Suzuki + Bono Sorteo Ternero como obsequio extra destacado visualmente.
- [x] Estrategia de upsell: la pantalla de resultados muestra los 3 premios con claridad para motivar a comprar más.
- [ ] Confirmar número de WhatsApp del asesor *(pendiente)*
- [ ] Confirmar fecha de vigencia de la promoción *(pendiente)*
- [ ] Confirmar que todas las imágenes de premios están listas *(pendiente)*

**Entregable:** Este documento actualizado con decisiones tomadas.

---

### FASE 2 — Estructura base de la página ✅ COMPLETADA
**Objetivo:** Crear el archivo `aniversario/index.html` con la estructura HTML y estilos base.

- [x] Crear carpeta `aniversario/` en el repositorio
- [x] `index.html` — estructura semántica completa
- [x] `style.css` — variables de marca, tipografía, layout responsive
- [x] Header con logo BGOR + "2 Años" pill con icono SVG
- [x] Hero con copywriting "Gira y descubre tus premios de aniversario"
- [x] Sección "Cómo funciona" con 3 pasos e iconos SVG
- [x] Leyenda de aros explicando cada nivel y precio mínimo
- [x] Canvas 360×360 con pointer CSS triangular
- [x] Sección de resultados con grid 3 columnas + bonos-band + CTA compacto
- [x] Footer con T&C simplificado
- [x] 10 imágenes de premios copiadas a `aniversario/images/`
- [x] SVGs inline para: Bono genérico, Descuento 10%, Vitalkor

**Entregable:** ✅ Página visible en navegador con estructura completa.

---

### FASE 3 — Ruleta visual y animaciones ✅ COMPLETADA
**Objetivo:** Construir el componente visual de la ruleta con Canvas, completamente animado.

- [x] 3 aros concéntricos en Canvas HTML5 (outer=L1, middle=L2, inner=L3)
- [x] Colores diferenciados: L1 naranja, L2 negro/azul marino alternado, L3 gold claro/oscuro
- [x] Texto legible: L3 usa texto oscuro sobre gold (darkText=true)
- [x] MIN_ARC=14px — oculta etiquetas en segmentos muy pequeños
- [x] shortLabel map — etiquetas cortas ("$40K", "Parches", etc.)
- [x] Rotación idle: 3 aros giran en direcciones opuestas mientras espera
- [x] Botón "¡GIRAR!" con animación pulse, se bloquea al hacer clic
- [x] Animación de giro con easeOut(t) = 1 - (1-t)^4, duración 4.5s
- [x] Highlight pulsante post-giro: 3 pulsos en 1.6s sobre segmentos ganadores
- [x] Pointer CSS triangular naranja apuntando al segmento ganador (arriba)
- [x] computeTargetAngles() alinea el segmento ganador al top (−π/2)

**Entregable:** ✅ Ruleta animada completa.

---

### FASE 4 — Lógica de premios (motor oculto) ✅ COMPLETADA
**Objetivo:** Implementar el algoritmo de frecuencias de forma que no sea visible en el código de la página.

- [x] engine.js: IIFE con objeto privado `_d` que contiene pesos (w) por nivel
- [x] `_pick(list)` — weighted random selection usando Math.random()
- [x] `roll()` — determina premio para L1, L2 y L3 simultáneamente
- [x] `getWheelSegments(level)` — expone solo { id, name, weight } (sin pesos crudos en UI)
- [x] `getItem(level, id)` — busca item por ID para renderizar resultado
- [x] computeTargetAngles() en wheel.js conecta ID ganador con posición angular en canvas
- [x] Frecuencias correctas: L1 95%/5%, L2 17/25/13/10/15/20, L3 24/24/23/24/5

**Entregable:** ✅ Motor oculto conectado con la animación visual.

---

### FASE 5 — Persistencia y pantalla de resultados ✅ COMPLETADA
**Objetivo:** Guardar el resultado y mostrarlo correctamente en visitas posteriores.

- [x] Al primer giro: localStorage.setItem('bgor_aniversario_v1', { result, ts })
- [x] Al cargar: si hay resultado guardado → oculta sección de juego, muestra resultados con banner "Ya participaste"
- [x] Grid siempre 3 columnas — diseñado para screenshot en una pantalla
- [x] Tarjeta L1: imagen/SVG + nombre — estilo naranja
- [x] Tarjeta L2: imagen/SVG + nombre — estilo oscuro
- [x] Tarjeta L3: corona + badge "Máximo" + imagen/SVG + nombre — estilo gold
- [x] bonos-band: banda horizontal full-width con moto DR Suzuki + Ternero Simmental (siempre visible en L3)
- [x] CTA compacto: "Captura esta pantalla y envíasela a tu asesor de WhatsApp"
- [x] revealCards(): animación de aparición escalonada por tarjeta
- [x] launchConfetti(): 110 partículas animadas en naranja/gold/blanco
- [x] Flujo completo: primera visita → giro → highlight → resultado → confetti → refrescar → banner + premios guardados

**Entregable:** ✅ Flujo completo funcional de punta a punta.

---

### FASE 6 — Pulido final, disclaimer y despliegue *(SIGUIENTE)*
**Objetivo:** Detalles finales, revisión completa y subida a producción.

- [ ] Revisar diseño en todos los breakpoints (móvil, tablet, desktop)
- [ ] Audit visual: aros, colores, legibilidad de texto en cada segmento
- [ ] Optimizar imágenes para carga rápida (WebP si es posible)
- [ ] Commit y push a GitHub
- [ ] Confirmar que Netlify despliega en `/aniversario`
- [ ] Prueba final en el link real

**Entregable:** Página en producción en `bgor.com.co/aniversario`.

---

### FASE 7 — Auditoría final
**Objetivo:** Verificar que todo funciona exactamente como se especificó.

- [ ] Frecuencias de premios verificadas con simulación
- [ ] Control de una sola jugada por dispositivo funciona
- [ ] La lógica de frecuencias no es visible en el HTML/JS del navegador
- [ ] Pantalla de resultados muestra correctamente según nivel
- [ ] Imágenes de todos los premios presentes
- [ ] Disclaimer visible
- [ ] Página responsive en móvil
- [ ] Enlace compartible funciona correctamente

---

## PENDIENTES MENORES

~~Todos resueltos.~~

- Imágenes: todas disponibles en la carpeta. Ilustraciones SVG para bonos en dinero y descuento las crea Claude.
- WhatsApp: no se incluye número específico. El mensaje dice "Envía captura a tu asesor de WhatsApp".
- Vigencia: hasta el **15 de abril de 2026**.

---

## DECISIONES TOMADAS

| Decisión | Opción elegida | Fecha |
|----------|---------------|-------|
| Diseño de ruleta | 3 aros concéntricos en una sola rueda | 2026-03-15 |
| Persistencia / control de una jugada | localStorage | 2026-03-15 |
| Mecánica de la página | Muestra premios para los 3 niveles, usuario envía captura al asesor | 2026-03-15 |
| Nivel 3 bonus | Bono Moto + Bono Ternero siempre incluidos, destacados visualmente | 2026-03-15 |
| Upsell | Pantalla de resultados muestra diferencia de precio para motivar compra mayor | 2026-03-15 |

---
*Documento vivo — actualizar a medida que avanza el desarrollo.*
