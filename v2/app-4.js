(() => {
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const puntero = matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.getElementById('anio').textContent = new Date().getFullYear();

  /* ---- Idioma ---- */
  const botones = [...document.querySelectorAll('[data-lang]')];
  function idiomaInicial() {
    try {
      const g = localStorage.getItem('lang');
      if (g === 'es' || g === 'en') return g;
    } catch (e) {}
    return (navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
  }
  function poner(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-es]').forEach(el => { el.textContent = el.dataset[lang]; });
    botones.forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }
  botones.forEach(b => b.addEventListener('click', () => poner(b.dataset.lang)));
  poner(idiomaInicial());

  /* ---- Reloj de Bogotá ---- */
  const elHora = document.getElementById('hora');
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  const tic = () => { elHora.textContent = fmt.format(new Date()); };
  tic(); setInterval(tic, 1000);

  /* ---- Coordenadas en el pie ---- */
  const elCoord = document.getElementById('coord');
  const pad = n => String(Math.round(n)).padStart(4, '0');

  /* ---- Mira + sol + vista previa ---- */
  const mira = document.querySelector('.mira');
  const dato = document.getElementById('miraDato');
  const sol = document.getElementById('sol');
  const vista = document.getElementById('vista');
  const vistaImg = vista.querySelector('img');
  let mx = innerWidth / 2, my = innerHeight / 2;
  let vx = mx, vy = my, vistaOn = false;
  if (reducido) vista.remove();

  if (puntero) {
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      mira.classList.add('on');
      mira.style.setProperty('--x', mx + 'px');
      mira.style.setProperty('--y', my + 'px');
      dato.textContent = 'X ' + pad(mx) + ' · Y ' + pad(my);
      elCoord.textContent = 'X ' + pad(mx) + ' · Y ' + pad(my);
      if (!reducido) {
        sol.style.setProperty('--sx', ((mx / innerWidth) - 0.5) * -40 + 'px');
        sol.style.setProperty('--sy', ((my / innerHeight) - 0.5) * -40 + 'px');
      }
    }, { passive: true });
    document.addEventListener('pointerleave', () => mira.classList.remove('on'));

    document.querySelectorAll('a.fila').forEach(f => {
      f.addEventListener('pointerenter', () => {
        vistaImg.src = f.dataset.img;
        vista.classList.add('on'); vistaOn = true;
      });
      f.addEventListener('pointerleave', () => { vista.classList.remove('on'); vistaOn = false; });
    });
  }

  /* ---- Campo de puntos ---- */
  const cv = document.getElementById('campo');
  const cx = cv.getContext('2d');
  const paso = 30;
  let W = 0, H = 0, dpr = 1, visible = true;

  function medir() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dibujar(performance.now());
  }

  function dibujar(t) {
    cx.clearRect(0, 0, W, H);
    const r = cv.getBoundingClientRect();
    const px = mx - r.left, py = my - r.top;
    const radio = 190;
    const cols = Math.ceil(W / paso) + 1, filas = Math.ceil(H / paso) + 1;
    for (let j = 0; j < filas; j++) {
      for (let i = 0; i < cols; i++) {
        let x = i * paso + paso / 2, y = j * paso + paso / 2;
        let rad = 1, c = 'rgba(11,11,13,0.28)';
        if (puntero && !reducido) {
          const dx = x - px, dy = y - py, d = Math.hypot(dx, dy);
          if (d < radio) {
            const k = 1 - d / radio;
            x += (dx / (d || 1)) * k * 16;
            y += (dy / (d || 1)) * k * 16;
            rad = 1 + k * 3.2;
            c = k > 0.55 ? '#ff3b1f' : 'rgba(11,11,13,0.8)';
          }
        }
        if (!reducido) rad += Math.sin(t / 1400 + i * 0.35 + j * 0.25) * 0.25;
        cx.fillStyle = c;
        cx.beginPath(); cx.arc(x, y, Math.max(rad, 0.4), 0, 6.2832); cx.fill();
      }
    }
  }

  function bucle(t) {
    if (visible) dibujar(t);
    if (vistaOn || vista.classList.contains('on')) {
      vx += (mx - vx) * 0.14; vy += (my - vy) * 0.14;
      const w = vista.offsetWidth, h = vista.offsetHeight;
      let x = vx + 28, y = vy - h / 2;
      if (x + w > innerWidth - 12) x = vx - w - 28;
      y = Math.max(56, Math.min(y, innerHeight - h - 12));
      vista.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }
    if (!reducido) requestAnimationFrame(bucle);
  }

  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(cv);
  addEventListener('resize', medir);
  medir();
  requestAnimationFrame(bucle);

  /* ---- Revelado al hacer scroll ---- */
  const objetivos = document.querySelectorAll('.datos dl > div, .indice li, .sobre-texto, .tate-gr, .correo, .redes');
  objetivos.forEach(el => el.classList.add('rev'));
  if ('IntersectionObserver' in window && !reducido) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('ya'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    objetivos.forEach(el => io.observe(el));
  } else {
    objetivos.forEach(el => el.classList.add('ya'));
  }
})();
