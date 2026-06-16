// Todo App Main Script
class TodoApp {
    constructor() {
        this.todos = [];
        this.filteredTodos = [];
        this.editingId = null;
        this.init();
    }

    init() {
        this.loadTodos();
        this.setupEventListeners();
        this.render();
        this.updateStats();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('todoForm').addEventListener('submit', (e) => this.addTodo(e));

        // Dark mode
        document.getElementById('darkModeBtn').addEventListener('click', () => this.toggleDarkMode());

        // Clear all
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());

        // Search
        document.getElementById('searchInput').addEventListener('input', () => this.applyFilters());

        // Filters
        document.getElementById('filterStatus').addEventListener('change', () => this.applyFilters());
        document.getElementById('filterPriority').addEventListener('change', () => this.applyFilters());
        document.getElementById('filterCategory').addEventListener('change', () => this.applyFilters());
        document.getElementById('sortSelect').addEventListener('change', () => this.applyFilters());

        // Edit form
        document.getElementById('editForm').addEventListener('submit', (e) => this.saveEdit(e));
    }

    addTodo(e) {
        e.preventDefault();
        
        const title = document.getElementById('todoInput').value.trim();
        const priority = document.getElementById('prioritySelect').value;
        const category = document.getElementById('categorySelect').value;

        if (!title) return;

        const todo = {
            id: Date.now(),
            title,
            priority,
            category,
            completed: false,
            dueDate: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        this.updateStats();

        // Reset form
        document.getElementById('todoForm').reset();
        document.getElementById('prioritySelect').value = 'medium';
        document.getElementById('categorySelect').value = 'personal';

        // Show notification
        this.showNotification('Task added successfully!', 'success');
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            todo.updatedAt = new Date().toISOString();
            this.saveTodos();
            this.render();
            this.updateStats();
        }
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
            this.updateStats();
            this.showNotification('Task deleted!', 'info');
        }
    }

    openEditModal(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.editingId = id;
        document.getElementById('editTitle').value = todo.title;
        document.getElementById('editPriority').value = todo.priority;
        document.getElementById('editCategory').value = todo.category;
        document.getElementById('editDueDate').value = todo.dueDate || '';
        document.getElementById('editCompleted').checked = todo.completed;

        new bootstrap.Modal(document.getElementById('editModal')).show();
    }

    saveEdit(e) {
        e.preventDefault();

        const todo = this.todos.find(t => t.id === this.editingId);
        if (!todo) return;

        todo.title = document.getElementById('editTitle').value;
        todo.priority = document.getElementById('editPriority').value;
        todo.category = document.getElementById('editCategory').value;
        todo.dueDate = document.getElementById('editDueDate').value || null;
        todo.completed = document.getElementById('editCompleted').checked;
        todo.updatedAt = new Date().toISOString();

        this.saveTodos();
        this.render();
        this.updateStats();
        this.editingId = null;

        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
        this.showNotification('Task updated!', 'success');
    }

    applyFilters() {
        let filtered = [...this.todos];

        // Search filter
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(t => t.title.toLowerCase().includes(searchTerm));
        }

        // Status filter
        const status = document.getElementById('filterStatus').value;
        if (status !== 'all') {
            filtered = filtered.filter(t => 
                status === 'completed' ? t.completed : !t.completed
            );
        }

        // Priority filter
        const priority = document.getElementById('filterPriority').value;
        if (priority !== 'all') {
            filtered = filtered.filter(t => t.priority === priority);
        }

        // Category filter
        const category = document.getElementById('filterCategory').value;
        if (category !== 'all') {
            filtered = filtered.filter(t => t.category === category);
        }

        // Sorting
        const sort = document.getElementById('sortSelect').value;
        filtered.sort((a, b) => {
            switch (sort) {
                case 'date-asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'priority':
                    const priorityOrder = { high: 1, medium: 2, low: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'date-desc':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        this.filteredTodos = filtered;
        this.render();
    }

    clearAll() {
        if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
            this.todos = [];
            this.saveTodos();
            this.render();
            this.updateStats();
            this.showNotification('All tasks cleared!', 'warning');
        }
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('progressPercentage').textContent = percentage + '%';

        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = percentage + '%';
        
        if (percentage === 100 && total > 0) {
            progressBar.classList.add('bg-success');
        } else if (percentage === 0) {
            progressBar.classList.remove('bg-success');
        }
    }

    render() {
        const container = document.getElementById('tasksContainer');
        const emptyState = document.getElementById('emptyState');

        let todosToShow = this.filteredTodos.length > 0 ? this.filteredTodos : this.todos;

        if (todosToShow.length === 0) {
            container.innerHTML = '';
            emptyState.classList.add('show');
            return;
        }

        emptyState.classList.remove('show');

        container.innerHTML = todosToShow.map(todo => `
            <div class="todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''}">
                <div class="d-flex align-items-start gap-3">
                    <input type="checkbox" class="form-check-input mt-1" 
                           ${todo.completed ? 'checked' : ''} 
                           onchange="app.toggleTodo(${todo.id})">
                    <div class="flex-grow-1">
                        <div class="todo-text mb-2" style="font-size: 1.1rem; font-weight: 500;">
                            ${this.escapeHtml(todo.title)}
                        </div>
                        <div class="d-flex gap-2 flex-wrap mb-2">
                            <span class="badge badge-priority-${todo.priority}">
                                ${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                            </span>
                            <span class="badge badge-category category-${todo.category}">
                                ${todo.category.charAt(0).toUpperCase() + todo.category.slice(1)}
                            </span>
                            ${todo.dueDate ? `<span class="badge bg-info"><i class="fas fa-calendar"></i> ${new Date(todo.dueDate).toLocaleDateString()}</span>` : ''}
                        </div>
                        <small class="text-muted">
                            <i class="fas fa-clock"></i> Created: ${new Date(todo.createdAt).toLocaleDateString()}
                        </small>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-primary" onclick="app.openEditModal(${todo.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteTodo(${todo.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const stored = localStorage.getItem('todos');
        this.todos = stored ? JSON.parse(stored) : [];
        this.filteredTodos = [...this.todos];
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }

    showNotification(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '80px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();

    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});
