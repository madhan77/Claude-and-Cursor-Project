import Layout from '../components/Layout';
import { useProjects } from '../contexts/ProjectContext';
import { FaUsers, FaEnvelope } from 'react-icons/fa';
import { useState } from 'react';

export default function Team() {
  const { projects, addMember } = useProjects();
  const [selectedProject, setSelectedProject] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleInvite(e) {
    e.preventDefault();

    if (!selectedProject || !email) {
      return alert('Please select a project and enter an email');
    }

    try {
      setLoading(true);
      await addMember(selectedProject, email);
      setEmail('');
      setSelectedProject('');
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Team</h1>

        {/* Invite Member */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Invite Team Member
          </h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                  required
                >
                  <option value="">Choose a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="member@example.com"
                      disabled={loading}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    disabled={loading}
                  >
                    {loading ? 'Inviting...' : 'Invite'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Team Members by Project */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Team Members
          </h2>
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{project.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaUsers />
                    <span>{project.members?.length || 0} members</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FaUsers className="text-5xl mx-auto mb-3 text-gray-300" />
              <p>No projects yet. Create a project to start adding team members.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
