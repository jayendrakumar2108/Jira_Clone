// Admin Panel JS for Jira Clone

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }
    loadUsers();
    loadProjects();
});

async function loadUsers() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        const tbody = document.querySelector('#userTable tbody');
        tbody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <select onchange="updateUserRole(${user.id}, this.value)">
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        <option value="developer" ${user.role === 'developer' ? 'selected' : ''}>Developer</option>
                        <option value="reporter" ${user.role === 'reporter' ? 'selected' : ''}>Reporter</option>
                    </select>
                </td>
                <td><button class="btn-blue edit-user-btn" data-id="${user.id}">Edit</button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        alert('Failed to load users');
    }
}

async function updateUserRole(userId, newRole) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role: newRole })
        });
        if (!response.ok) {
            const data = await response.json();
            alert(data.msg || 'Failed to update role');
        }
    } catch (err) {
        alert('Failed to update user role');
    }
}

async function loadProjects() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/projects', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const projects = await response.json();
        const projectList = document.getElementById('projectList');
        projectList.innerHTML = '';
        projects.forEach(project => {
            const div = document.createElement('div');
            div.className = 'project-admin-card';
            div.innerHTML = `
                <strong>${project.name}</strong> (${project.id})<br>
                <span>${project.description || ''}</span>
                <button onclick="deleteProject(${project.id})">Delete</button>
            `;
            projectList.appendChild(div);
        });
    } catch (err) {
        alert('Failed to load projects');
    }
}

async function deleteProject(projectId) {
    const token = localStorage.getItem('token');
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
        const response = await fetch(`/projects/${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            loadProjects();
        } else {
            const data = await response.json();
            alert(data.msg || 'Failed to delete project');
        }
    } catch (err) {
        alert('Failed to delete project');
    }
} 