import { useState } from 'react';
import { useProjects } from '../contexts/ProjectContext';
import { useTasks } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import {
  FaProjectDiagram,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaPlus
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { userProfile } = useAuth();

  // Calculate statistics
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;

  // Prepare data for chart
  const chartData = projects.slice(0, 5).map(project => {
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    return {
      name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
      tasks: projectTasks.length,
      completed: projectTasks.filter(t => t.status === 'completed').length
    };
  });

  const stats = [
    {
      label: 'Total Projects',
      value: totalProjects,
      icon: FaProjectDiagram,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: FaTasks,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      label: 'Completed Tasks',
      value: completedTasks,
      icon: FaCheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      label: 'In Progress',
      value: inProgressTasks,
      icon: FaClock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {userProfile?.displayName || 'User'}!
          </h1>
          <p className="text-gray-600">Here's an overview of your projects and tasks</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="text-white text-2xl" />
                  </div>
                  <span className={`text-3xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Project Tasks Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Tasks by Project
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="#3b82f6" name="Total Tasks" />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No projects yet
              </div>
            )}
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Projects
              </h2>
              <Link
                to="/projects"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 5).map(project => {
                const projectTasks = tasks.filter(task => task.projectId === project.id);
                const completedCount = projectTasks.filter(t => t.status === 'completed').length;
                const progress = projectTasks.length > 0
                  ? Math.round((completedCount / projectTasks.length) * 100)
                  : 0;

                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-800">{project.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        project.status === 'active' ? 'bg-green-100 text-green-600' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {projectTasks.length} tasks · {completedCount} completed
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
              {projects.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <FaProjectDiagram className="text-5xl mx-auto mb-3 text-gray-300" />
                  <p>No projects yet</p>
                  <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <FaPlus /> Create your first project
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/projects"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <FaProjectDiagram className="text-2xl text-blue-600" />
              <div>
                <h3 className="font-medium text-gray-800">New Project</h3>
                <p className="text-sm text-gray-600">Create a new project</p>
              </div>
            </Link>
            <Link
              to="/tasks"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
            >
              <FaTasks className="text-2xl text-purple-600" />
              <div>
                <h3 className="font-medium text-gray-800">New Task</h3>
                <p className="text-sm text-gray-600">Add a new task</p>
              </div>
            </Link>
            <Link
              to="/team"
              className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <FaPlus className="text-2xl text-green-600" />
              <div>
                <h3 className="font-medium text-gray-800">Invite Team</h3>
                <p className="text-sm text-gray-600">Add team members</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
