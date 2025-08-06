from flask import current_app as app
import MySQLdb.cursors

def create_sprint(name, project_id, start_date, end_date):
    cursor = app.mysql.connection.cursor()
    cursor.execute("""
        INSERT INTO sprints (name, project_id, start_date, end_date)
        VALUES (%s, %s, %s, %s)
    """, (name, project_id, start_date, end_date))
    app.mysql.connection.commit()
    return cursor.lastrowid

def get_sprints(project_id):
    cursor = app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM sprints WHERE project_id = %s", (project_id,))
    return cursor.fetchall()

def update_sprint(sprint_id, name, start_date, end_date):
    cursor = app.mysql.connection.cursor()
    cursor.execute("UPDATE sprints SET name = %s, start_date = %s, end_date = %s WHERE id = %s", (name, start_date, end_date, sprint_id))
    app.mysql.connection.commit()

def delete_sprint(sprint_id):
    cursor = app.mysql.connection.cursor()
    cursor.execute("DELETE FROM sprints WHERE id = %s", (sprint_id,))
    app.mysql.connection.commit()
