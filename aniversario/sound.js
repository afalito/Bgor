/* Efectos de sonido — Web Audio API, sin archivos externos */
(function(w) {
    let ctx = null;

    function getCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    // ── Tick mecánico mientras gira ──────────────────────────────────────────
    // remainingAngle: cuánto queda por girar — afecta el tono (agudo=rápido, grave=frena)
    function playTick(remainingAngle) {
        try {
            const c = getCtx();
            const t = c.currentTime;
            const ratio = Math.min(Math.abs(remainingAngle) / (Math.PI * 8), 1); // 0..1
            const freq  = 480 + ratio * 440; // grave al frenar, agudo al inicio

            const osc  = c.createOscillator();
            const gain = c.createGain();
            osc.connect(gain);
            gain.connect(c.destination);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.025);

            gain.gain.setValueAtTime(0.11, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.042);

            osc.start(t);
            osc.stop(t + 0.05);
        } catch(e) {}
    }

    // ── Fanfarria ganadora — 4 notas ascendentes ────────────────────────────
    function playWin() {
        try {
            const c = getCtx();
            const notes = [
                { f: 523, t: 0.00, d: 0.30 },  // C5
                { f: 659, t: 0.12, d: 0.30 },  // E5
                { f: 784, t: 0.24, d: 0.30 },  // G5
                { f:1047, t: 0.36, d: 0.60 }   // C6 — nota final sostenida
            ];
            notes.forEach(function(n) {
                const s    = c.currentTime + n.t;
                const osc  = c.createOscillator();
                const gain = c.createGain();
                osc.connect(gain);
                gain.connect(c.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(n.f, s);
                gain.gain.setValueAtTime(0, s);
                gain.gain.linearRampToValueAtTime(0.20, s + 0.018);
                gain.gain.setValueAtTime(0.20, s + n.d * 0.55);
                gain.gain.exponentialRampToValueAtTime(0.001, s + n.d);
                osc.start(s);
                osc.stop(s + n.d + 0.02);
            });
        } catch(e) {}
    }

    // ── Pop suave al revelar cada tarjeta ────────────────────────────────────
    function playReveal(delay) {
        try {
            const c = getCtx();
            const t = c.currentTime + (delay || 0);
            const osc  = c.createOscillator();
            const gain = c.createGain();
            osc.connect(gain);
            gain.connect(c.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(680, t);
            osc.frequency.exponentialRampToValueAtTime(1080, t + 0.07);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.15, t + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.start(t);
            osc.stop(t + 0.26);
        } catch(e) {}
    }

    // ── Golpe dramático para los bonos del sorteo ────────────────────────────
    // Barrido rápido hacia arriba + acorde brillante = sensación de "¡bombazo!"
    function playBonus() {
        try {
            const c = getCtx();
            const t = c.currentTime;

            // Barrido ascendente (sawtooth — más agresivo)
            const sweep = c.createOscillator();
            const sg    = c.createGain();
            sweep.connect(sg); sg.connect(c.destination);
            sweep.type = 'sawtooth';
            sweep.frequency.setValueAtTime(280, t);
            sweep.frequency.exponentialRampToValueAtTime(1100, t + 0.09);
            sg.gain.setValueAtTime(0.07, t);
            sg.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
            sweep.start(t); sweep.stop(t + 0.15);

            // Acorde impactante: G5 + C6 + E6
            [[784, 0.17], [1047, 0.14], [1319, 0.11]].forEach(function(pair, i) {
                const freq = pair[0], vol = pair[1];
                const s    = t + 0.07 + i * 0.018;
                const osc  = c.createOscillator();
                const gain = c.createGain();
                osc.connect(gain); gain.connect(c.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, s);
                gain.gain.setValueAtTime(0, s);
                gain.gain.linearRampToValueAtTime(vol, s + 0.016);
                gain.gain.exponentialRampToValueAtTime(0.001, s + 0.55);
                osc.start(s); osc.stop(s + 0.58);
            });
        } catch(e) {}
    }

    // ── Motor de moto acelerando ─────────────────────────────────────────────
    // Dos osciladores ligeramente desafinados (coro) + LFO cuadrado (cilindros)
    // Frecuencias en rango 75-420Hz: audibles en bocinas de teléfono
    function playMotoRev() {
        try {
            const c = getCtx();
            const t = c.currentTime;
            const dur = 1.5;

            function makeOsc(startF, endF, detune) {
                const o = c.createOscillator();
                o.type = 'sawtooth';
                o.frequency.setValueAtTime(startF, t);
                o.frequency.exponentialRampToValueAtTime(startF * 1.6, t + 0.30);
                o.frequency.exponentialRampToValueAtTime(startF * 3.2, t + 0.75);
                o.frequency.exponentialRampToValueAtTime(startF * 5.2, t + 1.20);
                o.frequency.exponentialRampToValueAtTime(endF, t + dur);
                o.detune.value = detune;
                return o;
            }

            // Dos sawteeth ligeramente desafinados — coro de motor
            const osc1 = makeOsc(75, 420, 0);
            const osc2 = makeOsc(75, 420, +14); // +14 cents = chorusing

            // LFO cuadrado — pulsos de cilindros, va acelerando
            const lfo  = c.createOscillator();
            const lfoG = c.createGain();
            lfo.type = 'square';
            lfo.frequency.setValueAtTime(10, t);
            lfo.frequency.exponentialRampToValueAtTime(26, t + 0.6);
            lfo.frequency.exponentialRampToValueAtTime(62, t + 1.2);
            lfoG.gain.setValueAtTime(0.32, t);
            lfoG.gain.linearRampToValueAtTime(0.10, t + 1.0);
            lfoG.gain.linearRampToValueAtTime(0.03, t + dur);

            // Mix + AM modulation
            const mixG = c.createGain();
            mixG.gain.setValueAtTime(0.50, t);
            lfo.connect(lfoG); lfoG.connect(mixG.gain);
            osc1.connect(mixG); osc2.connect(mixG);

            // Envelope master
            const envG = c.createGain();
            envG.gain.setValueAtTime(0, t);
            envG.gain.linearRampToValueAtTime(0.44, t + 0.07);
            envG.gain.setValueAtTime(0.40, t + 1.1);
            envG.gain.exponentialRampToValueAtTime(0.001, t + dur);

            mixG.connect(envG); envG.connect(c.destination);
            osc1.start(t); osc1.stop(t + dur + 0.05);
            osc2.start(t); osc2.stop(t + dur + 0.05);
            lfo.start(t);  lfo.stop(t + dur + 0.05);

            // Kick de arranque — boom inicial
            const kick  = c.createOscillator();
            const kickG = c.createGain();
            kick.type = 'sine';
            kick.frequency.setValueAtTime(120, t);
            kick.frequency.exponentialRampToValueAtTime(28, t + 0.14);
            kickG.gain.setValueAtTime(0, t);
            kickG.gain.linearRampToValueAtTime(0.55, t + 0.005);
            kickG.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
            kick.connect(kickG); kickG.connect(c.destination);
            kick.start(t); kick.stop(t + 0.22);

        } catch(e) {}
    }

    // ── Muuuu de vaca ─────────────────────────────────────────────────────────
    // Fundamental 220Hz+ (audible en bocinas de teléfono), bandpass ancho (Q=2)
    function playMoo() {
        try {
            const c = getCtx();
            const t = c.currentTime;
            const dur = 1.6;

            // Oscilador principal a frecuencias audibles en móvil
            const osc = c.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(222, t);
            osc.frequency.linearRampToValueAtTime(315, t + 0.24);
            osc.frequency.linearRampToValueAtTime(275, t + 0.62);
            osc.frequency.linearRampToValueAtTime(215, t + 1.12);
            osc.frequency.linearRampToValueAtTime(168, t + dur);

            // Vibrato LFO — la ondulación característica
            const lfo  = c.createOscillator();
            const lfoG = c.createGain();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(4.5, t);
            lfo.frequency.linearRampToValueAtTime(8.0, t + 0.45);
            lfoG.gain.setValueAtTime(4, t);
            lfoG.gain.linearRampToValueAtTime(30, t + 0.55); // vibrato profundo
            lfoG.gain.setValueAtTime(25, t + 1.1);
            lfoG.gain.linearRampToValueAtTime(5, t + dur);
            lfo.connect(lfoG); lfoG.connect(osc.frequency);
            lfo.start(t); lfo.stop(t + dur + 0.05);

            // Bandpass — Q=2 ancho para dejar pasar más señal = más volumen
            const bp = c.createBiquadFilter();
            bp.type = 'bandpass';
            bp.frequency.setValueAtTime(480, t);
            bp.frequency.linearRampToValueAtTime(580, t + 0.24);
            bp.frequency.linearRampToValueAtTime(440, t + 1.0);
            bp.Q.value = 2.0;

            // Ganancia alta para compensar la atenuación del filtro
            const envG = c.createGain();
            envG.gain.setValueAtTime(0, t);
            envG.gain.linearRampToValueAtTime(0.95, t + 0.09);
            envG.gain.setValueAtTime(0.88, t + 1.0);
            envG.gain.exponentialRampToValueAtTime(0.001, t + dur);

            osc.connect(bp); bp.connect(envG); envG.connect(c.destination);
            osc.start(t); osc.stop(t + dur + 0.05);

        } catch(e) {}
    }

    w._bgorSound = { playTick, playWin, playReveal, playBonus, playMotoRev, playMoo };
})(window);
