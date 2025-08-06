from flask import current_app
import MySQLdb.cursors

def create_issue(title, description, type_, status, priority, assignee_id, reporter_id, project_id, due_date, sprint_id=None):
    cursor = current_app.mysql.connection.cursor()
    cursor.execute('''
        INSERT INTO issues (title, description, type, status, priority, assignee_id, reporter_id, project_id, created_at, due_date, sprint_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), %s, %s)
    ''', (title, description, type_, status, priority, assignee_id, reporter_id, project_id, due_date, sprint_id))
    current_app.mysql.connection.commit()
    return cursor.lastrowid

def get_issue_by_id(issue_id):
    cursor = current_app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM issues WHERE id = %s', (issue_id,))
    return cursor.fetchone()

def get_issues_by_project(project_id):
    cur = current_app.mysql.connection.cursor()
    cur.execute("""
        SELECT i.*, u.name as assignee_name
        FROM issues i
        LEFT JOIN users u ON i.assignee_id = u.id
        WHERE i.project_id = %s
        ORDER BY i.status, i.priority DESC, i.id DESC
    """, (project_id,))
    
    rows = cur.fetchall()

    if cur.description is None:
        cur.close()
        return []

    columns = [desc[0] for desc in cur.description]
    issues = []
    for row in rows:
        issue = dict(zip(columns, row))
        issue['assignee_name'] = row[-1] if row[-1] else None
        issues.append(issue)

    cur.close()
    return issues

def update_issue(issue_id, title, description, type_, status, priority, assignee_id, due_date, sprint_id=None):
    cursor = current_app.mysql.connection.cursor()
    cursor.execute('''
        UPDATE issues
        SET title = %s, description = %s, type = %s, status = %s, priority = %s, assignee_id = %s, due_date = %s, sprint_id = %s
        WHERE id = %s
    ''', (title, description, type_, status, priority, assignee_id, due_date, sprint_id, issue_id))
    current_app.mysql.connection.commit()

def delete_issue(issue_id):
    cursor = current_app.mysql.connection.cursor()
    cursor.execute('DELETE FROM issues WHERE id = %s', (issue_id,))
    current_app.mysql.connection.commit()
    return cursor.rowcount > 0  # True if deleted, False if not found

# In models/issue.py

def get_issues_by_project(project_id):
    cur = current_app.mysql.connection.cursor()
    cur.execute("SELECT * FROM issues WHERE project_id = %s", (project_id,))
    rows = cur.fetchall()
    # Convert rows to dicts as needed
    issues = [dict(zip([col[0] for col in cur.description], row)) for row in rows]
    cur.close()
    return issues

# ... existing imports ...
from flask import current_app as app

# ... existing code ...

def get_issues_by_project(project_id):
    cur = app.mysql.connection.cursor()
    cur.execute("""
        SELECT i.*, u.name as assignee_name
        FROM issues i
        LEFT JOIN users u ON i.assignee_id = u.id
        WHERE i.project_id = %s
    """, (project_id,))
    rows = cur.fetchall()
    issues = [dict(zip([col[0] for col in cur.description], row)) for row in rows]
    cur.close()
    return issues

def admin_update_issue(issue_id, **fields):
    cursor = current_app.mysql.connection.cursor()
    set_clauses = []
    values = []
    for key, value in fields.items():
        set_clauses.append(f"{key} = %s")
        values.append(value)
    if not set_clauses:
        return False
    values.append(issue_id)
    sql = f"UPDATE issues SET {', '.join(set_clauses)} WHERE id = %s"
    cursor.execute(sql, tuple(values))
    current_app.mysql.connection.commit()
    return True

def admin_delete_issue(issue_id):
    cursor = current_app.mysql.connection.cursor()
    cursor.execute('DELETE FROM issues WHERE id = %s', (issue_id,))
    current_app.mysql.connection.commit()
    return cursor.rowcount > 0

def get_all_issues():
    cur = current_app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cur.execute('SELECT * FROM issues')
    issues = cur.fetchall()
    cur.close()
    return issues