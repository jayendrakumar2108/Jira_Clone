document.addEventListener("DOMContentLoaded", function () {
    const userName = localStorage.getItem("userName");
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/index.html";
        return;
    }

    document.getElementById("userName").textContent = userName;
    document.getElementById("welcomeName").textContent = userName;

    fetchProjects();

    document.getElementById("createProjectForm").addEventListener("submit", function (e) {
        e.preventDefault();
        createProject();
    });
});

function fetchProjects() {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/projects", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const projectsGrid = document.getElementById("projectsGrid");
        projectsGrid.innerHTML = "";

        if (data && data.length > 0) {
            data.forEach(project => {
                addProjectCard(project);
            });
        } else {
            projectsGrid.innerHTML = "<p>No projects found.</p>";
        }
    })
    .catch(error => {
        console.error("Error fetching projects:", error);
    });
}

function createProject() {
    const name = document.getElementById("projectName").value.trim();
    const description = document.getElementById("projectDesc").value.trim();
    const priority = document.getElementById("projectPriority").value;
    const token = localStorage.getItem("token");

    if (!name || !priority) {
        alert("Project name and priority are required.");
        return;
    }

    fetch("http://localhost:5000/projects", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, priority })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            hideCreateProject();
            document.getElementById("createProjectForm").reset();
            fetchProjects();
        } else {
            alert(data.msg || "Failed to create project.");
        }
    })
    .catch(err => {
        console.error("Error creating project:", err);
        alert("Network error. Please try again.");
    });
}

function showCreateProject() {
    const modal = document.getElementById('createProjectModal');
    modal.classList.add('show');
    modal.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('projectName').focus();
    }, 100);
}

function hideCreateProject() {
    const modal = document.getElementById('createProjectModal');
    modal.classList.remove('show');
    modal.classList.add('hidden');
    document.getElementById('createProjectForm').reset();
}

// Trap focus in modal for accessibility
const projectModal = document.getElementById('createProjectModal');
if (projectModal) {
    projectModal.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const focusable = projectModal.querySelectorAll('input, select, textarea, button');
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
        if (e.key === 'Escape') hideCreateProject();
    });
    // Click outside to close
    projectModal.addEventListener('mousedown', function(e) {
        if (e.target === projectModal) hideCreateProject();
    });
}

function addProjectCard(project) {
    const projectsGrid = document.getElementById("projectsGrid");
    const projectCard = document.createElement("div");
    projectCard.className = "bg-white rounded-lg shadow p-5 flex flex-col gap-2 hover:shadow-lg transition";
    projectCard.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-lg text-gray-800">${project.name}</h3>
            <span class="px-2 py-1 rounded-full text-xs font-semibold ${project.priority === 'High' ? 'bg-red-100 text-red-700' : project.priority === 'Low' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${project.priority || 'Medium'}</span>
        </div>
        <p class="text-gray-600 text-sm mb-2">${project.description || 'No description'}</p>
        <div class="flex gap-2 mt-auto">
            <button onclick="openBoard(${project.id})" class="bg-blue-600 text-white px-3 py-1 rounded font-semibold hover:bg-blue-700 text-sm">Open Board</button>
            <button onclick="editProject(${project.id})" class="bg-gray-200 text-gray-700 px-3 py-1 rounded font-semibold hover:bg-gray-300 text-sm">Edit</button>
        </div>
    `;
    projectsGrid.appendChild(projectCard);
}

function openBoard(projectId) {
    window.location.href = `/board.html?project=${projectId}`;
}

function editProject(projectId) {
    // TODO: Implement edit project functionality
    alert("Edit project functionality coming soon!");
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "/index.html";
}

