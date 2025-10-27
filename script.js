class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Add task button
        document.getElementById('addBtn').addEventListener('click', () => this.addTask());
        
        // Enter key support
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Clear completed button
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const description = taskInput.value.trim();

        if (!description) {
            alert('Please enter a task description');
            return;
        }

        const task = {
            id: Date.now(),
            description,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.updateDisplay();
        taskInput.value = '';
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.updateDisplay();
        }
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.updateDisplay();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.updateDisplay();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear');
            return;
        }

        if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.updateDisplay();
        }
    }

    updateDisplay() {
        this.updateTaskList();
        this.updateStats();
    }

    updateTaskList() {
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            const emptyMessage = this.getEmptyMessage();
            taskList.innerHTML = `<li class="empty-message">${emptyMessage}</li>`;
            return;
        }

        taskList.innerHTML = filteredTasks.map(task => this.createTaskItem(task)).join('');
    }

    getEmptyMessage() {
        switch (this.currentFilter) {
            case 'active':
                return 'No active tasks! 🎉';
            case 'completed':
                return 'No completed tasks yet';
            default:
                return 'No tasks yet. Add one above!';
        }
    }

    createTaskItem(task) {
        return `
            <li class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="todoApp.toggleTask(${task.id})">
                <span class="task-text">${this.escapeHtml(task.description)}</span>
                <button class="delete-btn" onclick="todoApp.deleteTask(${task.id})">Delete</button>
            </li>
        `;
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const activeTasks = this.tasks.filter(task => !task.completed).length;
        
        document.getElementById('taskCount').textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} remaining`;
        
        // Show/hide clear completed button
        const completedTasks = totalTasks - activeTasks;
        const clearBtn = document.getElementById('clearCompleted');
        clearBtn.style.display = completedTasks > 0 ? 'block' : 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
}

// Initialize the todo app when the page loads
let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});
