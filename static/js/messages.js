const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}
const authHeader = { 'Authorization': 'Bearer ' + token };

let currentTab = 'inbox';
let inboxMessages = [];
let sentMessages = [];
let users = [];

function showLoading() {
    document.getElementById('messages-list').innerHTML = '<div id="loading-msg" class="text-center text-gray-400 py-8">Loading...</div>';
}

function showError(msg) {
    document.getElementById('messages-list').innerHTML = `<div class="text-center text-red-500 py-8">${msg}</div>`;
}

function renderMessages(messages, type) {
    if (!messages.length) {
        document.getElementById('messages-list').innerHTML = `<div class="text-center text-gray-400 py-8">No ${type === 'inbox' ? 'received' : 'sent'} messages.</div>`;
        return;
    }
    let html = '<ul class="divide-y">';
    for (const msg of messages) {
        html += `<li class="flex items-start gap-4 py-4 px-2 hover:bg-blue-50 rounded-lg transition-all cursor-pointer ${!msg.read && type==='inbox' ? 'bg-blue-50' : ''}" data-id="${msg.id}">
            <div class="flex-1">
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-gray-900">${type === 'inbox' ? msg.from : msg.to}</span>
                    ${!msg.read && type==='inbox' ? '<span class="unread-dot"></span>' : ''}
                    <span class="ml-auto text-xs text-gray-400">${msg.timestamp}</span>
                </div>
                <div class="font-medium text-gray-800 mt-1">${msg.subject}</div>
                <div class="text-gray-500 text-sm mt-1">${msg.body.length > 80 ? msg.body.slice(0, 80) + '…' : msg.body}</div>
            </div>
        </li>`;
    }
    html += '</ul>';
    document.getElementById('messages-list').innerHTML = html;
}

function updateUnreadBadge() {
    const unread = inboxMessages.filter(m => !m.read).length;
    const badge = document.getElementById('unread-badge');
    badge.innerHTML = unread > 0 ? '<span class="unread-dot"></span>' : '';
    document.getElementById('inbox-count').textContent = unread > 0 ? `(${unread})` : '';
}

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('inboxTab').classList.toggle('text-blue-700', tab === 'inbox');
    document.getElementById('inboxTab').classList.toggle('border-blue-600', tab === 'inbox');
    document.getElementById('sentTab').classList.toggle('text-blue-700', tab === 'sent');
    document.getElementById('sentTab').classList.toggle('border-blue-600', tab === 'sent');
    document.getElementById('sentTab').classList.toggle('text-gray-500', tab !== 'sent');
    document.getElementById('inboxTab').classList.toggle('text-gray-500', tab !== 'inbox');
    if (tab === 'inbox') {
        renderMessages(inboxMessages, 'inbox');
    } else {
        renderMessages(sentMessages, 'sent');
    }
}

async function fetchMessages() {
    showLoading();
    try {
        const [inboxRes, sentRes] = await Promise.all([
            fetch('/messages/inbox', { headers: authHeader }),
            fetch('/messages/sent', { headers: authHeader })
        ]);
        if (!inboxRes.ok || !sentRes.ok) throw new Error('Failed to load messages.');
        inboxMessages = await inboxRes.json();
        sentMessages = await sentRes.json();
        document.getElementById('inbox-count').textContent = `(${inboxMessages.length})`;
        document.getElementById('sent-count').textContent = `(${sentMessages.length})`;
        updateUnreadBadge();
        switchTab(currentTab);
    } catch (e) {
        showError('Error loading messages.');
    }
}

async function fetchUsers() {
    try {
        const res = await fetch('/api/users', { headers: authHeader });
        if (!res.ok) throw new Error();
        users = await res.json();
        const toUser = document.getElementById('toUser');
        toUser.innerHTML = users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
        toUser.selectedIndex = 0;
    } catch {
        document.getElementById('toUser').innerHTML = '<option>Failed to load users</option>';
    }
}

function openCompose() {
    document.getElementById('composeModal').classList.remove('hidden');
    document.getElementById('compose-error').classList.add('hidden');
    document.getElementById('composeForm').reset();
    fetchUsers();
    setTimeout(() => {
        document.getElementById('toUser').focus();
    }, 100);
}

function closeCompose() {
    document.getElementById('composeModal').classList.add('hidden');
}

// Toast notification
function showToast(msg, type = 'success') {
    let toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 transition-all';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('composeBtn').onclick = openCompose;
    document.getElementById('closeCompose').onclick = closeCompose;
    document.getElementById('composeModal').onclick = function(e) {
        if (e.target === this) closeCompose();
    };
    document.getElementById('inboxTab').onclick = () => switchTab('inbox');
    document.getElementById('sentTab').onclick = () => switchTab('sent');

    document.getElementById('composeForm').onsubmit = async function(e) {
        e.preventDefault();
        const sendBtn = this.querySelector('button[type="submit"]');
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
        const to = document.getElementById('toUser').value;
        const subject = document.getElementById('subject').value;
        const body = document.getElementById('body').value;
        try {
            const res = await fetch('/messages/send', {
                method: 'POST',
                headers: { ...authHeader, 'Content-Type': 'application/json' },
                body: JSON.stringify({ to, subject, body })
            });
            if (!res.ok) throw new Error();
            console.log('Message sent, closing modal...'); // Debug log
            closeCompose();
            document.getElementById('composeForm').reset();
            fetchMessages();
            showToast('Message sent!');
        } catch {
            const err = document.getElementById('compose-error');
            err.textContent = 'Failed to send message.';
            err.classList.remove('hidden');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
        }
    };

    document.getElementById('messages-list').onclick = async function(e) {
        let li = e.target;
        while (li && li.tagName !== 'LI') li = li.parentElement;
        if (!li) return;
        const id = li.getAttribute('data-id');
        if (currentTab === 'inbox') {
            await fetch(`/messages/read/${id}`, { method: 'PATCH', headers: authHeader });
            fetchMessages();
        }
    };

    (async function () {
        await fetchUsers();
        await fetchMessages();
        const me = await fetch('/api/me', { headers: authHeader });
        const u = await me.json();
        document.getElementById('sidebar-username').textContent = u.name || 'User';
    })();

    // Cancel button closes modal
    const cancelComposeBtn = document.getElementById('cancelCompose');
    if (cancelComposeBtn) {
        cancelComposeBtn.onclick = closeCompose;
    }
});

// ESC key closes modal
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('composeModal');
    if (!modal.classList.contains('hidden') && e.key === 'Escape') {
        closeCompose();
    }
});