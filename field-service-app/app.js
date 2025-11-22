// ====================================
// FIELD SERVICE PRO - ENHANCED APPLICATION
// With Voice Control, Time Tracking, Photos, Signatures, and More
// ====================================

// ============ Global State ============
const state = {
    currentPage: 'dashboard',
    selectedAppointment: null,
    filteredAppointments: [],
    filters: {
        status: 'all',
        technician: 'all',
        priority: 'all',
        search: ''
    },
    timeTracking: {
        active: false,
        appointmentId: null,
        startTime: null,
        elapsed: 0
    },
    voice: {
        recognition: null,
        isListening: false,
        activeField: null
    },
    photos: [],
    signature: null,
    notifications: [],
    fabMenuOpen: false
};

// ============ Voice Recognition System ============
class VoiceControl {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.setupVoiceRecognition();
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                this.handleVoiceCommand(transcript);
                this.stopListening();
            };

            this.recognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.stopListening();
                showToast('Voice recognition error. Please try again.', 'error');
            };

            this.recognition.onend = () => {
                this.stopListening();
            };
        } else {
            console.warn('Voice recognition not supported in this browser');
        }
    }

    startListening(targetField = null) {
        if (!this.recognition) {
            showToast('Voice recognition not supported in your browser', 'error');
            return;
        }

        state.voice.activeField = targetField;
        this.isListening = true;
        state.voice.isListening = true;

        // Show visual feedback
        showVoiceIndicator();

        try {
            this.recognition.start();
            showToast('🎤 Listening...', 'info');
        } catch (e) {
            console.error('Failed to start recognition:', e);
            this.stopListening();
        }
    }

    stopListening() {
        this.isListening = false;
        state.voice.isListening = false;
        hideVoiceIndicator();

        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Already stopped
            }
        }
    }

    handleVoiceCommand(transcript) {
        console.log('Voice command:', transcript);

        // If filling a specific field
        if (state.voice.activeField) {
            const field = document.querySelector(state.voice.activeField);
            if (field) {
                field.value = this.capitalizeFirst(transcript);
                showToast('✓ Text added', 'success');
            }
            state.voice.activeField = null;
            return;
        }

        // Navigation commands
        if (transcript.includes('go to') || transcript.includes('open') || transcript.includes('show')) {
            if (transcript.includes('dashboard')) {
                navigateToPage('dashboard');
                showToast('📊 Opening Dashboard', 'success');
            } else if (transcript.includes('appointment')) {
                navigateToPage('appointments');
                showToast('📅 Opening Appointments', 'success');
            } else if (transcript.includes('calendar')) {
                navigateToPage('calendar');
                showToast('📅 Opening Calendar', 'success');
            } else if (transcript.includes('work order')) {
                navigateToPage('work-orders');
                showToast('📋 Opening Work Orders', 'success');
            } else if (transcript.includes('client')) {
                navigateToPage('clients');
                showToast('🏢 Opening Clients', 'success');
            } else if (transcript.includes('team')) {
                navigateToPage('team');
                showToast('👥 Opening Team', 'success');
            } else if (transcript.includes('analytics')) {
                navigateToPage('analytics');
                showToast('📈 Opening Analytics', 'success');
            }
        }

        // Action commands
        else if (transcript.includes('new appointment') || transcript.includes('create appointment')) {
            openModal('newAppointmentModal');
            showToast('✨ Creating new appointment', 'success');
        }
        else if (transcript.includes('new work order') || transcript.includes('create work order')) {
            openModal('newWorkOrderModal');
            showToast('✨ Creating new work order', 'success');
        }
        else if (transcript.includes('clock in') || transcript.includes('start work')) {
            clockIn();
            showToast('⏱️ Clocked in', 'success');
        }
        else if (transcript.includes('clock out') || transcript.includes('end work')) {
            clockOut();
            showToast('⏱️ Clocked out', 'success');
        }
        else if (transcript.includes('take photo') || transcript.includes('upload photo')) {
            openModal('photoUploadModal');
            showToast('📸 Opening photo upload', 'success');
        }
        else if (transcript.includes('signature') || transcript.includes('sign')) {
            openModal('signatureModal');
            showToast('✍️ Opening signature pad', 'success');
        }

        // Status updates
        else if (transcript.includes('mark complete') || transcript.includes('complete appointment')) {
            if (state.selectedAppointment) {
                updateAppointmentStatus(state.selectedAppointment.id, 'completed');
                showToast('✅ Marked as completed', 'success');
            } else {
                showToast('No appointment selected', 'warning');
            }
        }
        else if (transcript.includes('start appointment') || transcript.includes('begin work')) {
            if (state.selectedAppointment) {
                updateAppointmentStatus(state.selectedAppointment.id, 'in-progress');
                showToast('▶️ Work started', 'success');
            } else {
                showToast('No appointment selected', 'warning');
            }
        }
        else if (transcript.includes('cancel appointment')) {
            if (state.selectedAppointment) {
                updateAppointmentStatus(state.selectedAppointment.id, 'cancelled');
                showToast('❌ Appointment cancelled', 'success');
            } else {
                showToast('No appointment selected', 'warning');
            }
        }

        // Search
        else if (transcript.includes('search for') || transcript.includes('find')) {
            const searchTerm = transcript.replace(/search for|find/gi, '').trim();
            if (searchTerm) {
                performGlobalSearch(searchTerm);
                showToast(`🔍 Searching for "${searchTerm}"`, 'info');
            }
        }

        // Help
        else if (transcript.includes('help') || transcript.includes('what can you do')) {
            showVoiceHelp();
        }

        else {
            showToast('Command not recognized. Say "help" for available commands.', 'warning');
        }
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize voice control
let voiceControl;

// ============ Initialize Application ============
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadDashboard();
    setupEventListeners();
    initializeCharts();
    setupVoiceControl();
    setupKeyboardShortcuts();
    loadNotifications();
});

function initializeApp() {
    applyFilters();
    renderAllAppointments();
    renderWorkOrders();
    renderClients();
    renderTeam();
    renderInventory();
}

function setupVoiceControl() {
    voiceControl = new VoiceControl();

    // Add voice button to FAB menu if not already there
    addVoiceButton();
}

function addVoiceButton() {
    const fabMenu = document.getElementById('fabMenu');
    if (fabMenu && !document.getElementById('voiceFabBtn')) {
        const voiceBtn = document.createElement('button');
        voiceBtn.id = 'voiceFabBtn';
        voiceBtn.className = 'fab-item';
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i><span>Voice Command</span>';
        voiceBtn.onclick = () => {
            toggleFabMenu();
            startVoiceCommand();
        };
        fabMenu.insertBefore(voiceBtn, fabMenu.firstChild);
    }
}

function startVoiceCommand() {
    if (voiceControl) {
        voiceControl.startListening();
    } else {
        showToast('Voice control not available', 'error');
    }
}

function showVoiceIndicator() {
    let indicator = document.getElementById('voiceIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'voiceIndicator';
        indicator.className = 'voice-indicator';
        indicator.innerHTML = `
            <div class="voice-indicator-content">
                <div class="voice-wave"></div>
                <div class="voice-wave"></div>
                <div class="voice-wave"></div>
                <i class="fas fa-microphone"></i>
                <p>Listening...</p>
            </div>
        `;
        document.body.appendChild(indicator);
    }
    indicator.classList.add('active');
}

function hideVoiceIndicator() {
    const indicator = document.getElementById('voiceIndicator');
    if (indicator) {
        indicator.classList.remove('active');
    }
}

function showVoiceHelp() {
    const helpContent = `
        <div class="voice-help-modal">
            <h3>🎤 Voice Commands</h3>
            <div class="voice-commands-list">
                <div class="command-group">
                    <h4>Navigation</h4>
                    <ul>
                        <li>"Go to dashboard"</li>
                        <li>"Open appointments"</li>
                        <li>"Show calendar"</li>
                        <li>"Open work orders"</li>
                        <li>"Go to clients"</li>
                        <li>"Show team"</li>
                    </ul>
                </div>
                <div class="command-group">
                    <h4>Actions</h4>
                    <ul>
                        <li>"New appointment"</li>
                        <li>"Create work order"</li>
                        <li>"Clock in"</li>
                        <li>"Clock out"</li>
                        <li>"Take photo"</li>
                        <li>"Signature"</li>
                    </ul>
                </div>
                <div class="command-group">
                    <h4>Status Updates</h4>
                    <ul>
                        <li>"Mark complete"</li>
                        <li>"Start appointment"</li>
                        <li>"Cancel appointment"</li>
                    </ul>
                </div>
                <div class="command-group">
                    <h4>Search</h4>
                    <ul>
                        <li>"Search for [term]"</li>
                        <li>"Find [client name]"</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    // Show in a modal or toast
    showToast(helpContent, 'info', 10000);
}

// ============ Time Tracking System ============
let timeTrackingInterval = null;

function clockIn() {
    if (state.timeTracking.active) {
        showToast('Already clocked in!', 'warning');
        return;
    }

    state.timeTracking.active = true;
    state.timeTracking.startTime = new Date();
    state.timeTracking.elapsed = 0;

    updateTimeTrackingUI();

    // Start interval
    timeTrackingInterval = setInterval(() => {
        state.timeTracking.elapsed = Math.floor((new Date() - state.timeTracking.startTime) / 1000);
        updateTimeTrackingUI();
    }, 1000);

    showToast('⏱️ Clocked in successfully', 'success');
    addNotification('Clocked in', 'Time tracking started', 'success');
}

function clockOut() {
    if (!state.timeTracking.active) {
        showToast('Not clocked in!', 'warning');
        return;
    }

    const duration = formatDuration(state.timeTracking.elapsed);

    state.timeTracking.active = false;
    state.timeTracking.appointmentId = null;

    if (timeTrackingInterval) {
        clearInterval(timeTrackingInterval);
        timeTrackingInterval = null;
    }

    updateTimeTrackingUI();

    showToast(`⏱️ Clocked out. Duration: ${duration}`, 'success');
    addNotification('Clocked out', `Total time: ${duration}`, 'info');
}

function updateTimeTrackingUI() {
    const widget = document.getElementById('activeTimeTracking');
    if (!widget) return;

    if (state.timeTracking.active) {
        const duration = formatDuration(state.timeTracking.elapsed);
        widget.innerHTML = `
            <div class="tracker-status active">
                <div class="tracker-time">${duration}</div>
                <div class="tracker-label">Currently working</div>
            </div>
            <button class="btn btn-danger btn-block btn-sm" onclick="clockOut()">
                <i class="fas fa-stop"></i> Clock Out
            </button>
        `;
    } else {
        widget.innerHTML = `
            <div class="tracker-status">Not clocked in</div>
            <button class="btn btn-success btn-block btn-sm" onclick="clockIn()">
                <i class="fas fa-play"></i> Clock In
            </button>
        `;
    }
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

function startTimeTracking() {
    openModal('timeTrackingModal');
    renderTimeTrackingModal();
}

function renderTimeTrackingModal() {
    const content = document.getElementById('timeTrackingContent');
    if (!content) return;

    content.innerHTML = `
        <div class="time-tracking-modal-content">
            <div class="time-display">
                <div class="time-value">${state.timeTracking.active ? formatDuration(state.timeTracking.elapsed) : '00:00:00'}</div>
                <div class="time-label">${state.timeTracking.active ? 'Time Elapsed' : 'Not Tracking'}</div>
            </div>

            ${state.timeTracking.active ? `
                <div class="tracking-info">
                    <p><strong>Started:</strong> ${new Date(state.timeTracking.startTime).toLocaleTimeString()}</p>
                    <p><strong>Status:</strong> <span class="badge" style="background: #10b981; color: white;">Active</span></p>
                </div>
                <button class="btn btn-danger btn-block" onclick="clockOut(); closeModal('timeTrackingModal')">
                    <i class="fas fa-stop-circle"></i> Stop Tracking
                </button>
            ` : `
                <button class="btn btn-success btn-block" onclick="clockIn(); closeModal('timeTrackingModal')">
                    <i class="fas fa-play-circle"></i> Start Tracking
                </button>
            `}
        </div>
    `;
}

// ============ Photo Upload System ============
function setupPhotoUpload() {
    const dropZone = document.getElementById('photoDropZone');
    const fileInput = document.getElementById('photoInput');

    if (!dropZone || !fileInput) return;

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        const files = Array.from(e.dataTransfer.files);
        handlePhotoFiles(files);
    });

    // File input
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handlePhotoFiles(files);
    });

    // Click to upload
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
}

function handlePhotoFiles(files) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
        showToast('Please select image files only', 'warning');
        return;
    }

    imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const photo = {
                id: Date.now() + Math.random(),
                url: e.target.result,
                name: file.name,
                size: file.size,
                timestamp: new Date()
            };

            state.photos.push(photo);
            renderPhotoPreview(photo);
        };
        reader.readAsDataURL(file);
    });

    showToast(`📸 ${imageFiles.length} photo(s) added`, 'success');
}

function renderPhotoPreview(photo) {
    const grid = document.getElementById('photoPreviewGrid');
    if (!grid) return;

    const photoCard = document.createElement('div');
    photoCard.className = 'photo-preview-card';
    photoCard.innerHTML = `
        <img src="${photo.url}" alt="${photo.name}">
        <div class="photo-overlay">
            <button class="btn-icon" onclick="removePhoto('${photo.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="photo-info">
            <span class="photo-name">${photo.name}</span>
            <span class="photo-size">${formatFileSize(photo.size)}</span>
        </div>
    `;

    grid.appendChild(photoCard);
}

function removePhoto(photoId) {
    state.photos = state.photos.filter(p => p.id != photoId);
    // Re-render grid
    const grid = document.getElementById('photoPreviewGrid');
    if (grid) {
        grid.innerHTML = '';
        state.photos.forEach(renderPhotoPreview);
    }
    showToast('Photo removed', 'info');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ============ Digital Signature System ============
let signaturePad = null;

function initSignaturePad() {
    const canvas = document.getElementById('signaturePad');
    if (!canvas) return;

    // Resize canvas
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 300;

    if (typeof SignaturePad !== 'undefined') {
        signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });
    } else {
        console.error('SignaturePad library not loaded');
    }
}

function clearSignature() {
    if (signaturePad) {
        signaturePad.clear();
        showToast('Signature cleared', 'info');
    }
}

function saveSignature() {
    if (!signaturePad) {
        showToast('Signature pad not initialized', 'error');
        return;
    }

    if (signaturePad.isEmpty()) {
        showToast('Please provide a signature first', 'warning');
        return;
    }

    const dataURL = signaturePad.toDataURL();
    state.signature = {
        data: dataURL,
        timestamp: new Date(),
        appointmentId: state.selectedAppointment?.id
    };

    showToast('✍️ Signature saved successfully', 'success');
    closeModal('signatureModal');

    if (state.selectedAppointment) {
        addNotification('Signature captured', `For appointment ${state.selectedAppointment.id}`, 'success');
    }
}

// ============ Keyboard Shortcuts ============
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+K or Cmd+K for global search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openGlobalSearch();
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            closeAllModals();
            closeGlobalSearch();
            closeNotifications();
        }

        // Ctrl+N for new appointment
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openModal('newAppointmentModal');
        }

        // Ctrl+/ for voice command
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            startVoiceCommand();
        }
    });
}

// ============ Global Search ============
function openGlobalSearch() {
    const overlay = document.getElementById('globalSearchOverlay');
    if (overlay) {
        overlay.classList.add('active');
        const input = document.getElementById('globalSearchInput');
        if (input) {
            input.focus();
            input.value = '';
        }
    }
}

function closeGlobalSearch() {
    const overlay = document.getElementById('globalSearchOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

function performGlobalSearch(query) {
    if (!query || query.length < 2) return;

    const results = {
        appointments: [],
        workOrders: [],
        clients: [],
        team: []
    };

    const searchLower = query.toLowerCase();

    // Search appointments
    results.appointments = demoData.appointments.filter(apt =>
        apt.id.toLowerCase().includes(searchLower) ||
        apt.clientName.toLowerCase().includes(searchLower) ||
        apt.description.toLowerCase().includes(searchLower) ||
        apt.serviceType.toLowerCase().includes(searchLower)
    );

    // Search work orders
    results.workOrders = demoData.workOrders.filter(wo =>
        wo.id.toLowerCase().includes(searchLower) ||
        wo.title.toLowerCase().includes(searchLower) ||
        wo.clientName.toLowerCase().includes(searchLower) ||
        wo.description.toLowerCase().includes(searchLower)
    );

    // Search clients
    results.clients = demoData.clients.filter(client =>
        client.name.toLowerCase().includes(searchLower) ||
        client.industry.toLowerCase().includes(searchLower) ||
        client.contactPerson.toLowerCase().includes(searchLower)
    );

    // Search team
    results.team = demoData.team.filter(member =>
        member.name.toLowerCase().includes(searchLower) ||
        member.role.toLowerCase().includes(searchLower) ||
        member.specializations.some(s => s.toLowerCase().includes(searchLower))
    );

    renderSearchResults(results, query);
}

function renderSearchResults(results, query) {
    const container = document.getElementById('globalSearchResults');
    if (!container) return;

    const totalResults = results.appointments.length + results.workOrders.length +
                        results.clients.length + results.team.length;

    if (totalResults === 0) {
        container.innerHTML = `
            <div class="search-no-results">
                <i class="fas fa-search"></i>
                <p>No results found for "${query}"</p>
            </div>
        `;
        return;
    }

    let html = `<div class="search-results-container">`;

    // Appointments
    if (results.appointments.length > 0) {
        html += `
            <div class="search-category">
                <h4><i class="fas fa-calendar-check"></i> Appointments (${results.appointments.length})</h4>
                <div class="search-items">
                    ${results.appointments.map(apt => `
                        <div class="search-result-item" onclick="viewAppointmentDetails('${apt.id}'); closeGlobalSearch();">
                            <div class="result-icon"><i class="fas fa-calendar"></i></div>
                            <div class="result-info">
                                <div class="result-title">${apt.id} - ${apt.clientName}</div>
                                <div class="result-subtitle">${apt.serviceType} • ${apt.date}</div>
                            </div>
                            <span class="status-badge ${apt.status}">${formatStatus(apt.status)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Work Orders
    if (results.workOrders.length > 0) {
        html += `
            <div class="search-category">
                <h4><i class="fas fa-clipboard-list"></i> Work Orders (${results.workOrders.length})</h4>
                <div class="search-items">
                    ${results.workOrders.map(wo => `
                        <div class="search-result-item" onclick="closeGlobalSearch();">
                            <div class="result-icon"><i class="fas fa-file-alt"></i></div>
                            <div class="result-info">
                                <div class="result-title">${wo.id} - ${wo.title}</div>
                                <div class="result-subtitle">${wo.clientName}</div>
                            </div>
                            <span class="status-badge ${wo.status}">${formatStatus(wo.status)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Clients
    if (results.clients.length > 0) {
        html += `
            <div class="search-category">
                <h4><i class="fas fa-building"></i> Clients (${results.clients.length})</h4>
                <div class="search-items">
                    ${results.clients.map(client => `
                        <div class="search-result-item" onclick="closeGlobalSearch(); navigateToPage('clients');">
                            <div class="result-icon"><i class="fas fa-building"></i></div>
                            <div class="result-info">
                                <div class="result-title">${client.name}</div>
                                <div class="result-subtitle">${client.industry} • ${client.contactPerson}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Team
    if (results.team.length > 0) {
        html += `
            <div class="search-category">
                <h4><i class="fas fa-users"></i> Team (${results.team.length})</h4>
                <div class="search-items">
                    ${results.team.map(member => `
                        <div class="search-result-item" onclick="closeGlobalSearch(); navigateToPage('team');">
                            <div class="result-icon"><i class="fas fa-user"></i></div>
                            <div class="result-info">
                                <div class="result-title">${member.name}</div>
                                <div class="result-subtitle">${member.role}</div>
                            </div>
                            <span class="team-status ${member.status}">${member.status}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;
}

// Setup global search input listener
setTimeout(() => {
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            performGlobalSearch(e.target.value);
        });
    }
}, 1000);

// ============ Notifications System ============
function loadNotifications() {
    // Initialize with demo notifications
    state.notifications = [
        { id: 1, title: 'New Appointment', message: 'APT008 scheduled for tomorrow', type: 'info', time: new Date(Date.now() - 300000), read: false },
        { id: 2, title: 'Work Order Complete', message: 'WO-2025-001 marked as complete', type: 'success', time: new Date(Date.now() - 1800000), read: false },
        { id: 3, title: 'High Priority', message: 'APT003 requires immediate attention', type: 'warning', time: new Date(Date.now() - 3600000), read: false },
        { id: 4, title: 'Client Feedback', message: 'New 5-star review from Acme Corp', type: 'success', time: new Date(Date.now() - 7200000), read: true },
        { id: 5, title: 'Team Update', message: 'Sarah Williams is now available', type: 'info', time: new Date(Date.now() - 10800000), read: true },
        { id: 6, title: 'Invoice Sent', message: 'Invoice #INV-2025-042 sent to client', type: 'info', time: new Date(Date.now() - 14400000), read: true },
        { id: 7, title: 'Parts Low Stock', message: 'HVAC filters running low', type: 'warning', time: new Date(Date.now() - 18000000), read: true }
    ];

    updateNotificationBadge();
}

function addNotification(title, message, type = 'info') {
    const notification = {
        id: Date.now(),
        title,
        message,
        type,
        time: new Date(),
        read: false
    };

    state.notifications.unshift(notification);
    updateNotificationBadge();
    renderNotifications();
}

function updateNotificationBadge() {
    const unreadCount = state.notifications.filter(n => !n.read).length;
    const badges = document.querySelectorAll('.nav-icon-btn .badge');
    badges.forEach(badge => {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    });
}

function toggleNotifications() {
    const panel = document.getElementById('notificationsPanel');
    if (panel) {
        panel.classList.toggle('active');
        if (panel.classList.contains('active')) {
            renderNotifications();
            markAllAsRead();
        }
    }
}

function closeNotifications() {
    const panel = document.getElementById('notificationsPanel');
    if (panel) {
        panel.classList.remove('active');
    }
}

function renderNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    if (state.notifications.length === 0) {
        list.innerHTML = `
            <div class="notifications-empty">
                <i class="fas fa-bell-slash"></i>
                <p>No notifications</p>
            </div>
        `;
        return;
    }

    list.innerHTML = state.notifications.map(notif => `
        <div class="notification-item ${notif.read ? 'read' : 'unread'}" onclick="markAsRead(${notif.id})">
            <div class="notification-icon ${notif.type}">
                <i class="fas fa-${getNotificationIcon(notif.type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notif.title}</div>
                <div class="notification-message">${notif.message}</div>
                <div class="notification-time">${formatTimeAgo(notif.time)}</div>
            </div>
            ${!notif.read ? '<div class="notification-dot"></div>' : ''}
        </div>
    `).join('');
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle',
        info: 'info-circle'
    };
    return icons[type] || 'bell';
}

function markAsRead(notifId) {
    const notif = state.notifications.find(n => n.id === notifId);
    if (notif) {
        notif.read = true;
        updateNotificationBadge();
        renderNotifications();
    }
}

function markAllAsRead() {
    setTimeout(() => {
        state.notifications.forEach(n => n.read = true);
        updateNotificationBadge();
    }, 2000);
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
}

// ============ Toast Notifications ============
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: 'check-circle',
        error: 'times-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };

    toast.innerHTML = `
        <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============ FAB Menu ============
function toggleFabMenu() {
    state.fabMenuOpen = !state.fabMenuOpen;
    const menu = document.getElementById('fabMenu');
    const fab = document.querySelector('.fab');

    if (menu) {
        menu.classList.toggle('active');
    }
    if (fab) {
        fab.style.transform = state.fabMenuOpen ? 'rotate(45deg)' : 'rotate(0deg)';
    }
}

// ============ Calendar View ============
let currentCalendarDate = new Date();

function renderCalendar() {
    const container = document.getElementById('calendar');
    if (!container) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let html = `
        <div class="calendar-header">
            <h2>${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        </div>
        <div class="calendar-grid">
            <div class="calendar-day-header">Sun</div>
            <div class="calendar-day-header">Mon</div>
            <div class="calendar-day-header">Tue</div>
            <div class="calendar-day-header">Wed</div>
            <div class="calendar-day-header">Thu</div>
            <div class="calendar-day-header">Fri</div>
            <div class="calendar-day-header">Sat</div>
    `;

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const appointments = demoData.appointments.filter(apt => apt.date === dateStr);
        const isToday = dateStr === new Date().toISOString().split('T')[0];

        html += `
            <div class="calendar-day ${isToday ? 'today' : ''}">
                <div class="day-number">${day}</div>
                ${appointments.length > 0 ? `
                    <div class="day-appointments">
                        ${appointments.slice(0, 3).map(apt => `
                            <div class="calendar-appointment ${apt.status}" onclick="viewAppointmentDetails('${apt.id}')">
                                <span class="apt-time">${apt.time}</span>
                                <span class="apt-client">${apt.clientName}</span>
                            </div>
                        `).join('')}
                        ${appointments.length > 3 ? `<div class="more-appointments">+${appointments.length - 3} more</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    html += '</div>';
    container.innerHTML = html;
}

function calendarToday() {
    currentCalendarDate = new Date();
    renderCalendar();
}

function calendarPrevMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
}

function calendarNextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
}

// ============ Analytics Dashboard ============
function renderAnalytics() {
    const container = document.getElementById('analyticsContent');
    if (!container) return;

    container.innerHTML = `
        <div class="analytics-stats-grid">
            <div class="stat-card-enhanced card-blue">
                <h3>Total Revenue</h3>
                <div class="stat-value">$156,890</div>
                <div class="stat-detail">This month</div>
            </div>
            <div class="stat-card-enhanced card-green">
                <h3>Completion Rate</h3>
                <div class="stat-value">94.5%</div>
                <div class="stat-detail">Above target</div>
            </div>
            <div class="stat-card-enhanced card-orange">
                <h3>Avg Response Time</h3>
                <div class="stat-value">2.4 hrs</div>
                <div class="stat-detail">-15% from last month</div>
            </div>
            <div class="stat-card-enhanced card-purple">
                <h3>Customer Satisfaction</h3>
                <div class="stat-value">4.8/5.0</div>
                <div class="stat-detail">Based on 234 reviews</div>
            </div>
        </div>

        <div class="analytics-charts">
            <div class="chart-card-large">
                <h3>Revenue Trend</h3>
                <canvas id="revenueChart"></canvas>
            </div>
            <div class="chart-card-large">
                <h3>Service Type Performance</h3>
                <canvas id="performanceChart"></canvas>
            </div>
        </div>
    `;

    // Initialize analytics charts
    initializeAnalyticsCharts();
}

function initializeAnalyticsCharts() {
    // Revenue chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx && typeof Chart !== 'undefined') {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Revenue ($)',
                    data: [45000, 52000, 48000, 61000, 58000, 67000, 71000, 69000, 75000, 82000, 78000, 85000],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Performance chart
    const performanceCtx = document.getElementById('performanceChart');
    if (performanceCtx && typeof Chart !== 'undefined') {
        new Chart(performanceCtx, {
            type: 'bar',
            data: {
                labels: ['Installation', 'Maintenance', 'Repair', 'Inspection', 'Emergency'],
                datasets: [{
                    label: 'Jobs Completed',
                    data: [45, 67, 52, 38, 28],
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#8b5cf6',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// ============ Inventory Management ============
function renderInventory() {
    const container = document.getElementById('inventoryList');
    if (!container) return;

    const inventoryItems = [
        { id: 1, name: 'HVAC Filter (16x20)', sku: 'HVF-1620', quantity: 45, minStock: 20, price: 12.99, category: 'Filters' },
        { id: 2, name: 'Thermostat Wire (50ft)', sku: 'THW-50', quantity: 12, minStock: 15, price: 24.99, category: 'Electrical' },
        { id: 3, name: 'Refrigerant R410A (25lb)', sku: 'REF-410', quantity: 8, minStock: 10, price: 189.99, category: 'Refrigerants' },
        { id: 4, name: 'Condensate Pump', sku: 'CDP-100', quantity: 6, minStock: 5, price: 67.99, category: 'Pumps' },
        { id: 5, name: 'Air Handler Motor', sku: 'AHM-750', quantity: 3, minStock: 2, price: 245.00, category: 'Motors' },
        { id: 6, name: 'Safety Goggles', sku: 'SAF-GOG', quantity: 28, minStock: 15, price: 8.99, category: 'Safety' },
        { id: 7, name: 'Work Gloves (Pair)', sku: 'GLV-MED', quantity: 34, minStock: 20, price: 6.49, category: 'Safety' },
        { id: 8, name: 'Duct Tape (Industrial)', sku: 'DCT-IND', quantity: 18, minStock: 10, price: 9.99, category: 'Supplies' }
    ];

    container.innerHTML = `
        <div class="inventory-grid">
            ${inventoryItems.map(item => `
                <div class="inventory-card ${item.quantity <= item.minStock ? 'low-stock' : ''}">
                    <div class="inventory-header">
                        <h4>${item.name}</h4>
                        ${item.quantity <= item.minStock ? '<span class="low-stock-badge">Low Stock</span>' : ''}
                    </div>
                    <div class="inventory-details">
                        <div class="inventory-row">
                            <span class="label">SKU:</span>
                            <span class="value">${item.sku}</span>
                        </div>
                        <div class="inventory-row">
                            <span class="label">Category:</span>
                            <span class="value">${item.category}</span>
                        </div>
                        <div class="inventory-row">
                            <span class="label">Price:</span>
                            <span class="value">$${item.price.toFixed(2)}</span>
                        </div>
                        <div class="inventory-row">
                            <span class="label">In Stock:</span>
                            <span class="value stock-quantity ${item.quantity <= item.minStock ? 'low' : ''}">${item.quantity}</span>
                        </div>
                        <div class="inventory-row">
                            <span class="label">Min Stock:</span>
                            <span class="value">${item.minStock}</span>
                        </div>
                    </div>
                    <div class="inventory-actions">
                        <button class="btn btn-sm btn-outline" onclick="adjustStock(${item.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="adjustStock(${item.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function adjustStock(itemId, change) {
    showToast(`Stock adjusted by ${change > 0 ? '+' : ''}${change}`, 'info');
    // In a real app, this would update the database
}

// ============ Invoice Generator ============
function generateInvoice(appointmentId) {
    const appointment = demoData.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    const client = demoData.clients.find(c => c.name === appointment.clientName);

    const invoiceData = {
        invoiceNumber: `INV-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString(),
        appointment: appointment,
        client: client,
        items: [
            { description: appointment.serviceType, quantity: 1, rate: 150.00, amount: 150.00 },
            { description: 'Labor (2 hours)', quantity: 2, rate: 75.00, amount: 150.00 },
            { description: 'Materials', quantity: 1, rate: 85.00, amount: 85.00 }
        ],
        subtotal: 385.00,
        tax: 38.50,
        total: 423.50
    };

    renderInvoice(invoiceData);
    openModal('invoiceModal');
}

function renderInvoice(data) {
    const content = document.getElementById('invoiceContent');
    if (!content) return;

    content.innerHTML = `
        <div class="invoice-template">
            <div class="invoice-header">
                <div class="invoice-logo">
                    <h1>FieldService Pro</h1>
                    <p>Professional Field Services</p>
                </div>
                <div class="invoice-info">
                    <h2>INVOICE</h2>
                    <p><strong>#${data.invoiceNumber}</strong></p>
                    <p>Date: ${data.date}</p>
                    <p>Due: ${data.dueDate}</p>
                </div>
            </div>

            <div class="invoice-parties">
                <div class="invoice-from">
                    <h4>From:</h4>
                    <p><strong>FieldService Pro</strong></p>
                    <p>123 Service Street</p>
                    <p>Business City, ST 12345</p>
                    <p>contact@fieldservicepro.com</p>
                </div>
                <div class="invoice-to">
                    <h4>Bill To:</h4>
                    <p><strong>${data.client?.name || data.appointment.clientName}</strong></p>
                    <p>${data.client?.address || data.appointment.clientAddress}</p>
                    <p>${data.client?.email || ''}</p>
                    <p>${data.client?.phone || ''}</p>
                </div>
            </div>

            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td>${item.quantity}</td>
                            <td>$${item.rate.toFixed(2)}</td>
                            <td>$${item.amount.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3">Subtotal</td>
                        <td>$${data.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3">Tax (10%)</td>
                        <td>$${data.tax.toFixed(2)}</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="3"><strong>Total</strong></td>
                        <td><strong>$${data.total.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>

            <div class="invoice-footer">
                <p><strong>Payment Terms:</strong> Net 30 days</p>
                <p><strong>Notes:</strong> Thank you for your business!</p>
            </div>
        </div>
    `;
}

function printInvoice() {
    window.print();
}

function downloadInvoice() {
    showToast('📄 Invoice download started', 'success');
    // In a real app, this would generate a PDF
    addNotification('Invoice Generated', 'PDF ready for download', 'success');
}

// ============ Modals ============
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');

        // Initialize special modals
        if (modalId === 'photoUploadModal') {
            setupPhotoUpload();
        } else if (modalId === 'signatureModal') {
            setTimeout(() => initSignaturePad(), 100);
        } else if (modalId === 'timeTrackingModal') {
            renderTimeTrackingModal();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal-enhanced').forEach(modal => {
        modal.classList.remove('active');
    });
}

// ============ User Menu ============
function toggleUserMenu() {
    showToast('User menu - coming soon!', 'info');
}

// ============ Refresh Dashboard ============
function refreshDashboard() {
    showToast('🔄 Refreshing dashboard...', 'info');
    loadDashboard();
    setTimeout(() => {
        showToast('✓ Dashboard refreshed', 'success');
    }, 500);
}

// ============ Clear Filters ============
function clearFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('technicianFilter').value = 'all';
    document.getElementById('priorityFilter').value = 'all';

    state.filters = {
        status: 'all',
        technician: 'all',
        priority: 'all',
        search: ''
    };

    applyFilters();
    loadDashboard();
    showToast('Filters cleared', 'info');
}

// ============ Navigation ============
function navigateToPage(page) {
    // Update active nav link (both nav-link and sidebar-link)
    document.querySelectorAll('.nav-link, .sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });

    // Show selected page
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.add('active');
        state.currentPage = page;

        // Load page-specific content
        switch(page) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'calendar':
                renderCalendar();
                break;
            case 'appointments':
                renderAllAppointments();
                break;
            case 'work-orders':
                renderWorkOrders();
                break;
            case 'analytics':
                renderAnalytics();
                break;
            case 'clients':
                renderClients();
                break;
            case 'team':
                renderTeam();
                break;
            case 'inventory':
                renderInventory();
                break;
        }
    }
}

// ============ Setup Event Listeners ============
function setupEventListeners() {
    // Navigation (both nav-link and sidebar-link)
    document.querySelectorAll('.nav-link, .sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            navigateToPage(page);
        });
    });

    // Date filter
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            loadDashboard();
        });
    }

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            state.filters.search = this.value;
            applyFilters();
            renderAllAppointments();
        });
    }

    // Form submissions
    const newAppointmentForm = document.getElementById('newAppointmentForm');
    if (newAppointmentForm) {
        newAppointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleNewAppointment();
        });
    }

    const newWorkOrderForm = document.getElementById('newWorkOrderForm');
    if (newWorkOrderForm) {
        newWorkOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleNewWorkOrder();
        });
    }
}

function handleNewAppointment() {
    showToast('✓ New appointment created successfully', 'success');
    closeModal('newAppointmentModal');
    addNotification('New Appointment', 'Appointment created and scheduled', 'success');
}

function handleNewWorkOrder() {
    showToast('✓ New work order created successfully', 'success');
    closeModal('newWorkOrderModal');
    addNotification('New Work Order', 'Work order created successfully', 'success');
}

// ============ Keep existing functions from original app.js ============
// (applyFilters, filterAppointments, loadDashboard, renderAppointments, etc.)
// These will be imported from the original file

// Make functions globally available
window.openModal = openModal;
window.closeModal = closeModal;
window.filterAppointments = filterAppointments;
window.viewAppointmentDetails = viewAppointmentDetails;
window.updateAppointmentStatus = updateAppointmentStatus;
window.navigateToPage = navigateToPage;
window.toggleFabMenu = toggleFabMenu;
window.startTimeTracking = startTimeTracking;
window.clockIn = clockIn;
window.clockOut = clockOut;
window.toggleNotifications = toggleNotifications;
window.closeNotifications = closeNotifications;
window.openGlobalSearch = openGlobalSearch;
window.closeGlobalSearch = closeGlobalSearch;
window.clearSignature = clearSignature;
window.saveSignature = saveSignature;
window.generateInvoice = generateInvoice;
window.printInvoice = printInvoice;
window.downloadInvoice = downloadInvoice;
window.calendarToday = calendarToday;
window.calendarPrevMonth = calendarPrevMonth;
window.calendarNextMonth = calendarNextMonth;
window.refreshDashboard = refreshDashboard;
window.clearFilters = clearFilters;
window.startVoiceCommand = startVoiceCommand;
window.toggleUserMenu = toggleUserMenu;
window.adjustStock = adjustStock;
window.removePhoto = removePhoto;
function applyFilters() {
    let filtered = [...demoData.appointments];

    // Status filter
    if (state.filters.status !== 'all') {
        filtered = filtered.filter(apt => apt.status === state.filters.status);
    }

    // Technician filter
    if (state.filters.technician !== 'all') {
        filtered = filtered.filter(apt => apt.assignedTo === state.filters.technician);
    }

    // Priority filter
    if (state.filters.priority !== 'all') {
        filtered = filtered.filter(apt => apt.priority === state.filters.priority);
    }

    // Search filter
    if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(apt =>
            apt.clientName.toLowerCase().includes(searchLower) ||
            apt.description.toLowerCase().includes(searchLower) ||
            apt.id.toLowerCase().includes(searchLower)
        );
    }

    state.filteredAppointments = filtered;
}

function filterAppointments() {
    state.filters.status = document.getElementById('statusFilter').value;
    state.filters.technician = document.getElementById('technicianFilter').value;
    state.filters.priority = document.getElementById('priorityFilter').value;

    applyFilters();

    // Update current view
    if (state.currentPage === 'dashboard') {
        loadDashboard();
    } else if (state.currentPage === 'appointments') {
        renderAllAppointments();
    }
}

function loadDashboard() {
    const today = document.getElementById('dateFilter').value;
    const todayAppointments = state.filteredAppointments.filter(apt => apt.date === today);

    renderAppointments('appointmentsList', todayAppointments);
}

function renderAppointments(containerId, appointments) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (appointments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No appointments found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = appointments.map(apt => `
        <div class="appointment-card-enhanced" onclick="viewAppointmentDetails('${apt.id}')">
            <div class="appointment-card-header">
                <div class="appointment-time-block">
                    <div class="time-large">${apt.time}</div>
                    <div class="duration-small">${apt.duration}</div>
                </div>
                <span class="status-badge-large ${apt.status}">${formatStatus(apt.status)}</span>
            </div>

            <div class="appointment-card-body">
                <h3 class="appointment-service">${apt.serviceType}</h3>
                <div class="appointment-id">ID: ${apt.id}</div>

                <div class="appointment-info-grid">
                    <div class="info-row">
                        <i class="fas fa-building"></i>
                        <span>${apt.clientName}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${apt.clientAddress.split(',')[0]}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-user"></i>
                        <span>${apt.technicianName}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-flag"></i>
                        <span class="priority-text priority-${apt.priority}">${apt.priority.toUpperCase()} Priority</span>
                    </div>
                </div>
            </div>

            <div class="appointment-card-footer">
                <span class="equipment-tag">
                    <i class="fas fa-tools"></i>
                    ${apt.equipmentNeeded ? apt.equipmentNeeded[0] : 'No equipment'}
                </span>
            </div>
        </div>
    `).join('');
}

function renderAllAppointments() {
    renderAppointments('allAppointmentsList', state.filteredAppointments);
}

function renderWorkOrders() {
    const container = document.getElementById('workOrdersList');
    if (!container) return;

    container.innerHTML = demoData.workOrders.map(wo => {
        const progressPercent = Math.round((wo.actualHours / wo.estimatedHours) * 100);
        const completedTasks = wo.tasks.filter(t => t.status === 'completed').length;

        return `
        <div class="work-order-card-enhanced">
            <div class="wo-header">
                <div class="wo-title-section">
                    <span class="wo-id">#${wo.id}</span>
                    <h3 class="wo-title">${wo.title}</h3>
                </div>
                <span class="status-badge-large ${wo.status}">${formatStatus(wo.status)}</span>
            </div>

            <div class="wo-body">
                <p class="wo-description">${wo.description}</p>

                <div class="wo-info-grid">
                    <div class="wo-info-item">
                        <i class="fas fa-building"></i>
                        <div>
                            <div class="info-label">Client</div>
                            <div class="info-value">${wo.clientName}</div>
                        </div>
                    </div>
                    <div class="wo-info-item">
                        <i class="fas fa-calendar"></i>
                        <div>
                            <div class="info-label">Scheduled</div>
                            <div class="info-value">${formatDate(wo.scheduledDate)}</div>
                        </div>
                    </div>
                    <div class="wo-info-item">
                        <i class="fas fa-wrench"></i>
                        <div>
                            <div class="info-label">Work Type</div>
                            <div class="info-value">${wo.workType}</div>
                        </div>
                    </div>
                    <div class="wo-info-item">
                        <i class="fas fa-users"></i>
                        <div>
                            <div class="info-label">Technicians</div>
                            <div class="info-value">${wo.technicians.length}</div>
                        </div>
                    </div>
                </div>

                <div class="wo-progress">
                    <div class="progress-header">
                        <span class="progress-label">Time Progress</span>
                        <span class="progress-value">${wo.actualHours} / ${wo.estimatedHours} hours (${progressPercent}%)</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>

                <div class="wo-tasks-summary">
                    <i class="fas fa-tasks"></i>
                    <span>${completedTasks} of ${wo.tasks.length} tasks completed</span>
                </div>
            </div>

            <div class="wo-footer">
                <button class="btn-view-details" onclick="viewWorkOrderDetails('${wo.id}')">
                    <i class="fas fa-eye"></i>
                    View Full Details
                </button>
            </div>
        </div>
    `;
    }).join('');
}

function renderClients() {
    const container = document.getElementById('clientsList');
    if (!container) return;

    container.innerHTML = demoData.clients.map(client => `
        <div class="client-card">
            <div class="client-header">
                <div class="client-logo">${client.name.substring(0, 2).toUpperCase()}</div>
                <div>
                    <div class="client-name">${client.name}</div>
                    <div style="color: var(--text-secondary); font-size: 0.875rem;">${client.industry}</div>
                </div>
            </div>
            <div class="client-info">
                <div class="client-info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${client.address.split(',')[0]}</span>
                </div>
                <div class="client-info-item">
                    <i class="fas fa-phone"></i>
                    <span>${client.phone}</span>
                </div>
                <div class="client-info-item">
                    <i class="fas fa-user"></i>
                    <span>${client.contactPerson} - ${client.contactTitle}</span>
                </div>
                <div class="client-info-item">
                    <i class="fas fa-file-contract"></i>
                    <span>${client.contractType}</span>
                </div>
            </div>
            <div class="client-stats">
                <div class="client-stat">
                    <div class="client-stat-value">${client.totalAppointments}</div>
                    <div class="client-stat-label">Total Jobs</div>
                </div>
                <div class="client-stat">
                    <div class="client-stat-value">${client.activeWorkOrders}</div>
                    <div class="client-stat-label">Active Orders</div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderTeam() {
    const container = document.getElementById('teamList');
    if (!container) return;

    container.innerHTML = demoData.team.map(member => {
        // Get initials from name
        const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();

        return `
        <div class="team-card">
            <div class="team-avatar-initials">${initials}</div>
            <div class="team-name">${member.name}</div>
            <div class="team-role">${member.role}</div>
            <div class="team-stats">
                <div class="team-stat">
                    <span class="team-stat-value">${member.totalJobs}</span>
                    <span class="team-stat-label">Total</span>
                </div>
                <div class="team-stat">
                    <span class="team-stat-value">${member.activeJobs}</span>
                    <span class="team-stat-label">Active</span>
                </div>
                <div class="team-stat">
                    <span class="team-stat-value">${member.rating}</span>
                    <span class="team-stat-label">Rating</span>
                </div>
            </div>
            <div class="team-status ${member.status}">
                <span class="status-dot"></span>
                ${member.status.charAt(0).toUpperCase() + member.status.slice(1)}
            </div>
            <div class="team-specializations">
                <div class="specializations-label">Specializations:</div>
                <div class="specializations-list">${member.specializations.join(', ')}</div>
            </div>
        </div>
    `;
    }).join('');
}

function viewAppointmentDetails(appointmentId) {
    const appointment = demoData.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    state.selectedAppointment = appointment;

    const timeline = demoData.activityTimeline[appointmentId] || [];

    const modalContent = document.getElementById('appointmentDetailContent');
    modalContent.innerHTML = `
        <div class="detail-grid">
            <div>
                <div class="detail-section">
                    <h3>Appointment Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Appointment ID</span>
                        <span class="detail-value">${appointment.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span class="detail-value">
                            <span class="status-badge ${appointment.status}">${formatStatus(appointment.status)}</span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Service Type</span>
                        <span class="detail-value">${appointment.serviceType}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Priority</span>
                        <span class="detail-value">
                            <span class="tag priority-${appointment.priority}">${appointment.priority.toUpperCase()}</span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date & Time</span>
                        <span class="detail-value">${formatDate(appointment.date)} at ${appointment.time}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Duration</span>
                        <span class="detail-value">${appointment.duration}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Client Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Client Name</span>
                        <span class="detail-value">${appointment.clientName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Address</span>
                        <span class="detail-value">${appointment.clientAddress}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Technician Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Assigned To</span>
                        <span class="detail-value">${appointment.technicianName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone</span>
                        <span class="detail-value">${appointment.technicianPhone}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Work Description</h3>
                    <p style="color: var(--text-secondary); line-height: 1.6;">${appointment.description}</p>
                </div>

                ${appointment.equipmentNeeded ? `
                <div class="detail-section">
                    <h3>Equipment Needed</h3>
                    <ul style="margin-left: 1.5rem; color: var(--text-secondary);">
                        ${appointment.equipmentNeeded.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}

                ${appointment.notes ? `
                <div class="detail-section">
                    <h3>Notes</h3>
                    <p style="background: #fff3cd; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #ffc107;">
                        ${appointment.notes}
                    </p>
                </div>
                ` : ''}

                ${appointment.completionNotes ? `
                <div class="detail-section">
                    <h3>Completion Notes</h3>
                    <p style="background: #d1fae5; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #10b981;">
                        ${appointment.completionNotes}
                    </p>
                    <div class="detail-row">
                        <span class="detail-label">Completed At</span>
                        <span class="detail-value">${formatDateTime(appointment.completedAt)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Time Spent</span>
                        <span class="detail-value">${appointment.timeSpent}</span>
                    </div>
                </div>
                ` : ''}
            </div>

            <div>
                <div class="detail-section">
                    <h3>Activity Timeline</h3>
                    <div class="timeline">
                        ${timeline.map((activity, index) => `
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div class="timeline-content">
                                    <div class="timeline-time">${formatDateTime(activity.time)}</div>
                                    <div class="timeline-text"><strong>${activity.action}</strong></div>
                                    <div class="timeline-text">${activity.details}</div>
                                    <div class="timeline-user">by ${activity.user}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Actions</h3>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${appointment.status === 'scheduled' ? `
                            <button class="btn btn-success btn-block" onclick="updateAppointmentStatus('${appointment.id}', 'in-progress')">
                                <i class="fas fa-play"></i> Start Work
                            </button>
                        ` : ''}
                        ${appointment.status === 'in-progress' ? `
                            <button class="btn btn-success btn-block" onclick="updateAppointmentStatus('${appointment.id}', 'completed')">
                                <i class="fas fa-check"></i> Complete
                            </button>
                        ` : ''}
                        <button class="btn btn-primary btn-block" onclick="alert('Edit functionality')">
                            <i class="fas fa-edit"></i> Edit Appointment
                        </button>
                        ${appointment.status !== 'cancelled' ? `
                            <button class="btn btn-danger btn-block" onclick="updateAppointmentStatus('${appointment.id}', 'cancelled')">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary btn-block" onclick="alert('Print functionality')">
                            <i class="fas fa-print"></i> Print Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    openModal('appointmentDetailModal');
}

function updateAppointmentStatus(appointmentId, newStatus) {
    const appointment = demoData.appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
        appointment.status = newStatus;
        if (newStatus === 'completed') {
            appointment.completedAt = new Date().toISOString();
            appointment.timeSpent = appointment.duration;
            appointment.completionNotes = 'Work completed successfully.';
        }

        // Refresh the view
        closeModal('appointmentDetailModal');
        if (state.currentPage === 'dashboard') {
            loadDashboard();
        } else {
            renderAllAppointments();
        }

        // Show notification
        showNotification(`Appointment ${appointmentId} status updated to ${formatStatus(newStatus)}`, 'success');
    }
}

function viewWorkOrderDetails(workOrderId) {
    alert(`Work Order Details for ${workOrderId} - Feature coming soon!`);
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function handleNewAppointment() {
    showNotification('New appointment created successfully!', 'success');
    closeModal('newAppointmentModal');
    document.getElementById('newAppointmentForm').reset();
}

function handleNewWorkOrder() {
    showNotification('New work order created successfully!', 'success');
    closeModal('newWorkOrderModal');
    document.getElementById('newWorkOrderForm').reset();
}

function showNotification(message, type = 'info') {
    // Simple notification - could be enhanced with a toast library
    alert(message);
}

// Utility functions
function formatStatus(status) {
    return status.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', dateOptions) + ' at ' + date.toLocaleTimeString('en-US', timeOptions);
}

// Charts initialization
function initializeCharts() {
    // Appointments Chart
    const appointmentsCtx = document.getElementById('appointmentsChart');
    if (appointmentsCtx) {
        new Chart(appointmentsCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Appointments',
                    data: [12, 19, 15, 17, 14, 10, 8],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.5,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e5e7eb'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Service Types Chart
    const serviceTypesCtx = document.getElementById('serviceTypesChart');
    if (serviceTypesCtx) {
        new Chart(serviceTypesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Installation', 'Maintenance', 'Repair', 'Inspection'],
                datasets: [{
                    data: [35, 30, 25, 10],
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Make functions available globally
window.openModal = openModal;
window.closeModal = closeModal;
window.filterAppointments = filterAppointments;
window.viewAppointmentDetails = viewAppointmentDetails;
window.viewWorkOrderDetails = viewWorkOrderDetails;
window.updateAppointmentStatus = updateAppointmentStatus;
