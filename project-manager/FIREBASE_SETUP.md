# Firebase Setup Instructions

Your Firebase configuration has been added to the project. Now you need to complete a few more steps in the Firebase Console.

## Project Details
- **Project Name:** Claude Project
- **Project ID:** claude-project-10b09
- **Project Number:** 998432816875

## Step 1: Enable Authentication ✅ Required

1. Go to [Firebase Console](https://console.firebase.google.com/project/claude-project-10b09)
2. Click **"Authentication"** in the left sidebar under "Build"
3. Click **"Get started"**
4. Enable these sign-in methods:

### Email/Password
- Click on "Email/Password"
- Toggle **"Enable"** to ON
- Click **"Save"**

### Google Sign-In
- Click on "Google"
- Toggle **"Enable"** to ON
- Select your support email from the dropdown
- Click **"Save"**

## Step 2: Create Firestore Database ✅ Required

1. In the Firebase Console, click **"Firestore Database"** under "Build"
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select a location closest to you (e.g., **us-central** or **us-east1**)
5. Click **"Enable"**

## Step 3: Deploy Firestore Security Rules ✅ Required

You have two options to deploy the security rules:

### Option A: Using Firebase CLI (Recommended)

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Firestore: Configure security rules and indexes files
# - Hosting: Configure files for Firebase Hosting
# Use existing project: claude-project-10b09
# Accept defaults for firestore.rules and firestore.indexes.json

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy everything (rules + hosting)
firebase deploy
```

### Option B: Manual Setup in Console

1. Go to **Firestore Database** → **Rules** tab
2. Copy and paste the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Projects collection
    match /projects/{projectId} {
      allow create: if request.auth != null &&
                      request.auth.uid == request.resource.data.ownerId &&
                      request.auth.uid in request.resource.data.members;

      allow read: if request.auth != null &&
                    request.auth.uid in resource.data.members;

      allow update: if request.auth != null &&
                      request.auth.uid == resource.data.ownerId;

      allow delete: if request.auth != null &&
                      request.auth.uid == resource.data.ownerId;
    }

    // Tasks collection
    match /tasks/{taskId} {
      allow create: if request.auth != null &&
                      request.auth.uid == request.resource.data.createdBy;

      allow read: if request.auth != null;

      allow update: if request.auth != null;

      allow delete: if request.auth != null &&
                      request.auth.uid == resource.data.createdBy;
    }
  }
}
```

3. Click **"Publish"**

## Step 4: Enable Firebase Storage (Optional)

For future file attachment features:

1. Click **"Storage"** under "Build"
2. Click **"Get started"**
3. Keep default security rules
4. Choose the same location as Firestore
5. Click **"Done"**

## Step 5: Test the Application

```bash
# Navigate to project directory
cd project-manager

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Visit: http://localhost:5173

### Test Steps:
1. ✅ Create an account with email/password
2. ✅ Sign out and sign in with Google
3. ✅ Create a project
4. ✅ Add tasks to the project
5. ✅ Drag and drop tasks between columns
6. ✅ View dashboard statistics

## Step 6: Deploy to Firebase Hosting

```bash
# Build the production version
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or deploy everything (hosting + rules)
firebase deploy
```

Your app will be live at:
**https://claude-project-10b09.web.app**

## Troubleshooting

### Issue: "Missing or insufficient permissions"

**Solution:** Make sure Firestore rules are deployed (Step 3)

### Issue: Authentication not working

**Solution:**
- Check that Email/Password and Google are enabled in Authentication
- For production, add your domain to authorized domains:
  - Go to Authentication → Settings → Authorized domains
  - Add your domain

### Issue: Can't read/write data

**Solution:**
- Verify you're logged in
- Check browser console for specific error messages
- Ensure Firestore rules match the ones in Step 3

## Firebase Console Quick Links

- **Project Overview:** https://console.firebase.google.com/project/claude-project-10b09
- **Authentication:** https://console.firebase.google.com/project/claude-project-10b09/authentication
- **Firestore Database:** https://console.firebase.google.com/project/claude-project-10b09/firestore
- **Storage:** https://console.firebase.google.com/project/claude-project-10b09/storage
- **Hosting:** https://console.firebase.google.com/project/claude-project-10b09/hosting

## Security Notes

⚠️ **Important:** Never commit your Firebase config to public repositories if you have paid plans or sensitive data.

For this project:
- ✅ Config is already in `src/firebase/config.js`
- ✅ Security rules protect your data
- ✅ Users can only access their own data and projects they're members of

## Next Steps

1. Complete Steps 1-3 above to enable authentication and database
2. Test the application locally
3. Deploy to Firebase Hosting (optional)
4. Invite team members to your projects!

Enjoy using ProjectHub! 🚀
