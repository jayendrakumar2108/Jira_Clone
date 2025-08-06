# Jira Clone - Full Feature Development

A complete Jira clone built with Flask (Python), MySQL, and vanilla HTML/CSS/JavaScript. Features a modern, colorful UI inspired by Atlassian's Jira.

## 🚀 Features

### Core Features
- ✅ **User Authentication** - JWT-based login/register system
- ✅ **Role-Based Access Control** - Admin, Developer, Reporter roles
- ✅ **Project Management** - Create, view, and manage projects
- ✅ **Issue Management** - Full CRUD operations for issues
- ✅ **Issue Types** - Task, Bug, Story, Epic
- ✅ **Issue Status Workflow** - To Do → In Progress → In Review → Done
- ✅ **Priority Levels** - High, Medium, Low
- ✅ **Kanban Board** - Drag-and-drop interface
- ✅ **Comments System** - Add comments to issues
- ✅ **File Attachments** - Upload files to issues
- ✅ **Assignee & Reporter Fields** - User assignment system
- ✅ **Due Dates** - Set and track deadlines
- ✅ **Search & Filtering** - Filter by project, assignee, status
- ✅ **Responsive Design** - Works on desktop and mobile

### UI/UX Features
- 🎨 **Modern Design** - Colorful, Jira-inspired interface
- 🎯 **Drag & Drop** - Intuitive Kanban board interactions
- 📱 **Responsive Layout** - Mobile-friendly design
- ⚡ **Real-time Updates** - Dynamic content loading
- 🔐 **Secure Authentication** - JWT token management

## 🛠️ Technology Stack

- **Backend**: Flask (Python)
- **Database**: MySQL
- **Authentication**: JWT (Flask-JWT-Extended)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **File Upload**: Local storage
- **CORS**: Flask-CORS

## 📋 Prerequisites

- Python 3.7+
- MySQL 5.7+
- pip (Python package manager)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd jira-cursor
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Set Up MySQL Database
```bash
# Login to MySQL
mysql -u root -p

# Run the database schema
source database_schema.sql
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your-mysql-password
MYSQL_DB=jira_clone
```

### 5. Create Upload Directory
```bash
mkdir -p static/uploads
```

### 6. Run the Application
```bash
python app.py
```

The application will be available at `http://localhost:5000`

## 👥 Sample Users

The database comes with pre-configured sample users:

| Email | Password | Role |
|-------|----------|------|
| admin@jira.com | admin123 | Admin |
| dev@jira.com | dev123 | Developer |
| reporter@jira.com | reporter123 | Reporter |

## 📁 Project Structure

```
jira-cursor/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── database_schema.sql    # MySQL database schema
├── README.md             # This file
├── config/
│   └── config.py         # Configuration settings
├── models/
│   ├── user.py           # User model
│   ├── project.py        # Project model
│   ├── issue.py          # Issue model
│   ├── comment.py        # Comment model
│   └── attachment.py     # Attachment model
├── routes/
│   ├── auth.py           # Authentication routes
│   ├── users.py          # User management routes
│   ├── projects.py       # Project routes
│   ├── issues.py         # Issue routes
│   └── comments.py       # Comment routes
├── utils/
│   ├── jwt_utils.py      # JWT helper functions
│   ├── validators.py     # Input validation
│   └── role_checks.py    # Role-based access control
├── static/
│   ├── css/
│   │   ├── style.css     # Main styles
│   │   ├── dashboard.css # Dashboard styles
│   │   └── board.css     # Kanban board styles
│   ├── js/
│   │   ├── index.js      # Login/register logic
│   │   ├── dashboard.js  # Dashboard functionality
│   │   └── board.js      # Kanban board logic
│   └── uploads/          # File upload directory
└── templates/
    ├── index.html        # Login/register page
    ├── dashboard.html    # Projects dashboard
    └── board.html        # Kanban board
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Projects
- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `GET /projects/<id>` - Get project details

### Issues
- `GET /issues/project/<id>` - List issues by project
- `POST /issues` - Create new issue
- `GET /issues/<id>` - Get issue details
- `PUT /issues/<id>` - Update issue

### Comments
- `GET /comments/<issue_id>` - List comments for issue
- `POST /comments/<issue_id>` - Add comment to issue

### Users
- `GET /users` - List all users (for assignee selection)

## 🎨 UI Features

### Color Scheme
- **Primary Blue**: #0052CC (Jira brand color)
- **Secondary Blue**: #2684FF
- **Success Green**: #36B37E
- **Warning Orange**: #FF8B00
- **Error Red**: #BF2600
- **Neutral Gray**: #6B778C

### Components
- **Navigation Bar**: Fixed top navigation with project info
- **Project Cards**: Hover effects and clean design
- **Kanban Columns**: Color-coded status columns
- **Issue Cards**: Drag-and-drop with type/priority badges
- **Modals**: Clean overlay forms for creating items

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with Werkzeug
- Role-based access control
- Input validation and sanitization
- CORS protection
- SQL injection prevention

## 🚀 Deployment

### Local Development
```bash
python app.py
```

### Production Deployment
1. Set up a production MySQL server
2. Configure environment variables
3. Use a production WSGI server (Gunicorn)
4. Set up reverse proxy (Nginx)
5. Configure SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is for educational purposes. Feel free to use and modify as needed.

## 🆘 Troubleshooting

### Common Issues

1. **MySQL Connection Error**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database `jira_clone` exists

2. **JWT Token Issues**
   - Clear browser localStorage
   - Check JWT secret key configuration
   - Verify token expiration settings

3. **File Upload Errors**
   - Ensure `static/uploads` directory exists
   - Check file permissions
   - Verify upload size limits

4. **CORS Issues**
   - Check Flask-CORS configuration
   - Verify frontend URL matches allowed origins

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the code comments
3. Create an issue in the repository

---

**Happy Coding! 🎉** 



Milestone 1: Advanced Board Functionality
Drag-and-drop for issues on the board (frontend: JS/React, backend: update issue status/order)
Sprint planning & backlog management (models/routes/templates for sprints, backlog, board views)
Milestone 2: Issue Types & Custom Fields
Support for different issue types (bug, story, task) (DB: issue_type, UI: select type)
Custom fields per project/issue (DB: custom_fields, UI: dynamic form fields)
Milestone 3: Notifications
Email or in-app notifications for changes (backend: notification logic, frontend: notification UI)
Milestone 4: Search & Filters
Advanced search (by status, assignee, project, etc.) (backend: search API, frontend: search UI)
Saveable filters or queries (DB: saved_filters, UI: save/load filters)
Milestone 5: Reporting & Analytics
Charts and statistics for project/issue progress (frontend: Chart.js, backend: stats endpoints)
Milestone 6: User Roles & Permissions
Fine-grained permissions (who can edit, delete, assign, etc.) (DB: roles/permissions, backend: checks, UI: restrict actions)
Milestone 7: Audit Logs
Track and display history of changes (DB: audit_log, backend: log changes, UI: show history)
Milestone 8: Integrations
Webhooks or APIs for external integrations (backend: webhook endpoints, outgoing calls)
Milestone 9: UI/UX Improvements
Responsive design, accessibility (frontend: Tailwind, ARIA, mobile views)
Better error handling and feedback (frontend: error messages, backend: error responses)
Milestone 10: Performance & Scalability
Pagination for large lists (backend: paginated queries, frontend: pagination UI)
Caching, optimization (backend: cache layer, query optimization)#   j i r a _ c l o n e  
 #   J i r a - C l o n e  
 #   J i r a _ C l o n e  
 