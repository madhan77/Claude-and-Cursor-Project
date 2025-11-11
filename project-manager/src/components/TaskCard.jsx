import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaGripVertical, FaEdit, FaTrash, FaClock, FaFlag } from 'react-icons/fa';
import { useTasks } from '../contexts/TaskContext';

export default function TaskCard({ task, onEdit }) {
  const { deleteTask } = useTasks();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const priorityColors = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-red-600 bg-red-100'
  };

  async function handleDelete(e) {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer group"
      onClick={onEdit}
    >
      {/* Drag Handle and Actions */}
      <div className="flex items-start justify-between mb-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <FaGripVertical />
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-blue-600 hover:text-blue-700 p-1"
          >
            <FaEdit size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 p-1"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="font-medium text-gray-800 mb-2">{task.title}</h4>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Task Meta */}
      <div className="flex items-center justify-between text-xs">
        {/* Priority */}
        {task.priority && (
          <span className={`flex items-center gap-1 px-2 py-1 rounded ${priorityColors[task.priority]}`}>
            <FaFlag size={10} />
            {task.priority}
          </span>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <span className="flex items-center gap-1 text-gray-600">
            <FaClock size={10} />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
