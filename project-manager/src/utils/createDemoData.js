import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { addDays } from 'date-fns';

export async function createDemoData() {
  console.log('Creating demo data...');

  try {
    // Create demo projects
    const project1 = await addDoc(collection(db, 'projects'), {
      name: 'E-Commerce Platform',
      description: 'Building a modern e-commerce platform with React and Node.js',
      status: 'in-progress',
      color: '#3b82f6',
      startDate: new Date('2024-01-01').toISOString(),
      endDate: new Date('2024-12-31').toISOString(),
      createdBy: 'demo-user-id',
      members: ['demo-user-id'],
      ownerId: 'demo-user-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    const project2 = await addDoc(collection(db, 'projects'), {
      name: 'Mobile App Development',
      description: 'Cross-platform mobile app using React Native',
      status: 'planning',
      color: '#10b981',
      startDate: new Date('2024-03-01').toISOString(),
      endDate: new Date('2024-09-30').toISOString(),
      createdBy: 'demo-user-id',
      members: ['demo-user-id'],
      ownerId: 'demo-user-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('Created 2 demo projects');

    // Create demo epics
    await addDoc(collection(db, 'epics'), {
      title: 'User Authentication System',
      description: 'Implement comprehensive user authentication and authorization',
      status: 'in-progress',
      priority: 'high',
      projectId: project1.id,
      createdBy: 'demo-user-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    await addDoc(collection(db, 'epics'), {
      title: 'Payment Integration',
      description: 'Integrate payment gateway with Stripe',
      status: 'planning',
      priority: 'critical',
      projectId: project1.id,
      createdBy: 'demo-user-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('Created 2 demo epics');

    // Create demo features
    await addDoc(collection(db, 'features'), {
      title: 'User Registration',
      description: 'Allow users to register with email and password',
      status: 'completed',
      priority: 'high',
      projectId: project1.id,
      createdBy: 'demo-user-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    await addDoc(collection(db, 'features'), {
      title: 'Social Login',
      description: 'Enable login with Google and Facebook',
      status: 'in-progress',
      priority: 'medium',
      projectId: project1.id,
      createdBy: 'demo-user-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('Created 2 demo features');

    // Create demo stories
    await addDoc(collection(db, 'stories'), {
      title: 'As a user, I want to register with email',
      description: 'Users should be able to create an account using their email address',
      status: 'completed',
      priority: 'high',
      storyPoints: 5,
      projectId: project1.id,
      notes: [],
      createdBy: 'demo-user-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    await addDoc(collection(db, 'stories'), {
      title: 'As a user, I want to reset my password',
      description: 'Users should be able to reset their password via email',
      status: 'in-progress',
      priority: 'medium',
      storyPoints: 3,
      projectId: project1.id,
      notes: [],
      createdBy: 'demo-user-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('Created 2 demo stories');

    // Create demo tasks
    await addDoc(collection(db, 'tasks'), {
      title: 'Design login page UI',
      description: 'Create mockups for the login page',
      status: 'completed',
      priority: 'high',
      projectId: project1.id,
      assignee: 'demo-user-id',
      dueDate: addDays(new Date(), -5).toISOString(),
      tags: ['design', 'ui'],
      createdBy: 'demo-user-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    await addDoc(collection(db, 'tasks'), {
      title: 'Implement email validation',
      description: 'Add email validation on registration form',
      status: 'in-progress',
      priority: 'high',
      projectId: project1.id,
      assignee: 'demo-user-id',
      dueDate: addDays(new Date(), 3).toISOString(),
      tags: ['development', 'backend'],
      createdBy: 'demo-user-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    await addDoc(collection(db, 'tasks'), {
      title: 'Write unit tests for auth service',
      description: 'Create comprehensive unit tests for authentication service',
      status: 'todo',
      priority: 'medium',
      projectId: project1.id,
      assignee: 'demo-user-id',
      dueDate: addDays(new Date(), 7).toISOString(),
      tags: ['testing'],
      createdBy: 'demo-user-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('Created 3 demo tasks');

    // Create demo sprint
    const today = new Date();
    await addDoc(collection(db, 'sprints'), {
      name: 'Sprint 1 - Authentication',
      goal: 'Complete user authentication features',
      startDate: today.toISOString().split('T')[0],
      endDate: addDays(today, 14).toISOString().split('T')[0],
      status: 'active',
      projectId: project1.id,
      stories: [],
      features: [],
      epics: [],
      createdBy: 'demo-user-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('Created 1 demo sprint');

    // Create demo requests
    await addDoc(collection(db, 'requests'), {
      title: 'Add dark mode support',
      description: 'Users are requesting a dark mode theme option',
      type: 'feature',
      status: 'in-review',
      priority: 'low',
      projectId: project1.id,
      requestedBy: 'Customer Support',
      createdBy: 'demo-user-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('Created 1 demo request');

    // Create demo change request
    await addDoc(collection(db, 'changeRequests'), {
      title: 'Update password strength requirements',
      description: 'Change minimum password length from 6 to 8 characters',
      type: 'enhancement',
      status: 'approved',
      priority: 'medium',
      impact: 'low',
      projectId: project1.id,
      requestedBy: 'Security Team',
      createdBy: 'demo-user-id',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    console.log('Created 1 demo change request');

    // Create demo meeting
    await addDoc(collection(db, 'meetings'), {
      title: 'Sprint Planning',
      description: 'Plan the upcoming sprint and assign tasks',
      date: addDays(new Date(), 1).toISOString(),
      time: '10:00',
      duration: 60,
      attendees: ['demo-user-id'],
      projectId: project1.id,
      status: 'scheduled',
      transcript: '',
      actionItems: [],
      createdBy: 'demo-user-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('Created 1 demo meeting');

    console.log('✅ Demo data created successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error creating demo data:', error);
    throw error;
  }
}
