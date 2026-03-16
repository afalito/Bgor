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

    // ── Motor de moto acelerando — con fanfarria ganadora al inicio ──────────
    function playMotoRev() {
        try {
            const c = getCtx();
            const t = c.currentTime;

            // ── Fanfarria C5→E5→G5 (triangle, brillante) — ¡ganaste una moto! ──
            [[523, 0.00], [659, 0.14], [784, 0.28]].forEach(function(pair) {
                const freq = pair[0], off = pair[1];
                const s   = t + off;
                const osc = c.createOscillator();
                const g   = c.createGain();
                osc.connect(g); g.connect(c.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, s);
                g.gain.setValueAtTime(0, s);
                g.gain.linearRampToValueAtTime(0.22, s + 0.018);
                g.gain.setValueAtTime(0.20, s + 0.12);
                g.gain.exponentialRampToValueAtTime(0.001, s + 0.30);
                osc.start(s); osc.stop(s + 0.34);
            });

            // ── Motor arrancando — empieza a los 0.52s ──
            const e   = t + 0.52;
            const dur = 1.5;

            function makeOsc(startF, endF, detune) {
                const o = c.createOscillator();
                o.type = 'sawtooth';
                o.frequency.setValueAtTime(startF, e);
                o.frequency.exponentialRampToValueAtTime(startF * 1.6, e + 0.30);
                o.frequency.exponentialRampToValueAtTime(startF * 3.2, e + 0.75);
                o.frequency.exponentialRampToValueAtTime(startF * 5.2, e + 1.20);
                o.frequency.exponentialRampToValueAtTime(endF, e + dur);
                o.detune.value = detune;
                return o;
            }

            const osc1 = makeOsc(75, 420, 0);
            const osc2 = makeOsc(75, 420, +14);

            const lfo  = c.createOscillator();
            const lfoG = c.createGain();
            lfo.type = 'square';
            lfo.frequency.setValueAtTime(10, e);
            lfo.frequency.exponentialRampToValueAtTime(26, e + 0.6);
            lfo.frequency.exponentialRampToValueAtTime(62, e + 1.2);
            lfoG.gain.setValueAtTime(0.32, e);
            lfoG.gain.linearRampToValueAtTime(0.10, e + 1.0);
            lfoG.gain.linearRampToValueAtTime(0.03, e + dur);

            const mixG = c.createGain();
            mixG.gain.setValueAtTime(0.50, e);
            lfo.connect(lfoG); lfoG.connect(mixG.gain);
            osc1.connect(mixG); osc2.connect(mixG);

            const envG = c.createGain();
            envG.gain.setValueAtTime(0, e);
            envG.gain.linearRampToValueAtTime(0.44, e + 0.07);
            envG.gain.setValueAtTime(0.40, e + 1.1);
            envG.gain.exponentialRampToValueAtTime(0.001, e + dur);

            mixG.connect(envG); envG.connect(c.destination);
            osc1.start(e); osc1.stop(e + dur + 0.05);
            osc2.start(e); osc2.stop(e + dur + 0.05);
            lfo.start(e);  lfo.stop(e + dur + 0.05);

            // Kick de arranque
            const kick  = c.createOscillator();
            const kickG = c.createGain();
            kick.type = 'sine';
            kick.frequency.setValueAtTime(120, e);
            kick.frequency.exponentialRampToValueAtTime(28, e + 0.14);
            kickG.gain.setValueAtTime(0, e);
            kickG.gain.linearRampToValueAtTime(0.55, e + 0.005);
            kickG.gain.exponentialRampToValueAtTime(0.001, e + 0.17);
            kick.connect(kickG); kickG.connect(c.destination);
            kick.start(e); kick.stop(e + 0.22);

        } catch(e) {}
    }

    // ── Muuuu de vaca — con campanita ganadora al inicio ─────────────────────
    function playMoo() {
        try {
            const c = getCtx();
            const t = c.currentTime;

            // ── Campanita C6 + armónico E6 — ¡ganaste un ternero! ──
            [[1047, 0.28], [1319, 0.10]].forEach(function(pair) {
                const freq = pair[0], vol = pair[1];
                const osc = c.createOscillator();
                const g   = c.createGain();
                osc.connect(g); g.connect(c.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t);
                osc.frequency.exponentialRampToValueAtTime(freq * 0.94, t + 0.50);
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(vol, t + 0.008);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.52);
                osc.start(t); osc.stop(t + 0.56);
            });

            // ── Muuuu — empieza a los 0.40s ──
            const m   = t + 0.40;
            const dur = 1.6;

            const osc = c.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(222, m);
            osc.frequency.linearRampToValueAtTime(315, m + 0.24);
            osc.frequency.linearRampToValueAtTime(275, m + 0.62);
            osc.frequency.linearRampToValueAtTime(215, m + 1.12);
            osc.frequency.linearRampToValueAtTime(168, m + dur);

            const lfo  = c.createOscillator();
            const lfoG = c.createGain();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(4.5, m);
            lfo.frequency.linearRampToValueAtTime(8.0, m + 0.45);
            lfoG.gain.setValueAtTime(4, m);
            lfoG.gain.linearRampToValueAtTime(30, m + 0.55);
            lfoG.gain.setValueAtTime(25, m + 1.1);
            lfoG.gain.linearRampToValueAtTime(5, m + dur);
            lfo.connect(lfoG); lfoG.connect(osc.frequency);
            lfo.start(m); lfo.stop(m + dur + 0.05);

            const bp = c.createBiquadFilter();
            bp.type = 'bandpass';
            bp.frequency.setValueAtTime(480, m);
            bp.frequency.linearRampToValueAtTime(580, m + 0.24);
            bp.frequency.linearRampToValueAtTime(440, m + 1.0);
            bp.Q.value = 2.0;

            const envG = c.createGain();
            envG.gain.setValueAtTime(0, m);
            envG.gain.linearRampToValueAtTime(0.95, m + 0.09);
            envG.gain.setValueAtTime(0.88, m + 1.0);
            envG.gain.exponentialRampToValueAtTime(0.001, m + dur);

            osc.connect(bp); bp.connect(envG); envG.connect(c.destination);
            osc.start(m); osc.stop(m + dur + 0.05);

        } catch(e) {}
    }

    w._bgorSound = { playTick, playWin, playReveal, playBonus, playMotoRev, playMoo };
})(window);
