import axios from 'axios';

const GOOGLE_API_BASE = 'https://www.googleapis.com';

// Helper to get OAuth token
const getToken = () => {
  return localStorage.getItem('googleOAuthToken');
};

// Gmail API Service
export const GmailService = {
  // Get user profile
  getProfile: async () => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/gmail/v1/users/me/profile`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // List messages with optional query
  listMessages: async (query = '', maxResults = 100) => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/gmail/v1/users/me/messages`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: query, maxResults }
      }
    );
    return response.data;
  },

  // Get message details
  getMessage: async (messageId) => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { format: 'full' }
      }
    );
    return response.data;
  },

  // Delete message (for suspicious emails)
  deleteMessage: async (messageId) => {
    const token = getToken();
    await axios.delete(
      `${GOOGLE_API_BASE}/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  },

  // Move to spam
  markAsSpam: async (messageId) => {
    const token = getToken();
    await axios.post(
      `${GOOGLE_API_BASE}/gmail/v1/users/me/messages/${messageId}/modify`,
      {
        addLabelIds: ['SPAM'],
        removeLabelIds: ['INBOX']
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  },

  // Get Gmail settings
  getSettings: async () => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/gmail/v1/users/me/settings`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // List filters
  listFilters: async () => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/gmail/v1/users/me/settings/filters`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Get forwarding addresses
  getForwarding: async () => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/gmail/v1/users/me/settings/forwardingAddresses`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }
};

// YouTube API Service
export const YouTubeService = {
  // Get user channels
  getChannels: async () => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/youtube/v3/channels`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { part: 'snippet,contentDetails,statistics,status', mine: true }
      }
    );
    return response.data;
  },

  // List videos
  listVideos: async () => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/youtube/v3/search`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          part: 'snippet',
          forMine: true,
          type: 'video',
          maxResults: 50
        }
      }
    );
    return response.data;
  },

  // Get video details
  getVideo: async (videoId) => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/youtube/v3/videos`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          part: 'snippet,status,contentDetails',
          id: videoId
        }
      }
    );
    return response.data;
  },

  // Update video privacy
  updateVideoPrivacy: async (videoId, privacyStatus) => {
    const token = getToken();
    const video = await YouTubeService.getVideo(videoId);

    await axios.put(
      `${GOOGLE_API_BASE}/youtube/v3/videos`,
      {
        id: videoId,
        status: {
          ...video.items[0].status,
          privacyStatus
        }
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { part: 'status' }
      }
    );
  },

  // Get subscriptions
  getSubscriptions: async () => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/youtube/v3/subscriptions`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { part: 'snippet', mine: true, maxResults: 50 }
      }
    );
    return response.data;
  }
};

// Google Drive API Service
export const DriveService = {
  // List files
  listFiles: async (pageSize = 100) => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/drive/v3/files`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          pageSize,
          fields: 'files(id,name,mimeType,shared,permissions,createdTime,modifiedTime,size,owners,webViewLink)'
        }
      }
    );
    return response.data;
  },

  // Get file permissions
  getPermissions: async (fileId) => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/drive/v3/files/${fileId}/permissions`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { fields: '*' }
      }
    );
    return response.data;
  },

  // Delete permission (remove sharing)
  deletePermission: async (fileId, permissionId) => {
    const token = getToken();
    await axios.delete(
      `${GOOGLE_API_BASE}/drive/v3/files/${fileId}/permissions/${permissionId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  },

  // Update permission
  updatePermission: async (fileId, permissionId, role) => {
    const token = getToken();
    await axios.patch(
      `${GOOGLE_API_BASE}/drive/v3/files/${fileId}/permissions/${permissionId}`,
      { role },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  },

  // Get file metadata
  getFile: async (fileId) => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/drive/v3/files/${fileId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          fields: 'id,name,mimeType,shared,permissions,createdTime,modifiedTime,size,owners,webViewLink,sharingUser'
        }
      }
    );
    return response.data;
  }
};

// Google Calendar API Service
export const CalendarService = {
  // List calendars
  listCalendars: async () => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/calendar/v3/users/me/calendarList`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Get calendar ACL (sharing settings)
  getCalendarAcl: async (calendarId) => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/calendar/v3/calendars/${encodeURIComponent(calendarId)}/acl`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Delete ACL rule
  deleteAclRule: async (calendarId, ruleId) => {
    const token = getToken();
    await axios.delete(
      `${GOOGLE_API_BASE}/calendar/v3/calendars/${encodeURIComponent(calendarId)}/acl/${ruleId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  },

  // List events
  listEvents: async (calendarId = 'primary') => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { maxResults: 100 }
      }
    );
    return response.data;
  }
};

// People API Service (Account info)
export const PeopleService = {
  // Get user info
  getUserInfo: async () => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/oauth2/v2/userinfo`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Get account connections
  getConnections: async () => {
    const token = getToken();
    const response = await axios.get(
      `${GOOGLE_API_BASE}/people/v1/people/me/connections`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          personFields: 'names,emailAddresses,phoneNumbers'
        }
      }
    );
    return response.data;
  }
};

export default {
  GmailService,
  YouTubeService,
  DriveService,
  CalendarService,
  PeopleService
};
