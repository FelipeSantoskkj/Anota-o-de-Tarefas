 // --- State Management ---
        let tasks = [];
        let currentFilter = 'all';
        let searchQuery = '';
        let currentSort = 'created-desc';
        let pendingAction = null;

        // --- DOM Elements ---
        const taskForm = document.getElementById('task-form');
        const taskTitleInput = document.getElementById('task-title-input');
        const taskDueDateInput = document.getElementById('task-due-date');
        const tasksList = document.getElementById('tasks-list');
        const emptyState = document.getElementById('empty-state');
        const searchInput = document.getElementById('search-input');
        const clearSearchBtn = document.getElementById('clear-search-btn');
        const sortSelect = document.getElementById('sort-select');
        const clearCompletedBtn = document.getElementById('clear-completed-btn');
        const filterTabs = document.querySelectorAll('.filter-tab');
        
        // Stats elements
        const statTotal = document.getElementById('stat-total');
        const statPending = document.getElementById('stat-pending');
        const statCompleted = document.getElementById('stat-completed');
        const statOverdue = document.getElementById('stat-overdue');
        const progressBarFill = document.getElementById('progress-bar-fill');
        const progressText = document.getElementById('progress-text');

        // Theme Toggle
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        const themeIcon = document.getElementById('theme-icon');
        const themeText = document.getElementById('theme-text');

        // Modals
        const editModal = document.getElementById('edit-modal');
        const editModalContent = document.getElementById('edit-modal-content');
        const editTaskForm = document.getElementById('edit-task-form');
        const editTaskId = document.getElementById('edit-task-id');
        const editTaskTitle = document.getElementById('edit-task-title');
        const editTaskPriority = document.getElementById('edit-task-priority');
        const editTaskDueDate = document.getElementById('edit-task-due-date');
        const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');

        const confirmModal = document.getElementById('confirm-modal');
        const confirmModalTitle = document.getElementById('confirm-modal-title');
        const confirmModalDesc = document.getElementById('confirm-modal-desc');
        const cancelConfirmBtn = document.getElementById('cancel-confirm-btn');
        const actionConfirmBtn = document.getElementById('action-confirm-btn');

        // --- Initialization ---
        window.addEventListener('DOMContentLoaded', () => {
            loadTasks();
            initTheme();
            renderTasks();
            setupEventListeners();
        });

        // --- Toast Notifications ---
        function showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            const icons = {
                success: '<i class="fa-solid fa-circle-check text-emerald-400 text-base"></i>',
                danger: '<i class="fa-solid fa-circle-xmark text-rose-400 text-base"></i>',
                warning: '<i class="fa-solid fa-triangle-exclamation text-amber-400 text-base"></i>',
                info: '<i class="fa-solid fa-circle-info text-brand-400 text-base"></i>'
            };

            toast.className = `pointer-events-auto flex items-center gap-3 p-4 rounded-xl glass-panel shadow-xl border border-slate-700/60 transform translate-y-2 opacity-0 transition-all duration-300 text-sm font-medium text-slate-100`;
            toast.innerHTML = `
                ${icons[type] || icons.info}
                <span class="flex-1">${message}</span>
            `;

            container.appendChild(toast);

            // Animate in
            setTimeout(() => {
                toast.classList.remove('translate-y-2', 'opacity-0');
            }, 10);

            // Remove toast after 3s
            setTimeout(() => {
                toast.classList.add('translate-y-2', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // --- Theme Management ---
        function initTheme() {
            const savedTheme = localStorage.getItem('taskflow_theme') || 'dark';
            if (savedTheme === 'light') {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                themeIcon.className = 'fa-solid fa-sun text-amber-400';
                themeText.textContent = 'Tema Claro';
            } else {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
                themeIcon.className = 'fa-solid fa-moon text-brand-400';
                themeText.textContent = 'Tema Escuro';
            }
        }

        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            if (isDark) {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                localStorage.setItem('taskflow_theme', 'light');
                themeIcon.className = 'fa-solid fa-sun text-amber-400';
                themeText.textContent = 'Tema Claro';
            } else {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
                localStorage.setItem('taskflow_theme', 'dark');
                themeIcon.className = 'fa-solid fa-moon text-brand-400';
                themeText.textContent = 'Tema Escuro';
            }
        });

        // --- Date Helper ---
        function formatDate(dateString) {
            if (!dateString) return null;
            const date = new Date(dateString);
            if (isNaN(date)) return null;

            const now = new Date();
            const isOverdue = date < now;

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            return {
                formatted: `${day}/${month}/${year} às ${hours}:${minutes}`,
                isOverdue
            };
        }

        // --- Storage Functions ---
        function saveTasks() {
            localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
            updateStats();
        }

        function loadTasks() {
            const data = localStorage.getItem('taskflow_tasks');
            if (data) {
                try {
                    tasks = JSON.parse(data);
                } catch (e) {
                    tasks = [];
                }
            } else {
                // Initial Default Tasks if empty
                tasks = [
                    {
                        id: '1',
                        title: 'Aprender a usar o TaskFlow 🚀',
                        priority: 'important',
                        dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                        completed: false,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        title: 'Comprar suprimentos do mês',
                        priority: 'medium',
                        dueDate: '',
                        completed: false,
                        createdAt: new Date(Date.now() - 3600000).toISOString()
                    },
                    {
                        id: '3',
                        title: 'Ler um capítulo de um livro',
                        priority: 'optional',
                        dueDate: '',
                        completed: true,
                        createdAt: new Date(Date.now() - 7200000).toISOString()
                    }
                ];
                saveTasks();
            }
        }

        // --- Task CRUD Operations ---
        function addTask(title, priority, dueDate) {
            const newTask = {
                id: Date.now().toString(),
                title: title.trim(),
                priority,
                dueDate: dueDate || '',
                completed: false,
                createdAt: new Date().toISOString()
            };

            tasks.unshift(newTask);
            saveTasks();
            renderTasks();
            showToast('Tarefa adicionada com sucesso!', 'success');
        }

        function toggleTaskComplete(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                saveTasks();
                renderTasks();

                if (task.completed) {
                    // Confetti effect on completion!
                    confetti({
                        particleCount: 40,
                        spread: 60,
                        origin: { y: 0.8 }
                    });
                    showToast('Tarefa marcada como concluída!', 'success');
                }
            }
        }

        function deleteTask(id) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
            showToast('Tarefa removida.', 'danger');
        }

        function updateTask(id, title, priority, dueDate) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.title = title.trim();
                task.priority = priority;
                task.dueDate = dueDate || '';
                saveTasks();
                renderTasks();
                showToast('Tarefa atualizada!', 'info');
            }
        }

        function clearCompletedTasks() {
            const count = tasks.filter(t => t.completed).length;
            if (count === 0) {
                showToast('Nenhuma tarefa concluída para limpar.', 'warning');
                return;
            }

            openConfirmModal(
                'Limpar tarefas concluídas',
                `Deseja remover permanentemente ${count} tarefa(s) concluída(s)?`,
                () => {
                    tasks = tasks.filter(t => !t.completed);
                    saveTasks();
                    renderTasks();
                    showToast(`${count} tarefa(s) limpa(s) com sucesso.`, 'info');
                }
            );
        }

        // --- Statistics & Progress Calculation ---
        function updateStats() {
            const total = tasks.length;
            const completed = tasks.filter(t => t.completed).length;
            const pending = total - completed;

            const now = new Date();
            const overdue = tasks.filter(t => {
                if (t.completed || !t.dueDate) return false;
                return new Date(t.dueDate) < now;
            }).length;

            statTotal.textContent = total;
            statPending.textContent = pending;
            statCompleted.textContent = completed;
            statOverdue.textContent = overdue;

            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            progressBarFill.style.width = `${percentage}%`;
            progressText.textContent = `${percentage}%`;
        }

        // --- Filtering & Sorting Logic ---
        function getFilteredTasks() {
            return tasks.filter(task => {
                // Priority / Category Filter
                if (currentFilter === 'important' && task.priority !== 'important') return false;
                if (currentFilter === 'medium' && task.priority !== 'medium') return false;
                if (currentFilter === 'optional' && task.priority !== 'optional') return false;
                if (currentFilter === 'pending' && task.completed) return false;
                if (currentFilter === 'completed' && !task.completed) return false;

                // Search Filter
                if (searchQuery.trim() !== '') {
                    const query = searchQuery.toLowerCase();
                    const matchTitle = task.title.toLowerCase().includes(query);
                    if (!matchTitle) return false;
                }

                return true;
            }).sort((a, b) => {
                // Sort Logic
                if (currentSort === 'created-desc') {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                } else if (currentSort === 'created-asc') {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                } else if (currentSort === 'due-date') {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                } else if (currentSort === 'priority') {
                    const map = { important: 3, medium: 2, optional: 1 };
                    return map[b.priority] - map[a.priority];
                }
                return 0;
            });
        }

        // --- Task Item Component Generator ---
        function createTaskCardHTML(task) {
            const isCompleted = task.completed;
            const dateInfo = formatDate(task.dueDate);

            // Priority badge styling
            const priorityBadges = {
                important: {
                    label: 'Importante',
                    class: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                },
                medium: {
                    label: 'Normal',
                    class: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                },
                optional: {
                    label: 'Opcional',
                    class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }
            };

            const badge = priorityBadges[task.priority] || priorityBadges.medium;

            // Date Badge styling
            let dateBadgeHTML = '';
            if (dateInfo) {
                const isOverdueAndPending = dateInfo.isOverdue && !isCompleted;
                const dateClass = isOverdueAndPending 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold' 
                    : 'bg-slate-800 text-slate-400 border-slate-700/50';

                dateBadgeHTML = `
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs ${dateClass}">
                        <i class="fa-regular fa-clock text-[11px]"></i>
                        <span>${dateInfo.formatted}</span>
                        ${isOverdueAndPending ? '<span class="ml-1 text-[10px] uppercase font-bold tracking-wider px-1 bg-rose-500/20 text-rose-300 rounded">Atrasada</span>' : ''}
                    </div>
                `;
            }

            return `
                <div class="task-item task-enter glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border ${isCompleted ? 'opacity-60 bg-slate-900/40' : 'hover:border-slate-700'}" data-id="${task.id}">
                    <div class="flex items-start sm:items-center gap-3.5 flex-1 min-w-0 w-full">
                        <!-- Custom Checkbox -->
                        <button onclick="toggleTaskComplete('${task.id}')" 
                            class="mt-0.5 sm:mt-0 flex-shrink-0 w-6 h-6 rounded-lg border-2 ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600 hover:border-brand-400 text-transparent'} transition-all flex items-center justify-center">
                            <i class="fa-solid fa-check text-xs font-bold"></i>
                        </button>

                        <!-- Task Details -->
                        <div class="flex-1 min-w-0">
                            <p class="text-sm sm:text-base font-medium ${isCompleted ? 'line-through text-slate-500' : 'text-slate-100'} break-words">
                                ${escapeHTML(task.title)}
                            </p>
                            
                            <div class="flex flex-wrap items-center gap-2 mt-2">
                                <!-- Priority Badge -->
                                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${badge.class}">
                                    ${badge.label}
                                </span>
                                <!-- Due Date Badge -->
                                ${dateBadgeHTML}
                            </div>
                        </div>
                    </div>

                    <!-- Task Action Buttons -->
                    <div class="flex items-center gap-1.5 self-end sm:self-center ml-auto sm:ml-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 w-full sm:w-auto justify-end">
                        <button onclick="openEditModal('${task.id}')" 
                            title="Editar tarefa"
                            class="p-2 rounded-xl text-slate-400 hover:text-brand-300 hover:bg-slate-800 transition-all">
                            <i class="fa-solid fa-pen-to-square text-sm"></i>
                        </button>
                        <button onclick="confirmDeleteTask('${task.id}')" 
                            title="Excluir tarefa"
                            class="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all">
                            <i class="fa-solid fa-trash-can text-sm"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        // Utility to escape HTML and avoid XSS
        function escapeHTML(str) {
            return str.replace(/[&<>'"]/g, 
                tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
            );
        }

        // Render Method
        function renderTasks() {
            const filtered = getFilteredTasks();

            if (filtered.length === 0) {
                tasksList.innerHTML = '';
                emptyState.classList.remove('hidden');
                emptyState.classList.add('flex');
            } else {
                emptyState.classList.add('hidden');
                emptyState.classList.remove('flex');
                tasksList.innerHTML = filtered.map(t => createTaskCardHTML(t)).join('');
            }

            updateStats();
        }

        // --- Event Handlers & Modal Logic ---
        function setupEventListeners() {
            // New Task Form Submission
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = taskTitleInput.value;
                const priority = document.querySelector('input[name="priority-option"]:checked').value;
                const dueDate = taskDueDateInput.value;

                if (title.trim()) {
                    addTask(title, priority, dueDate);
                    taskForm.reset();
                    // Reset priority to default (medium)
                    document.querySelector('input[name="priority-option"][value="medium"]').checked = true;
                }
            });

            // Search input filter
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                clearSearchBtn.classList.toggle('hidden', searchQuery === '');
                renderTasks();
            });

            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchQuery = '';
                clearSearchBtn.classList.add('hidden');
                renderTasks();
            });

            // Sort Selector
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                renderTasks();
            });

            // Clear Completed
            clearCompletedBtn.addEventListener('click', clearCompletedTasks);

            // Filter Tabs
            filterTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    filterTabs.forEach(t => {
                        t.className = 'filter-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800';
                    });
                    tab.className = 'filter-tab px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap bg-brand-600 text-white shadow-md shadow-brand-600/20';
                    currentFilter = tab.getAttribute('data-filter');
                    renderTasks();
                });
            });

            // Edit Modal Handlers
            editTaskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = editTaskId.value;
                const title = editTaskTitle.value;
                const priority = editTaskPriority.value;
                const dueDate = editTaskDueDate.value;

                if (title.trim()) {
                    updateTask(id, title, priority, dueDate);
                    closeEditModal();
                }
            });

            closeEditModalBtn.addEventListener('click', closeEditModal);
            cancelEditBtn.addEventListener('click', closeEditModal);

            // Confirm Modal Handlers
            cancelConfirmBtn.addEventListener('click', closeConfirmModal);
            actionConfirmBtn.addEventListener('click', () => {
                if (typeof pendingAction === 'function') {
                    pendingAction();
                }
                closeConfirmModal();
            });
        }

        // --- Modal Helpers ---
        window.openEditModal = function(id) {
            const task = tasks.find(t => t.id === id);
            if (!task) return;

            editTaskId.value = task.id;
            editTaskTitle.value = task.title;
            editTaskPriority.value = task.priority;
            editTaskDueDate.value = task.dueDate || '';

            editModal.classList.remove('hidden');
            setTimeout(() => {
                editModal.classList.remove('opacity-0');
                editModalContent.classList.remove('scale-95');
            }, 10);
        };

        function closeEditModal() {
            editModal.classList.add('opacity-0');
            editModalContent.classList.add('scale-95');
            setTimeout(() => {
                editModal.classList.add('hidden');
            }, 200);
        }

        window.confirmDeleteTask = function(id) {
            openConfirmModal(
                'Excluir Tarefa',
                'Tem certeza de que deseja excluir esta atividade?',
                () => deleteTask(id)
            );
        };

        function openConfirmModal(title, desc, onConfirm) {
            confirmModalTitle.textContent = title;
            confirmModalDesc.textContent = desc;
            pendingAction = onConfirm;

            confirmModal.classList.remove('hidden');
            setTimeout(() => {
                confirmModal.classList.remove('opacity-0');
            }, 10);
        }

        function closeConfirmModal() {
            confirmModal.classList.add('opacity-0');
            setTimeout(() => {
                confirmModal.classList.add('hidden');
                pendingAction = null;
            }, 200);
        }