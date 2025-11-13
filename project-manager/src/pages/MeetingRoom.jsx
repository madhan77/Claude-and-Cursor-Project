import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useMeetings } from '../contexts/MeetingContext';
import { useProjects } from '../contexts/ProjectContext';
import { useSprints } from '../contexts/SprintContext';
import { FaMicrophone, FaStop, FaPause, FaPlay, FaDownload, FaSave, FaRobot } from 'react-icons/fa';
import { analyzeMeetingTranscript } from '../services/aiAnalysisService';
import ActionItemsReview from '../components/ActionItemsReview';

export default function MeetingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { meetings, updateMeeting, completeMeeting } = useMeetings();
  const { projects } = useProjects();
  const { sprints } = useSprints();

  const [meeting, setMeeting] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [actionItems, setActionItems] = useState([]);
  const [showActionItems, setShowActionItems] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    const currentMeeting = meetings.find(m => m.id === id);
    if (currentMeeting) {
      setMeeting(currentMeeting);
      if (currentMeeting.transcript) {
        setTranscript(currentMeeting.transcript);
        transcriptRef.current = currentMeeting.transcript;
      }
      if (currentMeeting.actionItems) {
        setActionItems(currentMeeting.actionItems);
      }
    }
  }, [id, meetings]);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          const timestamp = new Date().toLocaleTimeString();
          const newText = `[${timestamp}] ${finalTranscript}\n`;
          transcriptRef.current += newText;
          setTranscript(transcriptRef.current);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Automatically restart if no speech detected
          if (isRecording && !isPaused) {
            recognitionRef.current.start();
          }
        }
      };

      recognitionRef.current.onend = () => {
        // Automatically restart if recording is still active
        if (isRecording && !isPaused) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
          }
        }
      };
    } else {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setIsPaused(false);

        // Start timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };

  const pauseRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (recognitionRef.current && isPaused) {
      recognitionRef.current.start();
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
    }
  };

  const saveTranscript = async () => {
    if (meeting) {
      await updateMeeting(meeting.id, { transcript: transcriptRef.current });
    }
  };

  const analyzeMeeting = async () => {
    if (!transcriptRef.current || transcriptRef.current.trim().length === 0) {
      alert('No transcript available to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysis = await analyzeMeetingTranscript(
        transcriptRef.current,
        meeting,
        projects,
        sprints
      );
      setActionItems(analysis.actionItems);
      setShowActionItems(true);
    } catch (error) {
      console.error('Error analyzing meeting:', error);
      alert('Failed to analyze meeting. Please check the console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCompleteMeeting = async () => {
    if (window.confirm('Are you sure you want to complete this meeting? This will save the transcript and action items.')) {
      await completeMeeting(meeting.id, transcriptRef.current, actionItems);
      navigate('/meetings');
    }
  };

  const downloadTranscript = () => {
    const element = document.createElement('a');
    const file = new Blob([transcriptRef.current], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `meeting-transcript-${meeting?.title || 'untitled'}-${new Date().toISOString()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!meeting) {
    return (
      <Layout>
        <div className="p-6 lg:p-8">
          <p>Loading meeting...</p>
        </div>
      </Layout>
    );
  }

  const project = projects.find(p => p.id === meeting.projectId);
  const sprint = sprints.find(s => s.id === meeting.sprintId);

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{meeting.title}</h1>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>{meeting.type}</span>
                <span>•</span>
                <span>{meeting.scheduledDate} at {meeting.scheduledTime}</span>
                {project && (
                  <>
                    <span>•</span>
                    <span>Project: {project.name}</span>
                  </>
                )}
                {sprint && (
                  <>
                    <span>•</span>
                    <span>Sprint: {sprint.name}</span>
                  </>
                )}
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
              meeting.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {meeting.status}
            </span>
          </div>

          {meeting.description && (
            <p className="text-gray-600 mb-4">{meeting.description}</p>
          )}
        </div>

        {/* Recording Controls */}
        {meeting.status !== 'completed' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-mono font-bold text-gray-800">
                  {formatTime(recordingTime)}
                </div>
                {isRecording && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-500 font-medium">
                      {isPaused ? 'Paused' : 'Recording'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!isRecording && (
                  <button
                    onClick={startRecording}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium"
                  >
                    <FaMicrophone /> Start Recording
                  </button>
                )}
                {isRecording && !isPaused && (
                  <>
                    <button
                      onClick={pauseRecording}
                      className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 font-medium"
                    >
                      <FaPause /> Pause
                    </button>
                    <button
                      onClick={stopRecording}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 font-medium"
                    >
                      <FaStop /> Stop
                    </button>
                  </>
                )}
                {isPaused && (
                  <>
                    <button
                      onClick={resumeRecording}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
                    >
                      <FaPlay /> Resume
                    </button>
                    <button
                      onClick={stopRecording}
                      className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 font-medium"
                    >
                      <FaStop /> Stop
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={saveTranscript}
                disabled={!transcript}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <FaSave /> Save Transcript
              </button>
              <button
                onClick={downloadTranscript}
                disabled={!transcript}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <FaDownload /> Download
              </button>
              <button
                onClick={analyzeMeeting}
                disabled={!transcript || isAnalyzing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <FaRobot /> {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
              </button>
              {transcript && (
                <button
                  onClick={handleCompleteMeeting}
                  className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  Complete Meeting
                </button>
              )}
            </div>
          </div>
        )}

        {/* Transcript Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Meeting Transcript</h2>
          <div className="bg-gray-50 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
            {transcript ? (
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                {transcript}
              </pre>
            ) : (
              <p className="text-gray-400 text-center py-12">
                No transcript yet. Start recording to begin capturing the meeting.
              </p>
            )}
          </div>
        </div>

        {/* Action Items Review */}
        {showActionItems && actionItems.length > 0 && (
          <ActionItemsReview
            actionItems={actionItems}
            meeting={meeting}
            onClose={() => setShowActionItems(false)}
            onSave={(updatedItems) => {
              setActionItems(updatedItems);
              setShowActionItems(false);
            }}
          />
        )}

        {/* Completed Meeting Action Items Display */}
        {meeting.status === 'completed' && actionItems.length > 0 && !showActionItems && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Action Items</h2>
            <div className="space-y-4">
              {actionItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.type === 'story' ? 'bg-blue-100 text-blue-800' :
                      item.type === 'feature' ? 'bg-purple-100 text-purple-800' :
                      item.type === 'epic' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  {item.assignee && (
                    <p className="text-xs text-gray-500">Assigned to: {item.assignee}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
