document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('header');

    // Menu Mobile
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', String(!isExpanded));
            navLinks.classList.toggle('active');

            if (!isExpanded) {
                navLinks.setAttribute('aria-hidden', 'false');
                const firstLink = navLinks.querySelector('a');
                if (firstLink) firstLink.focus();
            } else {
                navLinks.setAttribute('aria-hidden', 'true');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navLinks.setAttribute('aria-hidden', 'true');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.focus();
            }
        });

        document.addEventListener('click', (e) => {
            if (!header.contains(e.target) && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navLinks.setAttribute('aria-hidden', 'true');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    navLinks.setAttribute('aria-hidden', 'true');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }

                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        });
    });

    // Header Scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset <= 0) {
            header.style.background = 'rgba(255, 255, 255, 0.8)';
            header.style.borderBottomColor = '#e8e8ed';
        } else if (window.pageYOffset > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.borderBottomColor = '#d2d2d7';
        }
    }, { passive: true });

    // Skip Link
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.querySelector('#main-content');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
            }
        });
    }

    // Hero Animation
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!prefersReducedMotion.matches) {
        const heroContents = document.querySelectorAll('.hero-content');
        heroContents.forEach((content, index) => {
            content.style.opacity = '0';
            content.style.transform = 'translateY(30px)';
            setTimeout(() => {
                content.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
            }, 150 + (index * 100));
        });
    }

    // Intersection Observer
    if (!prefersReducedMotion.matches) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

        document.querySelectorAll('.product-card, .promo-card, .store-feature').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            observer.observe(el);
        });

        const style = document.createElement('style');
        style.textContent = '.animate-in { opacity: 1 !important; transform: translateY(0) !important; transition: opacity 0.6s ease, transform 0.6s ease; }';
        document.head.appendChild(style);
    }

    // Carousel
    document.querySelectorAll('[data-carousel]').forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        
        if (!track || slides.length === 0) return;
        
        let currentIndex = 0;
        let autoplayInterval = null;
        const autoplayDelay = 6000;
        let slidesPerView = 3;
        
        function getCarouselWidth() {
            return track.offsetWidth;
        }
        
        function getSlideWidth() {
            const carouselWidth = getCarouselWidth();
            const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
            return (carouselWidth - (gap * (slidesPerView - 1))) / slidesPerView;
        }
        
        function updateSlidesPerView() {
            if (window.innerWidth <= 480) {
                slidesPerView = 1;
            } else if (window.innerWidth <= 833) {
                slidesPerView = 2;
            } else {
                slidesPerView = 3;
            }
        }
        
        updateSlidesPerView();
        window.addEventListener('resize', updateSlidesPerView);
        
        const maxIndex = Math.max(0, slides.length - slidesPerView);
        
        // Create dots
        const numDots = maxIndex + 1;
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
        
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        
        function updateCarousel() {
            const slideWidth = getSlideWidth();
            const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
            const offset = currentIndex * (slideWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
        
        function goToSlide(index) {
            currentIndex = Math.min(index, maxIndex);
            updateCarousel();
            resetAutoplay();
        }
        
        function nextSlide() {
            currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
            updateCarousel();
            resetAutoplay();
        }
        
        function prevSlide() {
            currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
            updateCarousel();
            resetAutoplay();
        }
        
        function startAutoplay() {
            if (autoplayInterval) clearInterval(autoplayInterval);
            autoplayInterval = setInterval(nextSlide, autoplayDelay);
        }
        
        function resetAutoplay() {
            startAutoplay();
        }
        
        prevBtn.addEventListener('click', () => {
            prevSlide();
        });
        
        nextBtn.addEventListener('click', () => {
            nextSlide();
        });
        
        // Keyboard navigation
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        });
        
        // Touch/Swipe support
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let startTime = 0;
        
        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            currentX = startX;
            isDragging = true;
            startTime = Date.now();
            track.style.transition = 'none';
            if (autoplayInterval) clearInterval(autoplayInterval);
        }, { passive: true });
        
        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            const slideWidth = getSlideWidth();
            const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
            const baseOffset = currentIndex * (slideWidth + gap);
            track.style.transform = `translateX(calc(-${baseOffset}px + ${diff}px))`;
        }, { passive: true });
        
        track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            
            const diff = currentX - startX;
            const elapsed = Date.now() - startTime;
            const velocity = Math.abs(diff) / elapsed;
            const slideWidth = getSlideWidth();
            const threshold = slideWidth * 0.3;
            
            if (Math.abs(diff) > threshold || velocity > 0.5) {
                if (diff < 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            } else {
                updateCarousel();
            }
        });
        
        // Pause on hover
        carousel.addEventListener('mouseenter', () => {
            if (autoplayInterval) clearInterval(autoplayInterval);
        });
        
        carousel.addEventListener('mouseleave', () => {
            startAutoplay();
        });
        
        // Start autoplay
        startAutoplay();
    });
});
