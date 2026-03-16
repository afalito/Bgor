/* Controlador principal */
(function(){
    const STORAGE_KEY = 'bgor_aniversario_v1';

    /* SVGs para premios sin imagen */
    function bonoSVG(amount) {
        return `<svg viewBox="0 0 160 116" xmlns="http://www.w3.org/2000/svg" width="160" height="116">
            <!-- Fondo principal -->
            <rect x="5" y="5" width="150" height="106" rx="14" fill="#141414" stroke="#FF6B03" stroke-width="2.5"/>
            <!-- Banda central oscura -->
            <rect x="5" y="40" width="150" height="44" fill="#0A0A0A"/>
            <!-- Líneas separadoras sutiles -->
            <line x1="5" y1="40" x2="155" y2="40" stroke="rgba(255,107,3,0.3)" stroke-width="1"/>
            <line x1="5" y1="84" x2="155" y2="84" stroke="rgba(255,107,3,0.3)" stroke-width="1"/>
            <!-- Puntos decorativos izquierda -->
            <circle cx="22" cy="22" r="4.5" fill="rgba(255,107,3,0.35)"/>
            <circle cx="35" cy="22" r="3.5" fill="rgba(255,107,3,0.18)"/>
            <!-- Label "BONO REGALO" -->
            <text x="80" y="27" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="10" fill="#FF6B03" letter-spacing="3.5">BONO REGALO</text>
            <!-- Monto — grande y centrado en la banda -->
            <text x="80" y="70" text-anchor="middle" font-family="Inter,sans-serif" font-weight="900" font-size="30" fill="#FFFFFF">${amount}</text>
            <!-- Footer con logo -->
            <text x="80" y="99" text-anchor="middle" font-family="Inter,sans-serif" font-weight="600" font-size="9" fill="#555" letter-spacing="1">BGOR · Aniversario 2 Años</text>
        </svg>`;
    }

    const SVG_TEMPLATES = {
        desc10: `<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg" width="140" height="140">
            <circle cx="70" cy="70" r="62" fill="#FFF4EC" stroke="#FF6B03" stroke-width="3"/>
            <circle cx="70" cy="70" r="55" fill="none" stroke="rgba(255,107,3,0.12)" stroke-width="1.5"/>
            <text x="70" y="62" text-anchor="middle" font-family="Inter,sans-serif" font-weight="900" font-size="38" fill="#FF6B03">10%</text>
            <text x="70" y="84" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="13" fill="#D85A00" letter-spacing="1">DESCUENTO</text>
            <text x="70" y="104" text-anchor="middle" font-family="Inter,sans-serif" font-weight="500" font-size="11" fill="#AAA">en tu compra</text>
        </svg>`,
        vitalkor: `<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg" width="140" height="140">
            <rect x="8" y="8" width="124" height="124" rx="22" fill="#E8F5E9" stroke="#4CAF50" stroke-width="3"/>
            <rect x="8" y="8" width="124" height="124" rx="22" fill="none" stroke="rgba(76,175,80,0.15)" stroke-width="1.5"/>
            <text x="70" y="56" text-anchor="middle" font-family="Inter,sans-serif" font-weight="900" font-size="24" fill="#2E7D32" letter-spacing="1">VITAL</text>
            <text x="70" y="84" text-anchor="middle" font-family="Inter,sans-serif" font-weight="900" font-size="24" fill="#1B5E20" letter-spacing="1">KOR</text>
            <rect x="48" y="94" width="44" height="3.5" rx="2" fill="#4CAF50"/>
            <text x="70" y="118" text-anchor="middle" font-family="Inter,sans-serif" font-weight="600" font-size="10" fill="#4CAF50" letter-spacing=".5">Suplemento Premium</text>
        </svg>`
    };

    function getSVG(svgKey, itemName) {
        if (svgKey === 'bono') {
            const m = itemName.match(/\$([\d\.]+)/);
            return bonoSVG(m ? '$' + m[1] : '');
        }
        return SVG_TEMPLATES[svgKey] || '';
    }

    function loadResult() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
        catch(e) { return null; }
    }

    function saveResult(result) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ result, ts: Date.now() }));
    }

    function revealCards() {
        const cards = document.querySelectorAll('.pcard');
        cards.forEach(function(card, i) {
            setTimeout(function(){
                card.classList.add('revealed');
                if (window._bgorSound) window._bgorSound.playReveal();
            }, 150 + i * 220);
        });
    }

    function renderResults(resultIds) {
        const levels = [
            { key: 'L1', level: 1, imgId: 'img-level1', svgId: 'svg-level1', nameId: 'name-level1' },
            { key: 'L2', level: 2, imgId: 'img-level2', svgId: 'svg-level2', nameId: 'name-level2' },
            { key: 'L3', level: 3, imgId: 'img-level3', svgId: 'svg-level3', nameId: 'name-level3' }
        ];

        levels.forEach(function(l) {
            const item = window._bgorEngine.getItem(l.level, resultIds[l.key]);
            if (!item) return;

            document.getElementById(l.nameId).textContent = item.name;
            if (item.sub) {
                var nameEl = document.getElementById(l.nameId);
                var subEl = document.createElement('span');
                subEl.className = 'pcard__sub';
                subEl.textContent = item.sub;
                nameEl.appendChild(subEl);
            }

            if (item.img) {
                const img = document.getElementById(l.imgId);
                img.src = item.img;
                img.alt = item.name;
                img.hidden = false;
            } else if (item.svg) {
                const svgEl = document.getElementById(l.svgId);
                svgEl.innerHTML = getSVG(item.svg, item.name);
                svgEl.hidden = false;
            }
        });

        const section = document.getElementById('results-section');
        section.hidden = false;
        setTimeout(function(){
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            revealCards();
        }, 80);
    }

    function launchConfetti() {
        const container = document.getElementById('confetti-container');
        const colors = ['#FF6B03','#F5C518','#FFFFFF','#FF8C3A','#C9A000','#FFD700','#FF4500'];
        for (let i = 0; i < 110; i++) {
            const el = document.createElement('div');
            const size = 6 + Math.random() * 10;
            el.className = 'confetti-piece';
            el.style.cssText = [
                'left:'   + (Math.random() * 100) + '%',
                'width:'  + size + 'px',
                'height:' + size + 'px',
                'background:' + colors[Math.floor(Math.random() * colors.length)],
                'animation-duration:' + (2.2 + Math.random() * 2.5) + 's',
                'animation-delay:'    + (Math.random() * 1.8) + 's',
                'border-radius:' + (Math.random() > 0.4 ? '50%' : '3px')
            ].join(';');
            container.appendChild(el);
            el.addEventListener('animationend', function(){ el.remove(); });
        }
    }

    function showAlreadyPlayed(resultIds) {
        // Añadir banner de "ya jugaste" sobre los resultados
        const section = document.getElementById('results-section');
        const banner = document.createElement('div');
        banner.style.cssText = 'background:#F0F0F0;border:1px solid #E4E4E4;border-radius:12px;padding:14px 20px;text-align:center;margin-bottom:24px;font-size:14px;color:#666;font-weight:600;';
        banner.innerHTML = 'Ya participaste en la ruleta &mdash; aqu&iacute; est&aacute;n tus premios guardados.';
        const top = section.querySelector('.results__top');
        section.insertBefore(banner, top);
        renderResults(resultIds);
    }

    // ── Reveal animado — muestra cada nivel uno a uno con botón manual ──────
    function revealPrizesSequence(resultIds, onComplete) {
        const overlay = document.getElementById('prize-reveal');
        const cardEl  = document.getElementById('prize-reveal__card');

        const LEVELS = [
            { key:'L1', level:1, eyebrow:'Tu regalo · Nivel 1',  sub:'Por compras desde $149.900', theme:'l1', btnText:'Ver siguiente premio', btnDelay:750  },
            { key:'L2', level:2, eyebrow:'Premio Nivel 2',        sub:'Por compras desde $249.900', theme:'l2', btnText:'Ver siguiente premio', btnDelay:750  },
            { key:'L3', level:3, eyebrow:'★ TU MEJOR PREMIO ★',  sub:'Por compras desde $374.000', theme:'l3', btnText:'¡Ver mis premios!',    btnDelay:3800 }
        ];

        overlay.classList.add('rv-active');
        document.body.style.overflow = 'hidden';

        let idx = 0;
        function showNext() {
            if (idx >= LEVELS.length) {
                overlay.classList.remove('rv-active');
                overlay.classList.add('rv-closing');
                setTimeout(function() {
                    overlay.classList.remove('rv-closing');
                    document.body.style.overflow = '';
                    onComplete();
                }, 550);
                return;
            }

            const lvl  = LEVELS[idx];
            const item = window._bgorEngine.getItem(lvl.level, resultIds[lvl.key]);
            idx++;

            // Dots de progreso
            const dotsHTML = '<div class="rv-progress">' +
                LEVELS.map(function(_, i) {
                    const cls = i < idx - 1 ? 'rv-dot rv-dot--done' : i === idx - 1 ? 'rv-dot rv-dot--active' : 'rv-dot';
                    return '<span class="' + cls + '"></span>';
                }).join('') + '</div>';

            // Visual con fondo curvo
            const visualHTML = item.img
                ? '<div class="rv-img-wrap"><img src="' + item.img + '" alt="' + item.name + '" class="rv-img"></div>'
                : '<div class="rv-img-wrap rv-img-wrap--svg"><div class="rv-svg">' + getSVG(item.svg, item.name) + '</div></div>';

            // Bonos — solo L3
            const bonosHTML = lvl.level === 3 ? `
                <div class="rv-bonos-sep">¡Pero eso no es todo&hellip;!</div>
                <div class="rv-bonos">
                    <div class="rv-bono rv-bono--1">
                        <div class="rv-bono__img-wrap">
                            <img src="images/moto-suzuki.webp" alt="Moto DR Suzuki 150" class="rv-bono__img">
                        </div>
                        <div class="rv-bono__info">
                            <span class="rv-bono__tag">Bono Sorteo</span>
                            <span class="rv-bono__name">Moto DR Suzuki 150<br>Cero Kilómetros</span>
                            <span class="rv-bono__detail">&#9889; Nueva &middot; Sin estrenar</span>
                        </div>
                    </div>
                    <div class="rv-bono rv-bono--2">
                        <div class="rv-bono__img-wrap">
                            <img src="images/ternero.webp" alt="Ternero Simmental" class="rv-bono__img">
                        </div>
                        <div class="rv-bono__info">
                            <span class="rv-bono__tag">Bono Sorteo</span>
                            <span class="rv-bono__name">Ternero<br>Simmental</span>
                            <span class="rv-bono__detail">&#10003; Puro &middot; Con Registro</span>
                        </div>
                    </div>
                </div>` : '';

            cardEl.innerHTML =
                '<div class="rv-card rv-card--' + lvl.theme + '">' +
                    dotsHTML +
                    '<div class="rv-eyebrow-wrap">' +
                        '<span class="rv-eyebrow">' + lvl.eyebrow + '</span>' +
                        '<span class="rv-eyebrow-sub">' + lvl.sub + '</span>' +
                    '</div>' +
                    '<div class="rv-visual">' + visualHTML + '</div>' +
                    '<div class="rv-name">' + item.name + (item.sub ? '<span class="rv-name__sub">' + item.sub + '</span>' : '') + '</div>' +
                    bonosHTML +
                    '<button class="rv-next-btn" id="rv-next-btn">' + lvl.btnText + '</button>' +
                '</div>';

            // Entrada animada
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    cardEl.querySelector('.rv-card').classList.add('rv-enter');
                });
            });

            // Sonidos
            if (window._bgorSound) {
                if (lvl.level === 3) window._bgorSound.playWin();
                else                 window._bgorSound.playReveal();
            }

            // Bonos L3 — animación secuencial
            if (lvl.level === 3) {
                launchConfetti();
                setTimeout(function() {
                    var sep = cardEl.querySelector('.rv-bonos-sep');
                    if (sep) sep.classList.add('rv-pop');
                }, 900);
                setTimeout(function() {
                    var b1 = cardEl.querySelector('.rv-bono--1');
                    if (b1) b1.classList.add('rv-pop');
                    if (window._bgorSound) window._bgorSound.playMotoRev();
                }, 1400);
                setTimeout(function() {
                    var b2 = cardEl.querySelector('.rv-bono--2');
                    if (b2) b2.classList.add('rv-pop');
                    if (window._bgorSound) window._bgorSound.playMoo();
                }, 3200);
            }

            // Mostrar botón después del delay correspondiente
            setTimeout(function() {
                var btn = document.getElementById('rv-next-btn');
                if (!btn) return;
                btn.classList.add('rv-btn-show');
                btn.addEventListener('click', function() { showNext(); }, { once: true });
            }, lvl.btnDelay);
        }

        showNext();
    }

    function initGame() {
        const canvas  = document.getElementById('rouletteCanvas');
        const btnSpin = document.getElementById('btnSpin');
        const saved   = loadResult();

        window._bgorWheel.init(canvas);

        if (saved && saved.result) {
            document.getElementById('game-section').hidden = true;
            showAlreadyPlayed(saved.result);
            return;
        }

        btnSpin.addEventListener('click', function() {
            btnSpin.disabled = true;
            btnSpin.querySelector('.btn-spin__label').textContent = 'Girando...';
            btnSpin.querySelector('.btn-spin__sub').textContent   = '¡Un momento!';

            const rolled    = window._bgorEngine.roll();
            const resultIds = { L1: rolled.L1.id, L2: rolled.L2.id, L3: rolled.L3.id };

            window._bgorWheel.spin(resultIds, function() {
                saveResult(resultIds);
                document.getElementById('game-section').hidden = true;
                revealPrizesSequence(resultIds, function() {
                    renderResults(resultIds);
                    launchConfetti();
                });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', initGame);
})();
