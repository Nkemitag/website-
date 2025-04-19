// Smooth scrolling with offset for fixed header and additional enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initSmoothScrolling();
    initActiveSectionDetection();
    initParticlesJS();
    initBackToTopButton();
    initBasketballGame();
    handleInitialHashURL();
    
    // Mobile menu toggle (if you implement it later)
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }
});

// Initialize smooth scrolling functionality
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.classList.contains('no-smooth-scroll')) return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                scrollToElement(targetElement, this.dataset.offset);
                updateURL(targetId);
                closeMobileMenuIfOpen();
            }
        });
    });
    
    window.addEventListener('popstate', function() {
        if (location.hash) {
            const targetElement = document.querySelector(location.hash);
            if (targetElement) {
                scrollToElement(targetElement);
            }
        }
    });
}

// Scroll to element with offset
function scrollToElement(element, additionalOffset = 0) {
    const headerHeight = document.querySelector('header')?.offsetHeight || 90;
    const offset = parseInt(additionalOffset) || 0;
    const totalOffset = headerHeight + offset;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - totalOffset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Update URL without jump
function updateURL(hash) {
    if (history.pushState) {
        history.pushState(null, null, hash);
    } else {
        window.location.hash = hash;
    }
}

// Close mobile menu if open
function closeMobileMenuIfOpen() {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu?.classList.contains('active')) {
        toggleMobileMenu();
    }
}

// Handle initial page load with hash URL
function handleInitialHashURL() {
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                scrollToElement(target);
            }, 100);
        }
    }
}

// Add active class to current section in navigation
function initActiveSectionDetection() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.floating-nav a, nav a');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize particles.js
function initParticlesJS() {
    if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#ffffff" },
                "shape": { "type": "circle" },
                "opacity": {
                    "value": 0.5,
                    "random": true,
                    "anim": { "enable": true, "speed": 1, "opacity_min": 0.1 }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": { "enable": true, "speed": 2, "size_min": 0.1 }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": true,
                    "out_mode": "out",
                    "attract": { "enable": true, "rotateX": 600, "rotateY": 1200 }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "repulse" },
                    "onclick": { "enable": true, "mode": "push" },
                    "resize": true
                },
                "modes": {
                    "repulse": { "distance": 100, "duration": 0.4 },
                    "push": { "particles_nb": 4 }
                }
            },
            "retina_detect": true
        });
    }
}

// Back to top button functionality
function initBackToTopButton() {
    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            backToTopButton.classList.toggle('show', window.pageYOffset > 300);
        });
        
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            updateURL(' ');
        });
    }
}

// Basketball Game Implementation
function initBasketballGame() {
    const canvas = document.getElementById('basketball-game-preview');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const shootBtn = document.querySelector('.shoot-btn');
    const resetBtn = document.querySelector('.reset-btn');
    const scoreDisplay = document.querySelector('.score-display span');
    
    // Game variables
    let score = 0;
    let ball = {
        x: 100,
        y: canvas.height - 50,
        radius: 20,
        color: '#e67e22',
        dx: 0,
        dy: 0,
        gravity: 0.2,
        friction: 0.99,
        bouncing: false
    };
    
    let hoop = {
        x: canvas.width - 100,
        y: 150,
        width: 60,
        height: 10,
        backboardWidth: 10,
        backboardHeight: 80,
        color: '#333'
    };
    
    // Initialize game
    function initGame() {
        drawCourt();
        drawHoop();
        drawBall();
    }
    
    // Draw functions
    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
        
        // Basketball lines
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI, false);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    function drawHoop() {
        // Backboard
        ctx.fillStyle = hoop.color;
        ctx.fillRect(hoop.x - hoop.backboardWidth, hoop.y - 30, 
                     hoop.backboardWidth, hoop.backboardHeight);
        
        // Hoop
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(hoop.x, hoop.y, hoop.width, hoop.height);
    }
    
    function drawCourt() {
        // Court lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, canvas.height - 30);
        ctx.lineTo(canvas.width - 50, canvas.height - 30);
        ctx.stroke();
        
        // Free throw line
        ctx.beginPath();
        ctx.arc(150, canvas.height - 30, 60, 0, Math.PI, true);
        ctx.stroke();
    }
    
    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Apply physics
        ball.dy += ball.gravity;
        ball.dx *= ball.friction;
        ball.dy *= ball.friction;
        
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Wall collision
        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
            ball.dx = -ball.dx * 0.8;
        }
        
        // Floor collision
        if (ball.y + ball.radius > canvas.height - 30) {
            ball.y = canvas.height - 30 - ball.radius;
            ball.dy = -ball.dy * 0.7;
        }
        
        // Hoop collision
        if (ball.y - ball.radius < hoop.y + hoop.height &&
            ball.x + ball.radius > hoop.x &&
            ball.x - ball.radius < hoop.x + hoop.width) {
            
            if (ball.dy > 0) { // Only score when ball is falling
                score++;
                scoreDisplay.textContent = score;
            }
            ball.dy = -ball.dy * 0.5;
        }
        
        drawCourt();
        drawHoop();
        drawBall();
        
        if (Math.abs(ball.dy) > 0.1 || Math.abs(ball.dx) > 0.1) {
            requestAnimationFrame(update);
        }
    }
    
    // Event listeners
    if (shootBtn) {
        shootBtn.addEventListener('click', function() {
            ball.x = 100;
            ball.y = canvas.height - 50;
            ball.dx = 8 + Math.random() * 4;
            ball.dy = -12 - Math.random() * 4;
            update();
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            score = 0;
            scoreDisplay.textContent = score;
            ball.x = 100;
            ball.y = canvas.height - 50;
            ball.dx = 0;
            ball.dy = 0;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            initGame();
        });
    }
    
    initGame();
}

// Mobile menu toggle function
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuButton = document.querySelector('.menu-toggle');
    
    if (mobileMenu && menuButton) {
        mobileMenu.classList.toggle('active');
        menuButton.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }
}
