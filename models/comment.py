from flask import current_app as app
import MySQLdb.cursors

def create_comment(user_id, issue_id, content):
    cursor = app.mysql.connection.cursor()
    cursor.execute('INSERT INTO comments (user_id, issue_id, content, created_at) VALUES (%s, %s, %s, NOW())', (user_id, issue_id, content))
    app.mysql.connection.commit()
    return cursor.lastrowid

def get_comments_by_issue(issue_id):
    cursor = app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM comments WHERE issue_id = %s', (issue_id,))
    return cursor.fetchall()

def update_comment(comment_id, content):
    cursor = app.mysql.connection.cursor()
    cursor.execute('UPDATE comments SET content = %s WHERE id = %s', (content, comment_id))
    app.mysql.connection.commit()

def delete_comment(comment_id):
    cursor = app.mysql.connection.cursor()
    cursor.execute('DELETE FROM comments WHERE id = %s', (comment_id,))
    app.mysql.connection.commit() 