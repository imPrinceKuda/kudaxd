(() => {
  const edits = [
    "0vFNOa7EZjw", "8Wt7fe8kHNc", "s2B5a-8JxaY", "FVpdaVekZR4",
    "PmnywiU7cYU", "j6rmudQ-auE", "IRMAfNz83jA", "x4J7ETzv8P0",
    "1YXfRapkcfY", "iW8otHVCwRU", "PrmXtRaaw24", "HbSh7zftHFw",
    "--GnjB1205I", "rmVhQzWmero", "KRgdD_W6yEY", "cKCfN6gZs6o", "kkLRsBaXCLA"
  ];

  const editViews = {
    "0vFNOa7EZjw":"832K+", "8Wt7fe8kHNc":"397K+", "s2B5a-8JxaY":"330K+",
    "FVpdaVekZR4":"309K+", "PmnywiU7cYU":"268K+", "j6rmudQ-auE":"232K+",
    "IRMAfNz83jA":"188K+", "x4J7ETzv8P0":"187K+", "1YXfRapkcfY":"167K+",
    "iW8otHVCwRU":"162K+", "PrmXtRaaw24":"147K+", "HbSh7zftHFw":"108K+",
    "--GnjB1205I":"61K+", "rmVhQzWmero":"61K+", "KRgdD_W6yEY":"31K+",
    "cKCfN6gZs6o":"16K+", "kkLRsBaXCLA":"video"
  };

  const shorts = [
    { id: "q0VE8X7T3gs", title: "@ilyKuda Short", fallbackViews: "views" },
    { id: "3fV6pUSxek4", title: "@ilyKuda Short", fallbackViews: "views" },
    { id: "FuFBHCHBmHs", title: "@ilyKuda Short", fallbackViews: "views" },
    { id: "62Q4EV_qT6Y", title: "@ilyKuda Short", fallbackViews: "views" },
    { id: "k4xqarfLI_g", title: "@ilyKuda Short", fallbackViews: "views" },
    { id: "Dyw97LFGHXc", title: "@ilyKuda Short", fallbackViews: "views" },
    { id: "wH29xbbmIFU", title: "@ilyKuda Short", fallbackViews: "views" },
    { id: "BeyY4vdPc1U", title: "@ilyKuda Short", fallbackViews: "views" },
    { id: "X27OrL25QuA", title: "@ilyKuda Short", fallbackViews: "views" },
    { id: "B473r8WuDnQ", title: "@ilyKuda Short", fallbackViews: "views" }
  ];

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const thumb = (id, quality = 'maxresdefault') => `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
  const modal = document.querySelector('#videoModal');
  const frame = document.querySelector('#videoFrame');

  function resilientThumb(image, id) {
    image.addEventListener('error', () => {
      if (image.dataset.quality === 'maxresdefault') {
        image.dataset.quality = 'sddefault';
        image.src = thumb(id, 'sddefault');
      } else if (image.dataset.quality === 'sddefault') {
        image.dataset.quality = 'hqdefault';
        image.src = thumb(id, 'hqdefault');
      }
    });
  }

  function makeEditCard(id, index) {
    const card = document.createElement('button');
    card.className = 'video-card';
    card.type = 'button';
    card.dataset.video = id;
    card.setAttribute('aria-label', `Watch edit ${index + 1}`);

    const image = document.createElement('img');
    image.src = thumb(id);
    image.dataset.quality = 'maxresdefault';
    image.alt = `Kuda edit ${index + 1}`;
    image.loading = index < 3 ? 'eager' : 'lazy';
    image.decoding = 'async';
    resilientThumb(image, id);

    const play = document.createElement('span');
    play.className = 'play-chip';
    play.textContent = 'watch edit';

    const views = document.createElement('span');
    views.className = 'view-chip';
    views.textContent = editViews[id] || 'video';

    card.append(image, play, views);
    card.addEventListener('click', () => openVideo(id, false));
    return card;
  }

  function formatViews(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return null;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace('.0','')}M views`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1).replace('.0','')}K views`;
    return `${n.toLocaleString()} views`;
  }

  async function refreshShortViews(id, label) {
    // Public video metadata endpoint; failure falls back gracefully without breaking the card.
    try {
      const res = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${encodeURIComponent(id)}`, { mode: 'cors' });
      if (!res.ok) return;
      const data = await res.json();
      const formatted = formatViews(data.viewCount);
      if (formatted) label.textContent = formatted;
    } catch (_) {}
  }

  function makeShortCard(item, index) {
    const card = document.createElement('button');
    card.className = 'short-card';
    card.type = 'button';
    card.dataset.video = item.id;
    card.setAttribute('aria-label', `Watch Short ${index + 1}`);

    const image = document.createElement('img');
    image.src = thumb(item.id);
    image.dataset.quality = 'maxresdefault';
    image.alt = item.title;
    image.loading = 'lazy';
    image.decoding = 'async';
    resilientThumb(image, item.id);

    const title = document.createElement('span');
    title.className = 'short-title';
    title.textContent = item.title;

    const views = document.createElement('span');
    views.className = 'short-view-chip';
    views.textContent = item.fallbackViews;
    views.dataset.shortViews = item.id;

    card.append(image, title, views);
    card.addEventListener('click', () => openVideo(item.id, true));
    refreshShortViews(item.id, views);
    return card;
  }

  function renderCards() {
    const editsTrack = document.querySelector('#editsTrack');
    const shortsTrack = document.querySelector('#shortsTrack');
    if (editsTrack) edits.forEach((id, i) => editsTrack.appendChild(makeEditCard(id, i)));
    if (shortsTrack) shorts.forEach((item, i) => shortsTrack.appendChild(makeShortCard(item, i)));
  }

  function openVideo(id, isShort) {
    if (!modal || !frame) return;
    modal.classList.toggle('short-mode', !!isShort);
    frame.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeVideo() {
    if (!modal || !frame) return;
    modal.classList.remove('active', 'short-mode');
    modal.setAttribute('aria-hidden', 'true');
    frame.src = '';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-close-video]').forEach(el => el.addEventListener('click', closeVideo));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeVideo();
  });

  function setupReveal() {
    const nodes = [...document.querySelectorAll('[data-reveal]')];
    nodes.forEach(node => node.style.setProperty('--delay', `${node.dataset.delay || 0}ms`));
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(node => node.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -4% 0px' });
    nodes.forEach(node => observer.observe(node));
  }


  function setupParallax() {
    if (reducedMotion) return;
    const bg = document.querySelector('.site-bg');
    const tint = document.querySelector('.site-tint');
    if (!bg) return;

    let tx = 0, ty = 0, cx = 0, cy = 0;
    const maxX = 18;
    const maxY = 12;

    addEventListener('mousemove', e => {
      const px = (e.clientX / innerWidth - 0.5) * 2;
      const py = (e.clientY / innerHeight - 0.5) * 2;
      tx = -px * maxX;
      ty = -py * maxY;
    }, { passive: true });

    function frameParallax() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      bg.style.transform = `translate3d(${cx}px, ${cy}px, 0) scale(1.08)`;
      if (tint) tint.style.transform = `translate3d(${cx * 0.45}px, ${cy * 0.45}px, 0)`;
      requestAnimationFrame(frameParallax);
    }
    requestAnimationFrame(frameParallax);
  }

  function setupCursor() {
    if (!matchMedia('(pointer: fine)').matches) return;
    const pointer = document.querySelector('.cursor-pointer');
    if (!pointer) return;

    let x = innerWidth / 2;
    let y = innerHeight / 2;

    const renderCursor = () => {
      pointer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    addEventListener('mousemove', e => {
      x = e.clientX;
      y = e.clientY;
      document.body.classList.add('cursor-ready');
      renderCursor();
    }, { passive: true });

    document.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      document.body.classList.add('cursor-click');
      renderCursor();
    });
    document.addEventListener('pointerup', () => {
      document.body.classList.remove('cursor-click');
      renderCursor();
    });
    document.addEventListener('pointercancel', () => {
      document.body.classList.remove('cursor-click');
      renderCursor();
    });

    document.addEventListener('pointerover', e => {
      if (e.target.closest('a, button, [role="button"]')) {
        document.body.classList.add('cursor-hover');
        renderCursor();
      }
    });
    document.addEventListener('pointerout', e => {
      const interactive = e.target.closest('a, button, [role="button"]');
      const goingToInteractive = e.relatedTarget && e.relatedTarget.closest?.('a, button, [role="button"]');
      if (interactive && !goingToInteractive) {
        document.body.classList.remove('cursor-hover');
        renderCursor();
      }
    });
  }

  function setupUISounds() {
    if (!matchMedia('(pointer: fine)').matches) return;
    const interactiveSelector = 'a, button, [role="button"]';
    let ctx;
    let hoverTarget = null;

    function ensureAudio() {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!ctx) ctx = new Ctx();
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    }

    function playHoverSound() {
      const audio = ensureAudio();
      if (!audio) return;
      const t = audio.currentTime + 0.005;
      const osc1 = audio.createOscillator();
      const osc2 = audio.createOscillator();
      const gain = audio.createGain();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(640, t);
      osc1.frequency.exponentialRampToValueAtTime(900, t + 0.06);
      osc2.frequency.setValueAtTime(420, t);
      osc2.frequency.exponentialRampToValueAtTime(560, t + 0.05);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.028, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audio.destination);
      osc1.start(t); osc2.start(t);
      osc1.stop(t + 0.1); osc2.stop(t + 0.1);
    }

    function playClickSound() {
      const audio = ensureAudio();
      if (!audio) return;
      const t = audio.currentTime + 0.002;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950, t);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.03);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.022, t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    }

    document.addEventListener('pointerover', e => {
      const target = e.target.closest(interactiveSelector);
      if (!target || target === hoverTarget) return;
      hoverTarget = target;
      playHoverSound();
    });

    document.addEventListener('pointerout', e => {
      const target = e.target.closest(interactiveSelector);
      const goingTo = e.relatedTarget && e.relatedTarget.closest?.(interactiveSelector);
      if (target && !goingTo && hoverTarget === target) hoverTarget = null;
    });

    document.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      if (!e.target.closest(interactiveSelector)) return;
      playClickSound();
    });
  }

  renderCards();
  setupReveal();
  setupParallax();
  setupCursor();
  setupUISounds();
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
