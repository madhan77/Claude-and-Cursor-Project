// Field Service Application - Main JavaScript

// Global state
const state = {
    currentPage: 'dashboard',
    selectedAppointment: null,
    filteredAppointments: [],
    filters: {
        status: 'all',
        technician: 'all',
        priority: 'all',
        search: ''
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadDashboard();
    setupEventListeners();
    initializeCharts();
});

function initializeApp() {
    // Filter appointments based on current filters
    applyFilters();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
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

function navigateToPage(page) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

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
            case 'appointments':
                renderAllAppointments();
                break;
            case 'work-orders':
                renderWorkOrders();
                break;
            case 'clients':
                renderClients();
                break;
            case 'team':
                renderTeam();
                break;
        }
    }
}

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
        <div class="appointment-card" onclick="viewAppointmentDetails('${apt.id}')">
            <div class="appointment-time">
                <span class="time">${apt.time}</span>
                <span class="duration">${apt.duration}</span>
            </div>
            <div class="appointment-info">
                <div class="appointment-header">
                    <div>
                        <div class="appointment-title">${apt.serviceType} - ${apt.id}</div>
                        <div class="appointment-client">
                            <i class="fas fa-building"></i> ${apt.clientName}
                        </div>
                    </div>
                </div>
                <div class="appointment-details">
                    <div class="detail-item">
                        <i class="fas fa-user"></i>
                        <span>${apt.technicianName}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${apt.clientAddress.split(',')[0]}</span>
                    </div>
                </div>
                <div class="appointment-tags">
                    <span class="tag service">${apt.serviceType}</span>
                    <span class="tag priority-${apt.priority}">${apt.priority.toUpperCase()} Priority</span>
                </div>
            </div>
            <div class="appointment-actions">
                <span class="status-badge ${apt.status}">${formatStatus(apt.status)}</span>
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

    container.innerHTML = demoData.workOrders.map(wo => `
        <div class="work-order-card">
            <div class="work-order-header">
                <div>
                    <div class="work-order-id">${wo.id}</div>
                    <div class="work-order-title">${wo.title}</div>
                </div>
                <span class="status-badge ${wo.status}">${formatStatus(wo.status)}</span>
            </div>
            <div class="work-order-meta">
                <div class="meta-item">
                    <i class="fas fa-building"></i>
                    <span>${wo.clientName}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-wrench"></i>
                    <span>${wo.workType}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(wo.scheduledDate)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-users"></i>
                    <span>${wo.technicians.join(', ')}</span>
                </div>
            </div>
            <div class="work-order-description">${wo.description}</div>
            <div style="margin: 1rem 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.875rem;">
                    <span>Progress: ${wo.actualHours} / ${wo.estimatedHours} hours</span>
                    <span>${Math.round((wo.actualHours / wo.estimatedHours) * 100)}%</span>
                </div>
                <div style="background: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: var(--primary-color); height: 100%; width: ${(wo.actualHours / wo.estimatedHours) * 100}%; transition: width 0.3s;"></div>
                </div>
            </div>
            <div class="work-order-footer">
                <div>
                    <strong>Tasks:</strong> ${wo.tasks.filter(t => t.status === 'completed').length} / ${wo.tasks.length} completed
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm btn-secondary" onclick="viewWorkOrderDetails('${wo.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
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

    container.innerHTML = demoData.team.map(member => `
        <div class="team-card">
            <img src="${member.avatar}" alt="${member.name}" class="team-avatar">
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
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                <div style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                    <strong>Specializations:</strong>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                    ${member.specializations.join(', ')}
                </div>
            </div>
        </div>
    `).join('');
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
                maintainAspectRatio: false,
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
                maintainAspectRatio: false,
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
