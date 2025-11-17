import { GmailService, YouTubeService, DriveService, CalendarService } from './googleApiService';
import { toast } from 'react-toastify';

/**
 * Automated Remediation Service
 * Handles automatic fixes for detected security issues
 */
export const RemediationService = {
  /**
   * Delete suspicious/phishing email
   */
  deleteEmail: async (messageId) => {
    try {
      await GmailService.deleteMessage(messageId);
      toast.success('Suspicious email deleted successfully');
      return { success: true, message: 'Email deleted' };
    } catch (error) {
      console.error('Error deleting email:', error);
      toast.error('Failed to delete email');
      return { success: false, error: error.message };
    }
  },

  /**
   * Mark email as spam
   */
  markEmailAsSpam: async (messageId) => {
    try {
      await GmailService.markAsSpam(messageId);
      toast.success('Email marked as spam');
      return { success: true, message: 'Email marked as spam' };
    } catch (error) {
      console.error('Error marking email as spam:', error);
      toast.error('Failed to mark email as spam');
      return { success: false, error: error.message };
    }
  },

  /**
   * Make YouTube video private
   */
  makeVideoPrivate: async (videoId) => {
    try {
      await YouTubeService.updateVideoPrivacy(videoId, 'private');
      toast.success('Video privacy changed to private');
      return { success: true, message: 'Video is now private' };
    } catch (error) {
      console.error('Error updating video privacy:', error);
      toast.error('Failed to update video privacy');
      return { success: false, error: error.message };
    }
  },

  /**
   * Make YouTube video unlisted
   */
  makeVideoUnlisted: async (videoId) => {
    try {
      await YouTubeService.updateVideoPrivacy(videoId, 'unlisted');
      toast.success('Video privacy changed to unlisted');
      return { success: true, message: 'Video is now unlisted' };
    } catch (error) {
      console.error('Error updating video privacy:', error);
      toast.error('Failed to update video privacy');
      return { success: false, error: error.message };
    }
  },

  /**
   * Remove public sharing from Drive file
   */
  removePublicSharing: async (fileId, permissionId) => {
    try {
      await DriveService.deletePermission(fileId, permissionId);
      toast.success('Public sharing removed from file');
      return { success: true, message: 'Public sharing removed' };
    } catch (error) {
      console.error('Error removing public sharing:', error);
      toast.error('Failed to remove public sharing');
      return { success: false, error: error.message };
    }
  },

  /**
   * Downgrade file permission from writer to reader
   */
  downgradePermission: async (fileId, permissionId) => {
    try {
      await DriveService.updatePermission(fileId, permissionId, 'reader');
      toast.success('Permission downgraded to read-only');
      return { success: true, message: 'Permission changed to read-only' };
    } catch (error) {
      console.error('Error downgrading permission:', error);
      toast.error('Failed to downgrade permission');
      return { success: false, error: error.message };
    }
  },

  /**
   * Remove calendar sharing
   */
  removeCalendarSharing: async (calendarId, ruleId) => {
    try {
      await CalendarService.deleteAclRule(calendarId, ruleId);
      toast.success('Calendar sharing removed');
      return { success: true, message: 'Calendar sharing removed' };
    } catch (error) {
      console.error('Error removing calendar sharing:', error);
      toast.error('Failed to remove calendar sharing');
      return { success: false, error: error.message };
    }
  },

  /**
   * Auto-fix a security issue based on its type
   */
  autoFixIssue: async (issue) => {
    const { autoFixAction, affectedItem } = issue;

    switch (autoFixAction) {
      case 'deleteEmail':
        return await RemediationService.deleteEmail(affectedItem);

      case 'markAsSpam':
        return await RemediationService.markEmailAsSpam(affectedItem);

      case 'makeVideoPrivate':
        return await RemediationService.makeVideoPrivate(affectedItem);

      case 'makeVideoUnlisted':
        return await RemediationService.makeVideoUnlisted(affectedItem);

      case 'removePublicSharing':
        return await RemediationService.removePublicSharing(
          affectedItem.fileId,
          affectedItem.permissionId
        );

      case 'downgradePermission':
        return await RemediationService.downgradePermission(
          affectedItem.fileId,
          affectedItem.permissionId
        );

      case 'removeCalendarSharing':
        return await RemediationService.removeCalendarSharing(
          affectedItem.calendarId,
          affectedItem.ruleId
        );

      default:
        toast.warning('Auto-fix not available for this issue');
        return { success: false, error: 'No auto-fix available' };
    }
  },

  /**
   * Auto-fix multiple issues
   */
  autoFixMultiple: async (issues) => {
    const results = {
      total: issues.length,
      successful: 0,
      failed: 0,
      details: []
    };

    toast.info(`Starting auto-fix for ${issues.length} issues...`);

    for (const issue of issues) {
      if (issue.autoFixAvailable) {
        const result = await RemediationService.autoFixIssue(issue);

        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
        }

        results.details.push({
          issueId: issue.id,
          title: issue.title,
          ...result
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    toast.success(`Auto-fix complete: ${results.successful} successful, ${results.failed} failed`);
    return results;
  },

  /**
   * Get recommendations for an issue
   */
  getRecommendations: (issue) => {
    const recommendations = [];

    switch (issue.category) {
      case 'Email Security':
        recommendations.push({
          title: 'Enable 2-Factor Authentication',
          description: 'Add an extra layer of security to your Gmail account',
          priority: 'high'
        });
        recommendations.push({
          title: 'Review Email Filters',
          description: 'Check for unauthorized email forwarding or filtering rules',
          priority: 'high'
        });
        recommendations.push({
          title: 'Enable Advanced Protection',
          description: 'Google\'s strongest security for high-risk users',
          priority: 'medium'
        });
        break;

      case 'File Sharing':
        recommendations.push({
          title: 'Review All Shared Files',
          description: 'Regularly audit your shared files and remove unnecessary sharing',
          priority: 'high'
        });
        recommendations.push({
          title: 'Use Link Sharing Carefully',
          description: 'Prefer sharing with specific people rather than "anyone with link"',
          priority: 'medium'
        });
        recommendations.push({
          title: 'Set Expiration Dates',
          description: 'Use temporary sharing with expiration dates when possible',
          priority: 'low'
        });
        break;

      case 'Privacy':
        recommendations.push({
          title: 'Review Privacy Settings',
          description: 'Check your Google account privacy settings regularly',
          priority: 'high'
        });
        recommendations.push({
          title: 'Limit Public Content',
          description: 'Keep personal content private or unlisted',
          priority: 'medium'
        });
        break;

      case 'Account Security':
        recommendations.push({
          title: 'Update Recovery Options',
          description: 'Ensure your recovery email and phone are up to date',
          priority: 'high'
        });
        recommendations.push({
          title: 'Review Security Checkup',
          description: 'Complete Google\'s security checkup regularly',
          priority: 'high'
        });
        break;

      default:
        recommendations.push({
          title: 'Regular Security Audits',
          description: 'Run this security tracker tool monthly',
          priority: 'medium'
        });
    }

    return recommendations;
  }
};

export default RemediationService;
