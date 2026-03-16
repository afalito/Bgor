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

    // ── Fanfarria bono moto — C5→E5→G5→C6 ascendente ────────────────────────
    function playMotoRev() {
        try {
            var c = getCtx();
            var t = c.currentTime;
            [[523,0.00,0.34],[659,0.14,0.34],[784,0.28,0.34],[1047,0.44,0.60]].forEach(function(n) {
                var freq = n[0], off = n[1], dur = n[2];
                var s   = t + off;
                var osc = c.createOscillator();
                var g   = c.createGain();
                osc.connect(g); g.connect(c.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, s);
                g.gain.setValueAtTime(0, s);
                g.gain.linearRampToValueAtTime(0.22, s + 0.018);
                g.gain.setValueAtTime(0.20, s + dur * 0.5);
                g.gain.exponentialRampToValueAtTime(0.001, s + dur);
                osc.start(s); osc.stop(s + dur + 0.02);
            });
        } catch(e) {}
    }

    // ── Fanfarria bono ternero — campanita G5→C6→E6 ───────────────────────────
    function playMoo() {
        try {
            var c = getCtx();
            var t = c.currentTime;
            [[784,0.00,0.30],[1047,0.16,0.40],[1319,0.32,0.55]].forEach(function(n) {
                var freq = n[0], off = n[1], dur = n[2];
                var s   = t + off;
                var osc = c.createOscillator();
                var g   = c.createGain();
                osc.connect(g); g.connect(c.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, s);
                osc.frequency.exponentialRampToValueAtTime(freq * 0.96, s + dur);
                g.gain.setValueAtTime(0, s);
                g.gain.linearRampToValueAtTime(0.24, s + 0.008);
                g.gain.exponentialRampToValueAtTime(0.001, s + dur);
                osc.start(s); osc.stop(s + dur + 0.02);
            });
        } catch(e) {}
    }

    w._bgorSound = { playTick, playWin, playReveal, playBonus, playMotoRev, playMoo };
})(window);
