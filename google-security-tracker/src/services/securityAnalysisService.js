import { GmailService, YouTubeService, DriveService, CalendarService, PeopleService } from './googleApiService';

// Security issue severity levels
export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
};

// Security issue categories
export const CATEGORY = {
  EMAIL_SECURITY: 'Email Security',
  FILE_SHARING: 'File Sharing',
  PRIVACY: 'Privacy',
  ACCOUNT_SECURITY: 'Account Security',
  PERMISSIONS: 'Permissions',
  SUSPICIOUS_ACTIVITY: 'Suspicious Activity'
};

// Phishing email patterns
const PHISHING_PATTERNS = [
  /verify.*account/i,
  /confirm.*identity/i,
  /suspend.*account/i,
  /urgent.*action/i,
  /click.*here.*immediately/i,
  /prize.*won/i,
  /inheritance/i,
  /nigerian prince/i,
  /password.*expire/i,
  /unusual.*activity/i,
  /security.*alert/i,
  /update.*payment/i,
  /congratulations.*winner/i
];

// Suspicious domains
const SUSPICIOUS_DOMAINS = [
  'bit.ly',
  'tinyurl.com',
  'goo.gl',
  't.co'
];

// Security Analysis Engine
export const SecurityAnalysisService = {
  /**
   * Analyze Gmail for security issues
   */
  analyzeGmail: async () => {
    const issues = [];

    try {
      // Check for phishing emails
      const phishingResults = await GmailService.listMessages('is:unread');

      if (phishingResults.messages) {
        for (const msg of phishingResults.messages.slice(0, 20)) {
          const message = await GmailService.getMessage(msg.id);

          // Check subject and body for phishing patterns
          const subject = message.payload.headers.find(h => h.name === 'Subject')?.value || '';
          const from = message.payload.headers.find(h => h.name === 'From')?.value || '';

          const isPhishing = PHISHING_PATTERNS.some(pattern => pattern.test(subject));

          if (isPhishing) {
            issues.push({
              id: `email-${msg.id}`,
              severity: SEVERITY.HIGH,
              category: CATEGORY.EMAIL_SECURITY,
              title: 'Potential Phishing Email Detected',
              description: `Email with subject "${subject}" from ${from} shows signs of phishing`,
              recommendation: 'Delete this email and do not click any links',
              affectedItem: msg.id,
              autoFixAvailable: true,
              autoFixAction: 'deleteEmail'
            });
          }
        }
      }

      // Check for email forwarding rules
      const forwarding = await GmailService.getForwarding();
      if (forwarding.forwardingAddresses && forwarding.forwardingAddresses.length > 0) {
        forwarding.forwardingAddresses.forEach(addr => {
          if (addr.verificationStatus === 'accepted') {
            issues.push({
              id: `forward-${addr.forwardingEmail}`,
              severity: SEVERITY.CRITICAL,
              category: CATEGORY.EMAIL_SECURITY,
              title: 'Email Forwarding Enabled',
              description: `Emails are being forwarded to ${addr.forwardingEmail}`,
              recommendation: 'Review and disable forwarding if not authorized',
              affectedItem: addr.forwardingEmail,
              autoFixAvailable: false
            });
          }
        });
      }

      // Check for suspicious filters
      const filters = await GmailService.listFilters();
      if (filters.filter && filters.filter.length > 0) {
        filters.filter.forEach(filter => {
          if (filter.action?.forward) {
            issues.push({
              id: `filter-${filter.id}`,
              severity: SEVERITY.HIGH,
              category: CATEGORY.EMAIL_SECURITY,
              title: 'Suspicious Email Filter Detected',
              description: `Filter automatically forwarding emails to ${filter.action.forward}`,
              recommendation: 'Review and remove unauthorized filters',
              affectedItem: filter.id,
              autoFixAvailable: false
            });
          }
        });
      }

    } catch (error) {
      console.error('Gmail analysis error:', error);
    }

    return issues;
  },

  /**
   * Analyze YouTube for security and privacy issues
   */
  analyzeYouTube: async () => {
    const issues = [];

    try {
      const channels = await YouTubeService.getChannels();

      if (channels.items && channels.items.length > 0) {
        const channel = channels.items[0];

        // Check for public videos that might be private
        const videos = await YouTubeService.listVideos();

        if (videos.items) {
          for (const video of videos.items) {
            const videoDetails = await YouTubeService.getVideo(video.id.videoId);

            if (videoDetails.items && videoDetails.items[0]) {
              const item = videoDetails.items[0];

              if (item.status.privacyStatus === 'public') {
                // Check if video might be personal/private
                const title = item.snippet.title.toLowerCase();
                const personalKeywords = ['family', 'private', 'personal', 'home', 'kids', 'children'];

                if (personalKeywords.some(keyword => title.includes(keyword))) {
                  issues.push({
                    id: `video-${item.id}`,
                    severity: SEVERITY.MEDIUM,
                    category: CATEGORY.PRIVACY,
                    title: 'Potentially Private Video is Public',
                    description: `Video "${item.snippet.title}" is public but may contain personal content`,
                    recommendation: 'Change video privacy to "Private" or "Unlisted"',
                    affectedItem: item.id,
                    autoFixAvailable: true,
                    autoFixAction: 'makeVideoPrivate'
                  });
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('YouTube analysis error:', error);
    }

    return issues;
  },

  /**
   * Analyze Google Drive for security issues
   */
  analyzeDrive: async () => {
    const issues = [];

    try {
      const files = await DriveService.listFiles();

      if (files.files) {
        for (const file of files.files) {
          if (file.shared) {
            // Get detailed permissions
            const permissions = await DriveService.getPermissions(file.id);

            if (permissions.permissions) {
              permissions.permissions.forEach(perm => {
                // Check for public sharing
                if (perm.type === 'anyone' || perm.type === 'domain') {
                  const severity = perm.role === 'writer' || perm.role === 'owner'
                    ? SEVERITY.CRITICAL
                    : SEVERITY.HIGH;

                  issues.push({
                    id: `file-${file.id}-${perm.id}`,
                    severity,
                    category: CATEGORY.FILE_SHARING,
                    title: 'File Publicly Shared',
                    description: `File "${file.name}" is shared with ${perm.type} (${perm.role} access)`,
                    recommendation: 'Restrict sharing to specific people only',
                    affectedItem: { fileId: file.id, permissionId: perm.id },
                    autoFixAvailable: true,
                    autoFixAction: 'removePublicSharing'
                  });
                }

                // Check for overly permissive sharing
                if (perm.role === 'writer' || perm.role === 'owner') {
                  // Check if sensitive file types
                  const sensitiveTypes = [
                    'application/vnd.google-apps.spreadsheet',
                    'application/pdf',
                    'application/vnd.google-apps.document'
                  ];

                  if (sensitiveTypes.includes(file.mimeType)) {
                    issues.push({
                      id: `perm-${file.id}-${perm.id}`,
                      severity: SEVERITY.MEDIUM,
                      category: CATEGORY.PERMISSIONS,
                      title: 'Sensitive File with Write Access',
                      description: `File "${file.name}" has write/owner permissions shared`,
                      recommendation: 'Change to read-only access if possible',
                      affectedItem: { fileId: file.id, permissionId: perm.id },
                      autoFixAvailable: true,
                      autoFixAction: 'downgradePermission'
                    });
                  }
                }
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Drive analysis error:', error);
    }

    return issues;
  },

  /**
   * Analyze Google Calendar for security issues
   */
  analyzeCalendar: async () => {
    const issues = [];

    try {
      const calendars = await CalendarService.listCalendars();

      if (calendars.items) {
        for (const calendar of calendars.items) {
          try {
            const acl = await CalendarService.getCalendarAcl(calendar.id);

            if (acl.items) {
              acl.items.forEach(rule => {
                // Check for public calendar sharing
                if (rule.scope?.type === 'default') {
                  issues.push({
                    id: `cal-${calendar.id}-${rule.id}`,
                    severity: SEVERITY.MEDIUM,
                    category: CATEGORY.PRIVACY,
                    title: 'Calendar Publicly Shared',
                    description: `Calendar "${calendar.summary}" is shared publicly`,
                    recommendation: 'Restrict calendar sharing to specific people',
                    affectedItem: { calendarId: calendar.id, ruleId: rule.id },
                    autoFixAvailable: true,
                    autoFixAction: 'removeCalendarSharing'
                  });
                }
              });
            }
          } catch (error) {
            // Skip calendars we don't have access to
            console.log(`Skipping calendar ${calendar.id}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('Calendar analysis error:', error);
    }

    return issues;
  },

  /**
   * Run comprehensive security analysis
   */
  runFullAnalysis: async () => {
    console.log('Starting comprehensive security analysis...');

    const results = {
      timestamp: new Date().toISOString(),
      totalIssues: 0,
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0,
      issues: []
    };

    try {
      // Run all analyses in parallel
      const [gmailIssues, youtubeIssues, driveIssues, calendarIssues] = await Promise.all([
        SecurityAnalysisService.analyzeGmail(),
        SecurityAnalysisService.analyzeYouTube(),
        SecurityAnalysisService.analyzeDrive(),
        SecurityAnalysisService.analyzeCalendar()
      ]);

      // Combine all issues
      results.issues = [
        ...gmailIssues,
        ...youtubeIssues,
        ...driveIssues,
        ...calendarIssues
      ];

      // Calculate statistics
      results.totalIssues = results.issues.length;
      results.criticalIssues = results.issues.filter(i => i.severity === SEVERITY.CRITICAL).length;
      results.highIssues = results.issues.filter(i => i.severity === SEVERITY.HIGH).length;
      results.mediumIssues = results.issues.filter(i => i.severity === SEVERITY.MEDIUM).length;
      results.lowIssues = results.issues.filter(i => i.severity === SEVERITY.LOW).length;

      console.log(`Analysis complete: ${results.totalIssues} issues found`);

    } catch (error) {
      console.error('Error during security analysis:', error);
      throw error;
    }

    return results;
  },

  /**
   * Generate security score (0-100)
   */
  calculateSecurityScore: (analysisResults) => {
    const { criticalIssues, highIssues, mediumIssues, lowIssues } = analysisResults;

    // Start with perfect score
    let score = 100;

    // Deduct points based on severity
    score -= criticalIssues * 15;
    score -= highIssues * 10;
    score -= mediumIssues * 5;
    score -= lowIssues * 2;

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }
};

export default SecurityAnalysisService;
