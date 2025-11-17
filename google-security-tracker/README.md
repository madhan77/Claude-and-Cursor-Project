# Google Security Tracker

A comprehensive security monitoring and remediation tool for Google apps including Gmail, YouTube, Google Drive, and Google Calendar.

![Security Dashboard](https://img.shields.io/badge/Security-A+-green)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange)

## 🎯 Features

### 📧 Gmail Security Analysis
- **Phishing Detection**: Automatically identifies suspicious emails using pattern matching
- **Forwarding Rules Audit**: Detects unauthorized email forwarding
- **Filter Review**: Identifies suspicious email filters
- **Auto-Remediation**: One-click deletion of phishing emails

### 📁 Google Drive Security
- **Public Sharing Detection**: Finds files shared with "anyone with link"
- **Permission Auditing**: Identifies overly permissive file sharing
- **Sensitive File Protection**: Flags spreadsheets, PDFs, and documents with write access
- **Auto-Fix**: Automated permission downgrade and removal

### 🎥 YouTube Privacy Analysis
- **Privacy Checker**: Identifies potentially private videos that are public
- **Content Analysis**: Detects personal content keywords (family, private, home, kids)
- **Privacy Controls**: Auto-change videos to private or unlisted

### 📅 Calendar Privacy
- **Sharing Audit**: Detects publicly shared calendars
- **Permission Review**: Identifies excessive calendar sharing
- **Auto-Remediation**: Remove unwanted sharing permissions

### 🛡️ Security Features
- **Real-time Analysis**: Scan your Google account in seconds
- **Security Score**: Get a 0-100 security rating
- **Automated Fixes**: One-click remediation for most issues
- **Detailed Reports**: Export comprehensive security reports
- **Visual Analytics**: Charts and graphs for security overview

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Google account
- Firebase project
- Google Cloud Console project with APIs enabled

### Installation

1. **Clone the repository**
```bash
cd google-security-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication with Google provider
   - Create a Firestore database
   - Copy your Firebase config

4. **Set up Google Cloud Console**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable the following APIs:
     - Gmail API
     - YouTube Data API v3
     - Google Drive API
     - Google Calendar API
     - People API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `http://localhost:5174`
     - Your production URL

5. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your-client-secret
```

6. **Run the development server**
```bash
npm run dev
```

Visit `http://localhost:5174` to see the app!

## 📖 Usage Guide

### First Time Setup

1. **Sign In**
   - Click "Sign in with Google"
   - Grant required permissions (Gmail, Drive, YouTube, Calendar)
   - You'll be redirected to the dashboard

2. **Run Security Scan**
   - Click "Run Security Scan" on the dashboard
   - Wait for the analysis to complete (usually 30-60 seconds)
   - Review your security score and detected issues

3. **Review Issues**
   - Navigate to "Security Report" for detailed findings
   - Filter by severity or category
   - Read recommendations for each issue

4. **Apply Fixes**
   - Click "Auto-Fix" for individual issues
   - Or use "Auto-Fix All" to resolve all fixable issues
   - Confirm each action before it's applied

### Individual Service Analysis

- **Gmail**: Check for phishing emails and forwarding rules
- **Drive**: Review file sharing permissions
- **YouTube**: Audit video privacy settings
- **Calendar**: Check calendar sharing

### Settings

- **Auto-Scan**: Enable automatic security scans
- **Scan Frequency**: Choose hourly, daily, weekly, or monthly
- **Notifications**: Enable/disable alerts
- **Cache Management**: Clear stored analysis results

## 🔒 Security & Privacy

### Data Handling
- **Local Processing**: All analysis happens in your browser
- **No Data Storage**: We don't store your Google data on our servers
- **OAuth Security**: Uses Google's official OAuth 2.0 flow
- **Temporary Caching**: Results cached locally in browser storage only

### Permissions Required
- **Gmail**: Read and modify messages (for phishing detection and deletion)
- **Drive**: Read files and permissions (for sharing analysis)
- **YouTube**: Read channel and videos (for privacy checking)
- **Calendar**: Read calendars and sharing settings
- **Profile**: Basic profile information

### Privacy Guarantee
Your data is analyzed locally and never leaves your device except for API calls directly to Google's servers. We don't have backend servers that store your information.

## 🛠️ Tech Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Authentication**: Firebase Auth with Google OAuth
- **Database**: Firestore (for user preferences)
- **Charts**: Recharts
- **Icons**: React Icons
- **Notifications**: React Toastify
- **HTTP Client**: Axios

## 📊 Architecture

```
google-security-tracker/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.jsx
│   │   └── LoadingSpinner.jsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.jsx
│   ├── firebase/         # Firebase configuration
│   │   └── config.js
│   ├── pages/            # Page components
│   │   ├── Dashboard.jsx
│   │   ├── SecurityReport.jsx
│   │   ├── GmailAnalysis.jsx
│   │   ├── DriveAnalysis.jsx
│   │   ├── YouTubeAnalysis.jsx
│   │   ├── CalendarAnalysis.jsx
│   │   └── Settings.jsx
│   ├── services/         # Business logic
│   │   ├── googleApiService.js
│   │   ├── securityAnalysisService.js
│   │   └── remediationService.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

## 🔧 Development

### Build for Production
```bash
npm run build
```

### Run Linter
```bash
npm run lint
```

### Preview Production Build
```bash
npm run preview
```

## 🚀 Deployment

### Deploy to Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 🐛 Troubleshooting

### Common Issues

**"Failed to analyze Gmail"**
- Check that Gmail API is enabled in Google Cloud Console
- Verify OAuth scopes include Gmail permissions
- Ensure you granted permissions during sign-in

**"Access denied" errors**
- Re-authenticate by logging out and logging back in
- Check that all required APIs are enabled
- Verify OAuth credentials are correct

**Charts not displaying**
- Clear browser cache
- Check that analysis has been run
- Verify data exists in localStorage

## 📝 License

MIT License - feel free to use this project for any purpose.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 🙏 Acknowledgments

- Google APIs for comprehensive service integration
- Firebase for authentication and hosting
- React community for amazing tools and libraries

---

**⚠️ Disclaimer**: This tool is for personal security monitoring only. Always review automated actions before applying them. We are not responsible for any data loss or issues resulting from the use of this tool.
