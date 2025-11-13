#!/usr/bin/env node

/**
 * Standalone script to populate demo data in Firestore
 * This uses Firebase Admin SDK to directly insert data
 */

const admin = require('firebase-admin');

// Firebase config from project
const firebaseConfig = {
  projectId: 'claude-project-10b09',
};

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  ...firebaseConfig
});

const db = admin.firestore();

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function createDemoData() {
  console.log('🚀 Starting demo data creation...\n');

  try {
    // Create demo projects
    console.log('📁 Creating demo projects...');
    const project1Ref = await db.collection('projects').add({
      name: 'E-Commerce Platform',
      description: 'Building a modern e-commerce platform with React and Node.js',
      status: 'in-progress',
      color: '#3b82f6',
      startDate: new Date('2024-01-01').toISOString(),
      endDate: new Date('2024-12-31').toISOString(),
      createdBy: 'demo-user-id',
      members: ['demo-user-id'],
      ownerId: 'demo-user-id',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    const project2Ref = await db.collection('projects').add({
      name: 'Mobile App Development',
      description: 'Cross-platform mobile app using React Native',
      status: 'planning',
      color: '#10b981',
      startDate: new Date('2024-03-01').toISOString(),
      endDate: new Date('2024-09-30').toISOString(),
      createdBy: 'demo-user-id',
      members: ['demo-user-id'],
      ownerId: 'demo-user-id',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    console.log('   ✅ Created 2 demo projects');

    // Create demo epics
    console.log('📊 Creating demo epics...');
    await db.collection('epics').add({
      title: 'User Authentication System',
      description: 'Implement comprehensive user authentication and authorization',
      status: 'in-progress',
      priority: 'high',
      projectId: project1Ref.id,
      createdBy: 'demo-user-id',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    await db.collection('epics').add({
      title: 'Payment Integration',
      description: 'Integrate payment gateway with Stripe',
      status: 'planning',
      priority: 'critical',
      projectId: project1Ref.id,
      createdBy: 'demo-user-id',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    console.log('   ✅ Created 2 demo epics');

    // Create demo features
    console.log('✨ Creating demo features...');
    await db.collection('features').add({
      title: 'User Registration',
      description: 'Allow users to register with email and password',
      status: 'completed',
      priority: 'high',
      projectId: project1Ref.id,
      createdBy: 'demo-user-id',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    await db.collection('features').add({
      title: 'Social Login',
      description: 'Enable login with Google and Facebook',
      status: 'in-progress',
      priority: 'medium',
      projectId: project1Ref.id,
      createdBy: 'demo-user-id',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    console.log('   ✅ Created 2 demo features');

    // Create demo stories
    console.log('📖 Creating demo stories...');
    await db.collection('stories').add({
      title: 'As a user, I want to register with email',
      description: 'Users should be able to create an account using their email address',
      status: 'completed',
      priority: 'high',
      storyPoints: 5,
      projectId: project1Ref.id,
      notes: [],
      createdBy: 'demo-user-id',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    await db.collection('stories').add({
      title: 'As a user, I want to reset my password',
      description: 'Users should be able to reset their password via email',
      status: 'in-progress',
      priority: 'medium',
      storyPoints: 3,
      projectId: project1Ref.id,
      notes: [],
      createdBy: 'demo-user-id',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    console.log('   ✅ Created 2 demo stories');

    // Create demo tasks
    console.log('✅ Creating demo tasks...');
    await db.collection('tasks').add({
      title: 'Design login page UI',
      description: 'Create mockups for the login page',
      status: 'completed',
      priority: 'high',
      projectId: project1Ref.id,
      assignee: 'demo-user-id',
      dueDate: addDays(new Date(), -5).toISOString(),
      tags: ['design', 'ui'],
      createdBy: 'demo-user-id',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    await db.collection('tasks').add({
      title: 'Implement email validation',
      description: 'Add email validation on registration form',
      status: 'in-progress',
      priority: 'high',
      projectId: project1Ref.id,
      assignee: 'demo-user-id',
      dueDate: addDays(new Date(), 3).toISOString(),
      tags: ['development', 'backend'],
      createdBy: 'demo-user-id',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    await db.collection('tasks').add({
      title: 'Write unit tests for auth service',
      description: 'Create comprehensive unit tests for authentication service',
      status: 'todo',
      priority: 'medium',
      projectId: project1Ref.id,
      assignee: 'demo-user-id',
      dueDate: addDays(new Date(), 7).toISOString(),
      tags: ['testing'],
      createdBy: 'demo-user-id',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    console.log('   ✅ Created 3 demo tasks');

    // Create demo sprint
    console.log('🏃 Creating demo sprint...');
    const today = new Date();
    await db.collection('sprints').add({
      name: 'Sprint 1 - Authentication',
      goal: 'Complete user authentication features',
      startDate: today.toISOString().split('T')[0],
      endDate: addDays(today, 14).toISOString().split('T')[0],
      status: 'active',
      projectId: project1Ref.id,
      stories: [],
      features: [],
      epics: [],
      createdBy: 'demo-user-id',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    console.log('   ✅ Created 1 demo sprint');

    // Create demo requests
    console.log('📝 Creating demo requests...');
    await db.collection('requests').add({
      title: 'Add dark mode support',
      description: 'Users are requesting a dark mode theme option',
      type: 'feature',
      status: 'in-review',
      priority: 'low',
      projectId: project1Ref.id,
      requestedBy: 'Customer Support',
      createdBy: 'demo-user-id',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    console.log('   ✅ Created 1 demo request');

    // Create demo change request
    console.log('🔄 Creating demo change request...');
    await db.collection('changeRequests').add({
      title: 'Update password strength requirements',
      description: 'Change minimum password length from 6 to 8 characters',
      type: 'enhancement',
      status: 'approved',
      priority: 'medium',
      impact: 'low',
      projectId: project1Ref.id,
      requestedBy: 'Security Team',
      createdBy: 'demo-user-id',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    console.log('   ✅ Created 1 demo change request');

    // Create demo meeting
    console.log('📅 Creating demo meeting...');
    await db.collection('meetings').add({
      title: 'Sprint Planning',
      description: 'Plan the upcoming sprint and assign tasks',
      date: addDays(new Date(), 1).toISOString(),
      time: '10:00',
      duration: 60,
      attendees: ['demo-user-id'],
      projectId: project1Ref.id,
      status: 'scheduled',
      transcript: '',
      actionItems: [],
      createdBy: 'demo-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('   ✅ Created 1 demo meeting');

    console.log('\n🎉 Demo data created successfully!');
    console.log('\n📊 Summary:');
    console.log('   • 2 Projects');
    console.log('   • 2 Epics');
    console.log('   • 2 Features');
    console.log('   • 2 Stories');
    console.log('   • 3 Tasks');
    console.log('   • 1 Sprint');
    console.log('   • 1 Request');
    console.log('   • 1 Change Request');
    console.log('   • 1 Meeting');
    console.log('\n✅ You can now test Demo Mode!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating demo data:', error);
    process.exit(1);
  }
}

// Run the script
createDemoData();
