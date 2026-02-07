document.addEventListener('DOMContentLoaded', () => {
    // =========================================
    // 0) ORTAM / CİHAZ BAYRAKLARI
    // =========================================
    const prefersReducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const isMobile = window.innerWidth <= 900;
    const isTouch =
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
        (navigator && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0) ||
        ('ontouchstart' in window);

    // =========================================
    // 1) ORTAK BİLEŞENLER: NAVBAR / FOOTER
    // =========================================
    async function injectPartial(placeholderId, url) {
        const target = document.getElementById(placeholderId);
        if (!target) return false;

        try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            target.innerHTML = await res.text();

            // Parçalı içerikte ikonlar varsa yeniden çiz
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return true;
        } catch (err) {
            // Static file:// kullanımında fetch engellenebilir. Bu durumda sessiz geç.
            return false;
        }
    }

    async function loadSharedLayout() {
        // Bu sayfalarda placeholder yoksa zaten bir şey yapmaz.
        await injectPartial('navbar-placeholder', 'partials/navbar.html');
        await injectPartial('footer-placeholder', 'partials/footer.html');
    }

    function setActiveNavLink() {
        const nav = document.querySelector('.navbar');
        if (!nav) return;

        const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        const links = nav.querySelectorAll('a[href]');

        // Önce temizle
        links.forEach(a => a.classList.remove('active'));

        // 1) Direkt eşleşen link
        let matched = false;
        links.forEach(a => {
            const href = (a.getAttribute('href') || '').toLowerCase();
            if (href === currentFile) {
                a.classList.add('active');
                matched = true;
            }
        });

        // 2) Hizmet detay sayfaları: parent "Hizmetler" aktif olsun
        if (!matched) {
            const dropdown = nav.querySelector('.dropdown');
            const dropdownItems = dropdown ? dropdown.querySelectorAll('a[href]') : [];
            let isServiceDetail = false;

            dropdownItems.forEach(a => {
                const href = (a.getAttribute('href') || '').toLowerCase();
                if (href === currentFile) {
                    a.classList.add('active');
                    isServiceDetail = true;
                }
            });

            if (isServiceDetail) {
                const parent = nav.querySelector('.dropdown-parent > a');
                if (parent) parent.classList.add('active');
            }
        }
    }

    // =========================================
    // 2) LUCIDE İKONLARI
    // =========================================
    function initLucide() {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // =========================================
    // 3) NAVBAR + MOBİL MENÜ
    // =========================================
    function initNavbar() {
        const navbar = document.querySelector('.navbar');
        const menuBtn = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        const dropdownParentLink = document.querySelector('.dropdown-parent > a');
        const dropdownMenu = document.querySelector('.dropdown');

        // A) Scroll durumunda class toggle (inline style yok)
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

            window.addEventListener('scroll', () => {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(() => {
                    update();
                    ticking = false;
                });
            }, { passive: true });
        }

        // B) Mobil menü aç/kapat
        if (menuBtn && navLinks) {
            menuBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }

        // C) Mobil dropdown
        if (dropdownParentLink && dropdownMenu) {
            dropdownParentLink.addEventListener('click', (e) => {
                if (window.innerWidth <= 900) {
                    e.preventDefault();
                    dropdownMenu.classList.toggle('open');
                    dropdownParentLink.parentElement.classList.toggle('active');
                }
            });
        }

        // D) Menü linkine basınca menüyü kapat
        if (navLinks) {
            navLinks.addEventListener('click', (e) => {
                const a = e.target && e.target.closest ? e.target.closest('a') : null;
                if (!a) return;

                // Dropdown parent linkse kapatma (mobilde aç/kapa)
                if (a.parentElement && a.parentElement.classList.contains('dropdown-parent')) return;

                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            });
        }
    }

    // =========================================
    // 4) AKORDİYON (HİZMETLER SAYFASI)
    // =========================================
    function initAccordion() {
        const accItems = document.querySelectorAll('.accordion-item');
        if (!accItems || accItems.length === 0) return;

        function closeItem(item) {
            item.classList.remove('active');
            const content = item.querySelector('.accordion-content');
            if (content) content.style.maxHeight = null;
        }

        function openItem(item) {
            // Diğerlerini kapat
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
        }

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

        // Hash ile gelindiyse aç
        const hash = window.location.hash;
        if (hash) {
            try {
                const target = document.querySelector(hash);
                if (target && target.classList.contains('accordion-item')) {
                    setTimeout(() => openItem(target), 400);
                }
            } catch (_) { /* noop */ }
        }
    }

    // =========================================
    // 5) PARTİCLES (SADECE ANASAYFA)
    // =========================================
    function initParticles() {
        const particlesContainer = document.getElementById('tsparticles');
        if (!particlesContainer) return;

        const reduceEffects = prefersReducedMotion || isTouch || isMobile;

        const desktopConfig = {
            fullScreen: { enable: false },
            background: { color: "transparent" },
            fpsLimit: 60,
            particles: {
                number: { value: 80, density: { enable: true, area: 800 } },
                color: { value: ["#ffffff", "#2f94be", "#2fbe36"] },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 4 }, random: true },
                links: { enable: true, distance: 150, color: "#ffffffb7", opacity: 0.3, width: 1 },
                move: { enable: true, speed: 1.5, outModes: "out" },
                opacity: { value: 0.7 }
            },
            interactivity: {
                events: { onHover: { enable: true, mode: "grab" } },
                modes: { grab: { distance: 200, links: { opacity: 0.8 } } }
            },
            detectRetina: true
        };

        const mobileConfig = {
            fullScreen: { enable: false },
            background: { color: "transparent" },
            fpsLimit: 40,
            particles: {
                number: { value: 28, density: { enable: true, area: 900 } },
                color: { value: ["#ffffff", "#2f94be", "#2fbe36"] },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 3 }, random: true },
                links: { enable: false },
                move: { enable: true, speed: 1.0, outModes: "out" },
                opacity: { value: 0.55 }
            },
            interactivity: { events: { onHover: { enable: false } } },
            detectRetina: false
        };

        const chosenConfig = reduceEffects ? mobileConfig : desktopConfig;

        function start() {
            if (typeof tsParticles !== 'undefined') {
                tsParticles.load("tsparticles", chosenConfig);
            }
        }

        if ('requestIdleCallback' in window) {
            requestIdleCallback(start, { timeout: 1500 });
        } else {
            setTimeout(start, 500);
        }
    }


    // =========================================
    // 6) MOUSE EFFECT (HAKKIMIZDA) - touch'ta kapalı
    // =========================================
    function initPremiumMouseEffect() {
        if (isTouch) return;

        const interactiveSections = document.querySelectorAll('.section-premium');
        if (!interactiveSections || interactiveSections.length === 0) return;

        interactiveSections.forEach(section => {
            let rafId = null;
            let lastEvent = null;

            const apply = () => {
                if (!lastEvent) return;
                const rect = section.getBoundingClientRect();
                const x = lastEvent.clientX - rect.left;
                const y = lastEvent.clientY - rect.top;

                let xRatio = x / rect.width;
                if (xRatio < 0) xRatio = 0;
                if (xRatio > 1) xRatio = 1;

                const bluePercentage = (1 - xRatio) * 100;

                section.style.setProperty('--mouse-x', `${x}px`);
                section.style.setProperty('--mouse-y', `${y}px`);
                section.style.setProperty('--mix-ratio', `${bluePercentage}%`);
            };

            section.addEventListener('mousemove', (e) => {
                lastEvent = e;
                if (rafId) return;
                rafId = requestAnimationFrame(() => {
                    apply();
                    rafId = null;
                });
            }, { passive: true });
        });
    }

    // =========================================
    // 7) SCROLL SNAP (ANASAYFA) - mobilde kapalı
    // =========================================
    function initScrollSnap() {
        const htmlEl = document.documentElement;

        if (prefersReducedMotion || isTouch || isMobile) {
            htmlEl.classList.remove('home-scroll');
            return;
        }

        const heroTarget = document.querySelector('.hero');
        if (!heroTarget) return;

        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    htmlEl.classList.add('home-scroll');
                } else {
                    htmlEl.classList.remove('home-scroll');
                }
            });
        }, { threshold: 0.1 });

        heroObserver.observe(heroTarget);
    }

    // =========================================
    // BOOTSTRAP
    // =========================================
    (async function bootstrap() {
        await loadSharedLayout();

        // Eğer navbar/footer partial ile geldi ise query'ler artık var.
        initLucide();
        initNavbar();
        setActiveNavLink();

        initAccordion();
        initParticles();
        initPremiumMouseEffect();
        initScrollSnap();
    })();
});
