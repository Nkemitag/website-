// Smooth scrolling with offset for fixed header and additional enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initSmoothScrolling();
    initActiveSectionDetection();
    initParticlesJS();
    initBackToTopButton();
    initBasketballGame();
    handleInitialHashURL();
    
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
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
                scrollToElement(targetElement);
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

// Scroll to element with offset (adjusted for HTML structure)
function scrollToElement(element, additionalOffset = 0) {
    const headerHeight = document.querySelector('nav')?.offsetHeight || 80;
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
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
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
    const navLinks = document.querySelectorAll('.nav-link');
    
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

// Initialize particles.js (optional - not in original HTML)
function initParticlesJS() {
    // Only initialize if particles-js element exists
    if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            // ... your particles config ...
        });
    }
}

// Back to top button functionality
function initBackToTopButton() {
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('opacity-0', 'invisible');
                backToTopButton.classList.add('opacity-100', 'visible');
            } else {
                backToTopButton.classList.remove('opacity-100', 'visible');
                backToTopButton.classList.add('opacity-0', 'invisible');
            }
        });
        
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// Basketball Game Implementation (updated for HTML structure)
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
        radius: 15,
        dx: 0,
        dy: 0,
        gravity: 0.2,
        friction: 0.99,
        isMoving: false
    };
    
    let hoop = {
        x: canvas.width - 100,
        y: 150,
        width: 60,
        height: 5,
        rimWidth: 80,
        rimHeight: 5
    };
    
    let backboard = {
        x: hoop.x - 10,
        y: hoop.y - 100,
        width: 10,
        height: 100
    };
    
    // Draw game elements
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw backboard
        ctx.fillStyle = 'white';
        ctx.fillRect(backboard.x, backboard.y, backboard.width, backboard.height);
        
        // Draw hoop
        ctx.fillStyle = 'red';
        ctx.fillRect(hoop.x, hoop.y, hoop.width, hoop.height);
        
        // Draw rim
        ctx.fillStyle = 'orange';
        ctx.fillRect(hoop.x - 10, hoop.y, hoop.rimWidth, hoop.rimHeight);
        
        // Draw ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'orange';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();
        ctx.closePath();
        
        // Draw score
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 20, 30);
    }
    
    // Update game state
    function update() {
        if (ball.isMoving) {
            // Apply physics
            ball.dy += ball.gravity;
            ball.dx *= ball.friction;
            ball.dy *= ball.friction;
            
            // Update position
            ball.x += ball.dx;
            ball.y += ball.dy;
            
            // Check collisions
            checkCollisions();
            
            // Check scoring
            checkScoring();
        }
        
        draw();
        if (ball.isMoving) {
            requestAnimationFrame(update);
        }
    }
    
    function checkCollisions() {
        // Floor collision
        if (ball.y + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
            ball.dy = -ball.dy * 0.6;
            ball.dx *= 0.8;
            
            if (Math.abs(ball.dy) < 1) {
                ball.isMoving = false;
            }
        }
        
        // Wall collisions
        if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.dx = -ball.dx * 0.8;
        }
        
        if (ball.x + ball.radius > canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.dx = -ball.dx * 0.8;
        }
    }
    
    function checkScoring() {
        if (ball.y + ball.radius > hoop.y && 
            ball.y - ball.radius < hoop.y + hoop.height && 
            ball.x + ball.radius > hoop.x && 
            ball.x - ball.radius < hoop.x + hoop.width) {
            
            if (ball.dy > 0) { // Coming from above
                score++;
                if (scoreDisplay) scoreDisplay.textContent = score;
                resetBall();
            }
        }
    }
    
    function resetBall() {
        ball.x = 100;
        ball.y = canvas.height - 50;
        ball.dx = 0;
        ball.dy = 0;
        ball.isMoving = false;
    }
    
    function shootBall() {
        if (!ball.isMoving) {
            ball.dx = 8 + Math.random() * 2;
            ball.dy = -12 - Math.random() * 3;
            ball.isMoving = true;
            update();
        }
    }
    
    // Event listeners
    if (shootBtn) shootBtn.addEventListener('click', shootBall);
    if (resetBtn) resetBtn.addEventListener('click', function() {
        score = 0;
        if (scoreDisplay) scoreDisplay.textContent = score;
        resetBall();
        draw();
    });
    
    // Initial draw
    draw();
}

// Mobile menu toggle function
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}
