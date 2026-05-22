// ─── NAV ───
document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('open');
});
document.querySelectorAll('#mobile-menu a').forEach(a => {
    a.addEventListener('click', () => document.getElementById('mobile-menu').classList.remove('open'));
});

// ─── BACK TO TOP ───
const backBtn = document.getElementById('back-top');
window.addEventListener('scroll', () => {
    backBtn.classList.toggle('show', window.scrollY > 400);
});
backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ─── SKILL BARS (intersection observer) ───
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.skill-fill').forEach(bar => {
                bar.style.width = bar.dataset.w + '%';
            });
        }
    });
}, { threshold: 0.2 });
document.querySelectorAll('.skill-block').forEach(b => observer.observe(b));

// ─── PROJECT FILTER ───
document.querySelectorAll('.filt').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.filt').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const f = this.dataset.f;
        document.querySelectorAll('.proj-card').forEach(card => {
            const match = f === 'all' || card.dataset.cat === f;
            card.style.display = match ? 'block' : 'none';
        });
    });
});

// ─── CONTACT FORM via mailto fallback + EmailJS-style ───
document.getElementById('contact-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = document.getElementById('f-submit');
    const msg = document.getElementById('form-msg');
    const name = document.getElementById('f-name').value.trim();
    const email = document.getElementById('f-email').value.trim();
    const subject = document.getElementById('f-subject').value.trim();
    const message = document.getElementById('f-message').value.trim();

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SENDING...';
    msg.className = 'form-msg';
    msg.style.display = 'none';

    // Build mailto: link as primary method (works without backend)
    const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`
    );
    const mailto = `mailto:dnkemitag@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

    // Try opening mailto
    try {
        window.location.href = mailto;
        setTimeout(() => {
            msg.className = 'form-msg success';
            msg.textContent = '✅ Your mail client has opened! If it didn\'t open, please email dnkemitag@gmail.com directly.';
            msg.style.display = 'block';
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> SEND MESSAGE';
            this.reset();
        }, 1000);
    } catch (err) {
        msg.className = 'form-msg error';
        msg.textContent = '❌ Something went wrong. Please email dnkemitag@gmail.com directly.';
        msg.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> SEND MESSAGE';
    }
});


// ══════════════════════════════════════════════
//  ARCADE HOOPS — Full Arcade Basketball Game
// ══════════════════════════════════════════════
(function () {
    const canvas = document.getElementById('arcade-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const scoreEl = document.getElementById('g-score');
    const timerEl = document.getElementById('g-timer');
    const streakEl = document.getElementById('g-streak');
    const startBtn = document.getElementById('g-start');

    // Game state
    let state = 'idle'; // idle | playing | gameover
    let score = 0, streak = 0, timeLeft = 30, timerInterval = null;
    let balls = [], particles = [], hoops = [];
    let aimX = W / 2, aimY = H / 2;
    let mouseX = W / 2, mouseY = H / 2;
    let canShoot = true;
    let frameId = null;
    let highScore = 0;
    let flashMsg = null, flashTimer = 0;

    // ── HOOP MANAGEMENT ──
    function spawnHoop() {
        const margin = 60;
        return {
            x: margin + Math.random() * (W - margin * 2),
            y: 60 + Math.random() * (H / 2 - 40),
            w: 50, h: 6,
            scored: false,
            life: 1.0, // fades for visual feedback
            moving: Math.random() > 0.4,
            dir: Math.random() > 0.5 ? 1 : -1,
            speed: 0.8 + Math.random() * 1.5,
        };
    }

    function initHoops() {
        hoops = [];
        const count = 2;
        for (let i = 0; i < count; i++) {
            const h = spawnHoop();
            h.x = (W / (count + 1)) * (i + 1);
            h.y = 70 + Math.random() * 80;
            hoops.push(h);
        }
    }

    // ── BALL ──
    function createBall(tx, ty) {
        const startX = W / 2 + (Math.random() - 0.5) * 30;
        const startY = H - 20;
        const dx = (tx - startX) * 0.07;
        const dy = (ty - startY) * 0.07 - 2;
        return {
            x: startX, y: startY,
            dx, dy,
            gravity: 0.22,
            r: 12,
            trail: [],
            spin: (Math.random() - 0.5) * 0.4,
            angle: 0,
            active: true,
            bounced: false,
        };
    }

    // ── PARTICLES ──
    function burst(x, y, color, count = 18) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = 2 + Math.random() * 5;
            particles.push({
                x, y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed - 1,
                life: 1.0,
                decay: 0.03 + Math.random() * 0.03,
                r: 3 + Math.random() * 4,
                color
            });
        }
    }

    function scoreText(x, y, text) {
        flashMsg = { x, y, text, life: 1.0 };
    }

    // ── DRAW ──
    function drawCourt() {
        // Floor
        ctx.fillStyle = '#1a0a00';
        ctx.fillRect(0, 0, W, H);

        // Court wood pattern
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = `rgba(255,150,50,${0.03 + i * 0.003})`;
            ctx.fillRect(0, H * 0.6 + i * 8, W, 7);
        }

        // Center circle hint
        ctx.strokeStyle = 'rgba(255,140,0,0.12)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W / 2, H, 80, Math.PI, 0);
        ctx.stroke();

        // Three-point arc
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.arc(W / 2, H + 20, W * 0.45, Math.PI, 0);
        ctx.stroke();

        // Aim indicator (subtle arc from shooter position)
        if (state === 'playing' && canShoot) {
            const sx = W / 2, sy = H - 20;
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 8]);
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            // Simulate a few steps of the trajectory for dotted aim line
            let tx = sx, ty = sy;
            let vx = (mouseX - sx) * 0.07;
            let vy = (mouseY - sy) * 0.07 - 2;
            for (let i = 0; i < 18; i++) {
                vy += 0.22;
                tx += vx; ty += vy;
                if (i % 2 === 0) ctx.lineTo(tx, ty);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    function drawHoops() {
        hoops.forEach(hoop => {
            // Backboard
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.fillRect(hoop.x + hoop.w / 2 - 3, hoop.y - 30, 5, 32);

            // Backboard rectangle
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(hoop.x + hoop.w / 2 - 14, hoop.y - 28, 28, 18);

            // Rim glow
            if (!hoop.scored) {
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 8;
            }

            // Left rim
            ctx.fillStyle = hoop.scored ? '#888' : '#ff5500';
            ctx.fillRect(hoop.x - 8, hoop.y, 10, hoop.h);

            // Right rim
            ctx.fillRect(hoop.x + hoop.w - 2, hoop.y, 10, hoop.h);

            // Main hoop bar
            ctx.fillStyle = hoop.scored ? '#666' : '#ff3300';
            ctx.fillRect(hoop.x, hoop.y, hoop.w, hoop.h);

            ctx.shadowBlur = 0;

            // Net (simple lines)
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const nx = hoop.x + (hoop.w / 4) * i;
                ctx.beginPath();
                ctx.moveTo(nx, hoop.y + hoop.h);
                ctx.lineTo(nx + (i - 2) * 3, hoop.y + 28);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.moveTo(hoop.x, hoop.y + 14);
            ctx.lineTo(hoop.x + hoop.w, hoop.y + 14);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(hoop.x + 4, hoop.y + 24);
            ctx.lineTo(hoop.x + hoop.w - 4, hoop.y + 24);
            ctx.stroke();
        });
    }

    function drawBalls() {
        balls.forEach(ball => {
            if (!ball.active) return;

            // Trail
            ball.trail.forEach((pt, i) => {
                const a = (i / ball.trail.length) * 0.4;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, ball.r * (i / ball.trail.length) * 0.7, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 140, 0, ${a})`;
                ctx.fill();
            });

            // Shadow
            ctx.beginPath();
            ctx.ellipse(ball.x, H - 4, ball.r * 0.8, 3, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fill();

            // Ball
            ctx.save();
            ctx.translate(ball.x, ball.y);
            ctx.rotate(ball.angle);

            const grad = ctx.createRadialGradient(-3, -4, 1, 0, 0, ball.r);
            grad.addColorStop(0, '#ffaa33');
            grad.addColorStop(0.6, '#ff6600');
            grad.addColorStop(1, '#cc3300');
            ctx.beginPath();
            ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Seams
            ctx.strokeStyle = 'rgba(100,20,0,0.6)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, 0, ball.r, -0.5, 0.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, ball.r, Math.PI - 0.5, Math.PI + 0.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, -ball.r); ctx.lineTo(0, ball.r);
            ctx.stroke();

            ctx.restore();
        });
    }

    function drawParticles() {
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    function drawUI() {
        if (state === 'idle') {
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#ff5500';
            ctx.font = 'bold 28px Space Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('🏀 ARCADE HOOPS', W / 2, H / 2 - 30);
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.font = '14px Space Mono, monospace';
            ctx.fillText('Click START, then click to shoot!', W / 2, H / 2 + 10);
            if (highScore > 0) {
                ctx.fillStyle = '#ffd600';
                ctx.font = '12px Space Mono, monospace';
                ctx.fillText(`HIGH SCORE: ${String(highScore).padStart(3, '0')}`, W / 2, H / 2 + 40);
            }
            ctx.textAlign = 'left';
        }

        if (state === 'gameover') {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#ff4400';
            ctx.font = 'bold 26px Space Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', W / 2, H / 2 - 35);
            ctx.fillStyle = '#ffd600';
            ctx.font = '18px Space Mono, monospace';
            ctx.fillText(`SCORE: ${String(score).padStart(3, '0')}`, W / 2, H / 2 + 5);
            if (score >= highScore && score > 0) {
                ctx.fillStyle = '#00e5ff';
                ctx.font = '13px Space Mono, monospace';
                ctx.fillText('🎉 NEW HIGH SCORE!', W / 2, H / 2 + 35);
            }
            ctx.textAlign = 'left';
        }

        // Flash message (score popups)
        if (flashMsg && flashMsg.life > 0) {
            ctx.globalAlpha = flashMsg.life;
            ctx.fillStyle = '#ffd600';
            ctx.font = 'bold 18px Space Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(flashMsg.text, flashMsg.x, flashMsg.y);
            ctx.textAlign = 'left';
            ctx.globalAlpha = 1;
        }

        // Shooter position indicator
        if (state === 'playing') {
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.beginPath();
            ctx.arc(W / 2, H - 20, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff5500';
            ctx.beginPath();
            ctx.arc(W / 2, H - 20, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ── UPDATE ──
    function update() {
        // Move hoops
        hoops.forEach(hoop => {
            if (hoop.moving && state === 'playing') {
                hoop.x += hoop.dir * hoop.speed;
                if (hoop.x < 20 || hoop.x > W - hoop.w - 20) hoop.dir *= -1;
            }
            if (hoop.scored) {
                hoop.life -= 0.05;
                if (hoop.life <= 0) {
                    Object.assign(hoop, spawnHoop());
                    hoop.scored = false;
                    hoop.life = 1.0;
                }
            }
        });

        // Update balls
        balls.forEach(ball => {
            if (!ball.active) return;
            ball.trail.push({ x: ball.x, y: ball.y });
            if (ball.trail.length > 10) ball.trail.shift();

            ball.dy += ball.gravity;
            ball.x += ball.dx;
            ball.y += ball.dy;
            ball.angle += ball.spin;

            // Floor bounce
            if (ball.y + ball.r > H) {
                ball.y = H - ball.r;
                ball.dy *= -0.45;
                ball.dx *= 0.7;
                ball.spin *= 0.5;
                if (Math.abs(ball.dy) < 1.5) ball.active = false;
            }

            // Walls
            if (ball.x - ball.r < 0) { ball.x = ball.r; ball.dx *= -0.7; }
            if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.dx *= -0.7; }

            // Out of frame above
            if (ball.y + ball.r < 0) ball.active = false;

            // Check scoring with each hoop
            hoops.forEach(hoop => {
                if (hoop.scored) return;
                const cx = hoop.x + hoop.w / 2;
                const cy = hoop.y;
                const inX = ball.x > hoop.x + 4 && ball.x < hoop.x + hoop.w - 4;
                const inY = ball.y + ball.r > cy - 2 && ball.y - ball.r < cy + hoop.h + 4;
                if (inX && inY && ball.dy > 0) {
                    // SCORE!
                    hoop.scored = true;
                    streak++;
                    const pts = streak >= 3 ? 3 : streak >= 2 ? 2 : 1;
                    score += pts;
                    streakEl.textContent = streak;
                    scoreEl.textContent = String(score).padStart(3, '0');

                    const label = streak >= 3 ? `🔥 TRIPLE! +${pts}` : streak >= 2 ? `⚡ DOUBLE! +${pts}` : `+${pts}`;
                    scoreText(cx, hoop.y - 15, label);
                    burst(cx, cy, streak >= 3 ? '#00e5ff' : streak >= 2 ? '#ffd600' : '#ff6600');
                    ball.active = false;
                    canShoot = true;
                }
            });
        });

        // Remove dead balls — reset shoot if all gone
        const anyActive = balls.some(b => b.active);
        if (!anyActive && balls.length > 0 && state === 'playing') {
            balls = balls.filter(b => b.active);
            streak = 0;
            streakEl.textContent = '0';
            canShoot = true;
        }

        // Update particles
        particles.forEach(p => {
            p.x += p.dx; p.y += p.dy;
            p.dy += 0.1;
            p.life -= p.decay;
        });
        particles = particles.filter(p => p.life > 0);

        // Flash message
        if (flashMsg) {
            flashMsg.y -= 0.8;
            flashMsg.life -= 0.03;
        }
    }

    // ── LOOP ──
    function loop() {
        ctx.clearRect(0, 0, W, H);
        drawCourt();
        drawHoops();
        drawBalls();
        drawParticles();
        drawUI();
        if (state === 'playing') update();
        frameId = requestAnimationFrame(loop);
    }

    // ── CONTROLS ──
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        mouseX = (e.clientX - rect.left) * scaleX;
        mouseY = (e.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener('click', e => {
        if (state !== 'playing' || !canShoot) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        const tx = (e.clientX - rect.left) * scaleX;
        const ty = (e.clientY - rect.top) * scaleY;
        const ball = createBall(tx, ty);
        balls.push(ball);
        canShoot = false;
        // allow shooting again after short delay if ball is off-screen fast
        setTimeout(() => {
            if (!balls.some(b => b.active)) {
                canShoot = true;
                streak = 0;
                streakEl.textContent = '0';
            }
        }, 3000);
    });

    // Touch support
    canvas.addEventListener('touchend', e => {
        e.preventDefault();
        if (state !== 'playing' || !canShoot) return;
        const rect = canvas.getBoundingClientRect();
        const touch = e.changedTouches[0];
        const scaleX = W / rect.width;
        const scaleY = H / rect.height;
        const tx = (touch.clientX - rect.left) * scaleX;
        const ty = (touch.clientY - rect.top) * scaleY;
        balls.push(createBall(tx, ty));
        canShoot = false;
    }, { passive: false });

    startBtn.addEventListener('click', () => {
        if (state === 'playing') return;
        // Reset
        score = 0; streak = 0; timeLeft = 30;
        balls = []; particles = [];
        canShoot = true;
        scoreEl.textContent = '000';
        timerEl.textContent = '30';
        streakEl.textContent = '0';
        state = 'playing';
        startBtn.textContent = 'PLAYING';
        initHoops();

        timerInterval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                state = 'gameover';
                if (score > highScore) highScore = score;
                startBtn.textContent = 'PLAY AGAIN';
            }
        }, 1000);
    });

    // Kick off render loop
    initHoops();
    loop();
})();
