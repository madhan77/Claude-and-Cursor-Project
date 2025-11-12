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
    changeRequestCount = 200
  } = options;

  const results = {
    projects: [],
    tasks: [],
    epics: [],
    features: [],
    stories: [],
    sprints: [],
    requests: [],
    changeRequests: []
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
          parentId: i > 20 && Math.random() > 0.7 ? randomElement(projectsData.slice(0, 20)).id : '',
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

    const totalRecords = projectCount + taskCount + epicCount + featureCount + storyCount + sprintCount + requestCount + changeRequestCount;
    const calendarEntriesCount = results.tasks.filter(t => t.dueDate).length;
    console.log(`\n✓ Successfully generated ${totalRecords} total records!`);
    console.log(`\nBreakdown:`);
    console.log(`  - Projects: ${projectCount}`);
    console.log(`  - Tasks: ${taskCount} (${calendarEntriesCount} calendar entries)`);
    console.log(`  - Epics: ${epicCount}`);
    console.log(`  - Features: ${featureCount}`);
    console.log(`  - Stories: ${storyCount}`);
    console.log(`  - Sprints: ${sprintCount}`);
    console.log(`  - Requests: ${requestCount}`);
    console.log(`  - Change Requests: ${changeRequestCount}`);

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
