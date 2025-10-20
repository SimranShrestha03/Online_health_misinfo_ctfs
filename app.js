// Cyber CTF Application v2 - Pro-Level Polish & Engagement
class CyberCTFApp {
    constructor() {
        this.dataset = null;
        this.currentChallenge = null;
        this.gameState = {
            playerName: '',
            currentChallengeId: 1,
            solvedChallenges: [],
            score: 0,
            hintsUsed: {},
            totalHintsUsed: 0,
            badges: [],
            streak: 0,
            lastPlayDate: null,
            sessionStats: {
                pointsEarned: 0,
                hintsUsed: 0,
                badgesEarned: [],
                timeBonuses: 0
            },
            settings: {
                timerEnabled: true,
                audioEnabled: false,
                reducedMotion: false
            }
        };
        this.wrongAttempts = 0;
        this.maxAttempts = 3;
        this.salt = 'ctf_salt_2025_secure_random_string';
        this.timerInterval = null;
        this.timerStartTime = null;
        this.timerDuration = 10 * 60 * 1000; // 10 minutes
        this.DEV = false; // Set to false for production
        
        // Badge definitions
        this.badgeDefinitions = {
            'first_blood': { name: 'First Blood', icon: '🩸', description: 'Solve your first challenge' },
            'streak_3': { name: 'Streak-3', icon: '🔥', description: 'Solve 3 challenges in a row' },
            'streak_5': { name: 'Streak-5', icon: '🔥🔥', description: 'Solve 5 challenges in a row' },
            'streak_10': { name: 'Streak-10', icon: '🔥🔥🔥', description: 'Solve 10 challenges in a row' },
            'no_hint_solve': { name: 'No-Hint Solve', icon: '🎯', description: 'Solve a challenge without using hints' },
            'perfect_round': { name: 'Perfect Round', icon: '⭐', description: 'Solve 3 challenges without mistakes' },
            'graduate_slayer': { name: 'Graduate Slayer', icon: '🎓', description: 'Solve all graduate-level challenges' },
            'time_master': { name: 'Time Master', icon: '⏱️', description: 'Solve 5 challenges with time bonus' },
            'hint_master': { name: 'Hint Master', icon: '💡', description: 'Use all 3 hints on a challenge' },
            'operation_complete': { name: 'Operation Complete', icon: '🎖️', description: 'Complete an entire operation' }
        };
        
        this.init();
    }

    async init() {
        try {
            await this.loadDataset();
            this.loadGameState();
            this.detectPreferences();
            this.setupEventListeners();
            this.renderPage();
        } catch (error) {
            console.error('Failed to initialize CTF app:', error);
            this.showError('Failed to load CTF data. Please refresh the page.');
        }
    }

    detectPreferences() {
        // Detect user preferences
        this.gameState.settings.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.gameState.settings.audioEnabled = localStorage.getItem('ctf_audio_enabled') === 'true';
    }

    async loadDataset() {
        try {
            const response = await fetch('ctf_dataset.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.dataset = await response.json();
        } catch (error) {
            console.error('Error loading dataset:', error);
            throw error;
        }
    }

    loadGameState() {
        const stored = localStorage.getItem('cyber_ctf_state');
        if (stored) {
            const parsed = JSON.parse(stored);
            this.gameState = { ...this.gameState, ...parsed };
            
            // Update streak based on last play date
            this.updateStreak();
        }
    }

    saveGameState() {
        localStorage.setItem('cyber_ctf_state', JSON.stringify(this.gameState));
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastPlayDate = this.gameState.lastPlayDate;
        
        if (!lastPlayDate) {
            this.gameState.streak = 0;
        } else if (lastPlayDate === today) {
            // Same day, keep current streak
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastPlayDate === yesterday.toDateString()) {
                // Consecutive day, increment streak
                this.gameState.streak++;
            } else {
                // Streak broken
                this.gameState.streak = 0;
            }
        }
    }

    setupEventListeners() {
        // Landing page events
        const startButton = document.getElementById('start-ctf');
        const continueButton = document.getElementById('continue-ctf');
        const resetButton = document.getElementById('reset-ctf');
        const newGamePlusButton = document.getElementById('new-game-plus');
        const playerNameInput = document.getElementById('player-name');
        const showLeaderboardLink = document.getElementById('show-leaderboard');
        const showBadgesLink = document.getElementById('show-badges');
        const closeBadgesButton = document.getElementById('close-badges');

        if (startButton) {
            startButton.addEventListener('click', () => this.startNewGame());
        }

        if (continueButton) {
            continueButton.addEventListener('click', () => this.continueGame());
        }

        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetGame());
        }

        if (newGamePlusButton) {
            newGamePlusButton.addEventListener('click', () => this.startNewGamePlus());
        }

        if (playerNameInput) {
            playerNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.startNewGame();
                }
            });
        }

        if (showLeaderboardLink) {
            showLeaderboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleLeaderboard();
            });
        }

        if (showBadgesLink) {
            showBadgesLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showBadgesDrawer();
            });
        }

        if (closeBadgesButton) {
            closeBadgesButton.addEventListener('click', () => this.hideBadgesDrawer());
        }

        // Challenge page events
        const flagForm = document.getElementById('flag-form');
        const acknowledgeBtn = document.getElementById('acknowledge-warning');
        const timerToggle = document.getElementById('timer-toggle');
        const audioToggle = document.getElementById('audio-toggle');
        const nextChallengeBtn = document.getElementById('next-challenge');
        const viewBadgesBtn = document.getElementById('view-badges');

        if (flagForm) {
            flagForm.addEventListener('submit', (e) => this.handleFlagSubmission(e));
        }

        if (acknowledgeBtn) {
            acknowledgeBtn.addEventListener('click', () => this.acknowledgeWarning());
        }

        if (timerToggle) {
            timerToggle.addEventListener('click', () => this.toggleTimer());
        }

        if (audioToggle) {
            audioToggle.addEventListener('click', () => this.toggleAudio());
        }

        if (nextChallengeBtn) {
            nextChallengeBtn.addEventListener('click', () => this.advanceToNextChallenge());
        }

        if (viewBadgesBtn) {
            viewBadgesBtn.addEventListener('click', () => this.showBadgesDrawer());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Check for instructor mode
        this.checkInstructorMode();
    }

    checkInstructorMode() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('instructor') === '1') {
            this.showInstructorMode();
        }
    }

    renderPage() {
        const path = window.location.pathname;
        
        if (path.includes('challenge.html')) {
            this.renderChallengePage();
        } else {
            this.renderLandingPage();
        }
    }

    renderLandingPage() {
        if (!this.dataset) return;

        // Show continue section if player has progress
        const hasProgress = this.gameState.solvedChallenges.length > 0 || this.gameState.currentChallengeId > 1;
        
        const playerSetup = document.getElementById('player-setup');
        const continueSection = document.getElementById('continue-section');
        const leaderboardSection = document.getElementById('leaderboard-section');
        const operationsPreview = document.getElementById('operations-preview');

        if (hasProgress) {
            if (playerSetup) playerSetup.style.display = 'none';
            if (continueSection) {
                continueSection.style.display = 'block';
                this.renderProgressOverview();
                this.renderBadgesPreview();
                this.renderSessionRecap();
            }
        } else {
            if (playerSetup) playerSetup.style.display = 'block';
            if (continueSection) continueSection.style.display = 'none';
        }

        this.renderOperationsPreview();
        this.renderLeaderboard();
    }

    renderProgressOverview() {
        const currentOperation = this.getCurrentOperation();
        const currentChallenge = document.getElementById('current-challenge');
        const currentOperationEl = document.getElementById('current-operation');
        const currentScore = document.getElementById('current-score');
        const currentStreak = document.getElementById('current-streak');

        if (currentChallenge) currentChallenge.textContent = this.gameState.currentChallengeId;
        if (currentOperationEl) currentOperationEl.textContent = currentOperation;
        if (currentScore) currentScore.textContent = this.gameState.score;
        if (currentStreak) currentStreak.textContent = this.gameState.streak;
    }

    renderBadgesPreview() {
        const recentBadges = document.getElementById('recent-badges');
        if (!recentBadges) return;

        const recentBadgeIds = this.gameState.badges.slice(-3); // Show last 3 badges
        recentBadges.innerHTML = recentBadgeIds.map(badgeId => {
            const badge = this.badgeDefinitions[badgeId];
            if (!badge) return '';
            
            return `
                <div class="badge earned">
                    <span class="badge-icon">${badge.icon}</span>
                    <span>${badge.name}</span>
                </div>
            `;
        }).join('');
    }

    renderSessionRecap() {
        const sessionRecap = document.getElementById('session-recap');
        const recapStats = document.getElementById('recap-stats');
        
        if (!sessionRecap || !recapStats) return;

        const stats = this.gameState.sessionStats;
        if (stats.pointsEarned > 0 || stats.hintsUsed > 0 || stats.badgesEarned.length > 0) {
            sessionRecap.style.display = 'block';
            recapStats.innerHTML = `
                <div class="recap-stat">
                    <span class="recap-stat-label">Points</span>
                    <span class="recap-stat-value">+${stats.pointsEarned}</span>
                </div>
                <div class="recap-stat">
                    <span class="recap-stat-label">Hints</span>
                    <span class="recap-stat-value">${stats.hintsUsed}</span>
                </div>
                <div class="recap-stat">
                    <span class="recap-stat-label">Badges</span>
                    <span class="recap-stat-value">${stats.badgesEarned.length}</span>
                </div>
                <div class="recap-stat">
                    <span class="recap-stat-label">Time Bonus</span>
                    <span class="recap-stat-value">${stats.timeBonuses}</span>
                </div>
            `;
        } else {
            sessionRecap.style.display = 'none';
        }
    }

    renderOperationsPreview() {
        const operationsGrid = document.getElementById('operations-grid');
        if (!operationsGrid || !this.dataset) return;

        operationsGrid.innerHTML = this.dataset.meta.operations.map(operation => {
            const isCompleted = this.isOperationCompleted(operation.id);
            const isLocked = operation.id > this.getCurrentOperation();
            const status = isCompleted ? 'completed' : (isLocked ? 'locked' : '');
            
            return `
                <div class="operation-card ${status}">
                    <div class="operation-title">${operation.name}</div>
                    <div class="operation-description">${operation.description}</div>
                    <div class="operation-progress">
                        <span>${this.getOperationProgress(operation.id)}/5 challenges</span>
                        <span class="operation-status ${status}">${isCompleted ? 'COMPLETED' : (isLocked ? 'LOCKED' : 'IN PROGRESS')}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    getCurrentOperation() {
        const challenge = this.dataset.challenges.find(c => c.id === this.gameState.currentChallengeId);
        return challenge ? challenge.operation : 1;
    }

    isOperationCompleted(operationId) {
        const operationChallenges = this.dataset.meta.operations.find(op => op.id === operationId)?.challenges || [];
        return operationChallenges.every(challengeId => this.gameState.solvedChallenges.includes(challengeId));
    }

    getOperationProgress(operationId) {
        const operationChallenges = this.dataset.meta.operations.find(op => op.id === operationId)?.challenges || [];
        return operationChallenges.filter(challengeId => this.gameState.solvedChallenges.includes(challengeId)).length;
    }

    startNewGame() {
        const playerNameInput = document.getElementById('player-name');
        const playerName = playerNameInput ? playerNameInput.value.trim() : 'Agent_Alpha';
        
        if (!playerName) {
            this.showToast('Please enter your callsign', 'warning');
            return;
        }

        // Reset game state
        this.gameState = {
            playerName: playerName,
            currentChallengeId: 1,
            solvedChallenges: [],
            score: 0,
            hintsUsed: {},
            totalHintsUsed: 0,
            badges: [],
            streak: 0,
            lastPlayDate: new Date().toDateString(),
            sessionStats: {
                pointsEarned: 0,
                hintsUsed: 0,
                badgesEarned: [],
                timeBonuses: 0
            },
            settings: this.gameState.settings
        };

        this.saveGameState();
        this.navigateToChallenge(1);
    }

    startNewGamePlus() {
        if (confirm('Start New Game+ with reshuffled challenges and stricter hint costs?')) {
            // Reset but keep some progress
            this.gameState.currentChallengeId = 1;
            this.gameState.solvedChallenges = [];
            this.gameState.score = 0;
            this.gameState.hintsUsed = {};
            this.gameState.totalHintsUsed = 0;
            this.gameState.badges = [];
            this.gameState.sessionStats = {
                pointsEarned: 0,
                hintsUsed: 0,
                badgesEarned: [],
                timeBonuses: 0
            };
            
            this.saveGameState();
            this.navigateToChallenge(1);
        }
    }

    continueGame() {
        this.navigateToChallenge(this.gameState.currentChallengeId);
    }

    resetGame() {
        if (confirm('Are you sure you want to restart? This will reset all progress.')) {
            localStorage.removeItem('cyber_ctf_state');
            this.gameState = {
                playerName: '',
                currentChallengeId: 1,
                solvedChallenges: [],
                score: 0,
                hintsUsed: {},
                totalHintsUsed: 0,
                badges: [],
                streak: 0,
                lastPlayDate: null,
                sessionStats: {
                    pointsEarned: 0,
                    hintsUsed: 0,
                    badgesEarned: [],
                    timeBonuses: 0
                },
                settings: this.gameState.settings
            };
            this.renderLandingPage();
        }
    }

    navigateToChallenge(challengeId) {
        window.location.href = `challenge.html?id=${challengeId}`;
    }

    renderChallengePage() {
        const urlParams = new URLSearchParams(window.location.search);
        const challengeId = parseInt(urlParams.get('id'));

        if (!challengeId || !this.dataset) {
            this.showError('Invalid challenge ID');
            return;
        }

        const challenge = this.dataset.challenges.find(c => c.id === challengeId);
        if (!challenge) {
            this.showError('Challenge not found');
            return;
        }

        this.currentChallenge = challenge;
        this.renderChallenge(challenge);
    }

    renderChallenge(challenge) {
        // Update page title
        document.title = `${challenge.title} - Health Misinformation CTF`;

        // Update header info
        document.getElementById('header-player-name').textContent = this.gameState.playerName;
        document.getElementById('header-score').textContent = `${this.gameState.score} pts`;
        document.getElementById('header-streak').textContent = `🔥 ${this.gameState.streak}`;
        document.getElementById('challenge-difficulty').textContent = challenge.difficulty;
        document.getElementById('challenge-difficulty').className = `difficulty-badge ${challenge.difficulty}`;
        document.getElementById('challenge-points').textContent = `${challenge.points} pts`;

        // Update progress
        const currentOperation = challenge.operation;
        document.getElementById('current-operation').textContent = currentOperation;
        document.getElementById('progress-current').textContent = challenge.id;
        document.getElementById('progress-total').textContent = this.dataset.challenges.length;
        
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progress = (challenge.id / this.dataset.challenges.length) * 100;
            progressFill.style.width = `${progress}%`;
        }

        // Show harmful content warning if needed
        if (challenge.safety === 'HARMFUL_CONTENT') {
            this.showHarmfulContentWarning();
            return;
        }

        // Render challenge content
        this.renderChallengeContent(challenge);
    }

    showHarmfulContentWarning() {
        const warning = document.getElementById('harmful-content-warning');
        const content = document.getElementById('challenge-content');
        
        if (warning) warning.style.display = 'block';
        if (content) content.style.display = 'none';
    }

    acknowledgeWarning() {
        const warning = document.getElementById('harmful-content-warning');
        const content = document.getElementById('challenge-content');
        
        if (warning) warning.style.display = 'none';
        if (content) content.style.display = 'block';
        
        this.renderChallengeContent(this.currentChallenge);
    }

    renderChallengeContent(challenge) {
        // Hide loading state
        const loading = document.getElementById('loading-state');
        if (loading) loading.style.display = 'none';

        // Update challenge info
        document.getElementById('challenge-title').textContent = challenge.title;
        document.getElementById('challenge-type').textContent = challenge.type;
        document.getElementById('objective-text').textContent = challenge.learning_objective;
        document.getElementById('prompt-content').innerHTML = this.formatPromptText(challenge.prompt_text);

        // Render assets
        this.renderAssets(challenge.assets);

        // Render tags
        this.renderTags(challenge.tags);

        // Reset hints and attempts
        this.wrongAttempts = 0;
        this.renderHints(challenge.hints, challenge.id);

        // Start timer if enabled
        if (this.gameState.settings.timerEnabled) {
            this.startTimer();
        }

        // Show challenge content
        const content = document.getElementById('challenge-content');
        if (content) content.style.display = 'block';
    }

    formatPromptText(text) {
        return text.replace(/\n/g, '<br>');
    }

    renderAssets(assets) {
        const assetsSection = document.getElementById('assets-section');
        const assetsContainer = document.getElementById('assets-container');

        if (!assets || assets.length === 0) {
            if (assetsSection) assetsSection.style.display = 'none';
            return;
        }

        if (assetsSection) assetsSection.style.display = 'block';
        if (assetsContainer) {
            assetsContainer.innerHTML = '';

            assets.forEach(asset => {
                const assetItem = document.createElement('div');
                assetItem.className = 'asset-item';

                if (asset.endsWith('.mp4') || asset.endsWith('.mov') || asset.endsWith('.avi')) {
                    assetItem.innerHTML = `
                        <h4>Video Intelligence: ${asset}</h4>
                        <video controls>
                            <source src="assets/${asset}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    `;
                } else if (asset.endsWith('.png') || asset.endsWith('.jpg') || asset.endsWith('.jpeg') || asset.endsWith('.gif')) {
                    assetItem.innerHTML = `
                        <h4>Visual Intelligence: ${asset}</h4>
                        <img src="assets/${asset}" alt="Challenge asset: ${asset}" loading="lazy">
                    `;
                } else if (asset.endsWith('.pdf')) {
                    assetItem.innerHTML = `
                        <h4>Document Intelligence: ${asset}</h4>
                        <p><a href="assets/${asset}" target="_blank" rel="noopener">Open PDF document</a></p>
                    `;
                } else if (asset.endsWith('.csv')) {
                    assetItem.innerHTML = `
                        <h4>Data Intelligence: ${asset}</h4>
                        <p><a href="assets/${asset}" target="_blank" rel="noopener">Download CSV file</a></p>
                    `;
                } else if (asset.endsWith('.ipynb')) {
                    assetItem.innerHTML = `
                        <h4>Code Intelligence: ${asset}</h4>
                        <p><a href="assets/${asset}" target="_blank" rel="noopener">Download notebook</a></p>
                    `;
                } else {
                    assetItem.innerHTML = `
                        <h4>File Intelligence: ${asset}</h4>
                        <p><a href="assets/${asset}" target="_blank" rel="noopener">Download file</a></p>
                    `;
                }

                assetsContainer.appendChild(assetItem);
            });
        }
    }

    renderTags(tags) {
        const tagsContainer = document.getElementById('tags-container');
        if (tagsContainer) {
            tagsContainer.innerHTML = tags.map(tag => 
                `<span class="tag">${tag}</span>`
            ).join('');
        }
    }

    renderHints(hints, challengeId) {
        const hintsContainer = document.getElementById('hints-container');
        const hintImpact = document.getElementById('hint-impact');
        
        if (!hintsContainer) return;

        const hintsUsed = this.gameState.hintsUsed[challengeId] || 0;
        const hintCosts = [0, -2, -5, -10];
        const nextHintCost = hintCosts[hintsUsed + 1] || 0;

        if (hintImpact) {
            hintImpact.textContent = `Next hint: ${nextHintCost} pts`;
        }

        hintsContainer.innerHTML = '';

        if (hintsUsed === 0) {
            hintsContainer.innerHTML = '<p class="hint-instruction">Submit an incorrect answer to reveal hints</p>';
            return;
        }

        hints.forEach((hint, index) => {
            const hintElement = document.createElement('div');
            hintElement.className = `hint ${index < hintsUsed ? 'revealed' : ''}`;
            hintElement.innerHTML = `
                <div class="hint-number">Intelligence Hint ${index + 1}</div>
                <div class="hint-text">${hint}</div>
            `;
            hintsContainer.appendChild(hintElement);
        });
    }

    startTimer() {
        this.timerStartTime = Date.now();
        const timerSection = document.getElementById('timer-section');
        const timerValue = document.getElementById('timer-value');
        
        if (timerSection) timerSection.style.display = 'block';
        
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.timerStartTime;
            const remaining = Math.max(0, this.timerDuration - elapsed);
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            
            if (timerValue) {
                timerValue.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            if (remaining === 0) {
                this.stopTimer();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    toggleTimer() {
        this.gameState.settings.timerEnabled = !this.gameState.settings.timerEnabled;
        const timerSection = document.getElementById('timer-section');
        const timerToggle = document.getElementById('timer-toggle');
        
        if (timerSection) {
            timerSection.style.display = this.gameState.settings.timerEnabled ? 'block' : 'none';
        }
        
        if (timerToggle) {
            timerToggle.textContent = this.gameState.settings.timerEnabled ? '⏱️ Timer' : '⏱️ Timer';
            timerToggle.classList.toggle('active', this.gameState.settings.timerEnabled);
        }
        
        if (this.gameState.settings.timerEnabled && this.currentChallenge) {
            this.startTimer();
        } else {
            this.stopTimer();
        }
    }

    toggleAudio() {
        this.gameState.settings.audioEnabled = !this.gameState.settings.audioEnabled;
        localStorage.setItem('ctf_audio_enabled', this.gameState.settings.audioEnabled);
        
        const audioToggle = document.getElementById('audio-toggle');
        if (audioToggle) {
            audioToggle.textContent = this.gameState.settings.audioEnabled ? '🔊 SFX' : '🔇 SFX';
            audioToggle.classList.toggle('active', this.gameState.settings.audioEnabled);
        }
    }

    playSound(type) {
        if (!this.gameState.settings.audioEnabled || this.gameState.settings.reducedMotion) return;
        
        // Simple audio feedback - in a real implementation, you'd use actual audio files
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'success') {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        } else if (type === 'error') {
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    async handleFlagSubmission(event) {
        event.preventDefault();

        const flagInput = document.getElementById('flag-input');
        const submitButton = document.getElementById('submit-button');
        const resultDiv = document.getElementById('submission-result');
        
        if (!flagInput || !resultDiv) return;

        // Rate limiting - lock submit button for 1 second
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'SUBMITTING...';
            setTimeout(() => {
                submitButton.disabled = false;
                submitButton.innerHTML = '<span class="button-text">SUBMIT REPORT</span><span class="button-glow"></span>';
            }, 1000);
        }

        const submittedFlag = flagInput.value.trim();
        if (!submittedFlag) {
            this.showSubmissionResult('Please enter intelligence report', 'error');
            return;
        }

        const isCorrect = await this.verifyFlag(submittedFlag);
        
        if (isCorrect) {
            this.handleCorrectSubmission();
        } else {
            this.handleIncorrectSubmission();
        }
    }

    async verifyFlag(submittedFlag) {
        if (!this.currentChallenge) return false;

        // Try hashed verification first
        if (this.currentChallenge.storedHash) {
            const hash = await this.hashFlag(submittedFlag);
            return hash === this.currentChallenge.storedHash;
        }

        // Fallback to plaintext comparison (for development)
        return submittedFlag === this.currentChallenge.flag;
    }

    async hashFlag(flag) {
        const encoder = new TextEncoder();
        const data = encoder.encode(this.salt + flag);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    handleCorrectSubmission() {
        // Update game state
        if (!this.gameState.solvedChallenges.includes(this.currentChallenge.id)) {
            this.gameState.solvedChallenges.push(this.currentChallenge.id);
            
            // Calculate points
            let pointsEarned = this.currentChallenge.points;
            
            // Deduct points for hints used
            const hintsUsed = this.gameState.hintsUsed[this.currentChallenge.id] || 0;
            const hintCosts = [0, -2, -5, -10];
            const totalHintCost = hintCosts[hintsUsed] || 0;
            pointsEarned += totalHintCost;
            
            // Time bonus
            let timeBonus = 0;
            if (this.gameState.settings.timerEnabled && this.timerStartTime) {
                const elapsed = Date.now() - this.timerStartTime;
                if (elapsed < this.timerDuration && hintsUsed === 0) {
                    timeBonus = Math.floor(pointsEarned * 0.1); // 10% bonus
                    this.gameState.sessionStats.timeBonuses++;
                }
            }
            
            pointsEarned += timeBonus;
            this.gameState.score += pointsEarned;
            this.gameState.sessionStats.pointsEarned += pointsEarned;
            this.gameState.sessionStats.hintsUsed += hintsUsed;
            
            // Ensure score doesn't go below 0
            this.gameState.score = Math.max(0, this.gameState.score);
            
            // Update streak
            this.gameState.streak++;
            this.gameState.lastPlayDate = new Date().toDateString();
        }

        // Check for badges
        this.checkBadges();

        this.saveGameState();
        this.updateLeaderboard();

        // Show success animation
        this.showSuccessAnimation();
        this.playSound('success');
    }

    handleIncorrectSubmission() {
        this.wrongAttempts++;
        
        // Show hint if this is the first wrong attempt
        if (this.wrongAttempts === 1) {
            this.revealHint();
        }
        
        // Show adaptive difficulty assist after 4 wrong attempts
        if (this.wrongAttempts >= 4) {
            this.showNudge();
        }

        const remainingAttempts = this.maxAttempts - this.wrongAttempts;
        if (remainingAttempts > 0) {
            this.showSubmissionResult(`❌ Intelligence rejected. ${remainingAttempts} attempts remaining.`, 'error');
        } else {
            this.showSubmissionResult('❌ Maximum attempts reached. Check the intelligence hints above.', 'error');
        }
        
        this.playSound('error');
    }

    revealHint() {
        const challengeId = this.currentChallenge.id;
        const currentHints = this.gameState.hintsUsed[challengeId] || 0;
        
        if (currentHints < 3) {
            this.gameState.hintsUsed[challengeId] = currentHints + 1;
            this.gameState.totalHintsUsed++;
            this.gameState.sessionStats.hintsUsed++;
            this.saveGameState();
            this.renderHints(this.currentChallenge.hints, challengeId);
        }
    }

    showNudge() {
        const nudgeSection = document.getElementById('nudge-section');
        const nudgeText = document.getElementById('nudge-text');
        
        if (nudgeSection && nudgeText) {
            // Provide process-based nudges based on challenge type
            const nudges = {
                'image': 'Consider checking the axes origin or base rate calculations.',
                'text': 'Look for logical fallacies and verify source credibility.',
                'video': 'Check for editing artifacts and verify the original source.',
                'datafile': 'Examine the methodology and look for statistical manipulation.',
                'mixed': 'Apply multiple verification techniques systematically.'
            };
            
            nudgeText.textContent = nudges[this.currentChallenge.type] || 'Consider the fundamental principles of the challenge type.';
            nudgeSection.style.display = 'block';
        }
    }

    checkBadges() {
        const newBadges = [];
        
        // First Blood
        if (this.gameState.solvedChallenges.length === 1 && !this.gameState.badges.includes('first_blood')) {
            newBadges.push('first_blood');
        }
        
        // Streak badges
        if (this.gameState.streak === 3 && !this.gameState.badges.includes('streak_3')) {
            newBadges.push('streak_3');
        }
        if (this.gameState.streak === 5 && !this.gameState.badges.includes('streak_5')) {
            newBadges.push('streak_5');
        }
        if (this.gameState.streak === 10 && !this.gameState.badges.includes('streak_10')) {
            newBadges.push('streak_10');
        }
        
        // No-hint solve
        const hintsUsed = this.gameState.hintsUsed[this.currentChallenge.id] || 0;
        if (hintsUsed === 0 && !this.gameState.badges.includes('no_hint_solve')) {
            newBadges.push('no_hint_solve');
        }
        
        // Perfect round (3 solves without mistakes)
        const recentChallenges = this.gameState.solvedChallenges.slice(-3);
        if (recentChallenges.length === 3) {
            const recentHints = recentChallenges.every(id => (this.gameState.hintsUsed[id] || 0) === 0);
            if (recentHints && !this.gameState.badges.includes('perfect_round')) {
                newBadges.push('perfect_round');
            }
        }
        
        // Graduate Slayer
        const graduateChallenges = this.dataset.challenges.filter(c => c.difficulty === 'graduate').map(c => c.id);
        const solvedGraduate = graduateChallenges.filter(id => this.gameState.solvedChallenges.includes(id));
        if (solvedGraduate.length === graduateChallenges.length && !this.gameState.badges.includes('graduate_slayer')) {
            newBadges.push('graduate_slayer');
        }
        
        // Time Master
        if (this.gameState.sessionStats.timeBonuses >= 5 && !this.gameState.badges.includes('time_master')) {
            newBadges.push('time_master');
        }
        
        // Hint Master
        if (hintsUsed === 3 && !this.gameState.badges.includes('hint_master')) {
            newBadges.push('hint_master');
        }
        
        // Operation Complete
        const currentOperation = this.currentChallenge.operation;
        if (this.isOperationCompleted(currentOperation) && !this.gameState.badges.includes('operation_complete')) {
            newBadges.push('operation_complete');
        }
        
        // Add new badges
        newBadges.forEach(badgeId => {
            this.gameState.badges.push(badgeId);
            this.gameState.sessionStats.badgesEarned.push(badgeId);
            this.showBadgeToast(badgeId);
        });
    }

    showBadgeToast(badgeId) {
        const badge = this.badgeDefinitions[badgeId];
        if (badge) {
            this.showToast(`🏆 ${badge.name} earned!`, 'success');
        }
    }

    showSubmissionResult(message, type) {
        const resultDiv = document.getElementById('submission-result');
        if (resultDiv) {
            resultDiv.className = `submission-result ${type}`;
            resultDiv.textContent = message;
            resultDiv.setAttribute('aria-live', 'assertive');
        }
    }

    showSuccessAnimation() {
        const successAnimation = document.getElementById('success-animation');
        const challengeContent = document.getElementById('challenge-content');
        const successMessage = document.getElementById('success-message');
        const successStats = document.getElementById('success-stats');
        const nextChallengeBtn = document.getElementById('next-challenge');
        const viewBadgesBtn = document.getElementById('view-badges');
        
        if (successAnimation) successAnimation.style.display = 'flex';
        if (challengeContent) challengeContent.style.display = 'none';
        
        // Update success message
        if (successMessage) {
            const nextChallengeId = this.currentChallenge.nextId;
            if (nextChallengeId) {
                successMessage.textContent = 'Unlocking next challenge...';
            } else {
                successMessage.textContent = 'Mission Complete! All challenges solved!';
            }
        }
        
        // Show success stats
        if (successStats) {
            const hintsUsed = this.gameState.hintsUsed[this.currentChallenge.id] || 0;
            const timeBonus = this.gameState.settings.timerEnabled && this.timerStartTime ? 
                (Date.now() - this.timerStartTime < this.timerDuration && hintsUsed === 0 ? '+10%' : '') : '';
            
            successStats.innerHTML = `
                <div class="success-stat">
                    <span class="stat-label">Points Earned</span>
                    <span class="stat-value">${this.currentChallenge.points}</span>
                </div>
                <div class="success-stat">
                    <span class="stat-label">Hints Used</span>
                    <span class="stat-value">${hintsUsed}</span>
                </div>
                <div class="success-stat">
                    <span class="stat-label">Time Bonus</span>
                    <span class="stat-value">${timeBonus}</span>
                </div>
            `;
        }
        
        // Show action buttons
        if (nextChallengeBtn) nextChallengeBtn.style.display = 'inline-block';
        if (viewBadgesBtn) viewBadgesBtn.style.display = 'inline-block';
        
        // Auto-advance after animation
        setTimeout(() => {
            this.advanceToNextChallenge();
        }, 3000);
    }

    advanceToNextChallenge() {
        const nextChallengeId = this.currentChallenge.nextId;
        
        if (nextChallengeId) {
            // Update current challenge
            this.gameState.currentChallengeId = nextChallengeId;
            this.saveGameState();
            
            // Navigate to next challenge
            this.navigateToChallenge(nextChallengeId);
        } else {
            // CTF completed!
            this.showCompletionMessage();
        }
    }

    showCompletionMessage() {
        const finalScore = this.gameState.score;
        const challengesSolved = this.gameState.solvedChallenges.length;
        const badgesEarned = this.gameState.badges.length;
        
        alert(`🎉 MISSION ACCOMPLISHED!\n\nFinal Score: ${finalScore} points\nChallenges Solved: ${challengesSolved}/25\nBadges Earned: ${badgesEarned}\nStreak: ${this.gameState.streak}\n\nCongratulations, Agent ${this.gameState.playerName}!`);
        window.location.href = 'index.html';
    }

    showBadgesDrawer() {
        const badgesDrawer = document.getElementById('badges-drawer');
        const badgesCollection = document.getElementById('badges-collection');
        
        if (badgesDrawer && badgesCollection) {
            badgesDrawer.classList.add('show');
            
            // Render all badges
            badgesCollection.innerHTML = Object.entries(this.badgeDefinitions).map(([badgeId, badge]) => {
                const isEarned = this.gameState.badges.includes(badgeId);
                return `
                    <div class="badge ${isEarned ? 'earned' : 'locked'}">
                        <span class="badge-icon">${badge.icon}</span>
                        <div class="badge-info">
                            <div class="badge-name">${badge.name}</div>
                            <div class="badge-description">${badge.description}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    hideBadgesDrawer() {
        const badgesDrawer = document.getElementById('badges-drawer');
        if (badgesDrawer) {
            badgesDrawer.classList.remove('show');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Hide toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    renderLeaderboard() {
        const container = document.getElementById('leaderboard-container');
        if (!container) return;

        // Get leaderboard from localStorage
        const leaderboard = this.getLeaderboard();
        
        if (leaderboard.length === 0) {
            container.innerHTML = '<p>No agents have completed missions yet.</p>';
            return;
        }

        container.innerHTML = leaderboard.map((entry, index) => `
            <div class="leaderboard-entry">
                <span class="leaderboard-rank">#${index + 1}</span>
                <span class="leaderboard-name">${entry.name}</span>
                <span class="leaderboard-score">${entry.score} pts</span>
            </div>
        `).join('');
    }

    getLeaderboard() {
        const stored = localStorage.getItem('cyber_ctf_leaderboard');
        return stored ? JSON.parse(stored) : [];
    }

    updateLeaderboard() {
        const leaderboard = this.getLeaderboard();
        
        // Add current player if they have a score
        if (this.gameState.score > 0) {
            const existingIndex = leaderboard.findIndex(entry => entry.name === this.gameState.playerName);
            const entry = {
                name: this.gameState.playerName,
                score: this.gameState.score,
                timestamp: new Date().toISOString()
            };
            
            if (existingIndex >= 0) {
                leaderboard[existingIndex] = entry;
            } else {
                leaderboard.push(entry);
            }
            
            // Sort by score (descending)
            leaderboard.sort((a, b) => b.score - a.score);
            
            // Keep only top 10
            const top10 = leaderboard.slice(0, 10);
            localStorage.setItem('cyber_ctf_leaderboard', JSON.stringify(top10));
        }
    }

    toggleLeaderboard() {
        const leaderboardSection = document.getElementById('leaderboard-section');
        if (leaderboardSection) {
            const isVisible = leaderboardSection.style.display !== 'none';
            leaderboardSection.style.display = isVisible ? 'none' : 'block';
        }
    }

    closeAllModals() {
        // Close all modals and drawers
        const badgesDrawer = document.getElementById('badges-drawer');
        if (badgesDrawer) badgesDrawer.classList.remove('show');
        
        const leaderboardSection = document.getElementById('leaderboard-section');
        if (leaderboardSection) leaderboardSection.style.display = 'none';
    }

    showInstructorMode() {
        // Add instructor banner
        const banner = document.createElement('div');
        banner.className = 'instructor-banner';
        banner.textContent = 'INSTRUCTOR MODE - Local Access Only';
        document.body.insertBefore(banner, document.body.firstChild);
        
        // Add instructor panel to main content
        const main = document.querySelector('main');
        if (main) {
            const instructorPanel = document.createElement('div');
            instructorPanel.className = 'instructor-panel';
            instructorPanel.innerHTML = `
                <h3>Instructor Panel</h3>
                <div class="challenge-list">
                    ${this.dataset.challenges.map(challenge => `
                        <div class="challenge-item">
                            <div class="challenge-item-header">
                                <div class="challenge-item-title">${challenge.title}</div>
                                <div class="challenge-item-meta">
                                    <span>${challenge.difficulty}</span>
                                    <span>${challenge.points} pts</span>
                                    <span>Op ${challenge.operation}</span>
                                </div>
                            </div>
                            <div class="challenge-item-content">
                                <p><strong>Objective:</strong> ${challenge.learning_objective}</p>
                                <p><strong>Explanation:</strong> ${challenge.explanation}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            main.appendChild(instructorPanel);
        }
    }

    showError(message) {
        const errorState = document.getElementById('error-state');
        const errorMessage = document.getElementById('error-message');
        const loadingState = document.getElementById('loading-state');
        
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'block';
        if (errorMessage) errorMessage.textContent = message;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CyberCTFApp();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
    if (window.location.pathname.includes('challenge.html')) {
        new CyberCTFApp();
    }
});