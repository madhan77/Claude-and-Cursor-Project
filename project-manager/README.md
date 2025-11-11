# ProjectHub - Modern Project Management Tool

A full-featured project management application built with React, Firebase, and Tailwind CSS. ProjectHub helps teams organize projects, manage tasks with Kanban boards, collaborate effectively, and track progress in real-time.

![ProjectHub](https://img.shields.io/badge/React-19-blue) ![Firebase](https://img.shields.io/badge/Firebase-Latest-orange) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38B2AC)

## Features

### Core Functionality
- ✅ **User Authentication** - Email/Password and Google OAuth sign-in
- ✅ **Project Management** - Create, edit, delete projects with status tracking
- ✅ **Kanban Boards** - Drag-and-drop task management
- ✅ **Task Management** - Priorities, due dates, tags, descriptions
- ✅ **Team Collaboration** - Invite members and collaborate in real-time
- ✅ **Dashboard** - Analytics and progress tracking with charts
- ✅ **Real-time Sync** - Live updates across all devices
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

## Quick Start

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Firebase account (free tier)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd project-manager

# Install dependencies
npm install

# Configure Firebase (see below)
# Edit src/firebase/config.js with your Firebase credentials

# Run development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password + Google)
4. Create Firestore database
5. Get your Firebase config

### 2. Update Configuration

Edit `src/firebase/config.js`:

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

### 3. Set Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /projects/{projectId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Tech Stack

- **React 19** - UI framework
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Firebase Auth** - Authentication
- **Firestore** - Database
- **@dnd-kit** - Drag and drop
- **Recharts** - Charts
- **React Toastify** - Notifications

## Project Structure

```
src/
├── components/      # Reusable components
├── contexts/        # React contexts (Auth, Projects, Tasks)
├── pages/           # Page components
├── firebase/        # Firebase configuration
├── App.jsx          # Main app with routing
└── main.jsx         # Entry point
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Deployment

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Vercel / Netlify

Connect your Git repository for automatic deployments.

## Features Roadmap

- ✅ User authentication
- ✅ Project management
- ✅ Kanban boards
- ✅ Dashboard analytics
- ✅ Team collaboration
- 🚀 Calendar view
- 🚀 File attachments
- 🚀 Comments system
- 🚀 Notifications
- 🚀 Gantt charts

## Troubleshooting

**Authentication errors:** Check Firebase Auth is enabled
**Permission errors:** Verify Firestore security rules
**Build errors:** Clear node_modules and reinstall

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

- [React Docs](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind Docs](https://tailwindcss.com)

---

Built with ❤️ using React, Firebase, and Tailwind CSS
