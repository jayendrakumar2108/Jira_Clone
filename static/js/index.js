// Auth form management
function showLoginForm() {
    document.getElementById('authOverlay').style.display = 'flex';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('authOverlay').style.display = 'flex';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function hideAuthForms() {
    document.getElementById('authOverlay').style.display = 'none';
    // Clear any error messages
    document.getElementById('loginMsg').innerHTML = '';
    document.getElementById('registerMsg').innerHTML = '';
}

// Close overlay when clicking outside
document.getElementById('authOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        hideAuthForms();
    }
});

// Login form submission
document.getElementById('loginFormElement').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            showMessage('loginMsg', 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            showMessage('loginMsg', data.msg || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('loginMsg', 'Network error. Please try again.', 'error');
    }
});

// Register form submission
document.getElementById('registerFormElement').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    
    try {
        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('registerMsg', 'Registration successful! Please sign in.', 'success');
            setTimeout(() => {
                showLoginForm();
            }, 1500);
        } else {
            showMessage('registerMsg', data.msg || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('registerMsg', 'Network error. Please try again.', 'error');
    }
});

// Helper function to show messages
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `form-message ${type}`;
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add some interactive animations
document.addEventListener('DOMContentLoaded', function() {
    // Animate feature cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}); 