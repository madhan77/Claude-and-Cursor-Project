# TaskFlow - Web-Based To-Do Task List App

A modern, full-featured task management application built with React, Firebase, and Tailwind CSS. TaskFlow helps you manage daily tasks effectively through an intuitive interface with support for categorization, prioritization, and real-time synchronization.

## Features

### Core Functionality (FR-01 to FR-09)
- ✅ **User Authentication** - Email/Password and Google OAuth login
- ✅ **Task Management** - Add, edit, delete, and mark tasks as completed
- ✅ **Categorization** - Organize tasks by categories, tags, and priority levels (Low, Medium, High)
- ✅ **Due Dates** - Set due dates for tasks with visual indicators for overdue items
- ✅ **Task Filtering** - Filter by Today, Upcoming, Active, Completed, or All tasks
- ✅ **Task Sorting** - Sort by creation date, due date, or priority
- ✅ **Dashboard Views** - Overview with statistics and task breakdowns
- ✅ **Search Functionality** - Real-time keyword search across task titles, descriptions, and tags
- ✅ **Responsive Design** - Fully responsive UI for desktop, tablet, and mobile devices
- ✅ **Real-time Sync** - Automatic synchronization across devices using Firebase Firestore

### User Interface
- Clean, minimal design with color-coded priorities
- Mobile-first responsive layout
- Modal-based task creation and editing
- Visual statistics dashboard with task counts
- Overdue task indicators
- Smooth animations and transitions

## Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **date-fns** - Date formatting and manipulation
- **React Toastify** - Toast notifications

### Backend & Services
- **Firebase Authentication** - User authentication (Email/Password + Google OAuth)
- **Firebase Firestore** - Real-time NoSQL database
- **Vite** - Build tool and development server

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn package manager
- A Firebase account (free tier is sufficient)

## Installation & Setup

### 1. Fix npm permissions (if needed)

If you encountered permission issues, run:
```bash
sudo chown -R 501:20 "/Users/madhanbaskaran/.npm"
```

### 2. Install Dependencies

```bash
cd taskflow
npm install
```

### 3. Firebase Configuration

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or "Create a project"
3. Enter project name: `taskflow` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create Project"

#### Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable **Email/Password** provider
4. Enable **Google** provider
   - Add a support email
   - Save configuration

#### Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Select **Start in test mode** (for development)
4. Choose a location closest to you
5. Click "Enable"

#### Set Firestore Security Rules

Go to the "Rules" tab and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register app with nickname: `TaskFlow Web`
5. Copy the `firebaseConfig` object

#### Update Firebase Config

Open `src/firebase/config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Getting Started

1. **Sign Up**: Create a new account using email/password or Google
2. **Login**: Access your dashboard
3. **Add Tasks**: Click "Add Task" button to create new tasks
4. **Organize**: Set priority, category, tags, and due dates
5. **Filter**: Use filters to view specific task groups
6. **Search**: Use the search bar to find tasks quickly
7. **Complete**: Check off tasks as you complete them
8. **Edit/Delete**: Use action buttons on each task

### Task Properties

- **Title** (required): Brief task description
- **Description**: Detailed information about the task
- **Priority**: Low, Medium, or High
- **Category**: Custom categories (e.g., Work, Personal, Study)
- **Due Date**: Optional deadline
- **Tags**: Comma-separated tags for better organization

### Dashboard Statistics

- **Total Tasks**: All tasks in your account
- **Completed**: Successfully finished tasks
- **Active**: Incomplete tasks
- **Due Today**: Tasks due today
- **Overdue**: Past-due incomplete tasks

## Project Structure

```
taskflow/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable React components
│   │   ├── PrivateRoute.jsx
│   │   ├── StatCard.jsx
│   │   ├── TaskItem.jsx
│   │   ├── TaskList.jsx
│   │   └── TaskModal.jsx
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── TaskContext.jsx
│   ├── firebase/          # Firebase configuration
│   │   └── config.js
│   ├── pages/             # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── utils/             # Helper functions
│   │   └── helpers.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Building for Production

Create a production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

Preview the production build locally:

```bash
npm run preview
```

## Deployment

### Firebase Hosting (Recommended)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase Hosting:
```bash
firebase init hosting
```

4. Build and deploy:
```bash
npm run build
firebase deploy
```

### Alternative Hosting Options

- **Vercel**: Connect your GitHub repository
- **Netlify**: Drag and drop the `dist` folder
- **AWS Amplify**: Follow AWS Amplify deployment guide

## Future Enhancements (As per PDR)

- [ ] Mobile App (React Native)
- [ ] AI-based task suggestions
- [ ] Integration with Slack / Microsoft Teams
- [ ] Voice command support
- [ ] Collaboration features (share lists with other users)
- [ ] Email/SMS notifications
- [ ] Google Calendar integration
- [ ] Advanced analytics and insights

## Success Metrics (From PDR)

- User retention > 70% after 30 days
- Average daily tasks created per user ≥ 5
- Task completion rate ≥ 60%
- App uptime ≥ 99.5%

## Troubleshooting

### Firebase Authentication Errors

- Ensure authentication providers are enabled in Firebase Console
- Check that Firebase config is correctly set in `src/firebase/config.js`
- Verify your domain is authorized in Firebase Console

### Firestore Permission Errors

- Update Firestore security rules as shown in setup instructions
- Ensure user is properly authenticated before accessing data

### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

## License

This project is built according to the Product Design Requirements (PDR) v1.0 for TaskFlow.

## Support

For issues or questions, please check:
- Firebase Documentation: https://firebase.google.com/docs
- React Documentation: https://react.dev
- Tailwind CSS Documentation: https://tailwindcss.com

---

**Version**: 1.0
**Date**: October 24, 2025
**Built with**: React, Firebase, Tailwind CSS
