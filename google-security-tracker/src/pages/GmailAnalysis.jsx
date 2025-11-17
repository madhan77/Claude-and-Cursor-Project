import React, { useState } from 'react';
import { FiMail, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import SecurityAnalysisService from '../services/securityAnalysisService';
import RemediationService from '../services/remediationService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const GmailAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const gmailIssues = await SecurityAnalysisService.analyzeGmail();
      setIssues(gmailIssues);
      toast.success(`Found ${gmailIssues.length} Gmail security issues`);
    } catch (error) {
      console.error('Gmail analysis error:', error);
      toast.error('Failed to analyze Gmail. Please check your permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFix = async (issue) => {
    if (window.confirm(`Auto-fix: ${issue.title}?`)) {
      await RemediationService.autoFixIssue(issue);
      setIssues(prev => prev.filter(i => i.id !== issue.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
            <FiMail className="text-red-500" />
            <span>Gmail Security Analysis</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Check for phishing emails, forwarding rules, and suspicious filters
          </p>
        </div>
        <button onClick={runAnalysis} disabled={loading} className="btn-primary">
          <FiRefreshCw className={loading ? 'animate-spin inline mr-2' : 'inline mr-2'} />
          {loading ? 'Analyzing...' : 'Analyze Gmail'}
        </button>
      </div>

      {loading && <LoadingSpinner message="Analyzing your Gmail account..." />}

      {!loading && issues.length === 0 && (
        <div className="card text-center py-12">
          <FiMail className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No Gmail Analysis Yet
          </h2>
          <p className="text-gray-600">
            Click "Analyze Gmail" to check for security issues
          </p>
        </div>
      )}

      {!loading && issues.length > 0 && (
        <div className="space-y-4">
          {issues.map(issue => (
            <div key={issue.id} className="card border-l-4 border-l-red-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`badge-${issue.severity}`}>
                      {issue.severity.toUpperCase()}
                    </span>
                    <FiAlertTriangle className="text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {issue.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{issue.description}</p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-700">
                      <strong>Recommendation:</strong> {issue.recommendation}
                    </p>
                  </div>
                </div>
                {issue.autoFixAvailable && (
                  <button
                    onClick={() => handleAutoFix(issue)}
                    className="btn-success ml-4"
                  >
                    Auto-Fix
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GmailAnalysis;
