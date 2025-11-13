## IMMEDIATE ACTION REQUIRED

The indexes need to be created manually. Click each link below to create them:

### Click These Links (one by one):

1. **Sprints Index:**
https://console.firebase.google.com/v1/r/project/claude-project-10b09/firestore/indexes?create_composite=ClRwcm9qZWN0cy9jbGF1ZGUtcHJvamVjdC0xMGIwOS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvc3ByaW50cy9pbmRleGVzL18QARoNCgljcmVhdGVkQnkQARoNCglzdGFydERhdGUQAhoMCghfX25hbWVfXxAC

2. **Requests Index:**
https://console.firebase.google.com/v1/r/project/claude-project-10b09/firestore/indexes?create_composite=ClVwcm9qZWN0cy9jbGF1ZGUtcHJvamVjdC0xMGIwOS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvcmVxdWVzdHMvaW5kZXhlcy9fEAEaDQoJY3JlYXRlZEJ5EAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg

3. **Tasks Index:**
https://console.firebase.google.com/v1/r/project/claude-project-10b09/firestore/indexes?create_composite=ClJwcm9qZWN0cy9jbGF1ZGUtcHJvamVjdC0xMGIwOS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvdGFza3MvaW5kZXhlcy9fEAEaDQoJY3JlYXRlZEJ5EAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg

4. **Change Requests Index:**
https://console.firebase.google.com/v1/r/project/claude-project-10b09/firestore/indexes?create_composite=Cltwcm9qZWN0cy9jbGF1ZGUtcHJvamVjdC0xMGIwOS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvY2hhbmdlUmVxdWVzdHMvaW5kZXhlcy9fEAEaDQoJY3JlYXRlZEJ5EAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg

5. **Projects Index:**
https://console.firebase.google.com/v1/r/project/claude-project-10b09/firestore/indexes?create_composite=ClVwcm9qZWN0cy9jbGF1ZGUtcHJvamVjdC0xMGIwOS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvcHJvamVjdHMvaW5kZXhlcy9fEAEaDQoJY3JlYXRlZEJ5EAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg

6. **Meetings Index:**
https://console.firebase.google.com/v1/r/project/claude-project-10b09/firestore/indexes?create_composite=ClVwcm9qZWN0cy9jbGF1ZGUtcHJvamVjdC0xMGIwOS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbWVldGluZ3MvaW5kZXhlcy9fEAEaDQoJY3JlYXRlZEJ5EAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg

7. **Stories Index:**
https://console.firebase.google.com/v1/r/project/claude-project-10b09/firestore/indexes?create_composite=ClRwcm9qZWN0cy9jbGF1ZGUtcHJvamVjdC0xMGIwOS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvc3Rvcmllcy9pbmRleGVzL18QARoNCgljcmVhdGVkQnkQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC

### What to do:

1. Click each link above
2. Click "Create Index" button in Firebase Console
3. Wait ~5 minutes for indexes to build
4. Indexes will show "Enabled" status when ready

### About the Quota Error:

The "Quota exceeded" error means you've hit Firestore's free tier write limits. This will reset in a few hours. For now:

- DON'T click "Create Demo Data" or "Generate Mock Data" buttons
- The demo data HTML page already tried to create data (that's what triggered the quota)
- Wait for indexes to build, then test demo mode with existing data

### After Indexes are Built:

1. Check index status: https://console.firebase.google.com/project/claude-project-10b09/firestore/indexes
2. Wait until all show "Enabled"
3. Refresh your app
4. Try Demo Mode

The demo mode should work once indexes are ready!
