import { useState, useMemo } from 'react';
import { useProjects } from '../contexts/ProjectContext';
import { useTasks } from '../contexts/TaskContext';
import Layout from '../components/Layout';
import ProjectModal from '../components/ProjectModal';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Projects() {
  const { projects, deleteProject } = useProjects();
  const { tasks } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [parentProject, setParentProject] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState({});
  const navigate = useNavigate();

  // Build project tree structure
  const projectTree = useMemo(() => {
    const buildTree = (parentId = null, level = 0) => {
      return projects
        .filter(p => (p.parentId || null) === parentId)
        .map(project => ({
          ...project,
          level,
          children: buildTree(project.id, level + 1)
        }));
    };
    return buildTree();
  }, [projects]);

  // Flatten tree for rendering
  const flattenedProjects = useMemo(() => {
    const flatten = (tree, result = []) => {
      tree.forEach(project => {
        result.push(project);
        if (expandedProjects[project.id] && project.children.length > 0) {
          flatten(project.children, result);
        }
      });
      return result;
    };
    return flatten(projectTree);
  }, [projectTree, expandedProjects]);

  function toggleExpand(projectId) {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  }

  function handleEdit(project) {
    setSelectedProject(project);
    setParentProject(null);
    setShowModal(true);
  }

  function handleCreateSubProject(project) {
    setSelectedProject(null);
    setParentProject(project);
    setShowModal(true);
  }

  async function handleDelete(projectId) {
    if (window.confirm('Are you sure you want to delete this project? All tasks and sub-projects will be deleted.')) {
      await deleteProject(projectId);
    }
  }

  function handleCreateNew() {
    setSelectedProject(null);
    setParentProject(null);
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setSelectedProject(null);
    setParentProject(null);
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Projects</h1>
            <p className="text-gray-600">Manage all your projects in one place</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            New Project
          </button>
        </div>

        {/* Projects Hierarchical List */}
        {projects.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {flattenedProjects.map(project => {
              const projectTasks = tasks.filter(task => task.projectId === project.id);
              const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
              const progress = projectTasks.length > 0
                ? Math.round((completedTasks / projectTasks.length) * 100)
                : 0;
              const hasChildren = project.children && project.children.length > 0;
              const isExpanded = expandedProjects[project.id];

              return (
                <div
                  key={project.id}
                  className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                  style={{ paddingLeft: `${project.level * 2}rem` }}
                >
                  <div className="p-4 flex items-center gap-3">
                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => toggleExpand(project.id)}
                      className={`p-1 hover:bg-gray-200 rounded transition-colors ${!hasChildren ? 'invisible' : ''}`}
                    >
                      {hasChildren && (
                        isExpanded ? <FaChevronDown className="text-gray-600" /> : <FaChevronRight className="text-gray-600" />
                      )}
                    </button>

                    {/* Project Info */}
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {project.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          project.status === 'active' ? 'bg-green-100 text-green-600' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {project.status}
                        </span>
                        {project.level > 0 && (
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded">
                            Level {project.level}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FaUsers className="text-gray-400" size={12} />
                          <span>{project.members?.length || 0}</span>
                        </div>
                        <div>{projectTasks.length} tasks</div>
                        {hasChildren && (
                          <div className="text-purple-600 font-medium">
                            {project.children.length} sub-project{project.children.length !== 1 ? 's' : ''}
                          </div>
                        )}

                        {/* Progress */}
                        <div className="flex items-center gap-2 ml-auto">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{progress}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateSubProject(project);
                        }}
                        className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 px-2 py-1 rounded hover:bg-purple-50 transition-colors"
                        title="Add sub-project"
                      >
                        <FaPlus size={10} />
                        Sub
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(project);
                        }}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        <FaEdit size={12} />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id);
                        }}
                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <FaTrash size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-md p-12 max-w-md mx-auto">
              <FaPlus className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first project
              </p>
              <button
                onClick={handleCreateNew}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        )}

        {/* Project Modal */}
        {showModal && (
          <ProjectModal
            project={selectedProject}
            parentProject={parentProject}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </Layout>
  );
}
