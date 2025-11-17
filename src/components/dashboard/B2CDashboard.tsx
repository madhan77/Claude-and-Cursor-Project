import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { OutputPanel } from '../output-panel/OutputPanel';
import { OutputResult } from '../../types';
import {
  Home,
  Sparkles,
  Heart,
  Trophy,
  Settings,
  LogOut,
  Zap,
  Star,
  TrendingUp
} from 'lucide-react';

export const B2CDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'favorites' | 'achievements'>('create');

  // Mock output result
  const mockOutput: OutputResult = {
    id: '1',
    timestamp: new Date(),
    content: `# Your Personalized Travel Itinerary

## 🌍 3-Day Paris Adventure

### Day 1: Classic Paris
- **Morning**: Visit the Eiffel Tower (arrive early at 9 AM)
- **Lunch**: Café de Flore in Saint-Germain
- **Afternoon**: Louvre Museum highlights tour
- **Evening**: Seine River cruise at sunset

### Day 2: Art & Culture
- **Morning**: Montmartre & Sacré-Cœur
- **Lunch**: Local bistro in Le Marais
- **Afternoon**: Musée d'Orsay
- **Evening**: Show at Moulin Rouge

### Day 3: Local Experience
- **Morning**: Fresh pastries at local boulangerie
- **Lunch**: Picnic at Luxembourg Gardens
- **Afternoon**: Shopping on Champs-Élysées
- **Evening**: Dinner at a traditional French restaurant

## 💡 Pro Tips
- Get the Paris Museum Pass for skip-the-line access
- Download the Paris Metro app
- Try authentic crêpes from street vendors

Bon voyage! 🗼`,
    format: 'markdown',
    metadata: {
      generationTime: 1.8,
      qualityScore: 96,
      tokenCount: 485,
    },
    status: 'success'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Top Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles size={24} />
                My Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full">
                <Zap size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                  125 Credits
                </span>
              </div>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Free Plan</p>
                </div>
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full ring-2 ring-purple-500"
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 border border-gray-200 dark:border-gray-700 sticky top-8">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'home'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Home size={20} />
                  <span className="font-medium">Home</span>
                </button>

                <button
                  onClick={() => setActiveTab('create')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'create'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Sparkles size={20} />
                  <span className="font-medium">Create</span>
                </button>

                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'favorites'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Heart size={20} />
                  <span className="font-medium">Favorites</span>
                </button>

                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === 'achievements'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Trophy size={20} />
                  <span className="font-medium">Achievements</span>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                  <Settings size={20} />
                  <span className="font-medium">Settings</span>
                </button>
              </nav>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
                  <span className="text-sm font-bold text-purple-600">12 creations</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Streak</span>
                  <span className="text-sm font-bold text-orange-600">7 days 🔥</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 md:col-span-9">
            {activeTab === 'create' && (
              <div className="space-y-6">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl shadow-2xl p-8 text-white">
                  <h2 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.name}! 👋
                  </h2>
                  <p className="text-purple-100 text-lg">
                    Create something amazing today
                  </p>
                </div>

                {/* Output Panel */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Your Latest Creation
                  </h3>
                  <OutputPanel
                    result={mockOutput}
                    onRegenerate={() => console.log('Regenerate')}
                    onShare={() => console.log('Share')}
                    showCollaboration={false}
                  />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg group-hover:scale-110 transition-transform">
                        <Sparkles size={24} className="text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900 dark:text-white">New Creation</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Start fresh</p>
                      </div>
                    </div>
                  </button>

                  <button className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform">
                        <Star size={24} className="text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Try Template</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Quick start</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'home' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Feed</h2>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">
                    Your personalized activity feed and recommendations will appear here.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Heart className="text-pink-500" size={28} />
                  Your Favorites
                </h2>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">
                    Save your favorite creations here for easy access.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Trophy className="text-yellow-500" size={28} />
                  Achievements
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: 'First Creation', desc: 'Created your first output', unlocked: true },
                    { title: 'Week Warrior', desc: '7-day streak', unlocked: true },
                    { title: 'Power User', desc: '50 total creations', unlocked: false },
                    { title: 'Social Star', desc: 'Share 10 outputs', unlocked: false },
                  ].map((achievement, i) => (
                    <div
                      key={i}
                      className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border ${
                        achievement.unlocked
                          ? 'border-yellow-300 dark:border-yellow-600'
                          : 'border-gray-200 dark:border-gray-700 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Trophy
                          size={24}
                          className={achievement.unlocked ? 'text-yellow-500' : 'text-gray-400'}
                        />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {achievement.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
