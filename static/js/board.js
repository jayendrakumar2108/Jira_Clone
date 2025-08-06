// Check authentication
if (!localStorage.getItem('token')) {
    window.location.href = '/';
}

const token = localStorage.getItem('token');
const userData = JSON.parse(atob(token.split('.')[1]));
document.getElementById('userName').textContent = userData.name || 'User';

// Get project ID from URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('project');

if (!projectId) {
    window.location.href = '/dashboard.html';
}

// Store all issues for filtering
let allIssues = [];
let filteredIssues = [];

// Load project info and issues
async function loadProjectInfo() {
    try {
        const response = await fetch(`/projects/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const project = await response.json();
        document.getElementById('projectName').textContent = project.name;
        document.getElementById('boardTitle').textContent = `${project.name} - Kanban Board`;
    } catch (error) {
        console.error('Error loading project:', error);
    }
}

// --- ADD THIS FUNCTION ---
async function loadBoardIssues(projectId) {
    try {
        showLoadingSpinner();
        const response = await fetch(`/projects/${projectId}/issues`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const issues = await response.json();
        hideLoadingSpinner();
        allIssues = issues;
        filteredIssues = [...allIssues];
        displayIssues(filteredIssues);
    } catch (error) {
        hideLoadingSpinner();
        showToast('Failed to load issues: ' + error.message, 'error');
        console.error('Error loading issues:', error);
    }
}

// --- Toast Notification System ---
function showToast(msg, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'success') toast.style.background = '#22c55e';
    if (type === 'error') toast.style.background = '#ef4444';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Loading Spinner Overlay ---
function showLoadingSpinner() {
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}
function hideLoadingSpinner() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) overlay.style.display = 'none';
}

// --- Card Highlight ---
function highlightCard(issueId) {
    const card = document.querySelector(`.issue-card[data-issue-id='${issueId}']`);
    if (card) {
        card.classList.add('highlight');
        setTimeout(() => card.classList.remove('highlight'), 2000);
    }
}

// --- User Avatar Helper ---
function getAvatarHtml(name) {
    if (!name) return '<span class="avatar">?</span>';
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
    return `<span class="avatar">${initials}</span>`;
}

// --- Update createIssueCard to use avatar ---
function createIssueCard(issue) {
    const card = document.createElement('div');
    card.className = 'issue-card mb-3 p-3 bg-white rounded shadow-sm border position-relative';
    card.draggable = true;
    card.dataset.issueId = issue.id;
    card.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="fw-semibold fs-6">${issue.title}</div>
            <div>
                <button class="btn btn-sm btn-light border me-1" onclick="editIssue(${issue.id})" title="Edit">✏️</button>
                <button class="btn btn-sm btn-light border" onclick="deleteIssue(${issue.id})" title="Delete">🗑️</button>
            </div>
        </div>
        <div class="mb-2">
            <span class="badge bg-info text-dark me-1">${issue.type}</span>
            <span class="badge bg-warning text-dark me-1">${issue.priority}</span>
        </div>
        <div class="text-muted mb-2" style="font-size: 0.95em;">${issue.description || 'No description'}</div>
        <div class="d-flex align-items-center justify-content-between mt-2 pt-2 border-top" style="font-size: 0.95em;">
            <span>
                ${getAvatarHtml(issue.assignee_name)}
                <span class="ms-1">${issue.assignee_name || 'Unassigned'}</span>
            </span>
            ${issue.due_date ? `<span class="text-secondary"><i class="bi bi-calendar-event"></i> ${new Date(issue.due_date).toLocaleDateString()}</span>` : ''}
        </div>
    `;
    card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            window.location.href = `/issue.html?id=${issue.id}`;
        }
    });
    return card;
}

let sprints = [];

async function loadSprints(projectId) {
    const response = await fetch(`/sprints/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    sprints = await response.json();
}

function renderSprintColumns() {
    const sprintColumns = document.getElementById('sprint-columns');
    sprintColumns.innerHTML = '';
    sprints.forEach(sprint => {
        const sprintId = sprint.id;
        const sprintDiv = document.createElement('div');
        sprintDiv.className = 'kanban-sprint mb-5';
        sprintDiv.innerHTML = `
            <div class="fw-bold fs-5 mb-2">Sprint: ${sprint.name}</div>
            <div class="row" id="sprint-${sprintId}-columns">
                <div class="col">
                    <div class="card">
                        <div class="card-header bg-light fw-semibold">To Do</div>
                        <div class="kanban-column" data-status="To Do" data-sprint-id="${sprintId}">
                            <div class="kanban-cards" id="sprint-${sprintId}-todo"></div>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card">
                        <div class="card-header bg-light fw-semibold">In Progress</div>
                        <div class="kanban-column" data-status="In Progress" data-sprint-id="${sprintId}">
                            <div class="kanban-cards" id="sprint-${sprintId}-inprogress"></div>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card">
                        <div class="card-header bg-light fw-semibold">In Review</div>
                        <div class="kanban-column" data-status="In Review" data-sprint-id="${sprintId}">
                            <div class="kanban-cards" id="sprint-${sprintId}-inreview"></div>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card">
                        <div class="card-header bg-light fw-semibold">Done</div>
                        <div class="kanban-column" data-status="Done" data-sprint-id="${sprintId}">
                            <div class="kanban-cards" id="sprint-${sprintId}-done"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        sprintColumns.appendChild(sprintDiv);
    });
}

function displayIssues(issues) {
    // Clear all columns
    ['todo', 'inprogress', 'inreview', 'done'].forEach(status => {
        document.getElementById(`backlog-${status}`).innerHTML = '';
    });
    sprints.forEach(sprint => {
        ['todo', 'inprogress', 'inreview', 'done'].forEach(status => {
            const col = document.getElementById(`sprint-${sprint.id}-${status}`);
            if (col) col.innerHTML = '';
        });
    });

    issues.forEach(issue => {
        const sprintId = issue.sprint_id ? issue.sprint_id : 'backlog';
        let status = issue.status.replace(' ', '').toLowerCase();
        if (status === 'inprogress') status = 'inprogress';
        if (status === 'inreview') status = 'inreview';
        if (status === 'todo') status = 'todo';
        if (status === 'done') status = 'done';
        const colId = `${sprintId === 'backlog' ? 'backlog' : 'sprint-' + sprintId}-${status}`;
        const col = document.getElementById(colId);
        if (col) col.appendChild(createIssueCard(issue));
    });
    enableDragAndDrop();
}

function enableDragAndDrop() {
    document.querySelectorAll('.issue-card').forEach(card => {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', this.dataset.issueId);
            e.dataTransfer.effectAllowed = 'move';
            this.classList.add('dragging');
        });
        card.addEventListener('dragend', function () {
            this.classList.remove('dragging');
        });
    });

    document.querySelectorAll('.kanban-column').forEach(col => {
        col.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.classList.add('drag-over');
        });
        col.addEventListener('dragleave', function () {
            this.classList.remove('drag-over');
        });
        col.addEventListener('drop', function (e) {
            e.preventDefault();
            this.classList.remove('drag-over');

            const issueId = e.dataTransfer.getData('text/plain');
            const card = document.querySelector(`.issue-card[data-issue-id='${issueId}']`);
            if (!card) return;

            const targetColumn = this.querySelector('.kanban-cards');
            if (targetColumn) {
                targetColumn.appendChild(card);
            }

            const newStatus = this.dataset.status;
            const newSprintId = this.dataset.sprintId === "backlog" ? null : this.dataset.sprintId;

            updateIssueStatus(issueId, newStatus, newSprintId);
        });
    });
}

function updateIssueStatus(issueId, newStatus, newSprintId) {
    showLoadingSpinner();
    fetch(`/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            status: newStatus,
            sprint_id: newSprintId || null
        })
    })
    .then(async response => {
        hideLoadingSpinner();
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.msg || 'Failed to update issue status!');
        }
        return response.json();
    })
    .then(() => {
        showToast('Issue moved!', 'success');
        highlightCard(issueId);
        loadBoardIssues(projectId);  // reload to reflect actual status
    })
    .catch(error => {
        hideLoadingSpinner();
        showToast(error.message, 'error');
    });
}

async function loadBoard() {
    await loadSprints(projectId);
    renderSprintColumns();
    await loadBoardIssues(projectId);
}

// On page load
window.onload = function() {
    loadProjectInfo();
    loadFilterOptions();
    loadBoard();
};

// Sprint modal logic (create/edit)
function showSprintModal() {
    document.getElementById('sprintModal').classList.add('show');
}
function hideSprintModal() {
    document.getElementById('sprintModal').classList.remove('show');
}
document.getElementById('sprintForm').onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = {
        name: formData.get('name'),
        project_id: projectId,
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date')
    };
    showLoadingSpinner();
    const response = await fetch('/sprints', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    hideLoadingSpinner();
    if (response.ok) {
        hideSprintModal();
        this.reset();
        loadBoard();
        showToast('Sprint created!', 'success');
    } else {
        showToast('Failed to create sprint', 'error');
    }
};

// Load filter options (assignees, etc.)
async function loadFilterOptions() {
    try {
        const response = await fetch('/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        
        const assigneeSelect = document.getElementById('filterAssignee');
        assigneeSelect.innerHTML = '<option value="">All Assignees</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            assigneeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading filter options:', error);
    }
}

// Filter functionality
function applyFilters() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const assigneeFilter = document.getElementById('filterAssignee').value;
    const priorityFilter = document.getElementById('filterPriority').value;
    const typeFilter = document.getElementById('filterType').value;
    
    filteredIssues = allIssues.filter(issue => {
        const matchesSearch = !searchText || 
            issue.title.toLowerCase().includes(searchText) || 
            (issue.description && issue.description.toLowerCase().includes(searchText));
        
        const matchesAssignee = !assigneeFilter || issue.assignee_id == assigneeFilter;
        const matchesPriority = !priorityFilter || issue.priority === priorityFilter;
        const matchesType = !typeFilter || issue.type === typeFilter;
        
        return matchesSearch && matchesAssignee && matchesPriority && matchesType;
    });
    
    displayIssues(filteredIssues);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterAssignee').value = '';
    document.getElementById('filterPriority').value = '';
    document.getElementById('filterType').value = '';
    
    filteredIssues = [...allIssues];
    displayIssues(filteredIssues);
}


document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.issue-card').forEach(card => {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', this.dataset.issueId);
            e.dataTransfer.effectAllowed = 'move';
            this.classList.add('dragging');
        });
        card.addEventListener('dragend', function () {
            this.classList.remove('dragging');
        });
    });

    // Make all columns droppable
    document.querySelectorAll('.kanban-column').forEach(col => {
        col.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.classList.add('drag-over');
        });
        col.addEventListener('dragleave', function () {
            this.classList.remove('drag-over');
        });
        col.addEventListener('drop', function (e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            const issueId = e.dataTransfer.getData('text/plain');
            const card = document.querySelector(`.issue-card[data-issue-id='${issueId}']`);
            if (card) {
                this.querySelector('.kanban-cards').appendChild(card);
                // Send AJAX to backend to update issue status
                updateIssueStatus(issueId, this.dataset.status);
            }
        });
    });
});

function renderIssueCard(issue) {
    return `
    <div class="issue-card" data-issue-id="${issue.id}" draggable="true">
        <div class="font-bold">${issue.title}</div>
        <div class="text-xs mb-1">
            <span class="inline-block bg-blue-100 text-blue-700 rounded px-2 py-0.5 mr-1">${issue.type}</span>
            <span class="inline-block bg-yellow-100 text-yellow-700 rounded px-2 py-0.5">${issue.priority}</span>
        </div>
        <div class="text-xs text-gray-500 mb-1">${issue.description || ''}</div>
        <div class="flex items-center gap-2 text-sm mt-1">
            <span>👤</span>
            <span>${issue.assignee_name ? issue.assignee_name : 'Unassigned'}</span>
        </div>
    </div>
    `;
}

function renderKanbanBoard(issues) {
    const columns = {
        'To Do': document.getElementById('todo-cards'),
        'In Progress': document.getElementById('inprogress-cards'),
        'In Review': document.getElementById('inreview-cards'),
        'Done': document.getElementById('done-cards')
    };
    // Clear columns
    Object.values(columns).forEach(col => col.innerHTML = '');
    // Place issues in columns
    issues.forEach(issue => {
        let col = columns[issue.status] || columns['To Do'];
        col.innerHTML += renderIssueCard(issue);
    });
    // After rendering, re-attach drag-and-drop listeners
    enableDragAndDrop();
}

function enableDragAndDrop() {
    // Make all issue cards draggable
    document.querySelectorAll('.issue-card').forEach(card => {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', this.dataset.issueId);
            e.dataTransfer.effectAllowed = 'move';
            this.classList.add('dragging');
        });
        card.addEventListener('dragend', function () {
            this.classList.remove('dragging');
        });
    });
    // Make all columns droppable
    document.querySelectorAll('.kanban-column').forEach(col => {
        col.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            this.classList.add('drag-over');
        });
        col.addEventListener('dragleave', function () {
            this.classList.remove('drag-over');
        });
        col.addEventListener('drop', function (e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            const issueId = e.dataTransfer.getData('text/plain');
            const card = document.querySelector(`.issue-card[data-issue-id='${issueId}']`);
            if (card) {
                this.querySelector('.kanban-cards').appendChild(card);
                // Send AJAX to backend to update issue status
                updateIssueStatus(issueId, this.dataset.status);
            }
        });
    });
}

function updateIssueStatus(issueId, newStatus) {
    const token = localStorage.getItem('token'); // ✅ Correct token key used
    showLoadingSpinner();
    fetch(`/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // ✅ Send correct token
        },
        body: JSON.stringify({ status: newStatus }) // ✅ Proper body
    })
    .then(async (response) => {
        hideLoadingSpinner();
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.msg || 'Failed to update issue status!');
        }
        return response.json();
    })
    .then(data => {
        showToast('Issue moved!', 'success');
        highlightCard(issueId);
        loadBoardIssues(projectId); 
    })
    .catch(error => {
        hideLoadingSpinner();
        showToast(error.message, 'error');
    });
}


// Create issue modal
function showCreateIssue() {
    const modal = document.getElementById('createIssueModal');
    modal.classList.add('show');
    modal.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('issueTitle').focus();
    }, 100);
}
function hideCreateIssue() {
    const modal = document.getElementById('createIssueModal');
    modal.classList.remove('show');
    modal.classList.add('hidden');
}
// Trap focus in modal for accessibility
const modal = document.getElementById('createIssueModal');
if (modal) {
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const focusable = modal.querySelectorAll('input, select, textarea, button');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
        if (e.key === 'Escape') hideCreateIssue();
    });
}

async function loadUsers() {
    try {
        const response = await fetch('/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        
        const select = document.getElementById('issueAssignee');
        select.innerHTML = '<option value="">Select Assignee</option>';
        
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

document.getElementById('createIssueForm').onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        type: formData.get('type'),
        status: 'To Do',
        priority: formData.get('priority'),
        assignee_id: formData.get('assignee_id') ? Number(formData.get('assignee_id')) : null,
        project_id: projectId, // Ensure correct project
        due_date: formData.get('due_date') || null
    };
    try {
        showLoadingSpinner();
        const response = await fetch('/issues', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const responseBody = await response.json().catch(() => ({}));
        hideLoadingSpinner();
        if (response.ok) {
            hideCreateIssue();
            this.reset();
            clearFilters();
            await loadBoardIssues(projectId);
            highlightCard(responseBody.issue_id);
            showToast('Issue created!', 'success');
        } else {
            showToast('Failed to create issue: ' + (responseBody.msg || response.status), 'error');
        }
    } catch (error) {
        hideLoadingSpinner();
        showToast('Failed to create issue: ' + error, 'error');
        console.error('Error creating issue:', error);
    }
};

// Issue actions
function editIssue(issueId) {
    window.location.href = `/issue.html?id=${issueId}&edit=true`;
}

async function deleteIssue(issueId) {
    if (!confirm('Are you sure you want to delete this issue?')) return;
    
    try {
        const response = await fetch(`/issues/${issueId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            alert('The issue has been deleted.');
            loadBoardIssues(projectId);
        } else {
            const error = await response.json();
            alert(error.msg || 'Failed to delete issue');
        }
    } catch (error) {
        console.error('Error deleting issue:', error);
        alert('Failed to delete issue');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    window.location.href = '/';
}

// Load data on page load
loadProjectInfo();
loadBoardIssues(projectId); 

async function loadNotifications() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Not logged in!');
        return;
    }
    try {
        const response = await fetch('/notifications', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const notifications = await response.json();
        const dropdown = document.getElementById('notificationDropdown');
        const count = notifications.filter(n => !n.is_read).length;
        document.getElementById('notificationCount').textContent = count;
        dropdown.innerHTML = notifications.length === 0
            ? '<div class="text-muted">No notifications</div>'
            : notifications.map(n => `
                <div class="dropdown-item${n.is_read ? '' : ' fw-bold'}" style="white-space: normal;">
                    ${n.message}
                    <br><small class="text-muted">${new Date(n.created_at).toLocaleString()}</small>
                </div>
            `).join('');
    } catch (error) {
        document.getElementById('notificationDropdown').innerHTML = '<div class="text-danger">Failed to load notifications</div>';
    }
}

document.getElementById('notificationBell').addEventListener('click', () => {
    loadNotifications();
    document.getElementById('notificationDropdown').classList.toggle('show');
}); 