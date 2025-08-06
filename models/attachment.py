from flask import current_app as app
import MySQLdb.cursors

def create_attachment(issue_id, file_path, uploaded_by):
    cursor = app.mysql.connection.cursor()
    cursor.execute('INSERT INTO attachments (issue_id, file_path, uploaded_by, uploaded_at) VALUES (%s, %s, %s, NOW())', (issue_id, file_path, uploaded_by))
    app.mysql.connection.commit()
    return cursor.lastrowid

def get_attachments_by_issue(issue_id):
    cursor = app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM attachments WHERE issue_id = %s', (issue_id,))
    return cursor.fetchall()

def delete_attachment(attachment_id):
    cursor = app.mysql.connection.cursor()
    cursor.execute('DELETE FROM attachments WHERE id = %s', (attachment_id,))
    app.mysql.connection.commit() 