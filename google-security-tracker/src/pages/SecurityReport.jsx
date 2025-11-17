import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiDownload, FiFilter } from 'react-icons/fi';
import RemediationService from '../services/remediationService';
import { toast } from 'react-toastify';

const SecurityReport = () => {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const cached = localStorage.getItem('lastAnalysisResults');
    if (cached) {
      const results = JSON.parse(cached);
      setAnalysisResults(results);
      setFilteredIssues(results.issues);
    }
  }, []);

  useEffect(() => {
    if (analysisResults) {
      let filtered = analysisResults.issues;

      if (selectedSeverity !== 'all') {
        filtered = filtered.filter(i => i.severity === selectedSeverity);
      }

      if (selectedCategory !== 'all') {
        filtered = filtered.filter(i => i.category === selectedCategory);
      }

      setFilteredIssues(filtered);
    }
  }, [selectedSeverity, selectedCategory, analysisResults]);

  const handleAutoFix = async (issue) => {
    if (!issue.autoFixAvailable) {
      toast.warning('Auto-fix not available for this issue');
      return;
    }

    if (window.confirm(`Are you sure you want to auto-fix: ${issue.title}?`)) {
      await RemediationService.autoFixIssue(issue);

      // Remove fixed issue from display
      setFilteredIssues(prev => prev.filter(i => i.id !== issue.id));

      // Update cached results
      const updatedResults = {
        ...analysisResults,
        issues: analysisResults.issues.filter(i => i.id !== issue.id)
      };
      localStorage.setItem('lastAnalysisResults', JSON.stringify(updatedResults));
      setAnalysisResults(updatedResults);
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'badge-critical';
      case 'high':
        return 'badge-high';
      case 'medium':
        return 'badge-medium';
      case 'low':
        return 'badge-low';
      default:
        return 'badge-info';
    }
  };

  const exportReport = () => {
    if (!analysisResults) return;

    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalIssues: analysisResults.totalIssues,
        criticalIssues: analysisResults.criticalIssues,
        highIssues: analysisResults.highIssues,
        mediumIssues: analysisResults.mediumIssues,
        lowIssues: analysisResults.lowIssues
      },
      issues: analysisResults.issues
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString()}.json`;
    a.click();

    toast.success('Report exported successfully');
  };

  const categories = analysisResults
    ? [...new Set(analysisResults.issues.map(i => i.category))]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Security Report</h1>
          <p className="text-gray-600 mt-1">
            Detailed analysis of all detected security issues
          </p>
        </div>
        <button onClick={exportReport} className="btn-secondary flex items-center space-x-2">
          <FiDownload />
          <span>Export Report</span>
        </button>
      </div>

      {!analysisResults ? (
        <div className="card text-center py-12">
          <FiAlertCircle className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No Analysis Results
          </h2>
          <p className="text-gray-600">
            Run a security scan from the dashboard to see detailed results
          </p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="card">
            <div className="flex items-center space-x-4">
              <FiFilter className="text-xl text-gray-600" />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity
                  </label>
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-4">
            {filteredIssues.length === 0 ? (
              <div className="card text-center py-8">
                <FiCheckCircle className="text-5xl text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-gray-700">
                  No Issues Found
                </h3>
                <p className="text-gray-600">
                  {selectedSeverity !== 'all' || selectedCategory !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Your account is secure!'}
                </p>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <div key={issue.id} className="card border-l-4 border-l-red-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={getSeverityBadgeClass(issue.severity)}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className="badge-info">{issue.category}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {issue.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{issue.description}</p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <h4 className="font-semibold text-blue-800 text-sm mb-1">
                          Recommendation
                        </h4>
                        <p className="text-sm text-blue-700">{issue.recommendation}</p>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 text-sm">
                          Additional Recommendations:
                        </h4>
                        {RemediationService.getRecommendations(issue).map((rec, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-sm">
                            <span className={`badge-${rec.priority === 'high' ? 'high' : rec.priority === 'medium' ? 'medium' : 'low'} text-xs`}>
                              {rec.priority}
                            </span>
                            <div>
                              <p className="font-medium text-gray-800">{rec.title}</p>
                              <p className="text-gray-600">{rec.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Auto-fix Button */}
                    {issue.autoFixAvailable && (
                      <button
                        onClick={() => handleAutoFix(issue)}
                        className="btn-success ml-4"
                      >
                        <FiCheckCircle className="inline mr-2" />
                        Auto-Fix
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SecurityReport;
