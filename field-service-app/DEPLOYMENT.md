# Field Service App - Firebase Deployment Guide

## Prerequisites
- Firebase account (https://firebase.google.com/)
- Node.js and npm installed
- Firebase CLI installed globally

## Quick Deployment Steps

### 1. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```
This will open a browser window for authentication.

### 3. Deploy the Application
```bash
cd field-service-app
firebase deploy --only hosting
```

### 4. Access Your Application
After deployment, Firebase will provide a URL like:
```
https://claude-project-10b09.web.app
```

## Firebase Project Configuration

The application is configured to use the Firebase project: **claude-project-10b09**

Configuration files:
- `firebase.json` - Firebase hosting configuration
- `.firebaserc` - Firebase project selection

## Deployment Script

For convenience, you can use this one-liner:
```bash
cd field-service-app && firebase deploy --only hosting
```

## Troubleshooting

### Authentication Issues
If you get authentication errors:
```bash
firebase logout
firebase login
```

### Project Not Found
If the Firebase project doesn't exist:
1. Go to https://console.firebase.google.com/
2. Create a new project or use an existing one
3. Update `.firebaserc` with your project ID:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### Deployment Fails
- Ensure you're in the `field-service-app` directory
- Check that `firebase.json` exists
- Verify you have permission to deploy to the project

## CI/CD Deployment (Optional)

For automated deployments:

### 1. Generate CI Token
```bash
firebase login:ci
```
This will generate a token for non-interactive deployments.

### 2. Set Environment Variable
```bash
export FIREBASE_TOKEN="your-token-here"
```

### 3. Deploy Using Token
```bash
firebase deploy --only hosting --token "$FIREBASE_TOKEN"
```

## Custom Domain (Optional)

To use a custom domain:
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Hosting Configuration

The current configuration (`firebase.json`) includes:
- **Public directory**: Current directory (.)
- **Cache control**: 1 hour for all files
- **SPA routing**: All routes redirect to index.html
- **Ignored files**: README.md, PRD.md, firebase.json, hidden files

## File Structure After Deployment

```
Deployed files:
├── index.html
├── styles.css
├── app.js
├── data.js
└── (all other assets)

Not deployed:
├── README.md
├── PRD.md
├── DEPLOYMENT.md
├── firebase.json
└── .firebaserc
```

## Performance Optimization

The app is optimized for fast loading:
- No build step required
- CDN-hosted libraries (Chart.js, Font Awesome)
- Efficient CSS and JavaScript
- Browser caching enabled

## Security

Current configuration:
- Static hosting only
- No backend required
- Client-side only application
- Demo data embedded

For production use, consider:
- Adding authentication
- Moving data to Firestore
- Implementing Cloud Functions
- Setting up security rules

## Monitoring

After deployment, monitor your app:
- Firebase Console → Hosting → Dashboard
- View deployment history
- Check traffic and performance
- Monitor errors

## Rollback

To rollback to a previous deployment:
```bash
firebase hosting:channel:deploy previous-version
```

Or use the Firebase Console to restore a previous version.

## Support

For Firebase issues:
- Firebase Documentation: https://firebase.google.com/docs/hosting
- Firebase Support: https://firebase.google.com/support
- Community: Stack Overflow (tag: firebase-hosting)

## Next Steps After Deployment

1. **Test the application** thoroughly on the live URL
2. **Share the URL** with your team for feedback
3. **Monitor usage** through Firebase Analytics (optional)
4. **Plan enhancements** based on user feedback
5. **Set up CI/CD** for automated deployments

---

**Note**: The application is currently using demo data. For production use, you'll need to:
- Set up a backend database (Firestore recommended)
- Implement user authentication (Firebase Auth)
- Add API endpoints (Cloud Functions)
- Configure security rules
- Set up proper error handling and logging

---

## Estimated Costs

Firebase Free Tier (Spark Plan):
- **Hosting**: 10 GB storage, 360 MB/day transfer
- **Sufficient for**: Testing and small deployments

For production, consider:
- **Blaze Plan**: Pay-as-you-go with free tier included
- **Estimated**: $0-5/month for small to medium usage

---

**Deployment Status**: Ready to deploy
**Last Updated**: 2025-11-22
