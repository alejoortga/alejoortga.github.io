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

  /* ---- La O mira al cursor ---- */
  const ojo = document.getElementById('ojo');
  if (puntero && !reducido) {
    addEventListener('pointermove', e => {
      const r = ojo.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const max = r.width * 0.2;
      const k = Math.min(1, d / 300);
      ojo.style.setProperty('--ex', (dx / d) * max * k + 'px');
      ojo.style.setProperty('--ey', (dy / d) * max * k + 'px');
    }, { passive: true });
  }

  /* ---- Revelado al hacer scroll ---- */
  const objetivos = document.querySelectorAll('.placa, .privado-frase, .privado-pie, .ficha, .sobre-texto, .correo, .redes');
  objetivos.forEach(el => el.classList.add('rev'));
  if ('IntersectionObserver' in window && !reducido) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('ya'); io.unobserve(e.target); }
    }), { threshold: 0.1 });
    objetivos.forEach(el => io.observe(el));
  } else {
    objetivos.forEach(el => el.classList.add('ya'));
  }
})();
