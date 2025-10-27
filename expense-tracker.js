class ExpenseTracker {
    constructor() {
        this.expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.setDefaultDate();
    }

    setupEventListeners() {
        // Add expense button
        document.getElementById('addExpenseBtn').addEventListener('click', () => this.addExpense());
        
        // Enter key support for inputs
        document.getElementById('expenseDescription').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addExpense();
        });
        document.getElementById('expenseAmount').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addExpense();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Action buttons
        document.getElementById('exportData').addEventListener('click', () => this.exportData());
        document.getElementById('clearAllData').addEventListener('click', () => this.clearAllData());
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expenseDate').value = today;
    }

    addExpense() {
        const description = document.getElementById('expenseDescription').value.trim();
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const date = document.getElementById('expenseDate').value;

        // Validation
        if (!description || !amount || amount <= 0) {
            alert('Please fill in all fields with valid values');
            return;
        }

        const expense = {
            id: Date.now(),
            description,
            amount,
            category,
            date,
            createdAt: new Date().toISOString()
        };

        this.expenses.unshift(expense);
        this.saveExpenses();
        this.updateDisplay();
        this.clearForm();
    }

    clearForm() {
        document.getElementById('expenseDescription').value = '';
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    }

    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            this.expenses = this.expenses.filter(expense => expense.id !== id);
            this.saveExpenses();
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

    getFilteredExpenses() {
        if (this.currentFilter === 'all') {
            return this.expenses;
        }
        return this.expenses.filter(expense => expense.category === this.currentFilter);
    }

    updateDisplay() {
        this.updateSummaryCards();
        this.updateExpenseList();
        this.updateCategoryChart();
    }

    updateSummaryCards() {
        const totalBalance = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const thisMonth = this.getCurrentMonthExpenses();
        const categories = new Set(this.expenses.map(expense => expense.category)).size;

        document.getElementById('totalBalance').textContent = `$${totalBalance.toFixed(2)}`;
        document.getElementById('monthlyExpense').textContent = `$${thisMonth.toFixed(2)}`;
        document.getElementById('categoryCount').textContent = categories;
    }

    getCurrentMonthExpenses() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return this.expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && 
                       expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, expense) => sum + expense.amount, 0);
    }

    updateExpenseList() {
        const expenseList = document.getElementById('expenseList');
        const filteredExpenses = this.getFilteredExpenses();

        if (filteredExpenses.length === 0) {
            expenseList.innerHTML = '<li class="no-expenses">No expenses found</li>';
            return;
        }

        expenseList.innerHTML = filteredExpenses.map(expense => this.createExpenseItem(expense)).join('');
    }

    createExpenseItem(expense) {
        const categoryIcons = {
            food: '🍔',
            transport: '🚗',
            shopping: '🛍️',
            entertainment: '🎬',
            bills: '💡',
            healthcare: '🏥',
            education: '📚',
            other: '📦'
        };

        const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        return `
            <li class="expense-item">
                <div class="category-icon">${categoryIcons[expense.category]}</div>
                <div class="expense-description">${expense.description}</div>
                <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
                <div class="expense-date">${formattedDate}</div>
                <button class="delete-btn" onclick="expenseTracker.deleteExpense(${expense.id})">Delete</button>
            </li>
        `;
    }

    updateCategoryChart() {
        const chartContainer = document.getElementById('categoryChart');
        const categoryTotals = this.getCategoryTotals();
        const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

        if (totalAmount === 0) {
            chartContainer.innerHTML = '<p>No expenses to display</p>';
            return;
        }

        const categoryIcons = {
            food: '🍔',
            transport: '🚗',
            shopping: '🛍️',
            entertainment: '🎬',
            bills: '💡',
            healthcare: '🏥',
            education: '📚',
            other: '📦'
        };

        const categoryNames = {
            food: 'Food',
            transport: 'Transport',
            shopping: 'Shopping',
            entertainment: 'Entertainment',
            bills: 'Bills',
            healthcare: 'Healthcare',
            education: 'Education',
            other: 'Other'
        };

        chartContainer.innerHTML = Object.entries(categoryTotals)
            .map(([category, amount]) => {
                const percentage = ((amount / totalAmount) * 100).toFixed(1);
                return `
                    <div class="chart-item">
                        <div class="chart-category">${categoryIcons[category]} ${categoryNames[category]}</div>
                        <div class="chart-amount">$${amount.toFixed(2)}</div>
                        <div class="chart-percentage">${percentage}%</div>
                    </div>
                `;
            })
            .join('');
    }

    getCategoryTotals() {
        const totals = {};
        this.expenses.forEach(expense => {
            totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
        });
        return totals;
    }

    exportData() {
        if (this.expenses.length === 0) {
            alert('No data to export');
            return;
        }

        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    generateCSV() {
        const headers = ['Date', 'Description', 'Amount', 'Category'];
        const rows = this.expenses.map(expense => [
            expense.date,
            expense.description,
            expense.amount,
            expense.category
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    clearAllData() {
        if (confirm('Are you sure you want to delete ALL expense data? This cannot be undone.')) {
            this.expenses = [];
            this.saveExpenses();
            this.updateDisplay();
        }
    }

    saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }
}

// Initialize the expense tracker when the page loads
let expenseTracker;
document.addEventListener('DOMContentLoaded', () => {
    expenseTracker = new ExpenseTracker();
});
