document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================
    // 1. LUCIDE İKONLARI BAŞLAT
    // =========================================
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // =========================================
    // 2. NAVBAR VE MOBİL MENÜ YÖNETİMİ
    // =========================================
    const navbar = document.querySelector('.navbar');
    const menuBtn = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdownParentLink = document.querySelector('.dropdown-parent > a');
    const dropdownMenu = document.querySelector('.dropdown');

    // A. Navbar Scroll Efekti (Aşağı inince arkaplan değişimi)
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            navbar.style.background = "rgba(255, 255, 255, 0.98)";
            navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.background = "rgba(255, 255, 255, 0.85)";
            navbar.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.03)";
        }
    });

    // B. Mobil Menü Aç/Kapat (Sandviç Buton)
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            
            // Menü açıldığında ikon değişimi (Opsiyonel görsel iyileştirme)
            const icon = menuBtn.querySelector('svg');
            if (navLinks.classList.contains('active')) {
                // Menü açıkken yapılacak işlemler (Gerekirse)
            }
        });
    }

    // C. Mobil Dropdown (Hizmetler'e tıklayınca alt menüyü aç)
    if (dropdownParentLink && dropdownMenu) {
        dropdownParentLink.addEventListener('click', (e) => {
            // Sadece mobil genişlikte (900px altı) çalışsın
            if (window.innerWidth <= 900) {
                e.preventDefault(); // Sayfaya gitmeyi engelle
                dropdownMenu.classList.toggle('open');
                dropdownParentLink.parentElement.classList.toggle('active');
            }
        });
    }

    // D. Linklere Tıklayınca Menüyü Kapat (UX İyileştirmesi)
    const allNavLinks = document.querySelectorAll('.nav-links a');
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Sadece normal linklerde kapat, dropdown tetikleyicide kapatma
            if (!link.parentElement.classList.contains('dropdown-parent')) {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // =========================================
    // 3. AKORDİYON MENÜ (HİZMETLER SAYFASI)
    // =========================================
    const accItems = document.querySelectorAll('.accordion-item');

    // Akordiyon Açma Fonksiyonu
    function openAccordion(item) {
        if (!item) return;

        // Diğerlerini kapat
        accItems.forEach(other => {
            if (other !== item) {
                other.classList.remove('active');
                const otherContent = other.querySelector('.accordion-content');
                if (otherContent) otherContent.style.maxHeight = null;
            }
        });

        // Seçileni aç
        item.classList.add('active');
        const content = item.querySelector('.accordion-content');
        if (content) {
            content.style.maxHeight = content.scrollHeight + "px";
            
            // Animasyon bitince ekrana kaydır
            setTimeout(() => {
                item.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start'
                });
            }, 300);
        }
    }

    // A. Manuel Tıklama Olayı
    if (accItems.length > 0) {
        accItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            if(header){
                header.addEventListener('click', () => {
                    if (item.classList.contains('active')) {
                        // Zaten açıksa kapat
                        item.classList.remove('active');
                        item.querySelector('.accordion-content').style.maxHeight = null;
                        // URL hash temizle
                        history.replaceState(null, null, ' ');
                    } else {
                        // Kapalıysa aç
                        openAccordion(item);
                        // URL hash güncelle
                        history.replaceState(null, null, `#${item.id}`);
                    }
                });
            }
        });
    }

    // B. Sayfa Yüklendiğinde Hash Kontrolü (Dışarıdan linkle gelince)
    function checkHash() {
        const hash = window.location.hash;
        if (hash) {
            try {
                const targetItem = document.querySelector(hash);
                if (targetItem && targetItem.classList.contains('accordion-item')) {
                    // Sayfa yüklenmesini bekleyip aç
                    setTimeout(() => {
                        openAccordion(targetItem);
                    }, 500);
                }
            } catch (e) { console.log("Hash hatası:", e); }
        }
    }
    
    // Hash kontrolünü çalıştır
    checkHash();

    // =========================================
    // 4. HAREKETLİ ARKA PLAN (PARTICLES) - ANASAYFA
    // =========================================
    const particlesContainer = document.getElementById('tsparticles');
    if (particlesContainer) {
        (async () => {
            if (typeof tsParticles !== 'undefined') {
                await loadSlim(tsParticles);
                await tsParticles.load("tsparticles", {
                    fullScreen: { enable: false },
                    background: { color: "transparent" },
                    particles: {
                        number: { value: 80, density: { enable: true, area: 800 } },
                        color: { value: ["#ffffff", "#2f94be", "#2fbe36"] },
                        shape: { type: "circle" },
                        size: { value: { min: 1, max: 4 }, random: true },
                        links: {
                            enable: true,
                            distance: 150,
                            color: "#ffffffb7",
                            opacity: 0.3,
                            width: 1
                        },
                        move: {
                            enable: true,
                            speed: 1.5,
                            direction: "none",
                            random: false,
                            straight: false,
                            outModes: "out"
                        },
                        opacity: {
                            value: 0.7,
                            anim: { enable: true, speed: 1, opacity_min: 0.2, sync: false }
                        }
                    },
                    interactivity: {
                        events: {
                            onHover: { enable: true, mode: "grab" },
                            onClick: { enable: true, mode: "push" }
                        },
                        modes: {
                            grab: { distance: 200, links: { opacity: 0.8 } },
                            push: { quantity: 4 }
                        }
                    },
                    detectRetina: true
                });
            }
        })();
    }

    // =========================================
    // 5. INTERACTIVE MOUSE EFFECT (HAKKIMIZDA)
    // =========================================
    const interactiveSections = document.querySelectorAll('.section-premium');
    interactiveSections.forEach(section => {
        section.addEventListener('mousemove', (e) => {
            const rect = section.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            let xRatio = x / rect.width;
            if (xRatio < 0) xRatio = 0;
            if (xRatio > 1) xRatio = 1;
            
            const bluePercentage = (1 - xRatio) * 100;
            
            section.style.setProperty('--mouse-x', `${x}px`);
            section.style.setProperty('--mouse-y', `${y}px`);
            section.style.setProperty('--mix-ratio', `${bluePercentage}%`);
        });
    });

    // =========================================
    // 6. SCROLL SNAP (HERO KİLİDİ) - ANASAYFA
    // =========================================
    const heroTarget = document.querySelector('.hero');
    const htmlEl = document.documentElement;
    if (heroTarget) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    htmlEl.classList.add('home-scroll'); // CSS'te snap özelliği aç
                } else {
                    htmlEl.classList.remove('home-scroll'); // CSS'te snap özelliği kapat
                }
            });
        }, { threshold: 0.1 });
        heroObserver.observe(heroTarget);
    }

});
