import { useState } from 'react';
import { MdEdit, MdDelete, MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';
import { useTask } from '../contexts/TaskContext';
import { formatDate, isOverdue, PRIORITY_COLORS } from '../utils/helpers';
import TaskModal from './TaskModal';

const TaskItem = ({ task }) => {
  const [showModal, setShowModal] = useState(false);
  const { toggleTaskComplete, deleteTask } = useTask();

  const handleToggle = () => {
    toggleTaskComplete(task.id, task.completed);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  const overdue = !task.completed && isOverdue(task.dueDate);

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
          task.completed ? 'opacity-60' : ''
        } ${overdue ? 'border-l-4 border-red-500' : ''}`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={handleToggle}
            className="mt-1 text-2xl focus:outline-none"
          >
            {task.completed ? (
              <MdCheckCircle className="text-green-500" />
            ) : (
              <MdRadioButtonUnchecked className="text-gray-400 hover:text-gray-600" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-gray-800 mb-1 ${
                task.completed ? 'line-through text-gray-500' : ''
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-2">
              {task.priority && (
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    PRIORITY_COLORS[task.priority]
                  }`}
                >
                  {task.priority.toUpperCase()}
                </span>
              )}

              {task.category && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                  {task.category}
                </span>
              )}

              {task.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {task.dueDate && (
              <div className="text-sm">
                <span
                  className={`${
                    overdue
                      ? 'text-red-600 font-semibold'
                      : task.completed
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  Due: {formatDate(task.dueDate)}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-500 hover:text-blue-700 p-2"
              title="Edit task"
            >
              <MdEdit size={20} />
            </button>
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 p-2"
              title="Delete task"
            >
              <MdDelete size={20} />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <TaskModal
          task={task}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default TaskItem;
