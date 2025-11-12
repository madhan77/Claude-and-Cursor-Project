import { collection, addDoc, Timestamp } from 'firebase/firestore';
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

export async function generateMockData(userId, options = {}) {
  const {
    epicCount = 200,
    featureCount = 400,
    storyCount = 800,
    sprintCount = 50,
    requestCount = 300,
    changeRequestCount = 200
  } = options;

  const results = {
    epics: [],
    features: [],
    stories: [],
    sprints: [],
    requests: [],
    changeRequests: []
  };

  console.log('Starting mock data generation...');

  try {
    // Generate Epics
    console.log(`Generating ${epicCount} epics...`);
    for (let i = 1; i <= epicCount; i++) {
      const epicData = {
        name: generateEpicName(i),
        description: generateDescription(),
        status: randomElement(statuses),
        businessValue: `This epic will deliver ${randomInt(50, 500)}% ROI over the next ${randomInt(6, 24)} months.`,
        targetDate: randomDate(new Date(), addDays(new Date(), 365)),
        createdBy: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'epics'), epicData);
      results.epics.push({ id: docRef.id, ...epicData });

      if (i % 20 === 0) {
        console.log(`  Created ${i}/${epicCount} epics`);
      }
    }
    console.log(`✓ Created ${epicCount} epics`);

    // Generate Features
    console.log(`Generating ${featureCount} features...`);
    for (let i = 1; i <= featureCount; i++) {
      const epicId = randomElement(results.epics).id;
      const featureData = {
        name: generateFeatureName(i),
        description: generateDescription(),
        status: randomElement(statuses),
        epicId,
        acceptanceCriteria: `- All tests must pass\n- Code review completed\n- Documentation updated\n- Performance benchmarks met`,
        targetDate: randomDate(new Date(), addDays(new Date(), 180)),
        createdBy: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'features'), featureData);
      results.features.push({ id: docRef.id, ...featureData });

      if (i % 40 === 0) {
        console.log(`  Created ${i}/${featureCount} features`);
      }
    }
    console.log(`✓ Created ${featureCount} features`);

    // Generate Stories
    console.log(`Generating ${storyCount} stories...`);
    for (let i = 1; i <= storyCount; i++) {
      const featureId = randomElement(results.features).id;
      const storyData = {
        title: generateStoryTitle(i),
        description: generateDescription(),
        status: randomElement(statuses),
        featureId,
        priority: randomElement(priorities.slice(0, 3)), // low, medium, high
        storyPoints: randomElement([1, 2, 3, 5, 8, 13]),
        acceptanceCriteria: `Given a user\nWhen they perform the action\nThen the expected result occurs`,
        targetDate: randomDate(new Date(), addDays(new Date(), 90)),
        notes: [
          {
            id: Date.now().toString(),
            text: 'Initial analysis completed. Waiting for design mockups.',
            createdBy: userId,
            createdAt: new Date().toISOString()
          }
        ],
        createdBy: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'stories'), storyData);
      results.stories.push({ id: docRef.id, ...storyData });

      if (i % 80 === 0) {
        console.log(`  Created ${i}/${storyCount} stories`);
      }
    }
    console.log(`✓ Created ${storyCount} stories`);

    // Generate Sprints
    console.log(`Generating ${sprintCount} sprints...`);
    for (let i = 1; i <= sprintCount; i++) {
      const startDate = subDays(new Date(), (sprintCount - i) * 14);
      const endDate = addDays(startDate, 14);

      // Randomly select stories, features, and epics for this sprint
      const sprintStories = [];
      const sprintFeatures = [];
      const sprintEpics = [];

      const numStories = randomInt(5, 20);
      for (let j = 0; j < numStories; j++) {
        const story = randomElement(results.stories);
        if (!sprintStories.includes(story.id)) {
          sprintStories.push(story.id);
        }
      }

      const numFeatures = randomInt(2, 8);
      for (let j = 0; j < numFeatures; j++) {
        const feature = randomElement(results.features);
        if (!sprintFeatures.includes(feature.id)) {
          sprintFeatures.push(feature.id);
        }
      }

      const numEpics = randomInt(1, 4);
      for (let j = 0; j < numEpics; j++) {
        const epic = randomElement(results.epics);
        if (!sprintEpics.includes(epic.id)) {
          sprintEpics.push(epic.id);
        }
      }

      const sprintData = {
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
      };

      const docRef = await addDoc(collection(db, 'sprints'), sprintData);
      results.sprints.push({ id: docRef.id, ...sprintData });

      if (i % 10 === 0) {
        console.log(`  Created ${i}/${sprintCount} sprints`);
      }
    }
    console.log(`✓ Created ${sprintCount} sprints`);

    // Generate Requests
    console.log(`Generating ${requestCount} requests...`);
    for (let i = 1; i <= requestCount; i++) {
      const requestData = {
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
      };

      const docRef = await addDoc(collection(db, 'requests'), requestData);
      results.requests.push({ id: docRef.id, ...requestData });

      if (i % 30 === 0) {
        console.log(`  Created ${i}/${requestCount} requests`);
      }
    }
    console.log(`✓ Created ${requestCount} requests`);

    // Generate Change Requests
    console.log(`Generating ${changeRequestCount} change requests...`);
    for (let i = 1; i <= changeRequestCount; i++) {
      const changeRequestData = {
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
      };

      const docRef = await addDoc(collection(db, 'changeRequests'), changeRequestData);
      results.changeRequests.push({ id: docRef.id, ...changeRequestData });

      if (i % 20 === 0) {
        console.log(`  Created ${i}/${changeRequestCount} change requests`);
      }
    }
    console.log(`✓ Created ${changeRequestCount} change requests`);

    const totalRecords = epicCount + featureCount + storyCount + sprintCount + requestCount + changeRequestCount;
    console.log(`\n✓ Successfully generated ${totalRecords} total records!`);
    console.log(`\nBreakdown:`);
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
