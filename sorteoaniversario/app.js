document.addEventListener('DOMContentLoaded', function () {

    const STORAGE_KEY = 'bgor_sorteo_aniversario';

    const form           = document.getElementById('sorteoForm');
    const btnSubmit      = document.getElementById('btnSubmit');
    const btnLabel       = document.getElementById('btnLabel');
    const btnLoading     = document.getElementById('btnLoading');
    const globalError    = document.getElementById('globalError');
    const globalErrorMsg = document.getElementById('globalErrorMsg');
    const formSection    = document.getElementById('form-section');
    const confirmScreen  = document.getElementById('confirmScreen');
    const numeroBig1     = document.getElementById('numeroBig1');
    const numeroBig2     = document.getElementById('numeroBig2');
    const yaInscrito     = document.getElementById('yaInscrito');
    const btnNoSoyYo     = document.getElementById('btnNoSoyYo');

    if (!form) return;

    // ── Revisar localStorage al cargar ────────────────────────────
    // Si el usuario ya se inscribió antes, mostrar sus números directo.
    const datosGuardados = cargarDatos();
    if (datosGuardados) {
        mostrarConfirmacion(datosGuardados.numero1, datosGuardados.numero2, false);
        return; // No inicializar el resto del form
    }

    // ── Botón "No soy yo" — limpia localStorage y muestra el form ──
    if (btnNoSoyYo) {
        btnNoSoyYo.addEventListener('click', function () {
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
            location.reload();
        });
    }

    // ── Validación en tiempo real ──────────────────────────────────
    function validateField(id, errorId, validate) {
        const input = document.getElementById(id);
        const error = document.getElementById(errorId);
        if (!input || !error) return true;
        const result = validate(input.value.trim());
        if (result) {
            input.classList.add('is-error');
            error.textContent = result;
            return false;
        } else {
            input.classList.remove('is-error');
            error.textContent = '';
            return true;
        }
    }

    document.getElementById('nombre').addEventListener('blur', () => {
        validateField('nombre', 'error-nombre', v => !v ? 'Ingresa tu nombre completo.' : v.length < 3 ? 'Mínimo 3 caracteres.' : '');
    });
    document.getElementById('guia').addEventListener('blur', () => {
        validateField('guia', 'error-guia', v => !v ? 'Ingresa tu número de guía.' : '');
    });
    document.getElementById('celular').addEventListener('blur', () => {
        validateField('celular', 'error-celular', v => {
            if (!v) return 'Ingresa tu celular.';
            if (!/^\d{7,15}$/.test(v.replace(/\s/g, ''))) return 'Celular inválido. Solo dígitos.';
            return '';
        });
    });

    // ── Submit ─────────────────────────────────────────────────────
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const okNombre  = validateField('nombre', 'error-nombre', v => !v ? 'Ingresa tu nombre completo.' : v.length < 3 ? 'Mínimo 3 caracteres.' : '');
        const okGuia    = validateField('guia',   'error-guia',   v => !v ? 'Ingresa tu número de guía.' : '');
        const okCelular = validateField('celular','error-celular', v => {
            if (!v) return 'Ingresa tu celular.';
            if (!/^\d{7,15}$/.test(v.replace(/\s/g, ''))) return 'Celular inválido. Solo dígitos.';
            return '';
        });

        const tyc = document.getElementById('tyc');
        let okTyc = true;
        if (!tyc.checked) {
            document.getElementById('error-tyc').textContent = 'Debes aceptar los términos y condiciones.';
            okTyc = false;
        } else {
            document.getElementById('error-tyc').textContent = '';
        }

        if (!okNombre || !okGuia || !okCelular || !okTyc) return;

        // Deshabilitar botón — prevenir doble submit
        btnSubmit.disabled = true;
        btnLabel.hidden    = true;
        btnLoading.hidden  = false;
        globalError.hidden = true;

        const nombre  = document.getElementById('nombre').value.trim();
        const guia    = document.getElementById('guia').value.trim();
        const celular = document.getElementById('celular').value.trim().replace(/\s/g, '');

        try {
            const res = await fetch('/.netlify/functions/registrar-sorteo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, guia, celular })
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            if (!data.numero1 || !data.numero2) throw new Error('Respuesta inválida del servidor.');

            const { numero1, numero2 } = data;

            // Guardar en localStorage para futuras visitas
            guardarDatos({ numero1, numero2, nombre });

            // Backup a Netlify Forms (no bloqueante)
            enviarBackupNetlify({ nombre, guia, celular, numero1, numero2 });

            // Mostrar pantalla de confirmación
            mostrarConfirmacion(numero1, numero2, true);

        } catch (err) {
            console.error('Error al inscribir:', err);
            globalErrorMsg.textContent = 'Hubo un error al inscribirte. Revisa tu conexión e intenta de nuevo.';
            globalError.hidden = false;
            btnSubmit.disabled = false;
            btnLabel.hidden    = false;
            btnLoading.hidden  = true;
        }
    });

    // ── Mostrar pantalla de confirmación ──────────────────────────
    function mostrarConfirmacion(numero1, numero2, esNuevo) {
        numeroBig1.textContent = numero1;
        numeroBig2.textContent = numero2;
        formSection.hidden     = true;
        confirmScreen.hidden   = false;

        // Si ya estaba inscrito, mostrar banner verde arriba
        if (!esNuevo && yaInscrito) {
            yaInscrito.hidden = false;
        }

        confirmScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ── localStorage helpers ───────────────────────────────────────
    const UNA_SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

    function guardarDatos(datos) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...datos, _ts: Date.now() }));
        } catch (e) { /* privado/incógnito: ignorar silenciosamente */ }
    }

    function cargarDatos() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const datos = JSON.parse(raw);
            if (!datos || !datos.numero1 || !datos.numero2) return null;
            if (datos._ts && Date.now() - datos._ts > UNA_SEMANA_MS) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
            return datos;
        } catch (e) {
            return null;
        }
    }

    // ── Backup a Netlify Forms ─────────────────────────────────────
    function enviarBackupNetlify({ nombre, guia, celular, numero1, numero2 }) {
        const body = new URLSearchParams({
            'form-name': 'sorteo-backup',
            nombre, guia, celular, numero1, numero2
        });
        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString()
        }).catch(err => console.warn('Netlify Forms backup falló (no crítico):', err));
    }

});
