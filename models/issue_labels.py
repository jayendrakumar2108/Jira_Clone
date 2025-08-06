from flask import current_app as app
import MySQLdb.cursors

def add_issue_label(issue_id, label):
    cursor = app.mysql.connection.cursor()
    cursor.execute('INSERT INTO issue_labels (issue_id, label) VALUES (%s, %s)', (issue_id, label))
    app.mysql.connection.commit()
    return cursor.lastrowid

def get_labels_by_issue(issue_id):
    cursor = app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM issue_labels WHERE issue_id = %s', (issue_id,))
    return cursor.fetchall()

def delete_label(label_id):
    cursor = app.mysql.connection.cursor()
    cursor.execute('DELETE FROM issue_labels WHERE id = %s', (label_id,))
    app.mysql.connection.commit() 