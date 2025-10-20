// CTF Application JavaScript
class CTFApp {
    constructor() {
        this.dataset = null;
        this.currentChallenge = null;
        this.wrongAttempts = 0;
        this.maxAttempts = 3;
        this.leaderboard = this.loadLeaderboard();
        this.salt = 'ctf_salt_2025_secure_random_string'; // In production, this should be server-side
        
        this.init();
    }

    async init() {
        try {
            await this.loadDataset();
            this.setupEventListeners();
            this.renderPage();
        } catch (error) {
            console.error('Failed to initialize CTF app:', error);
            this.showError('Failed to load CTF data. Please refresh the page.');
        }
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

    setupEventListeners() {
        // Flag submission form
        const flagForm = document.getElementById('flag-form');
        if (flagForm) {
            flagForm.addEventListener('submit', (e) => this.handleFlagSubmission(e));
        }

        // Harmful content warning acknowledgment
        const acknowledgeBtn = document.getElementById('acknowledge-warning');
        if (acknowledgeBtn) {
            acknowledgeBtn.addEventListener('click', () => this.acknowledgeWarning());
        }

        // Challenge card clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.challenge-card')) {
                const challengeId = e.target.closest('.challenge-card').dataset.challengeId;
                if (challengeId) {
                    this.navigateToChallenge(challengeId);
                }
            }
        });
    }

    renderPage() {
        const path = window.location.pathname;
        
        if (path.includes('challenge.html')) {
            this.renderChallengePage();
        } else {
            this.renderIndexPage();
        }
    }

    renderIndexPage() {
        if (!this.dataset) return;

        const container = document.getElementById('challenges-container');
        if (!container) return;

        container.innerHTML = '';

        this.dataset.challenges.forEach(challenge => {
            const challengeCard = this.createChallengeCard(challenge);
            container.appendChild(challengeCard);
        });

        this.renderLeaderboard();
    }

    createChallengeCard(challenge) {
        const card = document.createElement('div');
        card.className = 'challenge-card';
        card.dataset.challengeId = challenge.id;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Challenge ${challenge.id}: ${challenge.title}`);

        const isCompleted = this.isChallengeCompleted(challenge.id);
        const completionStatus = isCompleted ? '✓ Completed' : '';

        card.innerHTML = `
            <div class="challenge-header">
                <h3 class="challenge-title">${challenge.title}</h3>
                <div class="challenge-meta">
                    <span class="difficulty ${challenge.difficulty}">${challenge.difficulty}</span>
                    <span class="type">${challenge.type}</span>
                </div>
            </div>
            <p class="challenge-description">${challenge.learning_objective}</p>
            <div class="challenge-tags">
                ${challenge.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            ${completionStatus ? `<div class="completion-status">${completionStatus}</div>` : ''}
        `;

        // Add keyboard support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.navigateToChallenge(challenge.id);
            }
        });

        return card;
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
        document.title = `${challenge.title} - COVID Health Misinformation CTF`;
        document.getElementById('challenge-title').textContent = challenge.title;

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
        document.getElementById('challenge-difficulty').textContent = challenge.difficulty;
        document.getElementById('challenge-difficulty').className = `difficulty ${challenge.difficulty}`;
        document.getElementById('challenge-type').textContent = challenge.type;
        document.getElementById('objective-text').textContent = challenge.learning_objective;
        document.getElementById('prompt-content').innerHTML = this.formatPromptText(challenge.prompt_text);

        // Render assets
        this.renderAssets(challenge.assets);

        // Render tags
        this.renderTags(challenge.tags);

        // Reset hints and attempts
        this.wrongAttempts = 0;
        this.renderHints(challenge.hints);

        // Show challenge content
        const content = document.getElementById('challenge-content');
        if (content) content.style.display = 'block';
    }

    formatPromptText(text) {
        // Convert line breaks to HTML
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
                        <h4>Video: ${asset}</h4>
                        <video controls>
                            <source src="assets/${asset}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    `;
                } else if (asset.endsWith('.png') || asset.endsWith('.jpg') || asset.endsWith('.jpeg') || asset.endsWith('.gif')) {
                    assetItem.innerHTML = `
                        <h4>Image: ${asset}</h4>
                        <img src="assets/${asset}" alt="Challenge asset: ${asset}" loading="lazy">
                    `;
                } else if (asset.endsWith('.pdf')) {
                    assetItem.innerHTML = `
                        <h4>Document: ${asset}</h4>
                        <p><a href="assets/${asset}" target="_blank" rel="noopener">Open PDF document</a></p>
                    `;
                } else if (asset.endsWith('.csv')) {
                    assetItem.innerHTML = `
                        <h4>Data File: ${asset}</h4>
                        <p><a href="assets/${asset}" target="_blank" rel="noopener">Download CSV file</a></p>
                    `;
                } else if (asset.endsWith('.ipynb')) {
                    assetItem.innerHTML = `
                        <h4>Jupyter Notebook: ${asset}</h4>
                        <p><a href="assets/${asset}" target="_blank" rel="noopener">Download notebook</a></p>
                    `;
                } else {
                    assetItem.innerHTML = `
                        <h4>File: ${asset}</h4>
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

    renderHints(hints) {
        const hintsContainer = document.getElementById('hints-container');
        if (!hintsContainer) return;

        hintsContainer.innerHTML = '';

        if (this.wrongAttempts === 0) {
            hintsContainer.innerHTML = '<p class="hint-instruction">Submit an incorrect answer to reveal hints</p>';
            return;
        }

        hints.forEach((hint, index) => {
            const hintElement = document.createElement('div');
            hintElement.className = `hint ${index < this.wrongAttempts ? 'revealed' : ''}`;
            hintElement.innerHTML = `
                <div class="hint-number">Hint ${index + 1}</div>
                <div class="hint-text">${hint}</div>
            `;
            hintsContainer.appendChild(hintElement);
        });
    }

    async handleFlagSubmission(event) {
        event.preventDefault();

        const flagInput = document.getElementById('flag-input');
        const resultDiv = document.getElementById('submission-result');
        
        if (!flagInput || !resultDiv) return;

        const submittedFlag = flagInput.value.trim();
        if (!submittedFlag) {
            this.showSubmissionResult('Please enter a flag', 'error');
            return;
        }

        const isCorrect = await this.verifyFlag(submittedFlag);
        
        if (isCorrect) {
            this.showSubmissionResult('🎉 Correct! Well done!', 'success');
            this.markChallengeCompleted(this.currentChallenge.id);
            flagInput.disabled = true;
            document.querySelector('#flag-form button').disabled = true;
        } else {
            this.wrongAttempts++;
            this.showSubmissionResult(`❌ Incorrect. Attempt ${this.wrongAttempts}/${this.maxAttempts}`, 'error');
            this.renderHints(this.currentChallenge.hints);
            
            if (this.wrongAttempts >= this.maxAttempts) {
                this.showSubmissionResult('❌ Maximum attempts reached. Check the hints above.', 'error');
            }
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

    showSubmissionResult(message, type) {
        const resultDiv = document.getElementById('submission-result');
        if (resultDiv) {
            resultDiv.className = `submission-result ${type}`;
            resultDiv.textContent = message;
            resultDiv.setAttribute('aria-live', 'assertive');
        }
    }

    markChallengeCompleted(challengeId) {
        const completed = this.getCompletedChallenges();
        if (!completed.includes(challengeId)) {
            completed.push(challengeId);
            localStorage.setItem('ctf_completed', JSON.stringify(completed));
            this.updateLeaderboard();
        }
    }

    isChallengeCompleted(challengeId) {
        const completed = this.getCompletedChallenges();
        return completed.includes(challengeId);
    }

    getCompletedChallenges() {
        const stored = localStorage.getItem('ctf_completed');
        return stored ? JSON.parse(stored) : [];
    }

    loadLeaderboard() {
        const stored = localStorage.getItem('ctf_leaderboard');
        return stored ? JSON.parse(stored) : [];
    }

    updateLeaderboard() {
        const completed = this.getCompletedChallenges();
        const score = completed.length;
        
        // For demo purposes, use a simple scoring system
        // In a real implementation, you'd want more sophisticated scoring
        const entry = {
            name: `Player_${Date.now()}`,
            score: score,
            timestamp: new Date().toISOString()
        };

        this.leaderboard.push(entry);
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 10); // Keep top 10

        localStorage.setItem('ctf_leaderboard', JSON.stringify(this.leaderboard));
        this.renderLeaderboard();
    }

    renderLeaderboard() {
        const container = document.getElementById('leaderboard-container');
        if (!container) return;

        if (this.leaderboard.length === 0) {
            container.innerHTML = '<p>Complete challenges to appear on the leaderboard!</p>';
            return;
        }

        container.innerHTML = `
            <div class="leaderboard">
                ${this.leaderboard.map((entry, index) => `
                    <div class="leaderboard-entry">
                        <span class="leaderboard-rank">#${index + 1}</span>
                        <span class="leaderboard-name">${entry.name}</span>
                        <span class="leaderboard-score">${entry.score} challenges</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    navigateToChallenge(challengeId) {
        window.location.href = `challenge.html?id=${challengeId}`;
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
    new CTFApp();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
    if (window.location.pathname.includes('challenge.html')) {
        new CTFApp();
    }
});
