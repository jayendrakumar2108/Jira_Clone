from flask import current_app as app
import MySQLdb.cursors

def create_component(name, project_id):
    cursor = app.mysql.connection.cursor()
    cursor.execute("INSERT INTO components (name, project_id) VALUES (%s, %s)", (name, project_id))
    app.mysql.connection.commit()
    return cursor.lastrowid

def get_components_by_project(project_id):
    cursor = app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM components WHERE project_id = %s", (project_id,))
    return cursor.fetchall()

def update_component(component_id, name):
    cursor = app.mysql.connection.cursor()
    cursor.execute("UPDATE components SET name = %s WHERE id = %s", (name, component_id))
    app.mysql.connection.commit()

def delete_component(component_id):
    cursor = app.mysql.connection.cursor()
    cursor.execute("DELETE FROM components WHERE id = %s", (component_id,))
    app.mysql.connection.commit()
