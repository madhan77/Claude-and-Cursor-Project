// Demo Data for Field Service Application

const demoData = {
    // Appointments
    appointments: [
        {
            id: 'APT001',
            clientId: 'CLI001',
            clientName: 'Acme Corporation',
            clientAddress: '123 Business Park, Tech Valley, CA 94025',
            serviceType: 'Installation',
            date: '2025-11-22',
            time: '09:00',
            duration: '2 hours',
            assignedTo: 'tech1',
            technicianName: 'Mike Johnson',
            technicianPhone: '+1 (555) 123-4567',
            status: 'scheduled',
            priority: 'high',
            description: 'Install new HVAC system in main office building',
            equipmentNeeded: ['HVAC Unit Model X200', 'Installation Kit', 'Safety Gear'],
            notes: 'Contact facility manager before arrival',
            created: '2025-11-15T10:30:00',
            lastUpdated: '2025-11-20T14:22:00'
        },
        {
            id: 'APT002',
            clientId: 'CLI002',
            clientName: 'TechStart Inc.',
            clientAddress: '456 Innovation Drive, Silicon City, CA 94301',
            serviceType: 'Maintenance',
            date: '2025-11-22',
            time: '11:30',
            duration: '1.5 hours',
            assignedTo: 'tech2',
            technicianName: 'Sarah Williams',
            technicianPhone: '+1 (555) 234-5678',
            status: 'in-progress',
            priority: 'medium',
            description: 'Quarterly maintenance check on electrical systems',
            equipmentNeeded: ['Testing Equipment', 'Replacement Parts Kit'],
            notes: 'Annual contract - priority client',
            created: '2025-11-10T09:15:00',
            lastUpdated: '2025-11-22T11:35:00'
        },
        {
            id: 'APT003',
            clientId: 'CLI003',
            clientName: 'Global Solutions Ltd.',
            clientAddress: '789 Enterprise Way, Metro City, CA 94040',
            serviceType: 'Repair',
            date: '2025-11-22',
            time: '14:00',
            duration: '3 hours',
            assignedTo: 'tech3',
            technicianName: 'David Brown',
            technicianPhone: '+1 (555) 345-6789',
            status: 'scheduled',
            priority: 'high',
            description: 'Emergency repair - server room cooling system failure',
            equipmentNeeded: ['Cooling System Parts', 'Diagnostic Tools', 'Backup Unit'],
            notes: 'URGENT - Server room overheating. Client waiting on-site.',
            created: '2025-11-21T16:45:00',
            lastUpdated: '2025-11-21T17:00:00'
        },
        {
            id: 'APT004',
            clientId: 'CLI004',
            clientName: 'Retail Mart Chain',
            clientAddress: '321 Commerce Street, Downtown, CA 94102',
            serviceType: 'Inspection',
            date: '2025-11-22',
            time: '16:00',
            duration: '2 hours',
            assignedTo: 'tech4',
            technicianName: 'Emily Davis',
            technicianPhone: '+1 (555) 456-7890',
            status: 'scheduled',
            priority: 'low',
            description: 'Routine safety inspection of fire suppression system',
            equipmentNeeded: ['Inspection Checklist', 'Testing Kit'],
            notes: 'Annual compliance inspection required by law',
            created: '2025-11-08T11:20:00',
            lastUpdated: '2025-11-19T09:45:00'
        },
        {
            id: 'APT005',
            clientId: 'CLI005',
            clientName: 'Healthcare Plus',
            clientAddress: '555 Medical Center Blvd, Health District, CA 94305',
            serviceType: 'Installation',
            date: '2025-11-23',
            time: '08:00',
            duration: '4 hours',
            assignedTo: 'tech1',
            technicianName: 'Mike Johnson',
            technicianPhone: '+1 (555) 123-4567',
            status: 'scheduled',
            priority: 'high',
            description: 'Install medical-grade air filtration system in surgery wing',
            equipmentNeeded: ['Filtration System XM-500', 'Sterile Installation Kit', 'PPE'],
            notes: 'Must comply with medical facility regulations. Supervisor approval required.',
            created: '2025-11-16T14:30:00',
            lastUpdated: '2025-11-21T10:15:00'
        },
        {
            id: 'APT006',
            clientId: 'CLI001',
            clientName: 'Acme Corporation',
            clientAddress: '123 Business Park, Tech Valley, CA 94025',
            serviceType: 'Maintenance',
            date: '2025-11-23',
            time: '13:00',
            duration: '2 hours',
            assignedTo: 'tech2',
            technicianName: 'Sarah Williams',
            technicianPhone: '+1 (555) 234-5678',
            status: 'scheduled',
            priority: 'medium',
            description: 'Preventive maintenance on backup generator',
            equipmentNeeded: ['Oil', 'Filters', 'Testing Equipment'],
            notes: 'Monthly scheduled maintenance',
            created: '2025-11-12T08:00:00',
            lastUpdated: '2025-11-20T15:30:00'
        },
        {
            id: 'APT007',
            clientId: 'CLI006',
            clientName: 'Manufacturing Pro Inc.',
            clientAddress: '888 Industrial Parkway, Factory Town, CA 94560',
            serviceType: 'Repair',
            date: '2025-11-21',
            time: '10:00',
            duration: '3 hours',
            assignedTo: 'tech3',
            technicianName: 'David Brown',
            technicianPhone: '+1 (555) 345-6789',
            status: 'completed',
            priority: 'high',
            description: 'Repair conveyor belt control system',
            equipmentNeeded: ['Control Panel Parts', 'Wiring Kit', 'Safety Lockout'],
            notes: 'Production line down - completed ahead of schedule',
            created: '2025-11-20T15:30:00',
            lastUpdated: '2025-11-21T13:45:00',
            completedAt: '2025-11-21T13:30:00',
            timeSpent: '2.5 hours',
            completionNotes: 'Replaced faulty control module. System tested and operational.'
        },
        {
            id: 'APT008',
            clientId: 'CLI002',
            clientName: 'TechStart Inc.',
            clientAddress: '456 Innovation Drive, Silicon City, CA 94301',
            serviceType: 'Installation',
            date: '2025-11-21',
            time: '14:00',
            duration: '2 hours',
            assignedTo: 'tech4',
            technicianName: 'Emily Davis',
            technicianPhone: '+1 (555) 456-7890',
            status: 'completed',
            priority: 'medium',
            description: 'Install smart building automation sensors',
            equipmentNeeded: ['Sensor Modules', 'Network Cables', 'Configuration Laptop'],
            notes: 'New technology rollout',
            created: '2025-11-14T11:00:00',
            lastUpdated: '2025-11-21T16:30:00',
            completedAt: '2025-11-21T16:15:00',
            timeSpent: '2 hours',
            completionNotes: 'All sensors installed and connected to building management system'
        }
    ],

    // Work Orders
    workOrders: [
        {
            id: 'WO-2025-001',
            title: 'HVAC System Upgrade - Main Building',
            clientId: 'CLI001',
            clientName: 'Acme Corporation',
            workType: 'Installation',
            status: 'in-progress',
            priority: 'high',
            description: 'Complete HVAC system upgrade for 3-story office building. Includes removal of old units, installation of new energy-efficient system, and integration with building automation.',
            assignedTo: ['tech1', 'tech3'],
            technicians: ['Mike Johnson', 'David Brown'],
            createdDate: '2025-11-10',
            scheduledDate: '2025-11-22',
            estimatedCompletion: '2025-11-30',
            estimatedHours: 40,
            actualHours: 12,
            materials: [
                { item: 'HVAC Unit Model X200', quantity: 3, cost: 15000 },
                { item: 'Ductwork', quantity: 200, unit: 'ft', cost: 3000 },
                { item: 'Installation Materials', quantity: 1, cost: 2500 }
            ],
            tasks: [
                { task: 'Site assessment', status: 'completed', completedBy: 'Mike Johnson' },
                { task: 'Remove old HVAC units', status: 'completed', completedBy: 'David Brown' },
                { task: 'Install new units', status: 'in-progress', assignedTo: 'Mike Johnson' },
                { task: 'Connect to building automation', status: 'pending' },
                { task: 'System testing', status: 'pending' },
                { task: 'Client training', status: 'pending' }
            ]
        },
        {
            id: 'WO-2025-002',
            title: 'Electrical Panel Replacement',
            clientId: 'CLI002',
            clientName: 'TechStart Inc.',
            workType: 'Repair',
            status: 'scheduled',
            priority: 'high',
            description: 'Replace outdated electrical panel in server room. Work must be done after hours to avoid disruption.',
            assignedTo: ['tech2'],
            technicians: ['Sarah Williams'],
            createdDate: '2025-11-18',
            scheduledDate: '2025-11-24',
            estimatedCompletion: '2025-11-24',
            estimatedHours: 6,
            actualHours: 0,
            materials: [
                { item: 'Electrical Panel 200A', quantity: 1, cost: 1200 },
                { item: 'Circuit Breakers', quantity: 12, cost: 480 },
                { item: 'Wiring and Connectors', quantity: 1, cost: 300 }
            ],
            tasks: [
                { task: 'Schedule power shutdown', status: 'completed', completedBy: 'Sarah Williams' },
                { task: 'Remove old panel', status: 'pending' },
                { task: 'Install new panel', status: 'pending' },
                { task: 'Wire and test circuits', status: 'pending' },
                { task: 'Documentation and labeling', status: 'pending' }
            ]
        },
        {
            id: 'WO-2025-003',
            title: 'Fire Suppression System Annual Maintenance',
            clientId: 'CLI004',
            clientName: 'Retail Mart Chain',
            workType: 'Maintenance',
            status: 'scheduled',
            priority: 'medium',
            description: 'Annual maintenance and inspection of fire suppression system across all retail locations.',
            assignedTo: ['tech4'],
            technicians: ['Emily Davis'],
            createdDate: '2025-11-05',
            scheduledDate: '2025-11-22',
            estimatedCompletion: '2025-11-29',
            estimatedHours: 24,
            actualHours: 0,
            materials: [
                { item: 'Replacement Nozzles', quantity: 15, cost: 450 },
                { item: 'System Test Kit', quantity: 1, cost: 200 }
            ],
            tasks: [
                { task: 'Inspect all locations', status: 'pending' },
                { task: 'Test system activation', status: 'pending' },
                { task: 'Replace worn components', status: 'pending' },
                { task: 'Generate compliance report', status: 'pending' }
            ]
        },
        {
            id: 'WO-2025-004',
            title: 'Security System Installation',
            clientId: 'CLI005',
            clientName: 'Healthcare Plus',
            workType: 'Installation',
            status: 'completed',
            priority: 'high',
            description: 'Install comprehensive security system including cameras, access control, and alarm system.',
            assignedTo: ['tech1', 'tech2'],
            technicians: ['Mike Johnson', 'Sarah Williams'],
            createdDate: '2025-11-01',
            scheduledDate: '2025-11-10',
            estimatedCompletion: '2025-11-15',
            completedDate: '2025-11-14',
            estimatedHours: 32,
            actualHours: 30,
            materials: [
                { item: 'Security Cameras', quantity: 24, cost: 9600 },
                { item: 'NVR System', quantity: 2, cost: 3000 },
                { item: 'Access Control Panels', quantity: 8, cost: 4800 },
                { item: 'Cabling and Installation', quantity: 1, cost: 2000 }
            ],
            tasks: [
                { task: 'Site survey', status: 'completed', completedBy: 'Mike Johnson' },
                { task: 'Install cameras', status: 'completed', completedBy: 'Sarah Williams' },
                { task: 'Setup NVR and recording', status: 'completed', completedBy: 'Mike Johnson' },
                { task: 'Install access control', status: 'completed', completedBy: 'Sarah Williams' },
                { task: 'System integration', status: 'completed', completedBy: 'Mike Johnson' },
                { task: 'Staff training', status: 'completed', completedBy: 'Both' }
            ]
        }
    ],

    // Clients
    clients: [
        {
            id: 'CLI001',
            name: 'Acme Corporation',
            industry: 'Technology',
            address: '123 Business Park, Tech Valley, CA 94025',
            phone: '+1 (555) 100-2000',
            email: 'contact@acmecorp.com',
            contactPerson: 'John Smith',
            contactTitle: 'Facility Manager',
            contactPhone: '+1 (555) 100-2001',
            contactEmail: 'john.smith@acmecorp.com',
            accountStatus: 'Active',
            contractType: 'Annual Maintenance',
            contractValue: 120000,
            since: '2022-03-15',
            totalAppointments: 48,
            completedAppointments: 42,
            activeWorkOrders: 2,
            lastService: '2025-11-22',
            nextScheduled: '2025-11-23',
            notes: 'VIP Client - Priority Response Required'
        },
        {
            id: 'CLI002',
            name: 'TechStart Inc.',
            industry: 'Software Development',
            address: '456 Innovation Drive, Silicon City, CA 94301',
            phone: '+1 (555) 200-3000',
            email: 'info@techstart.com',
            contactPerson: 'Maria Garcia',
            contactTitle: 'Operations Director',
            contactPhone: '+1 (555) 200-3001',
            contactEmail: 'maria.garcia@techstart.com',
            accountStatus: 'Active',
            contractType: 'Quarterly Service',
            contractValue: 45000,
            since: '2023-01-20',
            totalAppointments: 24,
            completedAppointments: 22,
            activeWorkOrders: 1,
            lastService: '2025-11-22',
            nextScheduled: '2025-11-24',
            notes: 'Growing account - excellent payment history'
        },
        {
            id: 'CLI003',
            name: 'Global Solutions Ltd.',
            industry: 'Consulting',
            address: '789 Enterprise Way, Metro City, CA 94040',
            phone: '+1 (555) 300-4000',
            email: 'service@globalsolutions.com',
            contactPerson: 'Robert Chen',
            contactTitle: 'Facilities Coordinator',
            contactPhone: '+1 (555) 300-4001',
            contactEmail: 'robert.chen@globalsolutions.com',
            accountStatus: 'Active',
            contractType: 'On-Demand',
            contractValue: 0,
            since: '2023-06-10',
            totalAppointments: 15,
            completedAppointments: 13,
            activeWorkOrders: 1,
            lastService: '2025-11-15',
            nextScheduled: '2025-11-22',
            notes: 'Pay-per-service client'
        },
        {
            id: 'CLI004',
            name: 'Retail Mart Chain',
            industry: 'Retail',
            address: '321 Commerce Street, Downtown, CA 94102',
            phone: '+1 (555) 400-5000',
            email: 'facilities@retailmart.com',
            contactPerson: 'Lisa Anderson',
            contactTitle: 'Regional Facilities Manager',
            contactPhone: '+1 (555) 400-5001',
            contactEmail: 'lisa.anderson@retailmart.com',
            accountStatus: 'Active',
            contractType: 'Multi-Location Annual',
            contractValue: 180000,
            since: '2021-09-01',
            totalAppointments: 96,
            completedAppointments: 89,
            activeWorkOrders: 1,
            lastService: '2025-11-20',
            nextScheduled: '2025-11-22',
            notes: '12 locations - coordinated scheduling required'
        },
        {
            id: 'CLI005',
            name: 'Healthcare Plus',
            industry: 'Healthcare',
            address: '555 Medical Center Blvd, Health District, CA 94305',
            phone: '+1 (555) 500-6000',
            email: 'engineering@healthcareplus.org',
            contactPerson: 'Dr. Sarah Johnson',
            contactTitle: 'Chief Engineering Officer',
            contactPhone: '+1 (555) 500-6001',
            contactEmail: 'sarah.johnson@healthcareplus.org',
            accountStatus: 'Active',
            contractType: 'Premium Annual + Emergency',
            contractValue: 250000,
            since: '2020-05-15',
            totalAppointments: 128,
            completedAppointments: 125,
            activeWorkOrders: 0,
            lastService: '2025-11-18',
            nextScheduled: '2025-11-23',
            notes: 'Medical facility - strict compliance requirements, 24/7 emergency support'
        },
        {
            id: 'CLI006',
            name: 'Manufacturing Pro Inc.',
            industry: 'Manufacturing',
            address: '888 Industrial Parkway, Factory Town, CA 94560',
            phone: '+1 (555) 600-7000',
            email: 'maintenance@mfgpro.com',
            contactPerson: 'James Wilson',
            contactTitle: 'Maintenance Supervisor',
            contactPhone: '+1 (555) 600-7001',
            contactEmail: 'james.wilson@mfgpro.com',
            accountStatus: 'Active',
            contractType: 'Annual Preventive Maintenance',
            contractValue: 95000,
            since: '2022-11-01',
            totalAppointments: 36,
            completedAppointments: 34,
            activeWorkOrders: 0,
            lastService: '2025-11-21',
            nextScheduled: '2025-12-05',
            notes: 'Production equipment critical - minimize downtime'
        }
    ],

    // Team Members
    team: [
        {
            id: 'tech1',
            name: 'Mike Johnson',
            role: 'Senior Field Engineer',
            email: 'mike.johnson@fieldservicepro.com',
            phone: '+1 (555) 123-4567',
            avatar: 'https://i.pravatar.cc/150?img=13',
            status: 'available',
            specializations: ['HVAC', 'Electrical Systems', 'Building Automation'],
            certifications: ['EPA 608', 'Electrical License', 'OSHA 30'],
            experience: '8 years',
            rating: 4.9,
            totalJobs: 342,
            completedJobs: 338,
            activeJobs: 2,
            upcomingJobs: 3,
            location: 'Tech Valley, CA',
            joined: '2018-03-15',
            performanceScore: 98
        },
        {
            id: 'tech2',
            name: 'Sarah Williams',
            role: 'Field Service Technician',
            email: 'sarah.williams@fieldservicepro.com',
            phone: '+1 (555) 234-5678',
            avatar: 'https://i.pravatar.cc/150?img=45',
            status: 'busy',
            specializations: ['Electrical', 'Security Systems', 'Access Control'],
            certifications: ['Electrical License', 'Security+ Certified', 'Low Voltage License'],
            experience: '5 years',
            rating: 4.8,
            totalJobs: 256,
            completedJobs: 251,
            activeJobs: 1,
            upcomingJobs: 2,
            location: 'Silicon City, CA',
            joined: '2020-01-20',
            performanceScore: 96
        },
        {
            id: 'tech3',
            name: 'David Brown',
            role: 'Service Engineer',
            email: 'david.brown@fieldservicepro.com',
            phone: '+1 (555) 345-6789',
            avatar: 'https://i.pravatar.cc/150?img=33',
            status: 'available',
            specializations: ['Industrial Equipment', 'HVAC', 'Refrigeration'],
            certifications: ['EPA 608', 'Universal Refrigeration', 'Industrial Maintenance'],
            experience: '6 years',
            rating: 4.7,
            totalJobs: 289,
            completedJobs: 283,
            activeJobs: 2,
            upcomingJobs: 1,
            location: 'Metro City, CA',
            joined: '2019-06-10',
            performanceScore: 94
        },
        {
            id: 'tech4',
            name: 'Emily Davis',
            role: 'Field Service Specialist',
            email: 'emily.davis@fieldservicepro.com',
            phone: '+1 (555) 456-7890',
            avatar: 'https://i.pravatar.cc/150?img=48',
            status: 'available',
            specializations: ['Fire Safety', 'Inspection Services', 'Compliance'],
            certifications: ['Fire Safety Inspector', 'NICET Level II', 'Building Inspector'],
            experience: '7 years',
            rating: 4.9,
            totalJobs: 412,
            completedJobs: 408,
            activeJobs: 1,
            upcomingJobs: 2,
            location: 'Downtown, CA',
            joined: '2018-09-01',
            performanceScore: 97
        },
        {
            id: 'tech5',
            name: 'Alex Martinez',
            role: 'Junior Technician',
            email: 'alex.martinez@fieldservicepro.com',
            phone: '+1 (555) 567-8901',
            avatar: 'https://i.pravatar.cc/150?img=52',
            status: 'available',
            specializations: ['General Maintenance', 'Preventive Service'],
            certifications: ['OSHA 10', 'Basic Electrical'],
            experience: '2 years',
            rating: 4.5,
            totalJobs: 78,
            completedJobs: 75,
            activeJobs: 0,
            upcomingJobs: 3,
            location: 'Factory Town, CA',
            joined: '2023-05-15',
            performanceScore: 89
        },
        {
            id: 'tech6',
            name: 'Rachel Kim',
            role: 'Senior Technician',
            email: 'rachel.kim@fieldservicepro.com',
            phone: '+1 (555) 678-9012',
            avatar: 'https://i.pravatar.cc/150?img=47',
            status: 'offline',
            specializations: ['Plumbing', 'HVAC', 'General Building Systems'],
            certifications: ['Master Plumber', 'HVAC Universal', 'Backflow Prevention'],
            experience: '10 years',
            rating: 4.9,
            totalJobs: 485,
            completedJobs: 481,
            activeJobs: 0,
            upcomingJobs: 0,
            location: 'Health District, CA',
            joined: '2017-02-01',
            performanceScore: 99
        }
    ],

    // Activity Timeline for Appointment Details
    activityTimeline: {
        'APT001': [
            {
                time: '2025-11-15 10:30',
                action: 'Appointment created',
                user: 'System',
                details: 'Appointment scheduled for client request'
            },
            {
                time: '2025-11-15 10:45',
                action: 'Assigned to technician',
                user: 'Dispatcher',
                details: 'Assigned to Mike Johnson based on specialization'
            },
            {
                time: '2025-11-20 14:22',
                action: 'Pre-visit notes added',
                user: 'Mike Johnson',
                details: 'Reviewed site plans and equipment requirements'
            }
        ],
        'APT002': [
            {
                time: '2025-11-10 09:15',
                action: 'Appointment created',
                user: 'System',
                details: 'Quarterly maintenance from annual contract'
            },
            {
                time: '2025-11-10 09:20',
                action: 'Assigned to technician',
                user: 'Dispatcher',
                details: 'Assigned to Sarah Williams'
            },
            {
                time: '2025-11-22 11:30',
                action: 'Check-in',
                user: 'Sarah Williams',
                details: 'Arrived on site, starting inspection'
            },
            {
                time: '2025-11-22 11:35',
                action: 'Work in progress',
                user: 'Sarah Williams',
                details: 'Performing electrical system tests'
            }
        ]
    }
};

// ============ BULK DATA GENERATOR ============
// Generate 1000 rows for each entity for performance testing

const serviceTypes = ['Installation', 'Maintenance', 'Repair', 'Inspection', 'Emergency', 'Consultation', 'Upgrade'];
const statuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];
const priorities = ['low', 'medium', 'high'];
const clientNames = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Retail Mart', 'Healthcare Plus', 'Manufacturing Co', 'Finance Group', 'Education Center', 'Hotel Chain', 'Restaurant Group'];
const techNames = ['Mike Johnson', 'Sarah Williams', 'David Brown', 'Emily Davis', 'John Doe', 'Jane Smith', 'Robert Wilson', 'Lisa Anderson', 'Tom Martinez', 'Anna Lee'];
const categories = ['Filters', 'Electrical', 'Refrigerants', 'Pumps', 'Motors', 'Safety', 'Supplies', 'Tools', 'Parts', 'Equipment'];

function generateDate(daysOffset) {
    const date = new Date('2025-11-22');
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
}

function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate appointments (1000 rows)
for (let i = demoData.appointments.length; i < 1000; i++) {
    const daysOffset = Math.floor((i - demoData.appointments.length) / 10) - 50;
    const aptId = `APT${String(i + 1).padStart(5, '0')}`;
    const clientName = randomFromArray(clientNames) + (i > 100 ? ` #${randomNumber(1, 999)}` : '');
    const techName = randomFromArray(techNames);

    demoData.appointments.push({
        id: aptId,
        clientId: `CLI${String(randomNumber(1, 500)).padStart(5, '0')}`,
        clientName: clientName,
        clientAddress: `${randomNumber(100, 9999)} ${randomFromArray(['Main', 'Oak', 'Elm', 'Pine', 'Maple'])} ${randomFromArray(['St', 'Ave', 'Blvd', 'Dr'])}, City ${randomNumber(1, 50)}, CA ${randomNumber(90001, 99999)}`,
        clientPhone: `+1 (${randomNumber(200, 999)}) ${randomNumber(100, 999)}-${randomNumber(1000, 9999)}`,
        serviceType: randomFromArray(serviceTypes),
        date: generateDate(daysOffset),
        time: `${String(randomNumber(8, 17)).padStart(2, '0')}:${randomNumber(0, 1) * 30 === 0 ? '00' : '30'}`,
        duration: `${randomNumber(1, 4)} hours`,
        assignedTo: `tech${randomNumber(1, 10)}`,
        technicianName: techName,
        technicianPhone: `+1 (555) ${randomNumber(100, 999)}-${randomNumber(1000, 9999)}`,
        status: randomFromArray(statuses),
        priority: randomFromArray(priorities),
        description: `${randomFromArray(serviceTypes)} service for ${randomFromArray(['HVAC', 'Electrical', 'Plumbing', 'Security', 'Network'])} system`,
        equipmentNeeded: [randomFromArray(['Tools', 'Parts', 'Safety Gear', 'Diagnostic Equipment'])],
        notes: i % 5 === 0 ? 'Priority client' : 'Standard service',
        created: `2025-${String(randomNumber(10, 11)).padStart(2, '0')}-${String(randomNumber(1, 22)).padStart(2, '0')}T${String(randomNumber(8, 17)).padStart(2, '0')}:${String(randomNumber(0, 59)).padStart(2, '0')}:00`,
        lastUpdated: `2025-11-${String(randomNumber(15, 22)).padStart(2, '0')}T${String(randomNumber(8, 17)).padStart(2, '0')}:${String(randomNumber(0, 59)).padStart(2, '0')}:00`
    });
}

// Generate work orders (1000 rows)
for (let i = demoData.workOrders.length; i < 1000; i++) {
    const woId = `WO-2025-${String(i + 1).padStart(4, '0')}`;
    const estimatedHours = randomNumber(10, 100);
    const actualHours = randomNumber(5, estimatedHours + 20);

    demoData.workOrders.push({
        id: woId,
        title: `${randomFromArray(serviceTypes)} - ${randomFromArray(['Building', 'Floor', 'Zone', 'Area'])} ${randomNumber(1, 50)}`,
        client: randomFromArray(clientNames) + (i > 100 ? ` #${randomNumber(1, 999)}` : ''),
        status: randomFromArray(['pending', 'in-progress', 'completed', 'on-hold']),
        priority: randomFromArray(priorities),
        assignedDate: generateDate(-randomNumber(1, 60)),
        dueDate: generateDate(randomNumber(1, 30)),
        technicians: [randomFromArray(techNames), randomFromArray(techNames)].filter((v, i, a) => a.indexOf(v) === i),
        estimatedHours: estimatedHours,
        actualHours: actualHours,
        description: `Complete ${randomFromArray(serviceTypes).toLowerCase()} of ${randomFromArray(['HVAC', 'Electrical', 'Plumbing', 'Network'])} systems`,
        tasks: [
            { id: 1, name: 'Initial inspection', status: 'completed' },
            { id: 2, name: 'Parts procurement', status: randomFromArray(['completed', 'in-progress', 'pending']) },
            { id: 3, name: 'Installation/Repair', status: randomFromArray(['in-progress', 'pending']) },
            { id: 4, name: 'Testing & verification', status: 'pending' },
            { id: 5, name: 'Final documentation', status: 'pending' }
        ],
        materials: [
            { name: randomFromArray(['Filter', 'Pump', 'Motor', 'Sensor', 'Controller']), quantity: randomNumber(1, 10), cost: randomNumber(50, 500) }
        ]
    });
}

// Generate clients (1000 rows)
for (let i = demoData.clients.length; i < 1000; i++) {
    const clientId = `CLI${String(i + 1).padStart(5, '0')}`;
    const companyName = randomFromArray(clientNames) + (i > 100 ? ` #${randomNumber(1, 999)}` : '');

    demoData.clients.push({
        id: clientId,
        name: companyName,
        contactPerson: `${randomFromArray(['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily'])} ${randomFromArray(['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller'])}`,
        email: `contact${i}@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: `+1 (${randomNumber(200, 999)}) ${randomNumber(100, 999)}-${randomNumber(1000, 9999)}`,
        address: `${randomNumber(100, 9999)} ${randomFromArray(['Commerce', 'Business', 'Enterprise', 'Corporate'])} ${randomFromArray(['St', 'Ave', 'Blvd'])}, City ${randomNumber(1, 50)}, CA ${randomNumber(90001, 99999)}`,
        industry: randomFromArray(['Technology', 'Healthcare', 'Retail', 'Manufacturing', 'Finance', 'Education', 'Hospitality', 'Real Estate']),
        accountStatus: randomFromArray(['active', 'active', 'active', 'inactive']),
        totalJobs: randomNumber(5, 200),
        activeContracts: randomNumber(0, 5),
        lastService: generateDate(-randomNumber(1, 90)),
        rating: (randomNumber(35, 50) / 10).toFixed(1),
        totalRevenue: randomNumber(5000, 500000)
    });
}

// Generate team members (up to 100 to keep reasonable)
const teamTarget = Math.min(100, demoData.team.length + 90);
for (let i = demoData.team.length; i < teamTarget; i++) {
    const firstName = randomFromArray(['Mike', 'Sarah', 'David', 'Emily', 'John', 'Jane', 'Robert', 'Lisa', 'Tom', 'Anna', 'James', 'Mary', 'Chris', 'Amy', 'Steve']);
    const lastName = randomFromArray(['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas']);
    const fullName = `${firstName} ${lastName}`;
    const totalJobs = randomNumber(20, 150);
    const activeJobs = randomNumber(1, 8);

    demoData.team.push({
        id: `TECH${String(i + 1).padStart(3, '0')}`,
        name: fullName,
        role: randomFromArray(['Senior Technician', 'Lead Technician', 'Technician', 'Junior Technician', 'Specialist']),
        specialization: randomFromArray(['HVAC', 'Electrical', 'Plumbing', 'General Maintenance', 'Security Systems', 'Network Infrastructure']),
        phone: `+1 (555) ${randomNumber(100, 999)}-${randomNumber(1000, 9999)}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@fieldservice.com`,
        status: randomFromArray(['available', 'on-job', 'off-duty']),
        rating: (randomNumber(35, 50) / 10).toFixed(1),
        totalJobs: totalJobs,
        activeJobs: activeJobs,
        completedThisMonth: randomNumber(5, 25),
        efficiency: randomNumber(75, 100) + '%',
        location: { lat: 37.7749 + (Math.random() - 0.5) * 0.5, lng: -122.4194 + (Math.random() - 0.5) * 0.5 },
        certifications: [randomFromArray(['HVAC Certified', 'Electrical License', 'Safety Certified', 'EPA Certified'])],
        joinDate: `20${randomNumber(18, 24)}-${String(randomNumber(1, 12)).padStart(2, '0')}-${String(randomNumber(1, 28)).padStart(2, '0')}`
    });
}

console.log(`✅ Bulk data generated: ${demoData.appointments.length} appointments, ${demoData.workOrders.length} work orders, ${demoData.clients.length} clients, ${demoData.team.length} team members`);

// Export for use in app.js
window.demoData = demoData;
