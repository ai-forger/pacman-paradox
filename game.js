// Pacman Paradox - Retro Time Loop Game
// A Pac-Man clone with a unique twist: your past movements become enemies!

class PacmanParadox {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start'; // start, playing, paused, gameOver

        // Game settings
        this.cellSize = 20;
        this.mazeWidth = 28;
        this.mazeHeight = 31;
        this.recordingTime = 25; // seconds to record before spawning clones (reduced for better pacing)

        // Game state
        this.score = 0;
        this.gameTime = 0;
        this.cloneCount = 0;
        this.isPaused = false;
        this.powerMode = false;
        this.powerModeTimer = 0;
        this.highScore = this.loadHighScore();

        // Movement recording
        this.movementHistory = [];
        this.recordingStartTime = 0;
        this.isRecording = true;

        // Game objects
        this.pacman = null;
        this.ghosts = [];
        this.cloneGhosts = [];
        this.dots = [];
        this.powerPellets = [];
        this.walls = [];

        // Input handling
        this.keys = {};
        this.touchStart = { x: 0, y: 0 };
        this.touchEnd = { x: 0, y: 0 };

        // Animation
        this.animationId = null;
        this.lastTime = 0;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createMaze();
        this.createPacman();
        this.createGhosts();
        this.createDots();
        this.createPowerPellets();
        this.showScreen('start');
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === 'Escape' && this.gameState === 'playing') {
                this.togglePause();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStart.x = touch.clientX;
            this.touchStart.y = touch.clientY;
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            this.touchEnd.x = touch.clientX;
            this.touchEnd.y = touch.clientY;
            this.handleSwipe();
        });

        // Button event listeners
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
        document.getElementById('resumeButton').addEventListener('click', () => this.togglePause());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        document.getElementById('pauseRestartButton').addEventListener('click', () => this.restartGame());
        document.getElementById('playAgainButton').addEventListener('click', () => this.restartGame());
        document.getElementById('mainMenuButton').addEventListener('click', () => this.showMainMenu());
    }

    handleSwipe() {
        const deltaX = this.touchEnd.x - this.touchStart.x;
        const deltaY = this.touchEnd.y - this.touchStart.y;
        const minSwipeDistance = 30;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    this.pacman.setDirection('right');
                } else {
                    this.pacman.setDirection('left');
                }
            }
        } else {
            if (Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) {
                    this.pacman.setDirection('down');
                } else {
                    this.pacman.setDirection('up');
                }
            }
        }
    }

    createMaze() {
        // Classic Pac-Man style maze layout
        this.walls = [];

        // Outer walls
        for (let x = 0; x < this.mazeWidth; x++) {
            this.walls.push({ x, y: 0 });
            this.walls.push({ x, y: this.mazeHeight - 1 });
        }
        for (let y = 0; y < this.mazeHeight; y++) {
            this.walls.push({ x: 0, y });
            this.walls.push({ x: this.mazeWidth - 1, y });
        }

        // Inner maze structure - more strategic layout
        const obstacles = [
            // Top left block
            { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 },
            { x: 4, y: 4 }, { x: 6, y: 4 },
            { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 },

            // Top right block
            { x: 21, y: 3 }, { x: 22, y: 3 }, { x: 23, y: 3 },
            { x: 21, y: 4 }, { x: 23, y: 4 },
            { x: 21, y: 5 }, { x: 22, y: 5 }, { x: 23, y: 5 },

            // Center left block
            { x: 8, y: 10 }, { x: 9, y: 10 }, { x: 10, y: 10 },
            { x: 8, y: 11 }, { x: 10, y: 11 },
            { x: 8, y: 12 }, { x: 9, y: 12 }, { x: 10, y: 12 },

            // Center right block
            { x: 17, y: 10 }, { x: 18, y: 10 }, { x: 19, y: 10 },
            { x: 17, y: 11 }, { x: 19, y: 11 },
            { x: 17, y: 12 }, { x: 18, y: 12 }, { x: 19, y: 12 },

            // Bottom left block
            { x: 4, y: 20 }, { x: 5, y: 20 }, { x: 6, y: 20 },
            { x: 4, y: 21 }, { x: 6, y: 21 },
            { x: 4, y: 22 }, { x: 5, y: 22 }, { x: 6, y: 22 },

            // Bottom right block
            { x: 21, y: 20 }, { x: 22, y: 20 }, { x: 23, y: 20 },
            { x: 21, y: 21 }, { x: 23, y: 21 },
            { x: 21, y: 22 }, { x: 22, y: 22 }, { x: 23, y: 22 },

            // Center corridor blockers
            { x: 13, y: 8 }, { x: 14, y: 8 },
            { x: 13, y: 9 }, { x: 14, y: 9 },
            { x: 13, y: 10 }, { x: 14, y: 10 },
            { x: 13, y: 11 }, { x: 14, y: 11 },
            { x: 13, y: 12 }, { x: 14, y: 12 },
            { x: 13, y: 13 }, { x: 14, y: 13 },
            { x: 13, y: 14 }, { x: 14, y: 14 },
            { x: 13, y: 15 }, { x: 14, y: 15 },
            { x: 13, y: 16 }, { x: 14, y: 16 },
            { x: 13, y: 17 }, { x: 14, y: 17 },
            { x: 13, y: 18 }, { x: 14, y: 18 },
            { x: 13, y: 19 }, { x: 14, y: 19 },
            { x: 13, y: 20 }, { x: 14, y: 20 },
            { x: 13, y: 21 }, { x: 14, y: 21 }
        ];

        obstacles.forEach(obs => this.walls.push(obs));
    }

    createPacman() {
        this.pacman = {
            x: 1,
            y: 1,
            direction: 'right',
            nextDirection: 'right',
            mouthAngle: 0,
            mouthDirection: 1,
            moveCounter: 0,
            moveSpeed: 0.15, // Movement speed (lower = faster)

            setDirection(dir) {
                this.nextDirection = dir;
            },

            update() {
                // Handle movement timing
                this.moveCounter += this.moveSpeed;
                if (this.moveCounter >= 1) {
                    this.moveCounter = 0;

                    // Try to change direction
                    if (this.canMove(this.nextDirection)) {
                        this.direction = this.nextDirection;
                    }

                    // Move in current direction
                    if (this.canMove(this.direction)) {
                        this.move(this.direction);
                    }
                }

                // Animate mouth
                this.mouthAngle += this.mouthDirection * 0.3;
                if (this.mouthAngle >= 0.5 || this.mouthAngle <= 0) {
                    this.mouthDirection *= -1;
                }
            },

            canMove(dir) {
                let newX = this.x;
                let newY = this.y;

                switch (dir) {
                    case 'up': newY--; break;
                    case 'down': newY++; break;
                    case 'left': newX--; break;
                    case 'right': newX++; break;
                }

                // Check boundaries
                if (newX < 0 || newX >= this.mazeWidth || newY < 0 || newY >= this.mazeHeight) {
                    return false;
                }

                // Check walls
                return !this.walls.some(wall => wall.x === newX && wall.y === newY);
            },

            move(dir) {
                switch (dir) {
                    case 'up': this.y--; break;
                    case 'down': this.y++; break;
                    case 'left': this.x--; break;
                    case 'right': this.x++; break;
                }

                // Wrap around edges (only for valid positions)
                if (this.x < 0) this.x = this.mazeWidth - 1;
                if (this.x >= this.mazeWidth) this.x = 0;
                if (this.y < 0) this.y = this.mazeHeight - 1;
                if (this.y >= this.mazeHeight) this.y = 0;
            },

            draw(ctx, cellSize) {
                ctx.save();
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();

                const centerX = (this.x + 0.5) * cellSize;
                const centerY = (this.y + 0.5) * cellSize;
                const radius = cellSize * 0.4;

                let startAngle = 0;
                let endAngle = Math.PI * 2;

                // Create mouth effect
                switch (this.direction) {
                    case 'right':
                        startAngle = this.mouthAngle;
                        endAngle = Math.PI * 2 - this.mouthAngle;
                        break;
                    case 'left':
                        startAngle = Math.PI + this.mouthAngle;
                        endAngle = Math.PI - this.mouthAngle;
                        break;
                    case 'up':
                        startAngle = Math.PI * 1.5 + this.mouthAngle;
                        endAngle = Math.PI * 0.5 - this.mouthAngle;
                        break;
                    case 'down':
                        startAngle = Math.PI * 0.5 + this.mouthAngle;
                        endAngle = Math.PI * 1.5 - this.mouthAngle;
                        break;
                }

                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.lineTo(centerX, centerY);
                ctx.fill();
                ctx.restore();
            }
        };

        // Add wall checking to pacman
        this.pacman.walls = this.walls;
    }

    createGhosts() {
        this.ghosts = [
            // First ghost (red) - bottom right
            {
                x: this.mazeWidth - 2,
                y: this.mazeHeight - 2,
                direction: 'left',
                color: '#ff0000',
                speed: 0.12,
                moveCounter: 0,

                update() {
                    this.moveCounter += this.speed;
                    if (this.moveCounter >= 1) {
                        this.moveCounter = 0;
                        this.moveRandomly();
                    }
                },

                moveRandomly() {
                    const directions = ['up', 'down', 'left', 'right'];
                    const validDirections = directions.filter(dir => this.canMove(dir));

                    if (validDirections.length > 0) {
                        // Prefer current direction if it's still valid
                        if (validDirections.includes(this.direction)) {
                            // Keep going in current direction and actually move
                            this.move(this.direction);
                            return;
                        }
                        // Otherwise pick a random valid direction and move
                        this.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
                        this.move(this.direction);
                    }
                },

                canMove(dir) {
                    let newX = this.x;
                    let newY = this.y;

                    switch (dir) {
                        case 'up': newY--; break;
                        case 'down': newY++; break;
                        case 'left': newX--; break;
                        case 'right': newX++; break;
                    }

                    // Check boundaries
                    if (newX < 0 || newX >= this.mazeWidth || newY < 0 || newY >= this.mazeHeight) {
                        return false;
                    }

                    return !this.walls.some(wall => wall.x === newX && wall.y === newY);
                },

                move(dir) {
                    switch (dir) {
                        case 'up': this.y--; break;
                        case 'down': this.y++; break;
                        case 'left': this.x--; break;
                        case 'right': this.x++; break;
                    }

                    // Wrap around edges (only for valid positions)
                    if (this.x < 0) this.x = this.mazeWidth - 1;
                    if (this.x >= this.mazeWidth) this.x = 0;
                    if (this.y < 0) this.y = this.mazeHeight - 1;
                    if (this.y >= this.mazeHeight) this.y = 0;
                },

                draw(ctx, cellSize) {
                    ctx.save();
                    ctx.fillStyle = this.color;

                    const centerX = (this.x + 0.5) * cellSize;
                    const centerY = (this.y + 0.5) * cellSize;
                    const radius = cellSize * 0.4;

                    // Ghost body
                    ctx.beginPath();
                    ctx.arc(centerX, centerY - radius * 0.3, radius, 0, Math.PI, true);
                    ctx.rect(centerX - radius, centerY - radius * 0.3, radius * 2, radius * 0.6);
                    ctx.fill();

                    // Ghost eyes
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
                    ctx.arc(centerX + radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#000000';
                    ctx.beginPath();
                    ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1, 0, Math.PI * 2);
                    ctx.arc(centerX + radius * 0.3, centerY - radius * 0.3, radius * 0.1, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.restore();
                }
            },

            // Second ghost (pink) - top left
            {
                x: 1,
                y: this.mazeHeight - 2,
                direction: 'right',
                color: '#ff69b4',
                speed: 0.10,
                moveCounter: 0,

                update() {
                    this.moveCounter += this.speed;
                    if (this.moveCounter >= 1) {
                        this.moveCounter = 0;
                        this.moveRandomly();
                    }
                },

                moveRandomly() {
                    const directions = ['up', 'down', 'left', 'right'];
                    const validDirections = directions.filter(dir => this.canMove(dir));

                    if (validDirections.length > 0) {
                        // Prefer current direction if it's still valid
                        if (validDirections.includes(this.direction)) {
                            // Keep going in current direction and actually move
                            this.move(this.direction);
                            return;
                        }
                        // Otherwise pick a random valid direction and move
                        this.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
                        this.move(this.direction);
                    }
                },

                canMove(dir) {
                    let newX = this.x;
                    let newY = this.y;

                    switch (dir) {
                        case 'up': newY--; break;
                        case 'down': newY++; break;
                        case 'left': newX--; break;
                        case 'right': newX++; break;
                    }

                    // Check boundaries
                    if (newX < 0 || newX >= this.mazeWidth || newY < 0 || newY >= this.mazeHeight) {
                        return false;
                    }

                    return !this.walls.some(wall => wall.x === newX && wall.y === newY);
                },

                move(dir) {
                    switch (dir) {
                        case 'up': this.y--; break;
                        case 'down': this.y++; break;
                        case 'left': this.x--; break;
                        case 'right': this.x++; break;
                    }

                    // Wrap around edges (only for valid positions)
                    if (this.x < 0) this.x = this.mazeWidth - 1;
                    if (this.x >= this.mazeWidth) this.x = 0;
                    if (this.y < 0) this.y = this.mazeHeight - 1;
                    if (this.y >= this.mazeHeight) this.y = 0;
                },

                draw(ctx, cellSize) {
                    ctx.save();
                    ctx.fillStyle = this.color;

                    const centerX = (this.x + 0.5) * cellSize;
                    const centerY = (this.y + 0.5) * cellSize;
                    const radius = cellSize * 0.4;

                    // Ghost body
                    ctx.beginPath();
                    ctx.arc(centerX, centerY - radius * 0.3, radius, 0, Math.PI, true);
                    ctx.rect(centerX - radius, centerY - radius * 0.3, radius * 2, radius * 0.6);
                    ctx.fill();

                    // Ghost eyes
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
                    ctx.arc(centerX + radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#000000';
                    ctx.beginPath();
                    ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1, 0, Math.PI * 2);
                    ctx.arc(centerX + radius * 0.3, centerY - radius * 0.3, radius * 0.1, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.restore();
                }
            }
        ];

        // Add wall checking and maze dimensions to ghosts
        this.ghosts.forEach(ghost => {
            ghost.walls = this.walls;
            ghost.mazeWidth = this.mazeWidth;
            ghost.mazeHeight = this.mazeHeight;
        });
    }

    createDots() {
        this.dots = [];
        for (let x = 1; x < this.mazeWidth - 1; x++) {
            for (let y = 1; y < this.mazeHeight - 1; y++) {
                // Don't place dots on walls or where pacman starts
                if (!this.walls.some(wall => wall.x === x && wall.y === y) &&
                    !(x === 1 && y === 1)) {
                    this.dots.push({ x, y });
                }
            }
        }
    }

    createPowerPellets() {
        this.powerPellets = [];
        // Place power pellets in strategic locations
        const powerPelletPositions = [
            { x: 2, y: 2 },
            { x: this.mazeWidth - 3, y: 2 },
            { x: 2, y: this.mazeHeight - 3 },
            { x: this.mazeWidth - 3, y: this.mazeHeight - 3 }
        ];

        powerPelletPositions.forEach(pos => {
            if (!this.walls.some(wall => wall.x === pos.x && wall.y === pos.y)) {
                this.powerPellets.push({ x: pos.x, y: pos.y, active: true });
            }
        });
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.gameTime = 0;
        this.cloneCount = 0;
        this.isRecording = true;
        this.recordingStartTime = Date.now();
        this.movementHistory = [];
        this.cloneGhosts = [];

        // Reset positions
        this.pacman.x = 1;
        this.pacman.y = 1;
        this.pacman.direction = 'right';
        this.pacman.nextDirection = 'right';

        // Reset ghost positions
        this.ghosts[0].x = this.mazeWidth - 2;
        this.ghosts[0].y = this.mazeHeight - 2;
        this.ghosts[1].x = 1;
        this.ghosts[1].y = this.mazeHeight - 2;

        this.createDots();
        this.createPowerPellets();
        this.updateHighScoreDisplay();

        this.showScreen('game');
        this.gameLoop();
    }

    activatePowerMode() {
        this.powerMode = true;
        this.powerModeTimer = 10; // 10 seconds of power mode
        this.flashScreen('#ffff00', 300);

        // Make ghosts vulnerable
        this.ghosts.forEach(ghost => {
            ghost.vulnerable = true;
            ghost.color = '#0000ff'; // Blue when vulnerable
        });

        this.cloneGhosts.forEach(clone => {
            clone.vulnerable = true;
            clone.color = '#0000ff'; // Blue when vulnerable
        });
    }

    updatePowerMode() {
        if (this.powerMode) {
            this.powerModeTimer -= 1 / 60; // Decrease by frame time
            if (this.powerModeTimer <= 0) {
                this.powerMode = false;

                // Restore ghost colors
                this.ghosts.forEach(ghost => {
                    ghost.vulnerable = false;
                    ghost.color = '#ff0000';
                });

                this.cloneGhosts.forEach(clone => {
                    clone.vulnerable = false;
                    clone.color = '#ff00ff';
                });
            }
        }
    }

    respawnGhost(ghost) {
        // Respawn ghost at original position based on which ghost it is
        if (ghost === this.ghosts[0]) {
            // First ghost (red) - bottom right
            ghost.x = this.mazeWidth - 2;
            ghost.y = this.mazeHeight - 2;
            ghost.color = '#ff0000';
        } else if (ghost === this.ghosts[1]) {
            // Second ghost (pink) - top left
            ghost.x = 1;
            ghost.y = this.mazeHeight - 2;
            ghost.color = '#ff69b4';
        }
        ghost.vulnerable = false;
    }

    removeCloneGhost(clone) {
        const index = this.cloneGhosts.indexOf(clone);
        if (index > -1) {
            this.cloneGhosts.splice(index, 1);
            this.cloneCount = Math.max(0, this.cloneCount - 1); // Ensure count doesn't go negative
        }
    }

    // Method to get active clone count
    getActiveCloneCount() {
        return this.cloneGhosts.filter(clone =>
            clone.historyIndex < clone.history.length || clone.history.length > 0
        ).length;
    }

    // Debug method to log clone status
    logCloneStatus() {
        console.log(`Total clones: ${this.cloneCount}`);
        console.log(`Active clones: ${this.getActiveCloneCount()}`);
        this.cloneGhosts.forEach((clone, index) => {
            console.log(`Clone ${index}: historyIndex=${clone.historyIndex}, historyLength=${clone.history.length}, active=${clone.historyIndex < clone.history.length}`);
        });
    }

    loadHighScore() {
        return localStorage.getItem('pacmanParadoxHighScore') || 0;
    }

    saveHighScore(score) {
        if (score > this.highScore) {
            this.highScore = score;
            localStorage.setItem('pacmanParadoxHighScore', this.highScore);
            return true;
        }
        return false;
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.isPaused = true;
            this.showScreen('pause');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.isPaused = false;
            this.showScreen('game');
            this.gameLoop();
        }
    }

    restartGame() {
        this.showScreen('game');
        this.startGame();
    }

    showMainMenu() {
        this.gameState = 'start';
        this.showScreen('start');
        this.updateHighScoreDisplay();
    }

    updateHighScoreDisplay() {
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
    }

    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        // Show requested screen
        document.getElementById(screenName + 'Screen').classList.remove('hidden');

        if (screenName === 'game') {
            this.gameState = 'playing';
        }
    }

    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing' || this.isPaused) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update game time
        this.gameTime += deltaTime / 1000;

        // Record movement if still recording
        if (this.isRecording) {
            this.recordMovement();

            // Check if recording time is up
            if (this.gameTime >= this.recordingTime) {
                this.spawnCloneGhost();
                this.isRecording = false;

                // Schedule next clone spawn for increased difficulty
                this.scheduleNextClone();
            }
        }

        // Update game objects
        this.update();

        // Check collisions
        this.checkCollisions();

        // Update power mode
        this.updatePowerMode();

        // Ensure all clones stay active
        this.ensureCloneActivity();

        // Render
        this.render();

        // Update UI
        this.updateUI();

        // Continue loop
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    recordMovement() {
        // Only record movement when Pac-Man actually moves to a new position
        const lastMove = this.movementHistory[this.movementHistory.length - 1];
        const currentPos = { x: this.pacman.x, y: this.pacman.y };

        // Only record if position changed or if it's the first move
        if (!lastMove || (lastMove.x !== currentPos.x || lastMove.y !== currentPos.y)) {
            this.movementHistory.push({
                x: this.pacman.x,
                y: this.pacman.y,
                direction: this.pacman.direction,
                time: this.gameTime
            });
        }
    }

    spawnCloneGhost() {
        this.cloneCount++;

        // Visual feedback - flash the screen briefly
        this.flashScreen('#ff00ff', 200);

        // Show spawn message
        this.showSpawnMessage();

        // Debug logging
        this.logCloneStatus();

        const clone = {
            x: 1,
            y: 1,
            direction: 'right',
            color: '#ff00ff',
            speed: 0.15,
            moveCounter: 0,
            historyIndex: 0,
            history: [...this.movementHistory],
            id: Date.now() + Math.random(), // Unique identifier for each clone

            update() {
                this.moveCounter += this.speed;
                if (this.moveCounter >= 1) {
                    this.moveCounter = 0;
                    this.replayMovement();
                }
            },

            replayMovement() {
                if (this.historyIndex < this.history.length) {
                    const move = this.history[this.historyIndex];
                    // Smooth movement to the recorded position
                    this.x = move.x;
                    this.y = move.y;
                    this.direction = move.direction;
                    this.historyIndex++;
                } else {
                    // Loop the movement when reaching the end
                    this.historyIndex = 0;
                }
            },

            draw(ctx, cellSize) {
                ctx.save();
                ctx.fillStyle = this.color;

                const centerX = (this.x + 0.5) * cellSize;
                const centerY = (this.y + 0.5) * cellSize;
                const radius = cellSize * 0.4;

                // Clone ghost with different appearance
                ctx.beginPath();
                ctx.arc(centerX, centerY - radius * 0.3, radius, 0, Math.PI, true);
                ctx.rect(centerX - radius, centerY - radius * 0.3, radius * 2, radius * 0.6);
                ctx.fill();

                // Clone eyes (different color)
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
                ctx.arc(centerX + radius * 0.3, centerY - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#ff00ff';
                ctx.beginPath();
                ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1, 0, Math.PI * 2);
                ctx.arc(centerX + radius * 0.3, centerY - radius * 0.3, radius * 0.1, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        };

        // Add wall checking and maze dimensions to clone
        clone.walls = this.walls;
        clone.mazeWidth = this.mazeWidth;
        clone.mazeHeight = this.mazeHeight;

        this.cloneGhosts.push(clone);
    }

    scheduleNextClone() {
        // Schedule next clone spawn for increased difficulty
        const nextSpawnTime = this.gameTime + Math.max(15, 30 - this.cloneCount * 2); // Faster spawning as more clones exist

        setTimeout(() => {
            if (this.gameState === 'playing' && !this.isPaused) {
                this.spawnCloneGhost();
                this.scheduleNextClone(); // Schedule the next one
            }
        }, (nextSpawnTime - this.gameTime) * 1000);
    }

    // Improved method to ensure all clones stay active
    ensureCloneActivity() {
        this.cloneGhosts.forEach((clone, index) => {
            // Ensure each clone has proper references
            if (!clone.walls) {
                clone.walls = this.walls;
                clone.mazeWidth = this.mazeWidth;
                clone.mazeHeight = this.mazeHeight;
            }

            // Reset any stuck clones
            if (clone.historyIndex >= clone.history.length) {
                clone.historyIndex = 0; // Loop the movement
            }
        });
    }

    showSpawnMessage() {
        // Create a temporary spawn message
        const message = document.createElement('div');
        message.textContent = 'CLONE SPAWNED!';
        message.style.position = 'fixed';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.color = '#ff00ff';
        message.style.fontSize = '2rem';
        message.style.fontFamily = 'Press Start 2P, monospace';
        message.style.textShadow = '0 0 20px #ff00ff';
        message.style.zIndex = '1001';
        message.style.pointerEvents = 'none';

        document.body.appendChild(message);

        // Remove after 2 seconds
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, 2000);
    }

    update() {
        // Handle input
        if (this.keys['ArrowUp']) this.pacman.setDirection('up');
        if (this.keys['ArrowDown']) this.pacman.setDirection('down');
        if (this.keys['ArrowLeft']) this.pacman.setDirection('left');
        if (this.keys['ArrowRight']) this.pacman.setDirection('right');

        // Update pacman
        this.pacman.update();

        // Update ghosts
        this.ghosts.forEach(ghost => ghost.update());

        // Update clone ghosts
        this.cloneGhosts.forEach(clone => clone.update());
    }

    checkCollisions() {
        // Check dot collection
        this.dots = this.dots.filter(dot => {
            if (this.pacman.x === dot.x && this.pacman.y === dot.y) {
                this.score += 10;
                return false; // Remove dot
            }
            return true;
        });

        // Check power pellet collection
        this.powerPellets = this.powerPellets.filter(pellet => {
            if (pellet.active && this.pacman.x === pellet.x && this.pacman.y === pellet.y) {
                this.activatePowerMode();
                this.score += 50;
                return false; // Remove power pellet
            }
            return true;
        });

        // Check ghost collisions
        this.ghosts.forEach(ghost => {
            if (this.pacman.x === ghost.x && this.pacman.y === ghost.y) {
                if (this.powerMode) {
                    // Eat the ghost in power mode
                    this.score += 200;
                    this.respawnGhost(ghost);
                } else {
                    this.gameOver();
                }
            }
        });

        // Check clone ghost collisions
        this.cloneGhosts.forEach(clone => {
            if (this.pacman.x === clone.x && this.pacman.y === clone.y) {
                if (this.powerMode) {
                    // Eat the clone in power mode
                    this.score += 300;
                    this.removeCloneGhost(clone);
                } else {
                    this.gameOver();
                }
            }
        });

        // Check win condition
        if (this.dots.length === 0) {
            this.score += 1000; // Bonus for clearing all dots
            this.createDots(); // Reset dots for continuous play
        }
    }

    gameOver() {
        this.gameState = 'gameOver';

        // Check for new high score
        const isNewHighScore = this.saveHighScore(this.score);

        document.getElementById('finalScore').textContent = this.score;

        // Show high score message
        if (isNewHighScore) {
            document.querySelector('.paradoxMessage').textContent = 'NEW HIGH SCORE!';
            document.querySelector('.paradoxMessage').style.color = '#ffff00';
        } else {
            document.querySelector('.paradoxMessage').textContent = `High Score: ${this.highScore}`;
            document.querySelector('.paradoxMessage').style.color = '#ff00ff';
        }

        this.showScreen('gameOver');

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw walls
        this.ctx.fillStyle = '#0000ff';
        this.walls.forEach(wall => {
            this.ctx.fillRect(
                wall.x * this.cellSize,
                wall.y * this.cellSize,
                this.cellSize,
                this.cellSize
            );
        });

        // Draw dots
        this.ctx.fillStyle = '#ffff00';
        this.dots.forEach(dot => {
            this.ctx.beginPath();
            this.ctx.arc(
                (dot.x + 0.5) * this.cellSize,
                (dot.y + 0.5) * this.cellSize,
                this.cellSize * 0.1,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });

        // Draw power pellets
        this.ctx.fillStyle = '#ffff00';
        this.powerPellets.forEach(pellet => {
            if (pellet.active) {
                this.ctx.beginPath();
                this.ctx.arc(
                    (pellet.x + 0.5) * this.cellSize,
                    (pellet.y + 0.5) * this.cellSize,
                    this.cellSize * 0.2,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        });

        // Draw pacman
        this.pacman.draw(this.ctx, this.cellSize);

        // Draw ghosts
        this.ghosts.forEach(ghost => ghost.draw(this.ctx, this.cellSize));

        // Draw clone ghosts
        this.cloneGhosts.forEach(clone => clone.draw(this.ctx, this.cellSize));
    }

    updateUI() {
        document.getElementById('score').textContent = `SCORE: ${this.score}`;
        document.getElementById('time').textContent = `TIME: ${Math.floor(this.gameTime)}s`;
        document.getElementById('highScoreGame').textContent = `HIGH: ${this.highScore}`;

        // Show recording status or power mode
        if (this.powerMode) {
            const powerTimeLeft = Math.ceil(this.powerModeTimer);
            document.getElementById('clones').textContent = `POWER: ${powerTimeLeft}s`;
            document.getElementById('clones').style.color = '#ffff00';
        } else if (this.isRecording) {
            const timeLeft = Math.ceil(this.recordingTime - this.gameTime);
            document.getElementById('clones').textContent = `RECORDING: ${timeLeft}s`;
            document.getElementById('clones').style.color = '#00ffff';
        } else {
            const activeClones = this.getActiveCloneCount();
            document.getElementById('clones').textContent = `CLONES: ${activeClones}`;
            document.getElementById('clones').style.color = '#00ff00';
        }
    }

    flashScreen(color, duration) {
        // Create a flash overlay
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = '0';
        flash.style.left = '0';
        flash.style.width = '100%';
        flash.style.height = '100%';
        flash.style.backgroundColor = color;
        flash.style.opacity = '0.3';
        flash.style.pointerEvents = 'none';
        flash.style.zIndex = '1000';
        flash.style.transition = 'opacity 0.1s ease-out';

        document.body.appendChild(flash);

        // Fade out and remove
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(flash);
            }, 100);
        }, duration);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PacmanParadox();
});

// TODO: Future Enhancements
// - Add power pellets and energizer mechanics
// - Implement different ghost AI patterns
// - Add sound effects and background music
// - Create multiple maze layouts
// - Add high score system with localStorage
// - Implement different difficulty levels
// - Add particle effects for visual polish
// - Create a level progression system
// - Add achievements and unlockables
// - Implement a ghost house and bonus rounds
