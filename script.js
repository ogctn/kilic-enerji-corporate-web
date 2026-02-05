document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. İkonları Başlat ---
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- 2. Mobil Menü ---
    const menuBtn = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if(menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // --- Akordeon ---
    const accordions = document.querySelectorAll('.accordion-item');

    accordions.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            toggleAccordion(item);
        });
    });

    function toggleAccordion(targetItem) {
        const isActive = targetItem.classList.contains('active');
        const itemId = targetItem.id;
        if (isActive) {
            targetItem.classList.remove('active');
            targetItem.querySelector('.accordion-content').style.maxHeight = 0;
            // URL'deki hash'i temizle
            history.replaceState(null, null, window.location.pathname + window.location.search);
        } 
        else {
            accordions.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.accordion-content').style.maxHeight = 0;
            });
            targetItem.classList.add('active');
            const content = targetItem.querySelector('.accordion-content');
            content.style.maxHeight = content.scrollHeight + "px";
            // URL'ye hash ekle (#karbon)
            history.replaceState(null, null, `#${itemId}`);
        }
    }

    // --- 4. Header Linklerini Yakala (Çakışma Önleyici) ---
    const dropdownLinks = document.querySelectorAll('.dropdown li a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href'); 
            // Eğer link bir hash içeriyorsa (#)
            if (href.includes('#')) {
                const targetId = href.split('#')[1];
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    e.preventDefault();
                    if (!targetElement.classList.contains('active')) {
                         accordions.forEach(otherItem => {
                            otherItem.classList.remove('active');
                            otherItem.querySelector('.accordion-content').style.maxHeight = 0;
                        });
                        targetElement.classList.add('active');
                        const content = targetElement.querySelector('.accordion-content');
                        content.style.maxHeight = content.scrollHeight + "px";
                        // URL Güncelle
                        history.replaceState(null, null, `#${targetId}`);
                    } 
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Mobildeyse menüyü kapat
                    if(navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                    }
                }
            }
        });
    });

    // --- 5. Sayfa İlk Yüklendiğinde (Dışarıdan Gelince) ---
    function checkHashOnLoad() {
        const hash = window.location.hash;
        if (hash) {
            const targetId = hash.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                accordions.forEach(item => {
                    item.classList.remove('active');
                    item.querySelector('.accordion-content').style.maxHeight = 0;
                });
                targetElement.classList.add('active');
                const content = targetElement.querySelector('.accordion-content');
                content.style.maxHeight = content.scrollHeight + "px";
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        }
    }
    checkHashOnLoad();
    // --- 6. HAREKETLİ ARKA PLAN (Mesh) ---
    if (document.getElementById('tsparticles')) {
        (async () => {
            if (typeof tsParticles !== 'undefined') {
                await loadSlim(tsParticles);
                await tsParticles.load("tsparticles", {
                    fullScreen: { enable: false },
                    background: { color: "transparent" },
                    particles: {
                        number: { 
                            value: 80, 
                            density: { enable: true, area: 800 } 
                        },
                        color: { 
                            value: ["#ffffff", "#2f94be", "#2fbe36"] 
                        },
                        shape: { type: "circle" },
                        size: { 
                            value: { min: 1, max: 4 }, 
                            random: true 
                        },
                        links: {
                            enable: true,
                            distance: 150, // Bağlantı mesafesi
                            color: "#ffffffb7", // Çizgi rengi Beyaz
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
                            anim: {
                                enable: true,
                                speed: 1,
                                opacity_min: 0.2,
                                sync: false
                            }
                        }
                    },
                    interactivity: {
                        events: {
                            onHover: { enable: true, mode: "grab" },
                            onClick: { enable: true, mode: "push" }
                        },
                        modes: {
                            grab: { 
                                distance: 200, 
                                links: { opacity: 0.8 }
                            },
                            push: { quantity: 4 }
                        }
                    },
                    detectRetina: true
                });
            }
        })();
    }

// --- 7. MOBİL DROPDOWN MENÜ ---
    const dropdownParentLink = document.querySelector('.dropdown-parent > a');
    const dropdownParentLi = document.querySelector('.dropdown-parent');
    if (dropdownParentLink) {
        dropdownParentLink.addEventListener('click', (e) => {
            // Sadece mobil görünümde (900px altı) çalışsın
            if (window.innerWidth <= 900) {
                e.preventDefault(); // Sayfaya gitmeyi engelle
                dropdownParentLi.classList.toggle('active');
            }
        });
    }

    // --- 8. URL DEĞİŞMEDEN YUMUŞAK KAYDIRMA (Temiz URL) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId) return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- 9. SCROLL SNAP (HERO-VİTRİN KİLİDİ) ---
    const heroTarget = document.querySelector('.hero');
    const htmlEl = document.documentElement;
    if (heroTarget) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    htmlEl.classList.add('home-scroll'); // Mıknatıs AÇIK
                } else {
                    htmlEl.classList.remove('home-scroll'); // Mıknatıs KAPAT
                }
            });
        }, { threshold: 0.1 }); // %10'u göründüğü an devreye gir
        heroObserver.observe(heroTarget);
    }
});

const interactiveBg = document.getElementById('interactive-bg');
if (interactiveBg) {
    interactiveBg.addEventListener('mousemove', (e) => {
        const rect = interactiveBg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        let xRatio = x / rect.width;
        if (xRatio < 0) xRatio = 0;
        if (xRatio > 0.9) xRatio = 0.9;
        const bluePercentage = (0.9 - xRatio) * 100;
        interactiveBg.style.setProperty('--mouse-x', `${x}px`);
        interactiveBg.style.setProperty('--mouse-y', `${y}px`);
        interactiveBg.style.setProperty('--mix-ratio', `${bluePercentage}%`);
    });
}

// --- 11. MOBİLDE DROPDOWN ---
const dropdownToggle = document.querySelector('.dropdown-parent > a');
const dropdownMenu = document.querySelector('.dropdown');
if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener('click', function(e) {
        if (window.innerWidth <= 900) {
            e.preventDefault(); 
            dropdownMenu.classList.toggle('open');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    /* =========================================
       1. NAVBAR SCROLL & MENU
       ========================================= */
    const navbar = document.querySelector('.navbar');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdownMenu = document.querySelector('.dropdown');
    const dropdownParent = document.querySelector('.dropdown-parent > a');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = "rgba(255, 255, 255, 0.98)";
            navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";
        } else {
            navbar.style.background = "rgba(255, 255, 255, 0.85)";
            navbar.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.03)";
        }
    });
    // B. Mobil Menü (Hamburger)
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    // C. Mobil Dropdown
    if (dropdownParent && dropdownMenu) {
        dropdownParent.addEventListener('click', (e) => {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                dropdownMenu.classList.toggle('open');
            }
        });
    }

    // Dropdown içindeki veya ana menüdeki herhangi bir linke tıklanırsa menüyü kapat.
    const allNavLinks = document.querySelectorAll('.nav-links a');
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
            }
            if (dropdownMenu && dropdownMenu.classList.contains('open')) {
                dropdownMenu.classList.remove('open');
            }
        });
    });
    /* =========================================
       2. HİZMETLER AKORDİYON & YÖNLENDİRME
       ========================================= */
 document.addEventListener('DOMContentLoaded', () => {
    const accItems = document.querySelectorAll('.accordion-item');
    function openItem(item) {
        if (!item) return;
        accItems.forEach(other => {
            if (other !== item) {
                other.classList.remove('active');
                const otherContent = other.querySelector('.accordion-content');
                if (otherContent) otherContent.style.maxHeight = null;
            }
        });
        item.classList.add('active');
        const content = item.querySelector('.accordion-content');
        if (content) {
            // İçeriği aç
            content.style.maxHeight = content.scrollHeight + "px";
            // 350ms bekle CSS animasyonu (0.3s) bitsin ve kutu tam boyuna ulaşsın.
            setTimeout(() => {
                item.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' // 'center' yerine 'start' kullan
                });
            }, 350); 
        }
    }
    // A. Manuel Tıklama
    if (accItems.length > 0) {
        accItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            header.addEventListener('click', () => {
                if (item.classList.contains('active')) {
                    item.classList.remove('active');
                    item.querySelector('.accordion-content').style.maxHeight = null;
                } else {
                    openItem(item);
                }
            });
        });
    }
    // B. Linkten Gelme (Hash Kontrolü)
    function checkHash() {
        const hash = window.location.hash; 
        if (hash) {
            try {
                const targetItem = document.querySelector(hash);
                if (targetItem && targetItem.classList.contains('accordion-item')) {
                    // Sayfa yüklenirken biraz daha uzun bekle
                    setTimeout(() => {
                        openItem(targetItem);
                    }, 500); 
                }
            } catch (e) { console.log("Hata:", e); }
        }
    }
});
    window.addEventListener('load', checkHash);
    window.addEventListener('hashchange', checkHash);
    /* =========================================
       3. MOUSE HAREKET EFEKTİ (HAKKIMIZDA)
       ========================================= */
    const interactiveSections = document.querySelectorAll('.section-premium');
    if (interactiveSections.length > 0) {
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
    }
});
