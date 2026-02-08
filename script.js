document.addEventListener('DOMContentLoaded', () => {
  const mqMobile = window.matchMedia('(max-width: 900px)');
  const mqReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mqCoarse = window.matchMedia('(pointer: coarse)');

  const isMobile = () => mqMobile.matches;
  const prefersReducedMotion = () => mqReduceMotion.matches;
  const isTouch = () =>
    mqCoarse.matches ||
    (navigator && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0) ||
    ('ontouchstart' in window);

  async function injectPartial(placeholderId, url) {
    const target = document.getElementById(placeholderId);
    if (!target) return false;
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(String(res.status));
      target.innerHTML = await res.text();
      initLucide();
      return true;
    } catch (_) {
      return false;
    }
  }

  async function loadSharedLayout() {
    await injectPartial('navbar-placeholder', 'partials/navbar.html');
    await injectPartial('footer-placeholder', 'partials/footer.html');
  }

  function initLucide() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function getCurrentFileName() {
    const file = (window.location.pathname.split('/').pop() || '').trim();
    return file || 'index.html';
  }

  function setActiveNavLink() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;

    const currentFile = getCurrentFileName().toLowerCase();
    const links = Array.from(nav.querySelectorAll('a[href]'));
    links.forEach(a => a.classList.remove('active'));

    const exact = links.find(a => (a.getAttribute('href') || '').toLowerCase() === currentFile);
    if (exact) {
      exact.classList.add('active');
      return;
    }

    const dropdownLinks = Array.from(nav.querySelectorAll('.dropdown a[href]'));
    const match = dropdownLinks.find(a => (a.getAttribute('href') || '').toLowerCase() === currentFile);
    if (match) {
      match.classList.add('active');
      const parent = nav.querySelector('.dropdown-parent > a');
      if (parent) parent.classList.add('active');
    }
  }

  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const menuBtn = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    const closeAllDropdowns = () => {
      document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('.dropdown-parent.active').forEach(p => p.classList.remove('active'));
    };

    const closeMobileMenu = () => {
      if (navLinks) navLinks.classList.remove('active');
      closeAllDropdowns();
    };

    if (navbar) {
      let last = null;
      let ticking = false;

      const update = () => {
        const scrolled = window.scrollY > 50;
        if (scrolled !== last) {
          navbar.classList.toggle('scrolled', scrolled);
          last = scrolled;
        }
      };

      update();

      window.addEventListener(
        'scroll',
        () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            update();
            ticking = false;
          });
        },
        { passive: true }
      );
    }

    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        if (!navLinks.classList.contains('active')) closeAllDropdowns();
      });
    }

    document.addEventListener('click', e => {
      if (!isMobile()) return;

      const link = e.target && e.target.closest ? e.target.closest('.dropdown-parent > a') : null;
      if (!link) return;

      const parent = link.parentElement;
      const dropdown = parent ? parent.querySelector('.dropdown') : null;
      if (!dropdown) return;

      e.preventDefault();

      document.querySelectorAll('.dropdown.open').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });
      document.querySelectorAll('.dropdown-parent.active').forEach(p => {
        if (p !== parent) p.classList.remove('active');
      });

      dropdown.classList.toggle('open');
      parent.classList.toggle('active');
    });

    if (navLinks) {
      navLinks.addEventListener('click', e => {
        const a = e.target && e.target.closest ? e.target.closest('a') : null;
        if (!a) return;
        if (a.matches('.dropdown-parent > a')) return;
        if (navLinks.classList.contains('active')) closeMobileMenu();
      });
    }

    document.addEventListener('click', e => {
      if (!isMobile()) return;
      if (!navLinks || !navLinks.classList.contains('active')) return;
      const insideNavbar = e.target && e.target.closest ? e.target.closest('.navbar') : null;
      if (!insideNavbar) closeMobileMenu();
    });

    window.addEventListener(
      'resize',
      () => {
        if (!isMobile()) closeMobileMenu();
      },
      { passive: true }
    );
  }

  function initAccordion() {
    const accItems = Array.from(document.querySelectorAll('.accordion-item'));
    if (!accItems.length) return;

    const closeItem = item => {
      item.classList.remove('active');
      const content = item.querySelector('.accordion-content');
      if (content) content.style.maxHeight = null;
    };

    const openItem = item => {
      accItems.forEach(other => {
        if (other !== item) closeItem(other);
      });
      item.classList.add('active');
      const content = item.querySelector('.accordion-content');
      if (content) {
        content.style.maxHeight = content.scrollHeight + 'px';
        setTimeout(() => {
          item.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    };

    accItems.forEach(item => {
      const header = item.querySelector('.accordion-header');
      if (!header) return;
      header.addEventListener('click', () => {
        if (item.classList.contains('active')) {
          closeItem(item);
          history.replaceState(null, '', window.location.pathname + window.location.search);
        } else {
          openItem(item);
          if (item.id) history.replaceState(null, '', `#${item.id}`);
        }
      });
    });

    const hash = window.location.hash;
    if (hash) {
      try {
        const target = document.querySelector(hash);
        if (target && target.classList.contains('accordion-item')) {
          setTimeout(() => openItem(target), 400);
        }
      } catch (_) {}
    }
  }

  function initParticles() {
    const container = document.getElementById('tsparticles');
    if (!container) return;

    const reduceEffects = prefersReducedMotion() || isTouch() || isMobile();

    const desktopConfig = {
      fullScreen: { enable: false },
      background: { color: 'transparent' },
      fpsLimit: 60,
      particles: {
        number: { value: 80, density: { enable: true, area: 800 } },
        color: { value: ['#ffffff', '#2f94be', '#2fbe36'] },
        shape: { type: 'circle' },
        size: { value: { min: 1, max: 4 }, random: true },
        links: { enable: true, distance: 150, color: '#ffffffb7', opacity: 0.3, width: 1 },
        move: { enable: true, speed: 1.5, outModes: 'out' },
        opacity: { value: 0.7 }
      },
      interactivity: {
        events: { onHover: { enable: true, mode: 'grab' } },
        modes: { grab: { distance: 200, links: { opacity: 0.8 } } }
      },
      detectRetina: true
    };

    const mobileConfig = {
      fullScreen: { enable: false },
      background: { color: 'transparent' },
      fpsLimit: 40,
      particles: {
        number: { value: 28, density: { enable: true, area: 900 } },
        color: { value: ['#ffffff', '#2f94be', '#2fbe36'] },
        shape: { type: 'circle' },
        size: { value: { min: 1, max: 3 }, random: true },
        links: { enable: false },
        move: { enable: true, speed: 1.0, outModes: 'out' },
        opacity: { value: 0.55 }
      },
      interactivity: { events: { onHover: { enable: false } } },
      detectRetina: false
    };

    const config = reduceEffects ? mobileConfig : desktopConfig;

    const start = () => {
      if (typeof tsParticles !== 'undefined') tsParticles.load('tsparticles', config);
    };

    if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 1500 });
    else setTimeout(start, 500);
  }

  function initPremiumMouseEffect() {
    if (isTouch()) return;
    const sections = Array.from(document.querySelectorAll('.section-premium'));
    if (!sections.length) return;

    sections.forEach(section => {
      let rafId = null;
      let lastEvent = null;

      const apply = () => {
        if (!lastEvent) return;
        const rect = section.getBoundingClientRect();
        const x = lastEvent.clientX - rect.left;
        const y = lastEvent.clientY - rect.top;
        let xRatio = rect.width ? x / rect.width : 0.5;
        xRatio = Math.max(0, Math.min(1, xRatio));
        const bluePercentage = (1 - xRatio) * 100;

        section.style.setProperty('--mouse-x', `${x}px`);
        section.style.setProperty('--mouse-y', `${y}px`);
        section.style.setProperty('--mix-ratio', `${bluePercentage}%`);
      };

      section.addEventListener(
        'mousemove',
        e => {
          lastEvent = e;
          if (rafId) return;
          rafId = requestAnimationFrame(() => {
            apply();
            rafId = null;
          });
        },
        { passive: true }
      );
    });
  }

  function initScrollSnap() {
    const htmlEl = document.documentElement;
    if (prefersReducedMotion() || isTouch() || isMobile()) {
      htmlEl.classList.remove('home-scroll');
      return;
    }
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          htmlEl.classList.toggle('home-scroll', entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    obs.observe(hero);
  }

  function rememberInternalNavigation() {
    document.addEventListener(
      'click',
      e => {
        const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
        if (!a) return;

        const rawHref = a.getAttribute('href');
        if (!rawHref) return;
        if (rawHref.startsWith('#')) return;
        if (/^(mailto:|tel:|https?:|\/\/)/i.test(rawHref)) return;

        let targetUrl;
        try {
          targetUrl = new URL(rawHref, window.location.href);
        } catch (_) {
          return;
        }

        const targetFile = (targetUrl.pathname.split('/').pop() || '').toLowerCase();
        if (!targetFile.endsWith('.html')) return;

        try {
          sessionStorage.setItem('ke_last_page', window.location.href);
        } catch (_) {}
      },
      { capture: true }
    );
  }

  function getServiceBackHrefFromCurrent() {
    const currentFile = getCurrentFileName().toLowerCase();
    if (!currentFile.endsWith('.html')) return null;

    const mainPages = new Set([
      'index.html',
      'hizmetler.html',
      'hakkimizda.html',
      'iletisim.html',
      'is-birligi.html',
      'kvkk.html',
      'sss.html'
    ]);
    if (mainPages.has(currentFile)) return null;

    const slug = currentFile.replace(/\.html$/i, '');
    return `hizmetler.html#${slug}`;
  }

  function initInfoModal() {
    const modal = document.getElementById('info-modal');
    if (!modal) return;

    const current = getCurrentFileName().toLowerCase();
    const isHome = current === 'index.html' || current === 'index';
    const isPartners = current === 'is-birligi.html' || current === 'is-birligi';
    if (!isHome && !isPartners) return;

    const storageKey = 'ke_info_modal_hide';

    let shouldShow = true;
    if (isHome) {
      try {
        shouldShow = localStorage.getItem(storageKey) !== '1';
      } catch (_) {
        shouldShow = true;
      }
    }

    const open = () => {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
    };

    const close = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
    };

    modal.addEventListener('click', e => {
      const t = e.target;
      if (t && t.closest && t.closest('[data-close="true"]')) close();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });

    const dontShow =
      document.getElementById('infoModalDontShow') || document.getElementById('infoModalNoMore');

    if (isHome && dontShow) {
      dontShow.addEventListener('change', () => {
        try {
          if (dontShow.checked) localStorage.setItem(storageKey, '1');
          else localStorage.removeItem(storageKey);
        } catch (_) {}
      });
    }

    if (shouldShow) setTimeout(open, 450);
  }

  function shouldShowBackButton() {
    const currentFile = getCurrentFileName().toLowerCase();

    const exclude = new Set([
      'index.html',
      'hizmetler.html',
      'hakkimizda.html',
      'iletisim.html',
      'is-birligi.html',
      'kvkk.html',
      'sss.html'
    ]);

    if (currentFile === 'esg.html') return true;

    const dropdownLinks = Array.from(document.querySelectorAll('.navbar .dropdown a[href]'));
    for (const a of dropdownLinks) {
      const href = (a.getAttribute('href') || '').toLowerCase();
      const file = href.split('/').pop().split('#')[0];
      if (file === currentFile) return true;
    }

    if (!exclude.has(currentFile) && document.querySelector('.page-header-simple')) return true;
    return false;
  }

  function mountBackButton() {
    if (!shouldShowBackButton()) return;
    if (document.querySelector('.back-nav')) return;

    const wrap = document.createElement('div');
    wrap.className = 'back-nav';
    wrap.innerHTML = `
      <button type="button" class="back-btn" aria-label="Geri dön">
        <i data-lucide="arrow-left" class="back-ico"></i>
        <span>Geri</span>
      </button>
    `;

    const navPh = document.getElementById('navbar-placeholder');
    const insertAfter = navPh || document.querySelector('.navbar');
    if (insertAfter) insertAfter.insertAdjacentElement('afterend', wrap);
    else document.body.insertAdjacentElement('afterbegin', wrap);

    initLucide();

    const btn = wrap.querySelector('.back-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const serviceHref = getServiceBackHrefFromCurrent();
      if (serviceHref) {
        window.location.href = serviceHref;
        return;
      }

      let target = null;
      try {
        target = sessionStorage.getItem('ke_last_page');
      } catch (_) {}

      if (!target) {
        window.location.href = 'index.html';
        return;
      }
      window.location.href = target;
    });
  }

  async function bootstrap() {
    rememberInternalNavigation();
    await loadSharedLayout();
    initLucide();
    initNavbar();
    setActiveNavLink();
    initInfoModal();
    mountBackButton();
    initAccordion();
    initParticles();
    initPremiumMouseEffect();
    initScrollSnap();
  }

  bootstrap();
});
