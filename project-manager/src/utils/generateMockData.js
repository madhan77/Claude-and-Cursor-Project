import { collection, addDoc, writeBatch, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { addDays, subDays, format } from 'date-fns';

// Mock data generators

const epicNames = [
  'Customer Portal Redesign', 'Mobile App Development', 'Payment Integration',
  'User Authentication System', 'Analytics Dashboard', 'API Gateway Implementation',
  'Search Functionality Enhancement', 'Email Notification System', 'Data Migration',
  'Performance Optimization', 'Security Audit', 'Multi-language Support',
  'Third-party Integrations', 'Reporting System', 'Admin Panel Upgrade'
];

const featureNames = [
  'User Registration', 'Login System', 'Profile Management', 'Password Reset',
  'Two-factor Authentication', 'Social Login', 'Dashboard View', 'Data Export',
  'Advanced Search', 'Filtering Options', 'Real-time Updates', 'Push Notifications',
  'File Upload', 'Image Processing', 'Video Streaming', 'Chat Integration'
];

const storyTemplates = [
  'As a user, I want to {action} so that {benefit}',
  'As an admin, I want to {action} so that {benefit}',
  'As a customer, I want to {action} so that {benefit}'
];

const actions = [
  'view my profile', 'update settings', 'export data', 'filter results',
  'search by keyword', 'sort by date', 'receive notifications', 'upload files',
  'delete items', 'share content', 'customize layout', 'track progress'
];

const benefits = [
  'I can track my activities', 'I can improve productivity', 'I have better control',
  'I can collaborate effectively', 'I can make informed decisions', 'I save time',
  'I have better visibility', 'I can personalize my experience'
];

const statuses = ['planning', 'in-progress', 'testing', 'completed', 'on-hold'];
const priorities = ['low', 'medium', 'high', 'critical'];
const requestStatuses = ['new', 'in-review', 'approved', 'rejected', 'in-progress', 'completed'];
const taskStatuses = ['todo', 'in-progress', 'completed'];
const projectColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const taskTags = ['bug', 'feature', 'enhancement', 'documentation', 'testing', 'deployment', 'refactoring'];

const meetingTypes = [
  'Sprint Planning',
  'Daily Standup',
  'Sprint Review',
  'Sprint Retrospective',
  'Backlog Refinement',
  'General Discussion'
];

const meetingStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];

const attendees = [
  'john.doe@example.com',
  'jane.smith@example.com',
  'mike.johnson@example.com',
  'sarah.williams@example.com',
  'robert.brown@example.com',
  'emily.davis@example.com',
  'david.miller@example.com',
  'lisa.wilson@example.com',
  'james.moore@example.com',
  'maria.taylor@example.com'
];

const sampleTranscripts = [
  `[10:00:15] John: Good morning everyone, let's start today's sprint planning meeting.
[10:00:30] Sarah: Thanks John. I've reviewed the backlog and we have 15 high priority stories ready.
[10:01:45] Mike: We need to create a new epic for the customer portal redesign. This is critical for Q4.
[10:02:20] Lisa: Agreed. I'll take ownership of that epic. We should also update the authentication feature with two-factor support.
[10:03:10] John: Great. Action items: Sarah will create the customer portal epic, Lisa will update the authentication feature story, and Mike will fix the high priority bug in the payment system.
[10:04:00] Emily: I'll implement the new dashboard feature this sprint. Expected to be 8 story points.
[10:05:15] John: Perfect. Let's target completion by end of next week.`,

  `[14:30:00] Robert: Welcome to the sprint retrospective. What went well this sprint?
[14:30:45] Emily: The team collaboration was excellent. We completed 95% of our committed stories.
[14:31:20] David: I need to update three stories with the latest requirements from the product owner meeting.
[14:32:00] Maria: We should create a task to improve our testing coverage. It's currently below our target.
[14:33:10] Robert: Action items: David will update the three stories by tomorrow, Maria will create a testing improvement task with high priority, and I'll schedule a follow-up meeting for next week.`,

  `[09:00:00] Jane: Good morning team. Daily standup time.
[09:00:15] Mike: Yesterday I completed the API integration story. Today I'll start working on the new feature for data export.
[09:00:45] Sarah: I'm working on the mobile app epic. Need to create two new features under it for push notifications and offline mode.
[09:01:20] John: I'll implement the search functionality task today. Should be completed by EOD.
[09:02:00] Jane: Great progress everyone. Action items: Sarah create the two features, Mike start the data export feature, and John complete the search task today.`,

  `[15:00:00] Lisa: Sprint review meeting. Let's demonstrate what we've completed.
[15:01:30] Robert: We completed the payment integration epic ahead of schedule. This was a major milestone.
[15:02:45] Emily: I need to fix a critical bug in the user authentication system. This is blocking the next release.
[15:03:20] David: We should update the admin panel feature to include the new reporting capabilities.
[15:04:00] Lisa: Action items: Emily will fix the authentication bug with critical priority, David will update the admin panel feature, and Robert will create a new epic for the analytics dashboard.`,

  `[11:00:00] Sarah: Backlog refinement session. We have 25 stories to review.
[11:01:15] Mike: Story #123 needs more clarity. I'll update the acceptance criteria and add implementation notes.
[11:02:30] Jane: We should create a new task under Story #145 for database optimization. This is important for performance.
[11:03:45] John: I'll implement the caching feature this week. Estimated 5 story points.
[11:05:00] Sarah: Action items: Mike update Story #123, Jane create the database optimization task, and John implement the caching feature by Friday.`
];

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEpicName(index) {
  return `${randomElement(epicNames)} - Phase ${randomInt(1, 5)} (${index})`;
}

function generateFeatureName(index) {
  return `${randomElement(featureNames)} v${randomInt(1, 3)}.${randomInt(0, 9)} (${index})`;
}

function generateStoryTitle(index) {
  const template = randomElement(storyTemplates);
  const action = randomElement(actions);
  const benefit = randomElement(benefits);
  return template.replace('{action}', action).replace('{benefit}', benefit) + ` #${index}`;
}

function generateProjectName(index) {
  const prefixes = ['Project', 'Initiative', 'Program', 'Campaign'];
  const suffixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Phoenix', 'Titan', 'Nova', 'Nexus'];
  return `${randomElement(prefixes)} ${randomElement(suffixes)} ${randomInt(2023, 2025)} (${index})`;
}

function generateTaskTitle(index) {
  const verbs = ['Implement', 'Fix', 'Update', 'Review', 'Test', 'Deploy', 'Document', 'Refactor'];
  const subjects = ['authentication flow', 'database schema', 'API endpoints', 'user interface', 'error handling', 'caching layer', 'payment integration', 'notification system'];
  return `${randomElement(verbs)} ${randomElement(subjects)} #${index}`;
}

function generateDescription() {
  const descriptions = [
    'This feature will enhance user experience by providing more intuitive controls.',
    'Implementation requires careful consideration of security and performance.',
    'This addresses a critical user pain point identified in recent feedback.',
    'Integration with existing systems needs to be seamless and backward compatible.',
    'Expected to significantly improve system efficiency and user satisfaction.'
  ];
  return randomElement(descriptions);
}

function generateMeetingTitle(type, index) {
  switch (type) {
    case 'Sprint Planning':
      return `Sprint ${randomInt(1, 20)} Planning - Q${randomInt(1, 4)} 2024`;
    case 'Daily Standup':
      return `Daily Standup - ${format(new Date(), 'MMM dd, yyyy')}`;
    case 'Sprint Review':
      return `Sprint ${randomInt(1, 20)} Review & Demo`;
    case 'Sprint Retrospective':
      return `Sprint ${randomInt(1, 20)} Retrospective`;
    case 'Backlog Refinement':
      return `Backlog Refinement Session #${index}`;
    case 'General Discussion':
      return `Team Discussion - ${randomElement(['Architecture', 'Technical Debt', 'Feature Planning', 'Process Improvement'])}`;
    default:
      return `Team Meeting #${index}`;
  }
}

function generateMeetingDescription(type) {
  const descriptions = {
    'Sprint Planning': 'Plan and estimate work for the upcoming sprint. Review backlog items and commit to sprint goals.',
    'Daily Standup': 'Quick sync on progress, blockers, and plans for the day.',
    'Sprint Review': 'Demonstrate completed work to stakeholders and gather feedback.',
    'Sprint Retrospective': 'Reflect on the sprint and identify improvements for the team.',
    'Backlog Refinement': 'Review and refine backlog items, add details, and estimate effort.',
    'General Discussion': 'Open discussion on team processes, technical decisions, and planning.'
  };
  return descriptions[type] || 'Team meeting to discuss project progress and next steps.';
}

function generateActionItemsFromTranscript(transcript, meetingId, projectId, sprintId) {
  const actionItems = [];

  // Simple patterns to extract action items
  const patterns = [
    { regex: /create (?:a |an |the )?(?:new )?(\w+(?:\s+\w+)*)/gi, type: 'story' },
    { regex: /implement (?:a |an |the )?(\w+(?:\s+\w+)*)/gi, type: 'task' },
    { regex: /fix (?:a |an |the )?(\w+(?:\s+\w+)*)/gi, type: 'task' },
    { regex: /update (?:a |an |the )?(\w+(?:\s+\w+)*)/gi, type: 'story' }
  ];

  patterns.forEach(({ regex, type }) => {
    const matches = [...transcript.matchAll(regex)];
    matches.slice(0, 3).forEach((match, idx) => {
      const title = match[1].charAt(0).toUpperCase() + match[1].slice(0, 50);
      actionItems.push({
        id: `action-${Date.now()}-${idx}`,
        title: `${match[0].split(' ')[0]} ${title}`,
        description: `Action item extracted from meeting discussion: ${title}`,
        type: type,
        priority: randomElement(['high', 'medium', 'low']),
        assignee: randomElement(attendees),
        status: 'planning',
        projectId: projectId,
        sprintId: sprintId,
        meetingId: meetingId,
        approved: true
      });
    });
  });

  return actionItems.slice(0, 5); // Return up to 5 action items per meeting
}

function randomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return format(date, 'yyyy-MM-dd');
}

// Helper function to commit batches
async function commitBatch(batch, batchNumber, totalBatches) {
  await batch.commit();
  console.log(`  Committed batch ${batchNumber}/${totalBatches}`);
}

// Helper function to create documents in batches
async function createDocumentsInBatches(collectionName, documents, batchSize = 500) {
  const totalBatches = Math.ceil(documents.length / batchSize);

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = writeBatch(db);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const batchDocs = documents.slice(i, i + batchSize);

    batchDocs.forEach(docData => {
      const docRef = doc(collection(db, collectionName));
      batch.set(docRef, docData.data);
      docData.id = docRef.id; // Store the generated ID
    });

    await commitBatch(batch, batchNumber, totalBatches);
  }
}

export async function generateMockData(userId, options = {}) {
  const {
    projectCount = 100,
    taskCount = 500,
    epicCount = 200,
    featureCount = 400,
    storyCount = 800,
    sprintCount = 50,
    requestCount = 300,
    changeRequestCount = 200,
    meetingCount = 100
  } = options;

  const results = {
    projects: [],
    tasks: [],
    epics: [],
    features: [],
    stories: [],
    sprints: [],
    requests: [],
    changeRequests: [],
    meetings: []
  };

  console.log('Starting mock data generation with batched writes...');

  try {
    // Generate Projects data
    console.log(`Generating ${projectCount} projects...`);
    const projectsData = [];
    for (let i = 1; i <= projectCount; i++) {
      const startDate = subDays(new Date(), randomInt(1, 365));
      const endDate = addDays(startDate, randomInt(30, 180));

      const projectDoc = {
        data: {
          name: generateProjectName(i),
          description: generateDescription(),
          status: randomElement(statuses),
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          color: randomElement(projectColors),
          parentId: '',
          members: [userId],
          createdBy: userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      };
      projectsData.push(projectDoc);
    }
    await createDocumentsInBatches('projects', projectsData);
    results.projects = projectsData.map(p => ({ id: p.id, ...p.data }));
    console.log(`✓ Created ${projectCount} projects`);

    // Generate Tasks data (including calendar entries via dueDate)
    console.log(`Generating ${taskCount} tasks (with calendar entries)...`);
    const tasksData = [];
    for (let i = 1; i <= taskCount; i++) {
      const hasDueDate = Math.random() > 0.3; // 70% of tasks have due dates (calendar entries)
      const dueDate = hasDueDate ? randomDate(subDays(new Date(), 30), addDays(new Date(), 90)) : null;

      const numTags = randomInt(1, 3);
      const selectedTags = [];
      for (let j = 0; j < numTags; j++) {
        const tag = randomElement(taskTags);
        if (!selectedTags.includes(tag)) {
          selectedTags.push(tag);
        }
      }

      const taskDoc = {
        data: {
          title: generateTaskTitle(i),
          description: generateDescription(),
          status: randomElement(taskStatuses),
          priority: randomElement(priorities),
          dueDate: dueDate,
          tags: selectedTags,
          assignedTo: `user${randomInt(1, 20)}@example.com`,
          projectId: projectsData.length > 0 ? randomElement(projectsData).id : '',
          createdBy: userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      };
      tasksData.push(taskDoc);
    }
    await createDocumentsInBatches('tasks', tasksData);
    results.tasks = tasksData.map(t => ({ id: t.id, ...t.data }));
    const calendarEntriesCount = tasksData.filter(t => t.data.dueDate).length;
    console.log(`✓ Created ${taskCount} tasks (${calendarEntriesCount} with calendar entries)`);

    // Generate Epics data
    console.log(`Generating ${epicCount} epics...`);
    const epicsData = [];
    for (let i = 1; i <= epicCount; i++) {
      const epicDoc = {
        data: {
          name: generateEpicName(i),
          description: generateDescription(),
          status: randomElement(statuses),
          businessValue: `This epic will deliver ${randomInt(50, 500)}% ROI over the next ${randomInt(6, 24)} months.`,
          targetDate: randomDate(new Date(), addDays(new Date(), 365)),
          createdBy: userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      };
      epicsData.push(epicDoc);
    }
    await createDocumentsInBatches('epics', epicsData);
    results.epics = epicsData.map(e => ({ id: e.id, ...e.data }));
    console.log(`✓ Created ${epicCount} epics`);

    // Generate Features data
    console.log(`Generating ${featureCount} features...`);
    const featuresData = [];
    for (let i = 1; i <= featureCount; i++) {
      const epicId = randomElement(epicsData).id;
      const featureDoc = {
        data: {
          name: generateFeatureName(i),
          description: generateDescription(),
          status: randomElement(statuses),
          epicId,
          acceptanceCriteria: `- All tests must pass\n- Code review completed\n- Documentation updated\n- Performance benchmarks met`,
          targetDate: randomDate(new Date(), addDays(new Date(), 180)),
          createdBy: userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      };
      featuresData.push(featureDoc);
    }
    await createDocumentsInBatches('features', featuresData);
    results.features = featuresData.map(f => ({ id: f.id, ...f.data }));
    console.log(`✓ Created ${featureCount} features`);

    // Generate Stories data
    console.log(`Generating ${storyCount} stories...`);
    const storiesData = [];
    for (let i = 1; i <= storyCount; i++) {
      const featureId = randomElement(featuresData).id;
      const storyDoc = {
        data: {
          title: generateStoryTitle(i),
          description: generateDescription(),
          status: randomElement(statuses),
          featureId,
          priority: randomElement(priorities.slice(0, 3)),
          storyPoints: randomElement([1, 2, 3, 5, 8, 13]),
          acceptanceCriteria: `Given a user\nWhen they perform the action\nThen the expected result occurs`,
          targetDate: randomDate(new Date(), addDays(new Date(), 90)),
          notes: [
            {
              id: `${Date.now()}-${i}`,
              text: 'Initial analysis completed. Waiting for design mockups.',
              createdBy: userId,
              createdAt: new Date().toISOString()
            }
          ],
          createdBy: userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      };
      storiesData.push(storyDoc);
    }
    await createDocumentsInBatches('stories', storiesData);
    results.stories = storiesData.map(s => ({ id: s.id, ...s.data }));
    console.log(`✓ Created ${storyCount} stories`);

    // Generate Sprints data
    console.log(`Generating ${sprintCount} sprints...`);
    const sprintsData = [];
    for (let i = 1; i <= sprintCount; i++) {
      const startDate = subDays(new Date(), (sprintCount - i) * 14);
      const endDate = addDays(startDate, 14);

      const sprintStories = [];
      const sprintFeatures = [];
      const sprintEpics = [];

      const numStories = randomInt(5, 20);
      for (let j = 0; j < numStories && j < storiesData.length; j++) {
        const story = randomElement(storiesData);
        if (!sprintStories.includes(story.id)) {
          sprintStories.push(story.id);
        }
      }

      const numFeatures = randomInt(2, 8);
      for (let j = 0; j < numFeatures && j < featuresData.length; j++) {
        const feature = randomElement(featuresData);
        if (!sprintFeatures.includes(feature.id)) {
          sprintFeatures.push(feature.id);
        }
      }

      const numEpics = randomInt(1, 4);
      for (let j = 0; j < numEpics && j < epicsData.length; j++) {
        const epic = randomElement(epicsData);
        if (!sprintEpics.includes(epic.id)) {
          sprintEpics.push(epic.id);
        }
      }

      const sprintDoc = {
        data: {
          name: `Sprint ${i} - Q${Math.ceil(i / 13)}`,
          goal: `Complete ${numStories} user stories and deliver key features for improved user experience.`,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          stories: sprintStories,
          features: sprintFeatures,
          epics: sprintEpics,
          createdBy: userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      };
      sprintsData.push(sprintDoc);
    }
    await createDocumentsInBatches('sprints', sprintsData);
    results.sprints = sprintsData.map(s => ({ id: s.id, ...s.data }));
    console.log(`✓ Created ${sprintCount} sprints`);

    // Generate Requests data
    console.log(`Generating ${requestCount} requests...`);
    const requestsData = [];
    for (let i = 1; i <= requestCount; i++) {
      const requestDoc = {
        data: {
          title: `Release Request #${i} - ${randomElement(['Bug Fix', 'Feature Release', 'Hotfix', 'Security Patch'])}`,
          description: `${generateDescription()} This release addresses critical production issues and includes new features requested by stakeholders.`,
          status: randomElement(requestStatuses),
          priority: randomElement(priorities),
          requestedBy: `user${randomInt(1, 50)}@example.com`,
          targetDate: randomDate(new Date(), addDays(new Date(), 60)),
          releaseVersion: `v${randomInt(1, 10)}.${randomInt(0, 20)}.${randomInt(0, 100)}`,
          createdBy: userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      };
      requestsData.push(requestDoc);
    }
    await createDocumentsInBatches('requests', requestsData);
    results.requests = requestsData.map(r => ({ id: r.id, ...r.data }));
    console.log(`✓ Created ${requestCount} requests`);

    // Generate Change Requests data
    console.log(`Generating ${changeRequestCount} change requests...`);
    const changeRequestsData = [];
    for (let i = 1; i <= changeRequestCount; i++) {
      const changeRequestDoc = {
        data: {
          title: `Change Request #${i} - ${randomElement(['Database Migration', 'Configuration Update', 'Infrastructure Change', 'Security Update'])}`,
          description: `${generateDescription()} This change requires coordination with DevOps and QA teams for validation.`,
          status: randomElement(requestStatuses),
          priority: randomElement(priorities),
          requestedBy: `manager${randomInt(1, 20)}@example.com`,
          implementationDate: randomDate(new Date(), addDays(new Date(), 45)),
          impactAnalysis: `This change will affect ${randomInt(5, 50)} users and requires ${randomInt(1, 8)} hours of downtime.`,
          rollbackPlan: `Restore from backup taken at ${format(new Date(), 'yyyy-MM-dd HH:mm')}. Estimated rollback time: ${randomInt(15, 120)} minutes.`,
          createdBy: userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      };
      changeRequestsData.push(changeRequestDoc);
    }
    await createDocumentsInBatches('changeRequests', changeRequestsData);
    results.changeRequests = changeRequestsData.map(cr => ({ id: cr.id, ...cr.data }));
    console.log(`✓ Created ${changeRequestCount} change requests`);

    // Generate Meetings data
    console.log(`Generating ${meetingCount} meetings...`);
    const meetingsData = [];
    for (let i = 1; i <= meetingCount; i++) {
      const type = randomElement(meetingTypes);
      const statusWeights = [0.3, 0.1, 0.5, 0.1]; // 30% scheduled, 10% in-progress, 50% completed, 10% cancelled
      const rand = Math.random();
      let status;
      if (rand < 0.3) status = 'scheduled';
      else if (rand < 0.4) status = 'in-progress';
      else if (rand < 0.9) status = 'completed';
      else status = 'cancelled';

      // Date logic based on status
      let scheduledDate, scheduledTime, startedAt, completedAt;
      if (status === 'scheduled') {
        // Future meetings
        const futureDate = addDays(new Date(), randomInt(1, 30));
        scheduledDate = format(futureDate, 'yyyy-MM-dd');
        scheduledTime = `${randomInt(9, 17)}:${randomElement(['00', '30'])}`;
      } else if (status === 'in-progress') {
        // Today's meetings
        scheduledDate = format(new Date(), 'yyyy-MM-dd');
        scheduledTime = `${randomInt(9, 17)}:${randomElement(['00', '30'])}`;
        startedAt = new Date().toISOString();
      } else {
        // Past meetings (completed or cancelled)
        const pastDate = subDays(new Date(), randomInt(1, 60));
        scheduledDate = format(pastDate, 'yyyy-MM-dd');
        scheduledTime = `${randomInt(9, 17)}:${randomElement(['00', '30'])}`;
        if (status === 'completed') {
          startedAt = pastDate.toISOString();
          completedAt = addDays(pastDate, 0).toISOString();
        }
      }

      // Select random attendees
      const numAttendees = randomInt(3, 8);
      const meetingAttendees = [];
      for (let j = 0; j < numAttendees; j++) {
        const attendee = randomElement(attendees);
        if (!meetingAttendees.includes(attendee)) {
          meetingAttendees.push(attendee);
        }
      }

      // Link to project and sprint
      const linkedProject = projectsData.length > 0 && Math.random() > 0.3 ? randomElement(projectsData) : null;
      const linkedSprint = sprintsData.length > 0 && Math.random() > 0.4 ? randomElement(sprintsData) : null;

      // For completed meetings, add transcript and action items
      let transcript = '';
      let actionItems = [];
      if (status === 'completed') {
        transcript = randomElement(sampleTranscripts);
        actionItems = generateActionItemsFromTranscript(
          transcript,
          '', // Will be set after doc is created
          linkedProject?.id || '',
          linkedSprint?.id || ''
        );
      }

      const meetingDoc = {
        data: {
          title: generateMeetingTitle(type, i),
          type: type,
          description: generateMeetingDescription(type),
          scheduledDate: scheduledDate,
          scheduledTime: scheduledTime,
          duration: type === 'Daily Standup' ? 15 : randomElement([30, 60, 90, 120]),
          projectId: linkedProject?.id || '',
          sprintId: linkedSprint?.id || '',
          attendees: meetingAttendees,
          organizer: randomElement(attendees),
          location: 'Virtual',
          status: status,
          transcript: transcript,
          actionItems: actionItems,
          startedAt: startedAt || null,
          completedAt: completedAt || null,
          createdBy: userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }
      };
      meetingsData.push(meetingDoc);
    }
    await createDocumentsInBatches('meetings', meetingsData);
    results.meetings = meetingsData.map(m => ({ id: m.id, ...m.data }));

    const scheduledCount = meetingsData.filter(m => m.data.status === 'scheduled').length;
    const completedCount = meetingsData.filter(m => m.data.status === 'completed').length;
    const inProgressCount = meetingsData.filter(m => m.data.status === 'in-progress').length;
    console.log(`✓ Created ${meetingCount} meetings (${scheduledCount} scheduled, ${inProgressCount} in-progress, ${completedCount} completed)`);

    const totalRecords = projectCount + taskCount + epicCount + featureCount + storyCount + sprintCount + requestCount + changeRequestCount + meetingCount;
    const finalCalendarCount = results.tasks.filter(t => t.dueDate).length;
    console.log(`\n✓ Successfully generated ${totalRecords} total records!`);
    console.log(`\nBreakdown:`);
    console.log(`  - Projects: ${projectCount}`);
    console.log(`  - Tasks: ${taskCount} (${finalCalendarCount} calendar entries)`);
    console.log(`  - Epics: ${epicCount}`);
    console.log(`  - Features: ${featureCount}`);
    console.log(`  - Stories: ${storyCount}`);
    console.log(`  - Sprints: ${sprintCount}`);
    console.log(`  - Requests: ${requestCount}`);
    console.log(`  - Change Requests: ${changeRequestCount}`);
    console.log(`  - Meetings: ${meetingCount} (${completedCount} with transcripts & action items)`);

    return results;

  } catch (error) {
    console.error('Error generating mock data:', error);
    throw error;
  }
}

// Helper function to clear all collections (use with caution!)
export async function clearAllData() {
  console.warn('This function is not implemented to prevent accidental data loss.');
  console.warn('To clear data, use Firebase Console or write your own deletion script.');
}
