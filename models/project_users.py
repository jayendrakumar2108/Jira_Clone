from flask import current_app as app
import MySQLdb.cursors

def add_project_user(user_id, project_id, role):
    cursor = app.mysql.connection.cursor()
    cursor.execute('INSERT INTO project_users (user_id, project_id, role) VALUES (%s, %s, %s)', (user_id, project_id, role))
    app.mysql.connection.commit()
    return cursor.lastrowid

def get_users_by_project(project_id):
    cursor = app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM project_users WHERE project_id = %s', (project_id,))
    return cursor.fetchall()

def update_project_user_role(user_id, project_id, role):
    cursor = app.mysql.connection.cursor()
    cursor.execute('UPDATE project_users SET role = %s WHERE user_id = %s AND project_id = %s', (role, user_id, project_id))
    app.mysql.connection.commit()

def remove_project_user(user_id, project_id):
    cursor = app.mysql.connection.cursor()
    cursor.execute('DELETE FROM project_users WHERE user_id = %s AND project_id = %s', (user_id, project_id))
    app.mysql.connection.commit() 