import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { OutputPanel } from '../output-panel/OutputPanel';
import { OutputResult } from '../../types';
import {
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  BarChart3,
  FileText,
  Bell
} from 'lucide-react';

export const B2BDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'users' | 'output'>('output');

  // Mock output result
  const mockOutput: OutputResult = {
    id: '1',
    timestamp: new Date(),
    content: `# Marketing Campaign Analysis

## Executive Summary
Based on the analysis of Q4 2025 marketing data:

- Total Reach: 2.3M impressions
- Engagement Rate: 4.2% (↑ 0.8% vs Q3)
- Conversion Rate: 2.8%
- ROI: 285%

## Key Insights
1. Email campaigns outperformed social media by 35%
2. Mobile traffic increased 42% quarter-over-quarter
3. Top performing segment: 25-34 age group

## Recommendations
- Increase mobile ad spend by 25%
- A/B test subject lines for email campaigns
- Expand LinkedIn advertising budget`,
    format: 'markdown',
    metadata: {
      generationTime: 2.3,
      qualityScore: 94,
      tokenCount: 1250,
      version: 1
    },
    status: 'success'
  };

  const stats = [
    { label: 'Total Users', value: '12,543', change: '+12%', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Sessions', value: '8,291', change: '+8%', icon: Activity, color: 'from-purple-500 to-pink-500' },
    { label: 'Revenue (MRR)', value: '$124,500', change: '+23%', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { label: 'API Calls', value: '2.4M', change: '+15%', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Enterprise Dashboard
              </h1>
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'analytics'
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'users'
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('output')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'output'
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Output Panel
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative">
                <Bell size={20} className="text-gray-600 dark:text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Settings size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.organization}</p>
                </div>
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full ring-2 ring-blue-500"
                />
                <button
                  onClick={logout}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <LogOut size={18} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'output' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Output</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  View and manage generated outputs with team collaboration
                </p>
              </div>
            </div>

            <OutputPanel
              result={mockOutput}
              onRegenerate={() => console.log('Regenerate')}
              onShare={() => console.log('Share')}
              showCollaboration={true}
            />

            {/* Additional B2B Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Output Analytics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Outputs</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">1,234</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Quality Score</span>
                    <span className="text-sm font-medium text-green-600">92%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="text-sm font-medium text-green-600">98.5%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Recent Outputs
                </h3>
                <div className="space-y-2">
                  {['Marketing Analysis', 'Sales Report Q4', 'User Behavior Study'].map((title, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Generated {i + 1}h ago
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                      <stat.icon size={24} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Additional Content Based on Tab */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {activeTab === 'overview' && 'Organization Overview'}
                {activeTab === 'analytics' && 'Advanced Analytics'}
                {activeTab === 'users' && 'User Management'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'overview' && 'View comprehensive insights about your organization\'s platform usage.'}
                {activeTab === 'analytics' && 'Deep dive into usage patterns, performance metrics, and trends.'}
                {activeTab === 'users' && 'Manage team members, permissions, and access controls.'}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
