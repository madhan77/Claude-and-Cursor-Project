import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext';
import { useTasks } from '../contexts/TaskContext';
import Layout from '../components/Layout';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import { FaArrowLeft, FaPlus, FaEdit } from 'react-icons/fa';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, updateProject } = useProjects();
  const { tasks, updateTask } = useTasks();
  const [project, setProject] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const foundProject = projects.find(p => p.id === id);
    if (foundProject) {
      setProject(foundProject);
    }
  }, [id, projects]);

  const projectTasks = tasks.filter(task => task.projectId === id);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'review', title: 'Review', color: 'bg-yellow-100' },
    { id: 'completed', title: 'Completed', color: 'bg-green-100' }
  ];

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    // Update task status
    updateTask(taskId, { status: newStatus });
  }

  function handleCreateTask(status) {
    setSelectedTask({ status, projectId: id });
    setShowTaskModal(true);
  }

  function handleEditTask(task) {
    setSelectedTask(task);
    setShowTaskModal(true);
  }

  function handleCloseModal() {
    setShowTaskModal(false);
    setSelectedTask(null);
  }

  if (!project) {
    return (
      <Layout>
        <div className="p-6 lg:p-8">
          <div className="text-center py-16">
            <p className="text-gray-600">Project not found</p>
            <button
              onClick={() => navigate('/projects')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
  const progress = projectTasks.length > 0
    ? Math.round((completedTasks / projectTasks.length) * 100)
    : 0;

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <FaArrowLeft />
            Back to Projects
          </button>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
                  <span className={`text-xs px-3 py-1 rounded ${
                    project.status === 'active' ? 'bg-green-100 text-green-600' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600">{project.description}</p>
              </div>
              <button
                onClick={() => {/* Add edit project functionality */}}
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <FaEdit size={20} />
              </button>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Progress</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-800">{progress}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Tasks</p>
                <p className="text-xl font-semibold text-gray-800">
                  {completedTasks} / {projectTasks.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Timeline</p>
                <p className="text-sm font-medium text-gray-800">
                  {project.startDate && project.endDate
                    ? `${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}`
                    : 'Not set'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map(column => {
              const columnTasks = projectTasks.filter(task => task.status === column.id);

              return (
                <div key={column.id} className="bg-gray-50 rounded-lg p-4">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{column.title}</h3>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCreateTask(column.id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <FaPlus size={16} />
                    </button>
                  </div>

                  {/* Tasks */}
                  <SortableContext
                    items={columnTasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3 min-h-[200px]">
                      {columnTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={() => handleEditTask(task)}
                        />
                      ))}
                      {columnTasks.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          No tasks yet
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>
        </DndContext>

        {/* Task Modal */}
        {showTaskModal && (
          <TaskModal
            task={selectedTask}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </Layout>
  );
}
