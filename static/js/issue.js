// Issue Details Page JS for Jira Clone

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const issueId = urlParams.get('id');
    if (!issueId) {
        alert('No issue specified.');
        window.location.href = '/board.html';
        return;
    }
    loadIssue(issueId);
    loadComments(issueId);
    loadAttachments(issueId);
    loadActivity(issueId);
    loadWatchers(issueId);

    document.getElementById('addCommentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        postComment(issueId);
    });
    document.getElementById('uploadAttachmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        uploadAttachment(issueId);
    });

    // Assignee edit logic
    document.getElementById('editIssueBtn').addEventListener('click', async function() {
        const assigneeRow = document.getElementById('issue-assignee-row');
        const currentAssignee = document.getElementById('issue-assignee').dataset.userid || '';
        // Fetch users
        let users = [];
        try {
            const res = await fetch('/users', { headers: { 'Authorization': `Bearer ${token}` } });
            users = await res.json();
        } catch (e) {
            alert('Failed to load users');
            return;
        }
        // Build select
        const select = document.createElement('select');
        select.className = 'assignee-select';
        select.id = 'assigneeSelect';
        const unassignedOption = document.createElement('option');
        unassignedOption.value = '';
        unassignedOption.textContent = 'Unassigned';
        select.appendChild(unassignedOption);
        users.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = u.name;
            if (String(u.id) === String(currentAssignee)) opt.selected = true;
            select.appendChild(opt);
        });
        assigneeRow.innerHTML = '';
        assigneeRow.appendChild(select);
        // Add Save/Cancel
        const actions = document.createElement('div');
        actions.className = 'edit-actions-row';
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.className = 'btn-primary';
        saveBtn.onclick = async () => {
            const newAssignee = select.value || null;
            try {
                const resp = await fetch(`/issues/${issueId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ assignee_id: newAssignee })
                });
                if (resp.ok) {
                    await loadIssue(issueId);
                    restoreEditButton();
                } else {
                    alert('Failed to update assignee');
                }
            } catch (e) {
                alert('Failed to update assignee');
            }
        };
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'btn-cancel';
        cancelBtn.onclick = () => {
            loadIssue(issueId);
            restoreEditButton();
        };
        actions.appendChild(saveBtn);
        actions.appendChild(cancelBtn);
        document.getElementById('issue-edit-actions').innerHTML = '';
        document.getElementById('issue-edit-actions').appendChild(actions);
    });
    function restoreEditButton() {
        document.getElementById('issue-edit-actions').innerHTML = '<button class="btn-primary full-width" id="editIssueBtn">Edit</button>';
        document.getElementById('editIssueBtn').addEventListener('click', arguments.callee.caller);
    }
});

async function loadIssue(issueId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/issues/${issueId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const issue = await response.json();
        document.getElementById('issue-title').textContent = issue.title;
        document.getElementById('issue-type').textContent = issue.type;
        document.getElementById('issue-status').textContent = issue.status;
        document.getElementById('issue-priority').textContent = issue.priority;
        document.getElementById('issue-description').textContent = issue.description;
        // Show assignee name if available
        let assigneeName = 'Unassigned';
        let assigneeId = '';
        if (issue.assignee_id && issue.assignee_name) {
            assigneeName = issue.assignee_name;
            assigneeId = issue.assignee_id;
        } else if (issue.assignee_id) {
            assigneeName = issue.assignee_id;
            assigneeId = issue.assignee_id;
        }
        document.getElementById('issue-assignee-row').innerHTML = `<span id="issue-assignee" data-userid="${assigneeId}">${assigneeName}</span>`;
        document.getElementById('issue-dates').textContent = 'Created: ' + (issue.created_at || '') + ' | Due: ' + (issue.due_date || '');
        // Restore Edit button
        document.getElementById('issue-edit-actions').innerHTML = '<button class="btn-primary full-width" id="editIssueBtn">Edit</button>';
        document.getElementById('editIssueBtn').addEventListener('click', arguments.callee.caller);
    } catch (err) {
        alert('Failed to load issue details');
    }
}

async function loadComments(issueId) {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(atob(token.split('.')[1]));
    try {
        const response = await fetch(`/comments/${issueId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const comments = await response.json();
        const list = document.getElementById('comments-list');
        list.innerHTML = '';
        comments.forEach(comment => {
            const div = document.createElement('div');
            div.className = 'comment';
            div.innerHTML = `<strong>${comment.user_name || comment.user_id}</strong>: <span class="comment-content">${comment.content}</span> <span class=\"comment-date\">${comment.created_at}</span>`;
            // Show edit/delete if current user is author
            if (comment.user_id === userData.id) {
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Edit';
                editBtn.className = 'btn-secondary';
                editBtn.style.marginLeft = '0.5em';
                editBtn.onclick = () => editComment(comment, div, issueId);
                div.appendChild(editBtn);
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Delete';
                delBtn.className = 'btn-secondary';
                delBtn.style.marginLeft = '0.5em';
                delBtn.onclick = () => deleteComment(comment.id, issueId);
                div.appendChild(delBtn);
            }
            list.appendChild(div);
        });
    } catch (err) {
        alert('Failed to load comments');
    }
}

async function postComment(issueId) {
    const token = localStorage.getItem('token');
    const content = document.getElementById('commentContent').value;
    try {
        const response = await fetch(`/comments/${issueId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        if (response.ok) {
            document.getElementById('commentContent').value = '';
            loadComments(issueId);
        } else {
            const data = await response.json();
            alert(data.msg || 'Failed to add comment');
        }
    } catch (err) {
        alert('Failed to add comment');
    }
}

function editComment(comment, div, issueId) {
    const contentSpan = div.querySelector('.comment-content');
    const oldContent = contentSpan.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldContent;
    input.className = 'comment-edit-input';
    contentSpan.replaceWith(input);
    // Hide edit/delete buttons
    div.querySelectorAll('button').forEach(btn => btn.style.display = 'none');
    // Add save/cancel
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'btn-primary';
    saveBtn.style.marginLeft = '0.5em';
    saveBtn.onclick = async () => {
        await updateComment(comment.id, input.value, issueId);
    };
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'btn-secondary';
    cancelBtn.style.marginLeft = '0.5em';
    cancelBtn.onclick = () => loadComments(issueId);
    div.appendChild(saveBtn);
    div.appendChild(cancelBtn);
}

async function updateComment(commentId, content, issueId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });
        if (response.ok) {
            loadComments(issueId);
        } else {
            const data = await response.json();
            alert(data.msg || 'Failed to update comment');
        }
    } catch (err) {
        alert('Failed to update comment');
    }
}

async function deleteComment(commentId, issueId) {
    if (!confirm('Delete this comment?')) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            loadComments(issueId);
        } else {
            const data = await response.json();
            alert(data.msg || 'Failed to delete comment');
        }
    } catch (err) {
        alert('Failed to delete comment');
    }
}

async function loadAttachments(issueId) {
    // Placeholder: implement when backend endpoint is ready
    document.getElementById('attachments-list').innerHTML = '<em>Attachment list coming soon...</em>';
}

async function uploadAttachment(issueId) {
    // Placeholder: implement when backend endpoint is ready
    alert('Attachment upload coming soon!');
}

async function loadActivity(issueId) {
    // Placeholder: implement when backend endpoint is ready
    document.getElementById('activity-list').innerHTML = '<em>Activity history coming soon...</em>';
}

async function loadWatchers(issueId) {
    const watchersList = document.getElementById('watchers-list');
    if (watchersList) {
        watchersList.innerHTML = '<em>Watchers list coming soon...</em>';
    }
} 