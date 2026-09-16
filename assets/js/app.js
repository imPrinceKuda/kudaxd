(() => {
  const videos = [
    "0vFNOa7EZjw", "8Wt7fe8kHNc", "s2B5a-8JxaY", "FVpdaVekZR4",
    "PmnywiU7cYU", "j6rmudQ-auE", "IRMAfNz83jA", "x4J7ETzv8P0",
    "1YXfRapkcfY", "iW8otHVCwRU", "PrmXtRaaw24", "HbSh7zftHFw",
    "--GnjB1205I", "rmVhQzWmero", "KRgdD_W6yEY", "cKCfN6gZs6o", "kkLRsBaXCLA"
  ];

  const viewCounts = {
    "0vFNOa7EZjw":"832K+", "8Wt7fe8kHNc":"397K+", "s2B5a-8JxaY":"330K+",
    "FVpdaVekZR4":"309K+", "PmnywiU7cYU":"268K+", "j6rmudQ-auE":"232K+",
    "IRMAfNz83jA":"188K+", "x4J7ETzv8P0":"187K+", "1YXfRapkcfY":"167K+",
    "iW8otHVCwRU":"162K+", "PrmXtRaaw24":"147K+", "HbSh7zftHFw":"108K+",
    "--GnjB1205I":"61K+", "rmVhQzWmero":"61K+", "KRgdD_W6yEY":"31K+",
    "cKCfN6gZs6o":"16K+", "kkLRsBaXCLA":"video"
  };

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const track = document.querySelector('#sliderTrack');
  const shell = document.querySelector('#sliderShell');
  const modal = document.querySelector('#videoModal');
  const frame = document.querySelector('#videoFrame');

  const thumb = (id, quality='maxresdefault') => `https://i.ytimg.com/vi/${id}/${quality}.jpg`;

  function makeCard(id, i) {
    const button = document.createElement('button');
    button.className = 'video-card';
    button.type = 'button';
    button.dataset.video = id;
    button.setAttribute('aria-label', `Watch edit ${i + 1}`);

    const image = document.createElement('img');
    image.src = thumb(id);
    image.alt = `Video edit ${i + 1}`;
    image.loading = i < 3 ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      if (image.src.includes('maxresdefault')) image.src = thumb(id, 'sddefault');
      else if (image.src.includes('sddefault')) image.src = thumb(id, 'hqdefault');
    });

    const play = document.createElement('span');
    play.className = 'play-chip';
    play.textContent = 'watch edit';

    const views = document.createElement('span');
    views.className = 'view-chip';
    views.textContent = viewCounts[id] || 'video';

    button.append(image, play, views);
    button.addEventListener('click', () => openVideo(id));
    return button;
  }

  function loadVideos() {
    if (!track) return;
    const doubled = [...videos, ...videos];
    doubled.forEach((id, i) => track.appendChild(makeCard(id, i % videos.length)));
  }

  function openVideo(id) {
    if (!modal || !frame) return;
    frame.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeVideo() {
    if (!modal || !frame) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    frame.src = '';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-close-video]').forEach(el => el.addEventListener('click', closeVideo));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeVideo();
  });

  function setupSlider() {
    if (!shell || !track) return;

    let dragging = false;
    let pointerDown = false;
    let startX = 0;
    let startScroll = 0;
    let last = performance.now();
    let pauseUntil = 0;
    let suppressClick = false;
    const speed = reducedMotion ? 0 : .2;

    const half = () => track.scrollWidth / 2;
    const normalize = () => {
      const h = half();
      if (!h) return;
      if (shell.scrollLeft >= h) shell.scrollLeft -= h;
      if (shell.scrollLeft < 0) shell.scrollLeft += h;
    };
    const pause = (ms=1200) => pauseUntil = performance.now() + ms;

    shell.addEventListener('pointerdown', e => {
      if (e.button !== undefined && e.button !== 0) return;
      pointerDown = true;
      dragging = false;
      suppressClick = false;
      startX = e.clientX;
      startScroll = shell.scrollLeft;
      pause(600);
    });

    shell.addEventListener('pointermove', e => {
      if (!pointerDown) return;
      const dx = e.clientX - startX;
      if (!dragging && Math.abs(dx) > 7) {
        dragging = true;
        suppressClick = true;
        try { shell.setPointerCapture(e.pointerId); } catch {}
      }
      if (!dragging) return;
      e.preventDefault();
      shell.scrollLeft = startScroll - dx;
      normalize();
    });

    const endDrag = e => {
      if (!pointerDown) return;
      pointerDown = false;
      dragging = false;
      pause(900);
      try { shell.releasePointerCapture(e.pointerId); } catch {}
      setTimeout(() => { suppressClick = false; }, 80);
    };
    shell.addEventListener('pointerup', endDrag);
    shell.addEventListener('pointercancel', endDrag);
    shell.addEventListener('click', e => {
      if (suppressClick) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    shell.addEventListener('wheel', () => pause(900), {passive:true});
    shell.addEventListener('touchstart', () => pause(1000), {passive:true});

    const jump = direction => {
      pause(1300);
      shell.scrollBy({ left: direction * Math.max(shell.clientWidth * .8, 340), behavior: 'smooth' });
      setTimeout(normalize, 700);
    };
    document.querySelector('.slider-arrow-left')?.addEventListener('click', () => jump(-1));
    document.querySelector('.slider-arrow-right')?.addEventListener('click', () => jump(1));

    function tick(now) {
      const dt = Math.min(now - last, 34);
      last = now;
      if (!pointerDown && now > pauseUntil && document.visibilityState === 'visible') {
        shell.scrollLeft += speed * dt;
        normalize();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function setupReveal() {
    const nodes = [...document.querySelectorAll('[data-reveal]')];
    nodes.forEach(node => node.style.setProperty('--delay', `${node.dataset.delay || 0}ms`));
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(n => n.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:.12, rootMargin:'0px 0px -5% 0px'});
    nodes.forEach(n => observer.observe(n));
  }

  function setupCursor() {
    if (!matchMedia('(pointer: fine)').matches) return;
    const cursor = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    if (!cursor || !dot) return;

    let x = innerWidth/2, y = innerHeight/2;
    let dx = x, dy = y;
    addEventListener('mousemove', e => {
      x = e.clientX; y = e.clientY;
      cursor.style.transform = `translate(${x-3}px, ${y-3}px)`;
      document.body.classList.add('cursor-ready');
    }, {passive:true});

    function follow() {
      dx += (x-dx) * .24;
      dy += (y-dy) * .24;
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    }
    requestAnimationFrame(follow);

    document.addEventListener('mouseover', e => {
      if (e.target.closest('a,button,[role="button"]')) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('a,button,[role="button"]')) document.body.classList.remove('cursor-hover');
    });
  }

  loadVideos();
  setupSlider();
  setupReveal();
  setupCursor();
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
