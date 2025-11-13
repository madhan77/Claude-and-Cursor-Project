/**
 * AI Meeting Analysis Service
 *
 * This service analyzes meeting transcripts and extracts action items.
 * Currently uses pattern matching and keyword extraction.
 *
 * TODO: Integrate with OpenAI API or Claude API for production use
 * Example integration:
 * - OpenAI: https://platform.openai.com/docs/api-reference
 * - Claude: https://docs.anthropic.com/claude/reference/getting-started-with-the-api
 */

// Keywords that indicate action items
const ACTION_KEYWORDS = [
  'need to', 'should', 'must', 'have to', 'will',
  'create', 'update', 'fix', 'implement', 'develop',
  'action item', 'task', 'todo', 'follow up',
  'assign', 'responsible', 'owner'
];

// Keywords for different entity types
const ENTITY_KEYWORDS = {
  epic: ['epic', 'major feature', 'initiative', 'theme', 'large scale'],
  feature: ['feature', 'capability', 'functionality', 'module'],
  story: ['story', 'user story', 'requirement', 'ticket', 'issue'],
  task: ['task', 'subtask', 'work item', 'action']
};

// Priority keywords
const PRIORITY_KEYWORDS = {
  critical: ['critical', 'urgent', 'asap', 'immediately', 'blocker'],
  high: ['high priority', 'important', 'soon', 'needed'],
  medium: ['medium', 'normal'],
  low: ['low priority', 'nice to have', 'optional', 'eventually']
};

/**
 * Extract email addresses from text
 */
function extractEmails(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  return text.match(emailRegex) || [];
}

/**
 * Extract dates from text
 */
function extractDates(text) {
  // Simple date patterns - can be enhanced
  const datePatterns = [
    /\d{4}-\d{2}-\d{2}/g, // YYYY-MM-DD
    /\d{1,2}\/\d{1,2}\/\d{4}/g, // MM/DD/YYYY
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/gi,
    /(next week|next month|tomorrow)/gi
  ];

  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0];
    }
  }
  return null;
}

/**
 * Determine entity type from text
 */
function determineEntityType(text) {
  const lowerText = text.toLowerCase();

  for (const [type, keywords] of Object.entries(ENTITY_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return type;
    }
  }

  // Default to story
  return 'story';
}

/**
 * Determine priority from text
 */
function determinePriority(text) {
  const lowerText = text.toLowerCase();

  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return priority;
    }
  }

  return 'medium';
}

/**
 * Extract action items from a sentence
 */
function extractActionFromSentence(sentence, index) {
  const lowerSentence = sentence.toLowerCase();

  // Check if sentence contains action keywords
  const hasActionKeyword = ACTION_KEYWORDS.some(keyword =>
    lowerSentence.includes(keyword)
  );

  if (!hasActionKeyword) {
    return null;
  }

  // Extract assignee
  const emails = extractEmails(sentence);
  const assignee = emails.length > 0 ? emails[0] : null;

  // Extract due date
  const dueDate = extractDates(sentence);

  // Determine type and priority
  const type = determineEntityType(sentence);
  const priority = determinePriority(sentence);

  // Clean up the sentence to create title
  let title = sentence.trim();
  if (title.endsWith('.')) {
    title = title.slice(0, -1);
  }

  // Limit title length
  if (title.length > 100) {
    title = title.substring(0, 100) + '...';
  }

  return {
    id: `action-${index}`,
    title: title,
    description: sentence.trim(),
    type: type,
    priority: priority,
    assignee: assignee,
    dueDate: dueDate,
    status: 'planning',
    source: 'meeting-transcript',
    approved: false
  };
}

/**
 * Analyze meeting transcript and extract action items
 *
 * @param {string} transcript - The meeting transcript
 * @param {object} meeting - Meeting details
 * @param {array} projects - Available projects
 * @param {array} sprints - Available sprints
 * @returns {object} Analysis results with action items
 */
export async function analyzeMeetingTranscript(transcript, meeting, projects, sprints) {
  try {
    // Split transcript into sentences
    const sentences = transcript
      .split(/[.!?]\s+/)
      .filter(s => s.trim().length > 20); // Filter out very short sentences

    // Extract action items
    const actionItems = [];
    sentences.forEach((sentence, index) => {
      const action = extractActionFromSentence(sentence, index);
      if (action) {
        // Add meeting context
        action.meetingId = meeting.id;
        action.meetingTitle = meeting.title;
        action.projectId = meeting.projectId || '';
        action.sprintId = meeting.sprintId || '';

        actionItems.push(action);
      }
    });

    // Extract key topics (simple word frequency)
    const words = transcript.toLowerCase().split(/\s+/);
    const wordFreq = {};
    words.forEach(word => {
      if (word.length > 4) { // Only count words longer than 4 characters
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Get top 10 most frequent words as topics
    const topics = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    // Extract attendee mentions (emails)
    const mentionedAttendees = extractEmails(transcript);

    // Calculate meeting statistics
    const stats = {
      totalWords: words.length,
      totalSentences: sentences.length,
      duration: transcript.split('[').length - 1, // Count timestamps
      actionItemsCount: actionItems.length,
      attendeesCount: new Set(mentionedAttendees).size
    };

    return {
      actionItems,
      topics,
      mentionedAttendees: [...new Set(mentionedAttendees)],
      stats,
      summary: generateSummary(actionItems, topics, stats)
    };
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    throw error;
  }
}

/**
 * Generate a meeting summary
 */
function generateSummary(actionItems, topics, stats) {
  const lines = [];

  lines.push(`Meeting Summary`);
  lines.push(`--------------`);
  lines.push(`Total Words: ${stats.totalWords}`);
  lines.push(`Total Sentences: ${stats.totalSentences}`);
  lines.push(`Action Items Identified: ${stats.actionItemsCount}`);
  lines.push(``);

  if (topics.length > 0) {
    lines.push(`Key Topics Discussed:`);
    topics.slice(0, 5).forEach(topic => {
      lines.push(`- ${topic}`);
    });
    lines.push(``);
  }

  if (actionItems.length > 0) {
    lines.push(`Action Items by Type:`);
    const byType = actionItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    Object.entries(byType).forEach(([type, count]) => {
      lines.push(`- ${type}: ${count}`);
    });
  }

  return lines.join('\n');
}

/**
 * TODO: Integration with OpenAI API (commented out for now)
 *
 * Uncomment and configure when you have an OpenAI API key
 */
/*
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo - use backend in production
});

export async function analyzeMeetingWithOpenAI(transcript, meeting) {
  const prompt = `
Analyze the following meeting transcript and extract action items.
For each action item, identify:
- Title (brief description)
- Type (epic, feature, story, or task)
- Priority (critical, high, medium, low)
- Assignee (if mentioned)
- Due date (if mentioned)
- Description

Meeting Context:
- Title: ${meeting.title}
- Type: ${meeting.type}
- Project: ${meeting.projectId}
- Sprint: ${meeting.sprintId}

Transcript:
${transcript}

Return the results in JSON format:
{
  "actionItems": [
    {
      "title": "...",
      "type": "story",
      "priority": "high",
      "assignee": "email@example.com",
      "dueDate": "2024-01-15",
      "description": "..."
    }
  ]
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert Agile project manager analyzing meeting transcripts."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}
*/
