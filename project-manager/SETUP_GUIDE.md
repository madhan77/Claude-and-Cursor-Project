# ProjectHub - Complete Setup Guide

This guide will walk you through setting up ProjectHub from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Firebase Configuration](#firebase-configuration)
4. [Running the Application](#running-the-application)
5. [First Steps](#first-steps)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (version 16 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`

- **npm** (comes with Node.js) or **yarn**
  - Verify installation: `npm --version`

- **Git** (for version control)
  - Download from: https://git-scm.com/
  - Verify installation: `git --version`

- **A Firebase Account** (free tier is sufficient)
  - Sign up at: https://firebase.google.com/

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project-manager
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React and React Router
- Firebase SDK
- Tailwind CSS
- @dnd-kit (for drag and drop)
- Recharts (for analytics)
- React Toastify (for notifications)

## Firebase Configuration

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "projecthub-app")
4. (Optional) Disable Google Analytics if you don't need it
5. Click **"Create Project"**
6. Wait for the project to be created

### Step 2: Enable Authentication

1. In your Firebase project, click **"Build"** in the left sidebar
2. Click **"Authentication"**
3. Click **"Get started"**
4. Enable the following sign-in methods:

   **Email/Password:**
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

   **Google:**
   - Click on "Google"
   - Toggle "Enable"
   - Add a support email (your email)
   - Click "Save"

### Step 3: Create Firestore Database

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll update rules next)
4. Choose a location closest to your users
5. Click **"Enable"**

### Step 4: Set Up Firestore Security Rules

1. In Firestore Database, click the **"Rules"** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Projects collection
    match /projects/{projectId} {
      // Anyone authenticated can create a project
      allow create: if request.auth != null &&
                      request.auth.uid == request.resource.data.ownerId;

      // Only members can read the project
      allow read: if request.auth != null &&
                    request.auth.uid in resource.data.members;

      // Only the owner can update or delete
      allow update, delete: if request.auth != null &&
                              request.auth.uid == resource.data.ownerId;
    }

    // Tasks collection
    match /tasks/{taskId} {
      // Authenticated users can read/write tasks
      // In a production app, you'd want to verify project membership
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

### Step 5: Enable Firebase Storage (Optional)

If you plan to add file attachments in the future:

1. In the left sidebar, click **"Storage"**
2. Click **"Get started"**
3. Keep the default security rules for now
4. Choose the same location as Firestore
5. Click **"Done"**

### Step 6: Get Your Firebase Configuration

1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`)
5. Register your app:
   - App nickname: "ProjectHub Web"
   - (Optional) Check "Also set up Firebase Hosting"
   - Click **"Register app"**
6. Copy the `firebaseConfig` object

### Step 7: Update Project Configuration

1. Open `src/firebase/config.js` in your code editor
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                    // From Firebase Console
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

3. Save the file

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

You should see:
- The Vite logo and "Local: http://localhost:5173" in the terminal
- Your browser should automatically open to the app
- If not, manually navigate to http://localhost:5173

### Building for Production

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## First Steps

### 1. Create an Account

1. Open http://localhost:5173
2. Click **"Sign up"** link
3. Enter your details:
   - Full Name
   - Email
   - Password (minimum 6 characters)
   - Confirm Password
4. Click **"Create Account"**

   OR

   Click **"Sign up with Google"** for quick registration

### 2. Create Your First Project

1. After logging in, you'll see the Dashboard
2. Click **"New Project"** button
3. Fill in the project details:
   - **Name**: e.g., "Website Redesign"
   - **Description**: Brief description of the project
   - **Status**: Choose from Planning, Active, On Hold, Completed
   - **Start Date**: Project start date
   - **End Date**: Project deadline
   - **Color**: Choose a color for easy identification
4. Click **"Create Project"**

### 3. Add Tasks to Your Project

1. Click on your newly created project
2. You'll see a Kanban board with 4 columns:
   - To Do
   - In Progress
   - Review
   - Completed
3. Click the **+** icon in any column
4. Fill in task details:
   - **Title**: Task name
   - **Description**: What needs to be done
   - **Status**: Which column the task belongs to
   - **Priority**: Low, Medium, or High
   - **Due Date**: When the task is due
   - **Tags**: Comma-separated tags (e.g., frontend, urgent, bug)
5. Click **"Create Task"**

### 4. Manage Tasks

- **Drag and Drop**: Drag tasks between columns to update status
- **Edit Task**: Click on a task card to edit details
- **Delete Task**: Click the trash icon on a task card
- **Filter Tasks**: Use the filters on the Tasks page

### 5. Invite Team Members

1. Go to the **Team** page from the sidebar
2. Select a project from the dropdown
3. Enter the team member's email address
4. Click **"Invite"**
5. The team member must have an account with that email

## Troubleshooting

### Issue: "Failed to compile" or build errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear npm cache
npm cache clean --force
npm install
```

### Issue: Firebase Authentication not working

**Checklist:**
- [ ] Email/Password and Google auth are enabled in Firebase Console
- [ ] Firebase config is correctly set in `src/firebase/config.js`
- [ ] All Firebase config values are correct (no quotes around values in Firebase Console)
- [ ] Your domain is authorized in Firebase Console (for production)

**Steps:**
1. Go to Firebase Console → Authentication → Settings
2. Under "Authorized domains", add your domain
3. For local development, localhost should already be there

### Issue: "Permission denied" in Firestore

**Checklist:**
- [ ] Firestore security rules are set up correctly
- [ ] User is logged in before accessing data
- [ ] User ID is in the project's members array

**Steps:**
1. Check Firestore Rules tab in Firebase Console
2. Verify the rules match the ones in Step 4 above
3. Check browser console for specific error messages

### Issue: Drag and drop not working

**Solution:**
- Ensure @dnd-kit packages are installed: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- Try a different browser (Chrome recommended)
- Clear browser cache

### Issue: Charts not displaying

**Solution:**
- Ensure recharts is installed: `npm install recharts`
- Check browser console for errors
- Verify you have created projects and tasks with data

### Issue: Styling looks broken

**Solution:**
- Ensure Tailwind CSS is installed: `npm install -D tailwindcss @tailwindcss/postcss autoprefixer`
- Check that `tailwind.config.js` and `postcss.config.js` exist
- Verify `@tailwind` directives are in `src/index.css`
- Rebuild the project: `npm run build`

## Additional Resources

- **React Documentation**: https://react.dev
- **Firebase Documentation**: https://firebase.google.com/docs
- **Tailwind CSS Documentation**: https://tailwindcss.com
- **Vite Documentation**: https://vitejs.dev

## Getting Help

If you encounter issues:

1. Check the browser console (F12) for error messages
2. Check the terminal for build errors
3. Verify all prerequisites are installed
4. Ensure Firebase is configured correctly
5. Try creating a new Firebase project and start fresh
6. Search for error messages online

## Next Steps

After setting up:

- Explore the Dashboard to see project analytics
- Try the Kanban board drag-and-drop
- Create multiple projects to test
- Invite team members (they need to sign up first)
- Customize the project colors and statuses
- Export data by building custom features

Enjoy using ProjectHub! 🚀
