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

  // Verified uploads tied to the @ilyKuda channel. View counts are refreshed in-browser.
  const shorts = [
    {
      id: "ipXjyrEI_gw",
      title: "She Built Her Base in the Void on my Minecraft Server?!",
      fallbackViews: "views"
    },
    {
      id: "OEWvfOeaqxE",
      title: "FernSMP Short",
      fallbackViews: "views"
    }
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

  function setupCarousel(root, { autoplay = 4200 } = {}) {
    const viewport = root.querySelector('.carousel-viewport');
    const cards = [...root.querySelectorAll('.video-card, .short-card')];
    const prev = root.querySelector('.carousel-prev');
    const next = root.querySelector('.carousel-next');
    if (!viewport || !cards.length) return;

    let index = 0;
    let timer = null;
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    let resumeTimer = null;

    function targetLeft(i) {
      const card = cards[i];
      return Math.max(0, card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2);
    }

    function markActive(i) {
      index = Math.max(0, Math.min(cards.length - 1, i));
      cards.forEach((card, n) => card.classList.toggle('is-active', n === index));
    }

    function go(i, behavior = 'smooth') {
      let nextIndex = i;
      if (nextIndex < 0) nextIndex = cards.length - 1;
      if (nextIndex >= cards.length) nextIndex = 0;
      markActive(nextIndex);
      viewport.scrollTo({ left: targetLeft(nextIndex), behavior });
    }

    function closestIndex() {
      const center = viewport.scrollLeft + viewport.clientWidth / 2;
      let best = 0;
      let distance = Infinity;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const d = Math.abs(cardCenter - center);
        if (d < distance) { distance = d; best = i; }
      });
      return best;
    }

    function stopAuto() {
      if (timer) clearInterval(timer);
      timer = null;
      if (resumeTimer) clearTimeout(resumeTimer);
    }

    function startAuto(delay = autoplay) {
      if (reducedMotion || cards.length < 2) return;
      stopAuto();
      resumeTimer = setTimeout(() => {
        timer = setInterval(() => go(index + 1), autoplay);
      }, delay);
    }

    prev?.addEventListener('click', () => { stopAuto(); go(index - 1); startAuto(6500); });
    next?.addEventListener('click', () => { stopAuto(); go(index + 1); startAuto(6500); });

    viewport.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = viewport.scrollLeft;
      stopAuto();
      viewport.style.scrollBehavior = 'auto';
    });

    viewport.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      if (!moved) return;
      e.preventDefault();
      viewport.scrollLeft = startLeft - dx;
    });

    const finishDrag = () => {
      if (!dragging) return;
      dragging = false;
      viewport.style.scrollBehavior = '';
      const nearest = closestIndex();
      go(nearest);
      startAuto(6000);
      setTimeout(() => { moved = false; }, 100);
    };
    viewport.addEventListener('pointerup', finishDrag);
    viewport.addEventListener('pointercancel', finishDrag);
    viewport.addEventListener('pointerleave', e => { if (dragging && e.pointerType === 'mouse') finishDrag(); });
    viewport.addEventListener('click', e => {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    let scrollDebounce;
    viewport.addEventListener('scroll', () => {
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(() => markActive(closestIndex()), 90);
    }, { passive: true });
    viewport.addEventListener('mouseenter', stopAuto);
    viewport.addEventListener('mouseleave', () => startAuto(2500));
    viewport.addEventListener('focusin', stopAuto);
    viewport.addEventListener('focusout', () => startAuto(3500));
    viewport.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); stopAuto(); go(index - 1); startAuto(6000); }
      if (e.key === 'ArrowRight') { e.preventDefault(); stopAuto(); go(index + 1); startAuto(6000); }
    });

    addEventListener('resize', () => go(index, 'auto'), { passive: true });
    markActive(0);
    requestAnimationFrame(() => go(0, 'auto'));
    startAuto(autoplay);
  }

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

  function setupCursor() {
    if (!matchMedia('(pointer: fine)').matches) return;
    const pointer = document.querySelector('.cursor-pointer');
    const bubble = document.querySelector('.cursor-bubble');
    if (!pointer || !bubble) return;

    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let bx = x;
    let by = y;

    addEventListener('mousemove', e => {
      x = e.clientX;
      y = e.clientY;
      pointer.style.transform = `translate(${x - 4}px, ${y - 3}px)`;
      document.body.classList.add('cursor-ready');
    }, { passive: true });

    function followBubble() {
      bx += (x - bx) * .24;
      by += (y - by) * .24;
      const scale = document.body.classList.contains('cursor-hover') ? 1 : .45;
      bubble.style.transform = `translate(${bx}px, ${by}px) translate(-50%, -50%) scale(${scale})`;
      requestAnimationFrame(followBubble);
    }
    requestAnimationFrame(followBubble);

    document.addEventListener('pointerover', e => {
      if (e.target.closest('a, button, [role="button"]')) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('pointerout', e => {
      const interactive = e.target.closest('a, button, [role="button"]');
      const goingToInteractive = e.relatedTarget && e.relatedTarget.closest?.('a, button, [role="button"]');
      if (interactive && !goingToInteractive) document.body.classList.remove('cursor-hover');
    });
  }

  renderCards();
  document.querySelectorAll('[data-carousel]').forEach(root => {
    setupCarousel(root, { autoplay: root.dataset.carousel === 'shorts' ? 5000 : 4300 });
  });
  setupReveal();
  setupCursor();
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
