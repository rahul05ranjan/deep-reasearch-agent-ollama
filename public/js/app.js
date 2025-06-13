// Smart Research Assistant - Frontend Application
class SmartResearchApp {    constructor() {
        this.currentStep = 0;
        this.researchData = null;
        this.isConnected = false;
        this.startTime = null;
        this.timerInterval = null;
        this.thinkingMessages = [
            "Analyzing your research topic...",
            "Identifying key concepts and themes...",
            "Planning the research structure...",
            "Gathering comprehensive information...",
            "Processing AI-generated insights...",
            "Cross-referencing related topics...",
            "Synthesizing findings...",
            "Drawing meaningful connections...",
            "Generating actionable insights...",
            "Finalizing research report...",
            "Quality checking results..."
        ];
        this.currentThinkingIndex = 0;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Smart Research Assistant');
        
        // Bind event listeners
        this.bindEventListeners();
        
        // Check connection to backend
        await this.checkConnection();
        
        // Initialize the app state
        this.showWelcomeSection();
    }

    bindEventListeners() {
        // Navigation buttons
        document.getElementById('startResearchBtn').addEventListener('click', () => {
            this.showResearchForm();
        });

        document.getElementById('backBtn').addEventListener('click', () => {
            this.showWelcomeSection();
        });

        document.getElementById('newResearchBtn').addEventListener('click', () => {
            this.resetAndShowForm();
        });

        // Form submission
        document.getElementById('researchFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startResearch();
        });

        // Export functionality
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportResults();
        });

        // Sample topic buttons (we'll add these dynamically)
        this.addSampleTopics();
    }

    addSampleTopics() {
        const sampleTopics = [
            "Artificial Intelligence in Healthcare",
            "Quantum Computing Applications",
            "Climate Change Solutions",
            "Renewable Energy Technologies",
            "Blockchain in Supply Chain"
        ];

        // Add sample topic buttons to welcome section
        const welcomeContent = document.querySelector('.welcome-content');
        const samplesDiv = document.createElement('div');
        samplesDiv.className = 'sample-topics';
        samplesDiv.innerHTML = `
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 1rem;">Or try one of these topics:</p>
            <div class="sample-buttons">
                ${sampleTopics.map(topic => 
                    `<button class="btn btn-outline sample-btn" data-topic="${topic}">${topic}</button>`
                ).join('')}
            </div>
        `;

        // Add some styling
        const style = document.createElement('style');
        style.textContent = `
            .sample-topics {
                margin-top: 2rem;
            }
            .sample-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
                justify-content: center;
                margin-top: 1rem;
            }
            .sample-btn {
                font-size: 0.85rem;
                padding: 0.5rem 1rem;
                background: rgba(255,255,255,0.1);
                color: white;
                border: 1px solid rgba(255,255,255,0.3);
            }
            .sample-btn:hover {
                background: rgba(255,255,255,0.2);
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(style);

        welcomeContent.appendChild(samplesDiv);

        // Add click handlers for sample topics
        samplesDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('sample-btn')) {
                const topic = e.target.getAttribute('data-topic');
                document.getElementById('researchTopic').value = topic;
                this.showResearchForm();
            }
        });
    }    async checkConnection() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            
            this.isConnected = data.ollamaConnected;
            
            if (this.isConnected) {
                this.updateConnectionStatus(true, 'Connected to Ollama');
                this.showNotification('Successfully connected to research backend', 'success');
            } else {
                this.updateConnectionStatus(false, 'Ollama not available');
                this.showNotification('Backend connected but Ollama not available. Some features may be limited.', 'warning');
            }
        } catch (error) {
            this.isConnected = false;
            this.updateConnectionStatus(false, 'Connection failed');
            this.showNotification('Backend connection failed. Running in demo mode.', 'warning');
        }
    }

    updateConnectionStatus(connected, text) {
        const statusDot = document.getElementById('connectionStatus');
        const statusText = document.getElementById('statusText');
        
        statusDot.className = `status-dot ${connected ? 'connected' : 'disconnected'}`;
        statusText.textContent = text;
    }

    showWelcomeSection() {
        this.hideAllSections();
        document.getElementById('welcomeSection').classList.remove('hidden');
    }

    showResearchForm() {
        this.hideAllSections();
        document.getElementById('researchForm').classList.remove('hidden');
    }

    showResearchProgress() {
        this.hideAllSections();
        document.getElementById('researchProgress').classList.remove('hidden');
    }

    showResearchResults() {
        this.hideAllSections();
        document.getElementById('researchResults').classList.remove('hidden');
    }

    hideAllSections() {
        const sections = ['welcomeSection', 'researchForm', 'researchProgress', 'researchResults'];
        sections.forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });
    }

    async startResearch() {
        const formData = this.getFormData();
        
        if (!formData.topic.trim()) {
            this.showNotification('Please enter a research topic', 'error');
            return;
        }

        console.log('🔍 Starting research:', formData);
        
        this.showResearchProgress();
        await this.simulateResearch(formData);
    }

    getFormData() {
        return {
            topic: document.getElementById('researchTopic').value,
            mode: document.getElementById('researchMode').value,
            includeFollowups: document.getElementById('includeFollowups').checked,
            includeSynthesis: document.getElementById('includeSynthesis').checked
        };
    }    async simulateResearch(formData) {
        if (this.isConnected) {
            // Real API call to backend
            await this.performRealResearch(formData);
        } else {
            // Fallback to demo mode
            await this.performDemoResearch(formData);
        }
    }    async performRealResearch(formData) {
        this.startTime = Date.now();
        this.startTimer();
        this.startThinkingAnimation();

        const steps = [
            { 
                id: 'stepDetailed1', 
                name: 'Topic Analysis',
                substeps: [
                    'Parsing research query',
                    'Identifying key concepts', 
                    'Structuring research plan'
                ],
                progress: 25 
            },
            { 
                id: 'stepDetailed2', 
                name: 'Information Gathering',
                substeps: [
                    'Analyzing subtopic 1',
                    'Analyzing subtopic 2', 
                    'Analyzing subtopic 3'
                ],
                progress: 50 
            },
            { 
                id: 'stepDetailed3', 
                name: 'Synthesis & Analysis',
                substeps: [
                    'Identifying patterns',
                    'Drawing connections', 
                    'Generating insights'
                ],
                progress: 75 
            },
            { 
                id: 'stepDetailed4', 
                name: 'Final Assembly',
                substeps: [
                    'Formatting results',
                    'Generating follow-ups', 
                    'Quality assurance'
                ],
                progress: 100 
            }
        ];

        document.getElementById('progressTitle').textContent = `Researching: ${formData.topic}`;

        try {
            // Start the research request
            this.updateThinking("Connecting to AI research engine...");
            
            const response = await fetch('/api/research', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Simulate detailed progress while waiting for response
            let currentStep = 0;
            const progressInterval = setInterval(async () => {
                if (currentStep < steps.length) {
                    const step = steps[currentStep];
                    
                    // Update main progress
                    this.updateEnhancedProgress(step.progress, step.name);
                    this.setDetailedStepActive(step.id);
                    
                    // Animate substeps
                    await this.animateSubsteps(step.id, step.substeps);
                    
                    if (currentStep > 0) {
                        this.setDetailedStepCompleted(steps[currentStep - 1].id);
                    }
                    currentStep++;
                }
            }, 4000);

            // Wait for the actual response
            const results = await response.json();
            
            // Clear the progress interval
            clearInterval(progressInterval);
            this.stopTimer();
            this.stopThinkingAnimation();

            // Complete all steps
            steps.forEach((step) => {
                this.setDetailedStepCompleted(step.id);
            });
            
            this.updateEnhancedProgress(100, 'Complete');
            this.updateThinking("Research completed successfully!");

            // Convert API response to display format
            const displayResults = this.convertApiResults(results);
            
            // Delay before showing results for better UX
            setTimeout(() => {
                this.displayResults(displayResults);
            }, 1500);

        } catch (error) {
            console.error('Research API error:', error);
            this.stopTimer();
            this.stopThinkingAnimation();
            this.showNotification(`Research failed: ${error.message}`, 'error');
            
            // Fallback to demo mode
            this.showNotification('Falling back to demo mode...', 'info');
            await this.performDemoResearch(formData);
        }
    }    async performDemoResearch(formData) {
        this.startTime = Date.now();
        this.startTimer();
        this.startThinkingAnimation();

        const steps = [
            { 
                id: 'stepDetailed1', 
                name: 'Topic Analysis',
                substeps: [
                    'Parsing research query',
                    'Identifying key concepts', 
                    'Structuring research plan'
                ],
                progress: 25 
            },
            { 
                id: 'stepDetailed2', 
                name: 'Information Gathering',
                substeps: [
                    'Analyzing core concepts',
                    'Exploring applications', 
                    'Researching challenges'
                ],
                progress: 50 
            },
            { 
                id: 'stepDetailed3', 
                name: 'Synthesis & Analysis',
                substeps: [
                    'Identifying patterns',
                    'Drawing connections', 
                    'Generating insights'
                ],
                progress: 75 
            },
            { 
                id: 'stepDetailed4', 
                name: 'Final Assembly',
                substeps: [
                    'Formatting results',
                    'Generating follow-ups', 
                    'Quality assurance'
                ],
                progress: 100 
            }
        ];

        document.getElementById('progressTitle').textContent = `Researching: ${formData.topic}`;

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            
            // Update main progress
            this.updateEnhancedProgress(step.progress, step.name);
            this.setDetailedStepActive(step.id);
            
            // Animate substeps
            await this.animateSubsteps(step.id, step.substeps);
            
            // Simulate processing time
            await this.delay(2000 + Math.random() * 2000);
            
            this.setDetailedStepCompleted(step.id);
        }

        this.stopTimer();
        this.stopThinkingAnimation();
        this.updateThinking("Research completed successfully!");

        // Generate mock research results
        const results = await this.generateMockResults(formData);
        
        // Delay before showing results for better UX
        setTimeout(() => {
            this.displayResults(results);
        }, 1000);
    }

    convertApiResults(apiResults) {
        return {
            topic: apiResults.topic,
            mode: apiResults.mode,
            executiveSummary: apiResults.executiveSummary,
            topicAnalysis: this.formatTopicAnalysis(apiResults.analysis),
            researchFindings: this.formatResearchFindings(apiResults.researchResults),
            synthesis: apiResults.synthesis,
            followupQuestions: apiResults.followupQuestions,
            performanceStats: {
                totalTime: apiResults.performanceStats.totalTime,
                model: apiResults.performanceStats.model,
                timestamp: new Date().toLocaleString(),
                subtopicsResearched: apiResults.analysis.subtopics.length,
                wordsGenerated: this.estimateWordCount(apiResults)
            }
        };
    }

    formatTopicAnalysis(analysis) {
        return `
            <h4>Research Overview</h4>
            <p>${analysis.overview}</p>
            
            <h4>Key Subtopics Identified</h4>
            <ul>
                ${analysis.subtopics.map(subtopic => 
                    `<li><strong>${subtopic.title}:</strong> ${subtopic.description}</li>`
                ).join('')}
            </ul>
            
            <h4>Main Research Questions</h4>
            <ul>
                ${analysis.mainQuestions.map(question => `<li>${question}</li>`).join('')}
            </ul>
        `;
    }

    formatResearchFindings(researchResults) {
        return Object.entries(researchResults).map(([title, data]) => `
            <h4>${title}</h4>
            <p>${data.content}</p>
        `).join('');
    }

    estimateWordCount(apiResults) {
        let totalWords = 0;
        if (apiResults.executiveSummary) {
            totalWords += apiResults.executiveSummary.split(' ').length;
        }
        if (apiResults.researchResults) {
            Object.values(apiResults.researchResults).forEach(result => {
                totalWords += result.content.split(' ').length;
            });
        }
        if (apiResults.synthesis) {
            totalWords += apiResults.synthesis.split(' ').length;
        }
        return totalWords;
    }    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.startTime) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                document.getElementById('elapsedTime').textContent = `${elapsed}s`;
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    startThinkingAnimation() {
        this.currentThinkingIndex = 0;
        this.thinkingInterval = setInterval(() => {
            this.updateThinking(this.thinkingMessages[this.currentThinkingIndex]);
            this.currentThinkingIndex = (this.currentThinkingIndex + 1) % this.thinkingMessages.length;
        }, 3000);
    }

    stopThinkingAnimation() {
        if (this.thinkingInterval) {
            clearInterval(this.thinkingInterval);
            this.thinkingInterval = null;
        }
    }

    updateThinking(message) {
        document.getElementById('thinkingText').textContent = message;
    }

    updateEnhancedProgress(percentage, stepName) {
        const progressFill = document.getElementById('progressFillEnhanced');
        const progressSparkle = document.getElementById('progressSparkle');
        const currentStepEl = document.getElementById('currentStepName');
        const progressPercentageEl = document.getElementById('progressPercentage');
        
        progressFill.style.width = `${percentage}%`;
        progressSparkle.style.left = `${percentage}%`;
        
        if (percentage > 0) {
            progressSparkle.classList.add('active');
        }
        
        currentStepEl.textContent = stepName;
        progressPercentageEl.textContent = `${percentage}%`;
    }

    setDetailedStepActive(stepId) {
        // Remove active from all steps
        document.querySelectorAll('.step-detailed').forEach(step => {
            step.classList.remove('active');
        });
        
        // Add active to current step
        const stepEl = document.getElementById(stepId);
        if (stepEl) {
            stepEl.classList.add('active');
        }
    }

    setDetailedStepCompleted(stepId) {
        const stepEl = document.getElementById(stepId);
        if (stepEl) {
            stepEl.classList.remove('active');
            stepEl.classList.add('completed');
        }
    }

    async animateSubsteps(stepId, substeps) {
        const substepsContainer = document.getElementById(stepId.replace('stepDetailed', 'substeps'));
        if (!substepsContainer) return;

        // Update substeps content
        substepsContainer.innerHTML = substeps.map(step => 
            `<div class="substep">${step}</div>`
        ).join('');

        // Animate each substep
        const substepElements = substepsContainer.querySelectorAll('.substep');
        for (let i = 0; i < substepElements.length; i++) {
            await this.delay(800);
            substepElements[i].classList.add('completed');
        }
    }

    renderMarkdown(content) {
        if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
            // Configure marked for better output
            marked.setOptions({
                breaks: true,
                gfm: true
            });
            
            const rawMarkdown = marked.parse(content);
            return DOMPurify.sanitize(rawMarkdown);
        }
        
        // Fallback for basic markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }

    formatContentAsMarkdown(content) {
        const wrapper = document.createElement('div');
        wrapper.className = 'markdown-content';
        wrapper.innerHTML = this.renderMarkdown(content);
        return wrapper.outerHTML;
    }

    async generateMockResults(formData) {
        // This would normally be an API call to your backend
        // For demo purposes, we'll generate mock data
        
        const mockResults = {
            topic: formData.topic,
            mode: formData.mode,
            executiveSummary: this.generateExecutiveSummary(formData.topic),
            topicAnalysis: this.generateTopicAnalysis(formData.topic),
            researchFindings: this.generateResearchFindings(formData.topic),
            synthesis: formData.includeSynthesis ? this.generateSynthesis(formData.topic) : null,
            followupQuestions: formData.includeFollowups ? this.generateFollowupQuestions(formData.topic) : null,
            performanceStats: {
                totalTime: '2m 34s',
                model: 'qwen3:1.7b',
                timestamp: new Date().toLocaleString(),
                subtopicsResearched: 4,
                wordsGenerated: 1250
            }
        };

        return mockResults;
    }

    generateExecutiveSummary(topic) {
        return `This comprehensive research on "${topic}" reveals significant developments and emerging trends in the field. 

Key findings indicate substantial growth potential and transformative applications across multiple sectors. The analysis covers current state, technological advances, implementation challenges, and future outlook.

Critical success factors include stakeholder collaboration, regulatory frameworks, and continued innovation. The research identifies both opportunities and risks that organizations should consider when engaging with this domain.

Strategic recommendations focus on sustainable development, ethical considerations, and practical deployment strategies that can maximize benefits while minimizing potential negative impacts.`;
    }

    generateTopicAnalysis(topic) {
        const subtopics = this.getSubtopicsForTopic(topic);
        
        return `
            <h4>Research Overview</h4>
            <p>This analysis breaks down "${topic}" into key areas of investigation, providing a structured approach to understanding the complex landscape of this field.</p>
            
            <h4>Key Subtopics Identified</h4>
            <ul>
                ${subtopics.map(subtopic => `<li><strong>${subtopic.title}:</strong> ${subtopic.description}</li>`).join('')}
            </ul>
            
            <h4>Research Methodology</h4>
            <p>The analysis employs a systematic approach combining current literature, emerging trends, and practical applications to provide comprehensive insights into each subtopic area.</p>
        `;
    }

    generateResearchFindings(topic) {
        const subtopics = this.getSubtopicsForTopic(topic);
        
        return subtopics.map(subtopic => `
            <h4>${subtopic.title}</h4>
            <p>${subtopic.findings}</p>
        `).join('');
    }

    generateSynthesis(topic) {
        return `The research on "${topic}" reveals a complex ecosystem of interconnected factors driving innovation and adoption. 

<strong>Major Themes:</strong>
• Rapid technological advancement creating new possibilities
• Growing awareness of practical applications and benefits
• Need for balanced approaches addressing both opportunities and challenges
• Importance of stakeholder engagement and collaborative development

<strong>Key Insights:</strong>
The convergence of multiple technologies and methodologies is creating unprecedented opportunities for advancement. However, successful implementation requires careful consideration of ethical, practical, and regulatory factors.

<strong>Strategic Implications:</strong>
Organizations and individuals engaging with this field should focus on building adaptive capabilities, fostering innovation cultures, and maintaining awareness of evolving best practices and regulatory requirements.`;
    }

    generateFollowupQuestions(topic) {
        return [
            `What are the long-term implications of current developments in ${topic}?`,
            `How might regulatory changes impact the future of ${topic}?`,
            `What role will emerging technologies play in advancing ${topic}?`,
            `What are the potential ethical considerations surrounding ${topic}?`,
            `How can organizations best prepare for changes in ${topic}?`,
            `What international perspectives exist on ${topic}?`,
            `How might ${topic} evolve over the next decade?`
        ];
    }

    getSubtopicsForTopic(topic) {
        // Generate contextual subtopics based on the research topic
        const baseSubtopics = [
            {
                title: "Current State & Overview",
                description: "Present situation and foundational concepts",
                findings: "The current landscape shows rapid development with increasing adoption across various sectors. Key players are establishing market positions while emerging technologies continue to reshape possibilities."
            },
            {
                title: "Key Technologies & Methods",
                description: "Core technologies and methodological approaches",
                findings: "Several breakthrough technologies are converging to enable new capabilities. Methodological advances are improving efficiency and effectiveness while reducing implementation barriers."
            },
            {
                title: "Applications & Use Cases",
                description: "Practical applications and real-world implementations",
                findings: "Diverse applications are emerging across industries, with early adopters demonstrating significant benefits. Use cases range from operational improvements to entirely new business models."
            },
            {
                title: "Challenges & Considerations",
                description: "Key obstacles and important factors to consider",
                findings: "Implementation challenges include technical complexity, resource requirements, and regulatory considerations. Success factors involve strategic planning, stakeholder engagement, and adaptive management approaches."
            },
            {
                title: "Future Outlook & Trends",
                description: "Emerging trends and future developments",
                findings: "Future developments point toward increased sophistication and broader adoption. Emerging trends suggest continued innovation with focus on sustainability, accessibility, and practical value creation."
            }
        ];

        return baseSubtopics;
    }    displayResults(results) {
        // Update page title
        document.getElementById('resultsTitle').textContent = `Research Results: ${results.topic}`;

        // Display executive summary with markdown
        const executiveSummaryEl = document.getElementById('executiveSummary');
        executiveSummaryEl.innerHTML = this.formatContentAsMarkdown(results.executiveSummary);
        this.animateCardLoad(executiveSummaryEl.closest('.result-card'));

        // Display topic analysis with markdown
        const topicAnalysisEl = document.getElementById('topicAnalysis');
        topicAnalysisEl.innerHTML = this.formatContentAsMarkdown(results.topicAnalysis);
        this.animateCardLoad(topicAnalysisEl.closest('.result-card'));

        // Display research findings with markdown
        const researchFindingsEl = document.getElementById('researchFindings');
        researchFindingsEl.innerHTML = this.formatContentAsMarkdown(results.researchFindings);
        this.animateCardLoad(researchFindingsEl.closest('.result-card'));

        // Display synthesis if included
        if (results.synthesis) {
            const synthesisEl = document.getElementById('researchSynthesis');
            synthesisEl.innerHTML = this.formatContentAsMarkdown(results.synthesis);
            this.animateCardLoad(synthesisEl.closest('.result-card'));
        } else {
            document.getElementById('synthesisCard').classList.add('hidden');
        }

        // Display follow-up questions if included
        if (results.followupQuestions) {
            const questionsHtml = results.followupQuestions
                .map((q, i) => `**${i + 1}.** ${q}`)
                .join('\n\n');
            const followupEl = document.getElementById('followupQuestions');
            followupEl.innerHTML = this.formatContentAsMarkdown(questionsHtml);
            this.animateCardLoad(followupEl.closest('.result-card'));
        } else {
            document.getElementById('followupCard').classList.add('hidden');
        }

        // Display performance stats with enhanced formatting
        const statsHtml = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    <div class="stat-details">
                        <strong>Total Time</strong><br>
                        <span class="stat-highlight">${results.performanceStats.totalTime}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-microchip"></i></div>
                    <div class="stat-details">
                        <strong>AI Model</strong><br>
                        <span class="stat-highlight">${results.performanceStats.model}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-list"></i></div>
                    <div class="stat-details">
                        <strong>Subtopics</strong><br>
                        <span class="stat-highlight">${results.performanceStats.subtopicsResearched}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
                    <div class="stat-details">
                        <strong>Words Generated</strong><br>
                        <span class="stat-highlight">${results.performanceStats.wordsGenerated}</span>
                    </div>
                </div>
            </div>
            <div class="completion-badge">
                <i class="fas fa-check-circle"></i>
                Completed on ${results.performanceStats.timestamp}
            </div>
        `;
        document.getElementById('performanceStats').innerHTML = statsHtml;

        this.researchData = results;
        this.showResearchResults();
        this.showNotification('Research completed successfully!', 'success');
        
        // Add completion celebration effect
        this.celebrateCompletion();
    }

    animateCardLoad(cardElement) {
        if (cardElement) {
            cardElement.classList.add('loading');
            setTimeout(() => {
                cardElement.classList.remove('loading');
                cardElement.style.animation = 'slideInUp 0.6s ease-out';
            }, 500);
        }
    }

    celebrateCompletion() {
        // Create celebration particles
        const particles = [];
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'celebration-particle';
            particle.style.cssText = `
                position: fixed;
                width: 6px;
                height: 6px;
                background: ${['#00D2FF', '#3A7BD5', '#667EEA', '#00C851'][Math.floor(Math.random() * 4)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                left: ${Math.random() * window.innerWidth}px;
                top: ${window.innerHeight}px;
                animation: celebrationFloat ${2 + Math.random() * 3}s ease-out forwards;
            `;
            document.body.appendChild(particle);
            particles.push(particle);
        }

        // Clean up particles after animation
        setTimeout(() => {
            particles.forEach(particle => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            });
        }, 5000);
    }

    exportResults() {
        if (!this.researchData) {
            this.showNotification('No research data to export', 'error');
            return;
        }

        const exportData = {
            topic: this.researchData.topic,
            generatedOn: new Date().toISOString(),
            executiveSummary: this.researchData.executiveSummary,
            findings: this.researchData.researchFindings,
            synthesis: this.researchData.synthesis,
            followupQuestions: this.researchData.followupQuestions,
            stats: this.researchData.performanceStats
        };

        // Create and download JSON file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `research-${this.researchData.topic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Research data exported successfully', 'success');
    }

    resetAndShowForm() {
        // Reset form
        document.getElementById('researchFormElement').reset();
        
        // Reset progress
        this.updateProgress(0, 'Ready to start research...');
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
        document.getElementById('step1').classList.add('active');

        // Show cards that might have been hidden
        document.getElementById('synthesisCard').classList.remove('hidden');
        document.getElementById('followupCard').classList.remove('hidden');

        this.showResearchForm();
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const messageEl = notification.querySelector('.notification-message');
        const iconEl = notification.querySelector('.notification-icon');

        // Set message
        messageEl.textContent = message;

        // Set icon based on type
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        iconEl.className = `notification-icon ${icons[type] || icons.info}`;

        // Set type class
        notification.className = `notification ${type}`;

        // Show notification
        notification.classList.add('show');

        // Auto hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global functions for UI interactions
function showAbout() {
    alert('Smart Research Assistant v1.0\n\nAn AI-powered research tool built with Ollama.js\nCreated to help you discover comprehensive insights on any topic.');
}

function showHelp() {
    alert('How to use:\n\n1. Enter your research topic\n2. Select research mode\n3. Choose optional features\n4. Click "Start Research"\n5. Review and export results\n\nFor best results, be specific with your research topics.');
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.researchApp = new SmartResearchApp();
});
