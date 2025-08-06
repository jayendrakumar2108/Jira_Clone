from flask import current_app
import MySQLdb.cursors

# type: ignore for linter on current_app.mysql usage

def create_team(name, description, created_by):
    cursor = current_app.mysql.connection.cursor()  # type: ignore
    cursor.execute(
        'INSERT INTO teams (name, description, created_by) VALUES (%s, %s, %s)',
        (name, description, created_by)
    )
    current_app.mysql.connection.commit()  # type: ignore
    return cursor.lastrowid

def assign_team_to_project(team_id, project_id):
    cursor = current_app.mysql.connection.cursor()  # type: ignore
    cursor.execute(
        'INSERT INTO project_teams (project_id, team_id) VALUES (%s, %s)',
        (project_id, team_id)
    )
    current_app.mysql.connection.commit()  # type: ignore
    return cursor.lastrowid

def get_teams_by_project(project_id):
    cursor = current_app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)  # type: ignore
    cursor.execute(
        'SELECT t.* FROM teams t JOIN project_teams pt ON t.id = pt.team_id WHERE pt.project_id = %s',
        (project_id,)
    )
    return cursor.fetchall() 