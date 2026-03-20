window.onload = () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score-display');
    const highScoreDisplay = document.getElementById('high-score-display');

    let score = 0;
    let highScore = localStorage.getItem('bbd_highscore') || 0;
    highScoreDisplay.innerText = `BEST: ${highScore}`;
    
    const GRAVITY = 0.4;
    const AIR_RESISTANCE = 0.99;
    const BOUNCE_DAMPENING = 0.7;
    const FLOOR_DAMPENING = 0.6;
    
    let ball = { x: 0, y: 0, radius: 20, vx: 0, vy: 0, isDragging: false, hasScored: false, isActive: false };
    let hoop = { x: 0, y: 0, width: 90, rimRadius: 5 };
    let backboard = { x: 0, y: 0, width: 10, height: 120 };

    let dragStart = { x: 0, y: 0 };
    let dragCurrent = { x: 0, y: 0 };
    let particles = [];
    let trail = [];

    function resetBall() {
        ball.x = 50 + Math.random() * (canvas.width / 4);
        ball.y = canvas.height - 150 - Math.random() * (canvas.height / 3);
        ball.vx = 0;
        ball.vy = 0;
        ball.isDragging = false;
        ball.hasScored = false;
        ball.isActive = false;
        trail = [];
    }

    function initGameEntities() {
        hoop.x = canvas.width - 150;
        hoop.y = canvas.height / 2 - 50;
        backboard.x = hoop.x + hoop.width + 20;
        backboard.y = hoop.y - 80;
        resetBall();
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initGameEntities();
    }
    
    window.addEventListener('resize', resize);
    resize();

    function getPointerPos(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function pointerDown(e) {
        if (ball.isActive) return; 
        const pos = getPointerPos(e);
        const dist = Math.hypot(pos.x - ball.x, pos.y - ball.y);
        if (dist <= ball.radius + 30) {
            ball.isDragging = true;
            dragStart = { x: ball.x, y: ball.y };
            dragCurrent = { x: pos.x, y: pos.y };
        }
    }

    function pointerMove(e) {
        if (!ball.isDragging) return;
        const pos = getPointerPos(e);
        dragCurrent = { x: pos.x, y: pos.y };
    }

    function pointerUp(e) {
        if (!ball.isDragging) return;
        ball.isDragging = false;
        ball.isActive = true;
        ball.vx = (dragStart.x - dragCurrent.x) * 0.15;
        ball.vy = (dragStart.y - dragCurrent.y) * 0.15;
    }

    canvas.addEventListener('mousedown', pointerDown);
    canvas.addEventListener('mousemove', pointerMove);
    window.addEventListener('mouseup', pointerUp);
    canvas.addEventListener('touchstart', pointerDown);
    canvas.addEventListener('touchmove', pointerMove);
    window.addEventListener('touchend', pointerUp);

    function circleRectCollide(cx, cy, r, rx, ry, rw, rh) {
        let testX = cx;
        let testY = cy;
        if (cx < rx) testX = rx;
        else if (cx > rx + rw) testX = rx + rw;
        if (cy < ry) testY = ry;
        else if (cy > ry + rh) testY = ry + rh;
        let distX = cx - testX;
        let distY = cy - testY;
        let distance = Math.sqrt((distX*distX) + (distY*distY));
        return { collided: distance <= r, testX, testY, distX, distY };
    }

    function circleCircleCollide(x1, y1, r1, x2, y2, r2) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        let dist = Math.sqrt(dx*dx + dy*dy);
        return dist <= r1 + r2;
    }

    function resolveCollision(cx, cy, r, rx, ry, rw, rh) {
        let col = circleRectCollide(cx, cy, r, rx, ry, rw, rh);
        if (col.collided) {
            let nx = col.distX;
            let ny = col.distY;
            let len = Math.sqrt(nx*nx + ny*ny);
            if (len === 0) return false;
            nx /= len;
            ny /= len;
            let dot = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dot * nx) * BOUNCE_DAMPENING;
            ball.vy = (ball.vy - 2 * dot * ny) * BOUNCE_DAMPENING;
            ball.x = col.testX + nx * r;
            ball.y = col.testY + ny * r;
            return true;
        }
        return false;
    }

    function resolvePointCollision(px, py) {
        let col = circleCircleCollide(ball.x, ball.y, ball.radius, px, py, hoop.rimRadius);
        if (col) {
            let dx = ball.x - px;
            let dy = ball.y - py;
            let len = Math.sqrt(dx*dx + dy*dy);
            if(len === 0) return false;
            let nx = dx / len;
            let ny = dy / len;
            let dot = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dot * nx) * BOUNCE_DAMPENING;
            ball.vy = (ball.vy - 2 * dot * ny) * BOUNCE_DAMPENING;
            ball.x = px + nx * (ball.radius + hoop.rimRadius);
            ball.y = py + ny * (ball.radius + hoop.rimRadius);
            return true;
        }
        return false;
    }

    function triggerScoreEffect() {
        for(let i=0; i<30; i++) {
            particles.push({
                x: hoop.x + hoop.width/2,
                y: hoop.y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 1) * 10,
                life: 1.0,
                color: ['#4285F4', '#EA4335', '#FBBC05', '#34A853'][Math.floor(Math.random() * 4)]
            });
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += GRAVITY * 0.5;
            p.life -= 0.02;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function update() {
        if (ball.isActive) {
            ball.vy += GRAVITY;
            ball.vx *= AIR_RESISTANCE;
            ball.vy *= AIR_RESISTANCE;
            
            ball.x += ball.vx;
            ball.y += ball.vy;

            if (ball.y + ball.radius > canvas.height) {
                ball.y = canvas.height - ball.radius;
                ball.vy *= -FLOOR_DAMPENING;
                ball.vx *= FLOOR_DAMPENING;
            }
            if (ball.x - ball.radius < 0) {
                ball.x = ball.radius;
                ball.vx *= -BOUNCE_DAMPENING;
            }
            if (ball.x + ball.radius > canvas.width) {
                ball.x = canvas.width - ball.radius;
                ball.vx *= -BOUNCE_DAMPENING;
            }

            resolveCollision(ball.x, ball.y, ball.radius, backboard.x, backboard.y, backboard.width, backboard.height);

            let backRimX = hoop.x;
            let backRimY = hoop.y;
            let frontRimX = hoop.x + hoop.width;
            let frontRimY = hoop.y;

            resolvePointCollision(backRimX, backRimY);
            resolvePointCollision(frontRimX, frontRimY);

            let wasAbove = (ball.y - ball.vy) < hoop.y;
            let isBelow = ball.y >= hoop.y;
            let isBetween = ball.x > backRimX && ball.x < frontRimX;

            if (wasAbove && isBelow && isBetween && ball.vy > 0 && !ball.hasScored) {
                ball.hasScored = true;
                score++;
                scoreDisplay.innerText = score;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('bbd_highscore', highScore);
                    highScoreDisplay.innerText = `BEST: ${highScore}`;
                }
                triggerScoreEffect();
            }

            if (ball.hasScored || ball.y > canvas.height - ball.radius * 2) {
                 if (Math.abs(ball.vx) < 0.5 && Math.abs(ball.vy) < 0.5) {
                     ball.isActive = false; 
                     setTimeout(resetBall, 500);
                 }
            }
        }
        updateParticles();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (ball.isDragging) {
            ctx.beginPath();
            ctx.moveTo(ball.x, ball.y);
            let endX = ball.x + (dragStart.x - dragCurrent.x);
            let endY = ball.y + (dragStart.y - dragCurrent.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = "rgba(66, 133, 244, 0.5)"; 
            ctx.lineWidth = 4;
            ctx.setLineDash([5, 10]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.fillStyle = "#EA4335"; 
        ctx.fillRect(backboard.x, backboard.y, backboard.width, backboard.height);

        ctx.beginPath();
        ctx.arc(hoop.x, hoop.y, hoop.rimRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#FBBC05"; 
        ctx.fill();

        if (ball.isActive) {
            trail.push({x: ball.x, y: ball.y});
            if (trail.length > 20) trail.shift();
            
            if (trail.length > 0) {
                ctx.beginPath();
                ctx.moveTo(trail[0].x, trail[0].y);
                for(let i = 1; i < trail.length; i++) {
                    ctx.lineTo(trail[i].x, trail[i].y);
                }
                ctx.strokeStyle = "rgba(66, 133, 244, 0.3)";
                ctx.lineWidth = ball.radius;
                ctx.lineCap = "round";
                ctx.stroke();
            }
        } else {
            trail = [];
        }

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#4285F4"; 
        ctx.fill();
        ctx.strokeStyle = "#3367D6";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(hoop.x + hoop.width, hoop.y, hoop.rimRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#FBBC05"; 
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(hoop.x, hoop.y);
        ctx.lineTo(hoop.x + 20, hoop.y + 60);
        ctx.lineTo(hoop.x + hoop.width - 20, hoop.y + 60);
        ctx.lineTo(hoop.x + hoop.width, hoop.y);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        ctx.lineWidth = 2;
        ctx.stroke();

        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });
    }

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    loop();
};
