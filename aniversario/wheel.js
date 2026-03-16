/* Ruleta visual — 3 aros concéntricos */
(function(w){

    // ── Colores con suficiente contraste entre segmentos adyacentes ──────────
    const COLORS = {
        L1: ['#FF6B03','#C84E00'],                               // naranja / naranja oscuro
        L2: ['#1A1A1A','#2C4A6E','#1A1A1A','#3A5F7D','#1A1A1A','#243F5E'], // negro / azul marino
        L3: ['#C9A000','#7A5C00','#E8C200','#9A7200','#F0CC00']  // gold claro / gold oscuro alternado
    };

    const RING = {
        outer:  { r1: 226, r2: 170 },   // thick 56px (era 40px)
        middle: { r1: 166, r2: 110 },   // thick 56px
        inner:  { r1: 106, r2: 54  }    // thick 52px
    };

    const VISUAL_REPEATS = { outer: 1, middle: 1, inner: 1 };

    const CENTER   = 240;
    const DURATION = 4500; // ms del giro principal

    let canvas, ctx, size;
    let spinning = false;
    let lastTickCount = 0; // para el sonido de tick

    let currentAngle = { outer: 0, middle: 0, inner: 0 };
    let targetAngle  = { outer: 0, middle: 0, inner: 0 };
    let startAngle   = { outer: 0, middle: 0, inner: 0 };
    let animStart    = null;

    // ── Idle rotation ────────────────────────────────────────────────────────
    let idleRaf = null;
    // Velocidades en rad/frame a 60fps — aros en sentidos opuestos
    const IDLE_SPEED = { outer: 0.0022, middle: -0.0035, inner: 0.0055 };

    function startIdle() {
        if (idleRaf) return;
        function loop() {
            currentAngle.outer  += IDLE_SPEED.outer;
            currentAngle.middle += IDLE_SPEED.middle;
            currentAngle.inner  += IDLE_SPEED.inner;
            draw(currentAngle);
            idleRaf = requestAnimationFrame(loop);
        }
        idleRaf = requestAnimationFrame(loop);
    }

    function stopIdle() {
        if (idleRaf) { cancelAnimationFrame(idleRaf); idleRaf = null; }
    }

    // ── Segmentos visuales (con repeticiones si aplica) ──────────────────────
    function getVisualSegs(level) {
        const ringKey = level === 1 ? 'outer' : level === 2 ? 'middle' : 'inner';
        const n       = VISUAL_REPEATS[ringKey];
        const base    = window._bgorEngine.getWheelSegments(level);
        if (n === 1) return base;
        const result = [];
        for (let i = 0; i < n; i++) {
            base.forEach(function(s){ result.push({ id: s.id, name: s.name, weight: s.weight }); });
        }
        return result;
    }

    // ── Init ─────────────────────────────────────────────────────────────────
    function init(canvasEl) {
        canvas = canvasEl;
        ctx    = canvas.getContext('2d');
        size   = canvas.width;
        draw(currentAngle);
        startIdle();
    }

    // ── Draw ─────────────────────────────────────────────────────────────────
    function draw(angles, highlightIds, highlightAlpha) {
        ctx.clearRect(0, 0, size, size);
        drawRing(getVisualSegs(1), angles.outer,  RING.outer,  COLORS.L1, false);
        drawRing(getVisualSegs(2), angles.middle, RING.middle, COLORS.L2, false);
        drawRing(getVisualSegs(3), angles.inner,  RING.inner,  COLORS.L3, true);
        if (highlightIds && highlightAlpha > 0) {
            drawHighlights(angles, highlightIds, highlightAlpha);
        }
        drawCenter();
    }

    function drawRing(segments, offset, ring, colors, darkText) {
        const total   = segments.reduce(function(s, x){ return s + x.weight; }, 0);
        const rm      = (ring.r1 + ring.r2) / 2;
        const thick   = ring.r1 - ring.r2;
        const MIN_ARC = 14;

        let start = offset;
        for (let i = 0; i < segments.length; i++) {
            const seg   = segments[i];
            const slice = (seg.weight / total) * 2 * Math.PI;
            const end   = start + slice;
            const mid   = start + slice / 2;

            // Relleno
            ctx.beginPath();
            ctx.moveTo(CENTER, CENTER);
            ctx.arc(CENTER, CENTER, ring.r1, start, end);
            ctx.arc(CENTER, CENTER, ring.r2, end, start, true);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.28)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Texto — solo si hay espacio suficiente
            const arcLen   = slice * rm;
            const fontSize = Math.max(11, Math.min(15, thick * 0.24));

            if (arcLen >= MIN_ARC) {
                const tx = CENTER + rm * Math.cos(mid);
                const ty = CENTER + rm * Math.sin(mid);

                ctx.save();
                ctx.translate(tx, ty);
                ctx.rotate(mid + Math.PI / 2);
                ctx.fillStyle = darkText ? '#1A1A1A' : '#FFFFFF';
                ctx.font      = `bold ${fontSize}px Inter, sans-serif`;
                ctx.textAlign    = 'center';
                ctx.textBaseline = 'middle';

                const label = shortLabel(seg.name);
                const lines = wrapText(label, thick * 0.82, ctx);
                const lineH = fontSize * 1.3;
                lines.forEach(function(line, li) {
                    ctx.fillText(line, 0, (li - (lines.length - 1) / 2) * lineH);
                });
                ctx.restore();
            }

            start = end;
        }
    }

    // ── Highlight segmentos ganadores ────────────────────────────────────────
    function drawHighlights(angles, resultIds, alpha) {
        const pairs = [
            { level: 1, ring: 'outer',  id: resultIds.L1, def: RING.outer  },
            { level: 2, ring: 'middle', id: resultIds.L2, def: RING.middle },
            { level: 3, ring: 'inner',  id: resultIds.L3, def: RING.inner  }
        ];

        pairs.forEach(function(p) {
            const segs  = getVisualSegs(p.level);
            const total = segs.reduce(function(s, x){ return s + x.weight; }, 0);
            let acc = angles[p.ring];

            for (const seg of segs) {
                const slice = (seg.weight / total) * 2 * Math.PI;
                if (seg.id === p.id) {
                    // Overlay blanco sobre el segmento ganador
                    ctx.beginPath();
                    ctx.moveTo(CENTER, CENTER);
                    ctx.arc(CENTER, CENTER, p.def.r1, acc, acc + slice);
                    ctx.arc(CENTER, CENTER, p.def.r2, acc + slice, acc, true);
                    ctx.closePath();
                    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.32})`;
                    ctx.fill();

                    // Borde brillante
                    ctx.beginPath();
                    ctx.arc(CENTER, CENTER, p.def.r1 - 2, acc, acc + slice);
                    ctx.arc(CENTER, CENTER, p.def.r2 + 2, acc + slice, acc, true);
                    ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.9})`;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    break;
                }
                acc += slice;
            }
        });
    }

    // ── Animación de highlight pulsante ──────────────────────────────────────
    function animateHighlight(resultIds, callback) {
        const t0           = performance.now();
        const PULSE_TOTAL  = 1600; // ms — 3 pulsos y luego llama callback
        const PULSE_FREQ   = 3;    // número de pulsos

        function frame(ts) {
            const elapsed = ts - t0;
            if (elapsed >= PULSE_TOTAL) {
                draw(currentAngle); // frame final limpio
                if (callback) callback();
                return;
            }
            const t     = elapsed / PULSE_TOTAL;
            const alpha = Math.abs(Math.sin(t * Math.PI * PULSE_FREQ));
            draw(currentAngle, resultIds, alpha);
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    // ── Helpers texto ────────────────────────────────────────────────────────
    function shortLabel(name) {
        const map = {
            'Kit Parches Homeopáticos': 'Parches',
            'Descuento del 10%':        '10% OFF',
            'Set Recipientes Nevera':   'Recipientes',
            'Espuma Blanqueadora Dental': 'Espuma Dental',
            'Masajeador Mariposa':      'Masajeador',
            'Bono de $20.000':          '$20.000',
            'Bono de $30.000':          '$30.000',
            'Fumigadora Manual 2L':     'Fumigadora',
            'Kzador':                   'Kzador',
            'Kilo BGOR a Elección':     'Kilo BGOR',
            'Vitalkor':                 'Vitalkor',
            'Bono de $40.000':          '$40K'
        };
        return map[name] || name;
    }

    function wrapText(text, maxW, ctx) {
        const words = text.split(' ');
        const lines = [];
        let cur = '';
        words.forEach(function(word) {
            const test = cur ? cur + ' ' + word : word;
            if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = word; }
            else { cur = test; }
        });
        if (cur) lines.push(cur);
        return lines.slice(0, 2);
    }

    // ── Centro ───────────────────────────────────────────────────────────────
    function drawCenter() {
        // Círculo blanco
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, 50, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Logo text
        ctx.fillStyle   = '#FF6B03';
        ctx.font        = 'bold 17px Inter, sans-serif';
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BGOR', CENTER, CENTER - 8);
        ctx.fillStyle = '#1A1A1A';
        ctx.font      = '700 11px Inter, sans-serif';
        ctx.fillText('ANIVERSARIO', CENTER, CENTER + 10);
    }

    // ── Easing ───────────────────────────────────────────────────────────────
    function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

    // ── Spin ─────────────────────────────────────────────────────────────────
    function spin(resultIds, onDone) {
        if (spinning) return;
        spinning = true;
        stopIdle();

        const offsets = computeTargetAngles(resultIds);

        startAngle  = { outer: currentAngle.outer, middle: currentAngle.middle, inner: currentAngle.inner };
        // Resetear baseline de ticks para que no salten al inicio
        const TICK_NOTCH = (Math.PI * 2) / 8;
        lastTickCount = Math.floor(currentAngle.middle / TICK_NOTCH);
        // offsets ya son el ángulo final normalizado [0, 2π).
        // NO sumamos startAngle aquí — el lerp parte desde startAngle automáticamente.
        targetAngle = {
            outer:  (Math.PI * 2 * (6 + Math.floor(Math.random() * 4))) + offsets.outer,
            middle: (Math.PI * 2 * (7 + Math.floor(Math.random() * 4))) + offsets.middle,
            inner:  (Math.PI * 2 * (8 + Math.floor(Math.random() * 4))) + offsets.inner
        };
        animStart = null;

        function animate(ts) {
            if (!animStart) animStart = ts;
            const elapsed = ts - animStart;
            const t = Math.min(elapsed / DURATION, 1);
            const e = easeOut(t);

            currentAngle = {
                outer:  startAngle.outer  + (targetAngle.outer  - startAngle.outer)  * e,
                middle: startAngle.middle + (targetAngle.middle - startAngle.middle) * e,
                inner:  startAngle.inner  + (targetAngle.inner  - startAngle.inner)  * e
            };
            draw(currentAngle);

            // Tick sound — 8 notches por vuelta, tono varía según velocidad restante
            if (window._bgorSound) {
                const NOTCH    = (Math.PI * 2) / 8;
                const newCount = Math.floor(currentAngle.middle / NOTCH);
                if (newCount > lastTickCount) {
                    const remaining = targetAngle.middle - currentAngle.middle;
                    const burst = Math.min(newCount - lastTickCount, 2); // máx 2 ticks por frame
                    for (let k = 0; k < burst; k++) window._bgorSound.playTick(remaining);
                    lastTickCount = newCount;
                }
            }

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // Normalizar ángulos
                currentAngle = {
                    outer:  targetAngle.outer  % (Math.PI * 2),
                    middle: targetAngle.middle % (Math.PI * 2),
                    inner:  targetAngle.inner  % (Math.PI * 2)
                };
                spinning = false;
                // Pulsar los 3 segmentos ganadores antes de mostrar premios
                animateHighlight(resultIds, onDone);
            }
        }
        requestAnimationFrame(animate);
    }

    // ── Ángulos destino ──────────────────────────────────────────────────────
    // Devuelve el ángulo de dibujo final (normalizado a [0, 2π)) para que
    // el centro del segmento ganador quede exactamente en la flecha (−π/2 = arriba).
    function computeTargetAngles(resultIds) {
        const pairs = [
            { level: 1, ring: 'outer',  id: resultIds.L1 },
            { level: 2, ring: 'middle', id: resultIds.L2 },
            { level: 3, ring: 'inner',  id: resultIds.L3 }
        ];
        const TWO_PI = Math.PI * 2;
        const result = {};
        pairs.forEach(function(p) {
            const segs  = getVisualSegs(p.level);
            const total = segs.reduce(function(s, x){ return s + x.weight; }, 0);
            let acc = 0;
            for (const seg of segs) {
                const slice = (seg.weight / total) * TWO_PI;
                if (seg.id === p.id) {
                    // Ángulo de offset para que el centro del segmento quede en la flecha
                    let desired = ((-Math.PI / 2) - (acc + slice / 2)) % TWO_PI;
                    if (desired < 0) desired += TWO_PI;
                    result[p.ring] = desired;
                    break;
                }
                acc += slice;
            }
        });
        return result;
    }

    w._bgorWheel = { init, spin, draw };
})(window);
