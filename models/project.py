from flask import current_app as app
import MySQLdb.cursors

def create_project(name, description, priority, created_by):
    cursor = app.mysql.connection.cursor()
    cursor.execute(
        'INSERT INTO projects (name, description, priority, created_by) VALUES (%s, %s, %s, %s)',
        (name, description, priority, created_by)
    )
    app.mysql.connection.commit()
    return cursor.lastrowid

def get_project_by_id(project_id):
    cursor = app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM projects WHERE id = %s', (project_id,))
    return cursor.fetchone()

def get_all_projects():
    cursor = app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM projects')
    return cursor.fetchall()

def update_project(project_id, name, description, priority):
    cursor = app.mysql.connection.cursor()
    cursor.execute('UPDATE projects SET name = %s, description = %s, priority = %s WHERE id = %s', (name, description, priority, project_id))
    app.mysql.connection.commit()

def delete_project(project_id):
    cursor = app.mysql.connection.cursor()
    cursor.execute('DELETE FROM projects WHERE id = %s', (project_id,))
    app.mysql.connection.commit()

def admin_update_project(project_id, name=None, description=None, priority=None, created_by=None):
    cursor = app.mysql.connection.cursor()
    fields = []
    values = []
    if name:
        fields.append('name = %s')
        values.append(name)
    if description:
        fields.append('description = %s')
        values.append(description)
    if priority:
        fields.append('priority = %s')
        values.append(priority)
    if created_by:
        fields.append('created_by = %s')
        values.append(created_by)
    if not fields:
        return False
    values.append(project_id)
    sql = f"UPDATE projects SET {', '.join(fields)} WHERE id = %s"
    cursor.execute(sql, tuple(values))
    app.mysql.connection.commit()
    return True

def transfer_project_ownership(project_id, new_owner_id):
    cursor = app.mysql.connection.cursor()
    cursor.execute('UPDATE projects SET created_by = %s WHERE id = %s', (new_owner_id, project_id))
    app.mysql.connection.commit()
    return True
