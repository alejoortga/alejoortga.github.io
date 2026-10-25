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

  /* ---- Cursor: brillo, orbes, sol y cartas ---- */
  const brillo = document.getElementById('brillo');
  const elCoord = document.getElementById('coord');
  const sol = document.getElementById('sol');
  const orbes = [...document.querySelectorAll('.hero .orbe')];
  const cartas = [...document.querySelectorAll('a.carta')];
  const pad = n => String(Math.round(n)).padStart(4, '0');

  let mx = innerWidth / 2, my = innerHeight / 2, bx = mx, by = my;

  if (puntero && !reducido) {
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      brillo.classList.add('on');
      elCoord.textContent = 'X ' + pad(mx) + ' · Y ' + pad(my);

      // el sol de la "O" mira hacia el cursor
      const r = sol.getBoundingClientRect();
      const gx = Math.max(15, Math.min(70, 50 + ((mx - (r.left + r.width / 2)) / innerWidth) * 90));
      const gy = Math.max(15, Math.min(70, 50 + ((my - (r.top + r.height / 2)) / innerHeight) * 90));
      sol.style.setProperty('--gx', gx + '%');
      sol.style.setProperty('--gy', gy + '%');

      // parallax suave de los orbes
      orbes.forEach((o, i) => {
        const k = (i + 1) * 14;
        o.style.setProperty('--px', ((mx / innerWidth) - 0.5) * -k + 'px');
        o.style.setProperty('--py', ((my / innerHeight) - 0.5) * -k + 'px');
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => brillo.classList.remove('on'));

    // inclinación de las cartas
    cartas.forEach(c => {
      const marco = c.querySelector('.carta-marco');
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        marco.style.transform = 'rotateX(' + (-y * 5) + 'deg) rotateY(' + (x * 6) + 'deg)';
      });
      c.addEventListener('pointerleave', () => { marco.style.transform = ''; });
    });

    (function bucle() {
      bx += (mx - bx) * 0.12; by += (my - by) * 0.12;
      brillo.style.transform = 'translate(' + bx + 'px,' + by + 'px)';
      requestAnimationFrame(bucle);
    })();
  }

  /* ---- Revelado al hacer scroll ---- */
  const objetivos = document.querySelectorAll('.carta, .gran-orbe, .vacio-texto, .ficha, .sobre-texto, .correo, .redes');
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
