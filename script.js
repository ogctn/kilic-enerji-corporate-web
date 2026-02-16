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

    const cacheKey = `partial::${url}`;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        target.innerHTML = cached;
        initLucide();
        return true;
      }
    } catch (_) {}

    try {
      const res = await fetch(url, { cache: 'force-cache' });
      if (!res.ok) throw new Error(String(res.status));
      const html = await res.text();
      target.innerHTML = html;

      try {
        sessionStorage.setItem(cacheKey, html);
      } catch (_) {}

      initLucide();
      return true;
    } catch (_) {
      return false;
    }
  }

  async function loadSharedLayout() {
    await Promise.all([
      injectPartial('navbar-placeholder', 'partials/navbar.html'),
      injectPartial('footer-placeholder', 'partials/footer.html')
    ]);
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
    const links = Array.from(nav.querySelectorAll('a[href]'));
    const normalizeFileToken = value => {
      if (!value) return 'index';
      let v = String(value).toLowerCase().trim();
      v = v.split('#')[0].split('?')[0];
      v = v.split('/').filter(Boolean).pop() || 'index';
      v = v.replace(/\.html$/i, '');
      return v || 'index';
    };
    const currentToken = normalizeFileToken(getCurrentFileName());
    links.forEach(a => {
      a.classList.remove('active');
      a.removeAttribute('aria-current');
    });
    const matched = links.find(a => {
      const href = a.getAttribute('href') || '';
      const hrefToken = normalizeFileToken(href);
      return hrefToken === currentToken;
    });
    if (!matched) return;
    matched.classList.add('active');
    matched.setAttribute('aria-current', 'page');
    if (matched.closest('.dropdown')) {
      const parent = nav.querySelector('.dropdown-parent > a');
      if (parent) {
        parent.classList.add('active');
        parent.setAttribute('aria-current', 'page');
      }
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
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
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
        const expanded = navLinks.classList.contains('active');
        menuBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        if (!expanded) 
          closeAllDropdowns();
      });
    }

    document.addEventListener('click', e => {
      if (!isMobile()) return;

      const link = e.target && e.target.closest ? e.target.closest('.dropdown-parent > a') : null;
      if (!link) return;

      const parent = link.parentElement;
      const dropdown = parent ? parent.querySelector('.dropdown') : null;
      if (!dropdown) return;

      const isAlreadyOpen = dropdown.classList.contains('open');
      if (isAlreadyOpen) {
        e.preventDefault();
        closeAllDropdowns();
        return;
      }

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

  function initMouseEffect() {
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

   function initMobileLogosManualLoop() {
    const tracks = Array.from(document.querySelectorAll('.logos-slide-track'));
    if (!tracks.length) return;

    const mq = window.matchMedia('(max-width: 768px)');
    const cleanups = [];

    tracks.forEach(track => {
      let syncing = false;

      const syncLoopPosition = () => {
        if (!mq.matches) return;
        const half = track.scrollWidth / 2;
        if (!half || !Number.isFinite(half)) return;

        const threshold = 24;
        if (track.scrollLeft <= threshold) {
          syncing = true;
          track.scrollLeft += half;
          syncing = false;
          return;
        }

        const maxScroll = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= maxScroll - threshold) {
          syncing = true;
          track.scrollLeft -= half;
          syncing = false;
        }
      };

      const primeLoop = () => {
        if (!mq.matches) return;
        const half = track.scrollWidth / 2;
        if (!half || !Number.isFinite(half)) return;
        track.scrollLeft = half;
      };

      const onScroll = () => {
        if (syncing) return;
        syncLoopPosition();
      };

      const onModeChange = e => {
        if (e.matches) primeLoop();
        else track.scrollLeft = 0;
      };

      track.addEventListener('scroll', onScroll, { passive: true });
      if (mq.addEventListener) mq.addEventListener('change', onModeChange);
      else mq.addListener(onModeChange);

      requestAnimationFrame(primeLoop);

      cleanups.push(() => {
        track.removeEventListener('scroll', onScroll);
        if (mq.removeEventListener) mq.removeEventListener('change', onModeChange);
        else mq.removeListener(onModeChange);
      });
    });

    window.addEventListener('beforeunload', () => cleanups.forEach(fn => fn()), { once: true });
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

  function initContactMapSwitcher() {
    const mapSection = document.getElementById('contact-map-section');
    const mapFrame = document.getElementById('contact-map-iframe');
    const mapTitle = document.getElementById('map-title');
    const mapDescription = document.getElementById('map-description');
    const switchLinks = Array.from(document.querySelectorAll('.map-switch-link'));

    if (!mapSection || !mapFrame || !mapTitle || !mapDescription || !switchLinks.length) return;

    const setMapFromCard = card => {
      if (!card) return;
      const nextTitle = card.getAttribute('data-map-title') || '';
      const nextDescription = card.getAttribute('data-map-description') || '';
      const nextSrc = card.getAttribute('data-map-src') || '';

      if (nextTitle) mapTitle.textContent = nextTitle;
      if (nextDescription) mapDescription.textContent = nextDescription;
      if (nextSrc && mapFrame.getAttribute('src') !== nextSrc) mapFrame.setAttribute('src', nextSrc);

      document.querySelectorAll('.office-card.is-active').forEach(el => el.classList.remove('is-active'));
      card.classList.add('is-active');
    };

    const defaultCard = document.querySelector('.office-card');
    if (defaultCard) setMapFromCard(defaultCard);

    switchLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const card = link.closest('.office-card');
        if (!card) return;
        setMapFromCard(card);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
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
      'sertifikalar.html'
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

  // Aynı class'ı koruyoruz: .modal-intro__gif artık <video>
  const introVideo = modal.querySelector('.modal-intro__gif');
  let introTimer = null;

  const clearIntroTimer = () => {
    if (!introTimer) return;
    clearTimeout(introTimer);
    introTimer = null;
  };

  const ensureVideoSources = () => {
    if (!introVideo || introVideo.tagName !== 'VIDEO') return false;
    if (introVideo.querySelector('source')) return true;

    const webm = introVideo.getAttribute('data-webm');
    const mp4 = introVideo.getAttribute('data-mp4');

    if (webm) {
      const s1 = document.createElement('source');
      s1.src = webm;
      s1.type = 'video/webm';
      introVideo.appendChild(s1);
    }

    if (mp4) {
      const s2 = document.createElement('source');
      s2.src = mp4;
      s2.type = 'video/mp4';
      introVideo.appendChild(s2);
    }

    return !!introVideo.querySelector('source');
  };

  const startIntroVideo = () => {
    if (!introVideo || introVideo.tagName !== 'VIDEO') return;

    if (prefersReducedMotion()) return;

    const hasSources = ensureVideoSources();
    if (!hasSources) return;

    introVideo.load();

    const p = introVideo.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
      });
    }
  };

  const stopIntroVideo = () => {
    if (!introVideo || introVideo.tagName !== 'VIDEO') return;

    try {
      introVideo.pause();
      introVideo.currentTime = 0;
    } catch (_) {}

    introVideo.querySelectorAll('source').forEach(s => s.remove());
    try {
      introVideo.load();
    } catch (_) {}
  };

  const revealMainContent = () => {
    modal.classList.remove('is-intro');
    stopIntroVideo();
  };

  const runIntro = () => {
    clearIntroTimer();
    modal.classList.add('is-intro');

    requestAnimationFrame(startIntroVideo);

    introTimer = setTimeout(revealMainContent, 3000);
  };

  const open = () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    runIntro();
  };

  const close = () => {
    clearIntroTimer();
    stopIntroVideo();

    modal.classList.remove('is-open', 'is-intro');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
  };

  if (introVideo && introVideo.tagName === 'VIDEO') {
    introVideo.addEventListener('error', () => {
      stopIntroVideo();
    });
  }

  modal.addEventListener('click', e => {
    const t = e.target;
    if (t && t.closest && t.closest('[data-close="true"]')) close();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });

  setTimeout(open, 10);
}

  function initCertificateModal() {
    const modal = document.getElementById('certificate-modal');
    const pagesContainer = document.getElementById('certificate-modal-pages');
    const statusEl = document.getElementById('certificate-modal-status');
    const fallbackLink = document.getElementById('certificate-modal-open-new');
    const frame = document.getElementById('certificate-modal-frame');

    if (!modal || !pagesContainer) return;

    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    const renderPDF = async (url) => {
      try {
        pagesContainer.innerHTML = ''; 
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.textContent = 'Sertifika sayfaları hazırlanıyor...';
        }

        const loadingTask = pdfjsLib.getDocument({
          url: url,
          disableRange: false,
          disableAutoFetch: false
        });
        
        const pdf = await loadingTask.promise;
        if (statusEl) statusEl.style.display = 'none';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.3 });
          
          const canvas = document.createElement('canvas');
          canvas.className = 'certificate-modal__page-canvas';
          const context = canvas.getContext('2d', { alpha: false });
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
            intent: 'display'
          };

          await page.render(renderContext).promise;
          pagesContainer.appendChild(canvas);
        }

      } catch (error) {
        console.error('PDF Render Hatası:', error);
        if (statusEl) statusEl.textContent = 'Hata: PDF içeriği yüklenemedi.';
      }
    };

    const open = (pdfUrl, title) => {
      if (!pdfUrl) return;

      modal.setAttribute('aria-hidden', 'false'); 
      modal.classList.add('is-open');
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');

      const heading = modal.querySelector('#certificateModalTitle');
      if (heading) heading.textContent = title || 'Sertifika Önizleme';
      if (fallbackLink) fallbackLink.setAttribute('href', pdfUrl);
      if (frame) frame.style.display = 'none'; 

      renderPDF(pdfUrl);
    };

    const close = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true'); 
      
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');

      pagesContainer.innerHTML = '';
    };

    document.querySelectorAll('[data-open-certificate="true"]').forEach(button => {
      button.addEventListener('click', e => {
        e.preventDefault();
        const card = button.closest('.certificate-card');
        if (!card) return;
        const pdfUrl = card.getAttribute('data-pdf') || '';
        const title = card.querySelector('h4')?.textContent || 'Sertifika';
        open(pdfUrl, title);
      });
    });

    document.addEventListener('click', e => {
      if (e.target.closest('[data-certificate-close="true"]')) {
        e.preventDefault();
        close();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
          close();
        }
    });
  }


  function initScrollReveal() {
    const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!revealTargets.length || prefersReducedMotion()) return;

    if (!('IntersectionObserver' in window)) {
      revealTargets.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -2% 0px', threshold: 0.01 }
    );

    revealTargets.forEach(el => {
      el.style.setProperty('--reveal-delay', `220ms`);
      observer.observe(el);
    });
  }

  function initFooterContactLinks() {
    const contactLinks = Array.from(document.querySelectorAll('.contact-link[data-contact]'));
    if (!contactLinks.length) return;

    const applyLinks = () => {
      const mobile = isMobile();

      contactLinks.forEach(link => {
        const type = (link.getAttribute('data-contact') || '').trim();
        const value = (link.getAttribute('data-value') || '').trim();

        if (type === 'address') {
          const desktopHref = link.getAttribute('data-desktop-href') || 'iletisim.html';
          const mobileHref = link.getAttribute('data-mobile-href') || desktopHref;
          link.setAttribute('href', mobile ? mobileHref : desktopHref);
          link.setAttribute('target', mobile ? '_blank' : '_self');
          if (mobile) link.setAttribute('rel', 'noopener noreferrer');
          else link.removeAttribute('rel');
          link.removeAttribute('aria-disabled');
          link.classList.remove('is-disabled');
          return;
        }

        if (mobile && type === 'phone' && value) {
          link.setAttribute('href', `tel:${value.replace(/\s+/g, '')}`);
          link.removeAttribute('aria-disabled');
          link.classList.remove('is-disabled');
          return;
        }

        if (mobile && type === 'email' && value) {
          link.setAttribute('href', `mailto:${value}`);
          link.removeAttribute('aria-disabled');
          link.classList.remove('is-disabled');
          return;
        }

        link.removeAttribute('href');
        link.setAttribute('aria-disabled', 'true');
        link.classList.add('is-disabled');
      });
    };

    applyLinks();
    window.addEventListener('resize', applyLinks, { passive: true });
  }

  function shouldShowBackButton() {
    const currentFile = getCurrentFileName().toLowerCase();

    const exclude = new Set([
      'index.html','index',
      'hizmetler.html','hizmetler',
      'hakkimizda.html','hakkimizda',
      'iletisim.html','iletisim',
      'is-birligi.html','is-birligi'
    ]);

    if (currentFile === 'esg.html') return true;

    const dropdownLinks = Array.from(document.querySelectorAll('.navbar .dropdown a[href]'));
    for (const a of dropdownLinks) {
      const href = (a.getAttribute('href') || '').toLowerCase();
      const file = href.split('/').pop().split('#')[0];
      if (file === currentFile) return true;
    }

    if (!exclude.has(currentFile)) return true;
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
      let hasInternalReferrer = false;
      try {
        if (document.referrer) {
          const ref = new URL(document.referrer);
          hasInternalReferrer =
            ref.origin === window.location.origin &&
            (ref.pathname !== window.location.pathname || ref.search !== window.location.search);
        }
      } catch (_) {
        hasInternalReferrer = false;
      }

      if (hasInternalReferrer && window.history.length > 1) {
        window.history.back();
        return;
      }
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
    }
  );
  }

  async function bootstrap() {
    initInfoModal();
    await loadSharedLayout();
    initLucide();
    initNavbar();
    initFooterContactLinks();
    setActiveNavLink();
    initScrollReveal();
    initCertificateModal();
    mountBackButton();
    initAccordion();
    initParticles();
    initMouseEffect();
    initMobileLogosManualLoop();
    initScrollSnap();
    initContactMapSwitcher();
    rememberInternalNavigation();
  }
  bootstrap();
});
