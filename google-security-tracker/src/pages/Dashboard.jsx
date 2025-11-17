import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiRefreshCw, FiMail, FiVideo, FiHardDrive, FiCalendar } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import SecurityAnalysisService from '../services/securityAnalysisService';
import RemediationService from '../services/remediationService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [securityScore, setSecurityScore] = useState(null);

  useEffect(() => {
    // Load cached results if available
    const cached = localStorage.getItem('lastAnalysisResults');
    if (cached) {
      const results = JSON.parse(cached);
      setAnalysisResults(results);
      setSecurityScore(SecurityAnalysisService.calculateSecurityScore(results));
    }
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      toast.info('Starting comprehensive security analysis...');
      const results = await SecurityAnalysisService.runFullAnalysis();
      setAnalysisResults(results);

      const score = SecurityAnalysisService.calculateSecurityScore(results);
      setSecurityScore(score);

      // Cache results
      localStorage.setItem('lastAnalysisResults', JSON.stringify(results));

      toast.success(`Analysis complete! Found ${results.totalIssues} issues.`);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to complete security analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const autoFixAll = async () => {
    if (!analysisResults || analysisResults.totalIssues === 0) {
      toast.warning('No issues to fix');
      return;
    }

    const fixableIssues = analysisResults.issues.filter(i => i.autoFixAvailable);

    if (fixableIssues.length === 0) {
      toast.warning('No auto-fixable issues found');
      return;
    }

    if (window.confirm(`Auto-fix ${fixableIssues.length} issues?`)) {
      await RemediationService.autoFixMultiple(fixableIssues);
      // Re-run analysis after fixes
      setTimeout(() => runAnalysis(), 2000);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const severityData = analysisResults ? [
    { name: 'Critical', value: analysisResults.criticalIssues, color: '#ef4444' },
    { name: 'High', value: analysisResults.highIssues, color: '#f97316' },
    { name: 'Medium', value: analysisResults.mediumIssues, color: '#eab308' },
    { name: 'Low', value: analysisResults.lowIssues, color: '#3b82f6' },
  ].filter(item => item.value > 0) : [];

  const categoryData = analysisResults ? Object.entries(
    analysisResults.issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Security Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive overview of your Google account security
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Scanning...' : 'Run Security Scan'}</span>
          </button>
          {analysisResults && analysisResults.totalIssues > 0 && (
            <button
              onClick={autoFixAll}
              className="btn-success flex items-center space-x-2"
            >
              <FiCheckCircle />
              <span>Auto-Fix All</span>
            </button>
          )}
        </div>
      </div>

      {loading && <LoadingSpinner message="Analyzing your Google account security..." />}

      {!loading && !analysisResults && (
        <div className="card text-center py-12">
          <FiShield className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Ready to Scan Your Account
          </h2>
          <p className="text-gray-600 mb-6">
            Click "Run Security Scan" to analyze your Google account for security issues
          </p>
          <button onClick={runAnalysis} className="btn-primary">
            Start Security Scan
          </button>
        </div>
      )}

      {!loading && analysisResults && (
        <>
          {/* Security Score */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  Security Score
                </h2>
                <p className="text-sm text-gray-600">
                  Last scan: {new Date(analysisResults.timestamp).toLocaleString()}
                </p>
              </div>
              <div className={`${getScoreBgColor(securityScore)} rounded-full p-8`}>
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(securityScore)}`}>
                    {securityScore}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">out of 100</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Issues</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    {analysisResults.totalIssues}
                  </p>
                </div>
                <FiAlertTriangle className="text-4xl text-yellow-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Critical</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {analysisResults.criticalIssues}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FiShield className="text-2xl text-red-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">High Priority</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">
                    {analysisResults.highIssues}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <FiAlertTriangle className="text-2xl text-orange-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Medium Priority</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">
                    {analysisResults.mediumIssues}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="text-2xl text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Severity Distribution */}
            {severityData.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Issues by Severity
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Category Distribution */}
            {categoryData.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Issues by Category
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/gmail" className="card hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FiMail className="text-2xl text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Gmail</h3>
                  <p className="text-sm text-gray-600">Analyze emails</p>
                </div>
              </div>
            </Link>

            <Link to="/drive" className="card hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiHardDrive className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Drive</h3>
                  <p className="text-sm text-gray-600">Check file sharing</p>
                </div>
              </div>
            </Link>

            <Link to="/youtube" className="card hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FiVideo className="text-2xl text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">YouTube</h3>
                  <p className="text-sm text-gray-600">Review privacy</p>
                </div>
              </div>
            </Link>

            <Link to="/calendar" className="card hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiCalendar className="text-2xl text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Calendar</h3>
                  <p className="text-sm text-gray-600">Check sharing</p>
                </div>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
