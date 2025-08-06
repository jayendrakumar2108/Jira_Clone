document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }
    loadAssignees();
    loadComponents();

    document.getElementById('createIssueForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitIssue();
    });
});

async function loadAssignees() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        const select = document.getElementById('assignee');
        select.innerHTML = '<option value="">Select Assignee</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            select.appendChild(option);
        });
    } catch (err) {
        alert('Failed to load assignees');
    }
}

async function loadComponents() {
    document.getElementById('component').innerHTML = '<option value="">Select Component</option>';
}

async function submitIssue() {
    const token = localStorage.getItem('token');
    const form = document.getElementById('createIssueForm');
    const formData = new FormData(form);

    // Get current project and user IDs (adjust based on your app)
    const project_id = localStorage.getItem('currentProjectId');  // Store projectId in localStorage when navigating to project
    const reporter_id = localStorage.getItem('userId');          // Store userId in localStorage on login

    if (!project_id) {
        alert("Project ID is missing. Cannot create issue.");
        return;
    }

    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        type: formData.get('type'),
        priority: formData.get('priority'),
        assignee_id: formData.get('assignee'),
        due_date: formData.get('due_date'),
        labels: formData.get('labels'),
        component: formData.get('component'),
        status: "To Do",
        project_id: project_id,
        reporter_id: reporter_id
    };

    try {
        const response = await fetch('/issues', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Issue created successfully!');
            form.reset();
            window.location.href = '/board.html';  // Redirect to board after creating issue
        } else {
            const res = await response.json();
            alert(res.msg || 'Failed to create issue');
        }
    } catch (err) {
        alert('Failed to create issue');
    }
}
