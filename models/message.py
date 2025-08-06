from flask import current_app
from datetime import datetime

def create_message(from_id, to_id, subject, body):
    cur = current_app.mysql.connection.cursor()
    cur.execute("""
        INSERT INTO messages (from_id, to_id, subject, body, `read`, timestamp)
        VALUES (%s, %s, %s, %s, 0, %s)
    """, (from_id, to_id, subject, body, datetime.now()))
    current_app.mysql.connection.commit()
    cur.close()

def get_inbox(user_id):
    cur = current_app.mysql.connection.cursor()
    cur.execute("""
        SELECT m.id, u_from.name as `from`, u_to.name as `to`, m.subject, m.body, m.timestamp, m.read
        FROM messages m
        JOIN users u_from ON m.from_id = u_from.id
        JOIN users u_to ON m.to_id = u_to.id
        WHERE m.to_id = %s
        ORDER BY m.timestamp DESC
    """, (user_id,))
    rows = cur.fetchall()
    cur.close()
    return [
        {
            'id': row[0],
            'from': row[1],
            'to': row[2],
            'subject': row[3],
            'body': row[4],
            'timestamp': row[5].strftime('%Y-%m-%d %H:%M:%S'),
            'read': bool(row[6])
        } for row in rows
    ]

def get_sent(user_id):
    cur = current_app.mysql.connection.cursor()
    cur.execute("""
        SELECT m.id, u_from.name as `from`, u_to.name as `to`, m.subject, m.body, m.timestamp, m.read
        FROM messages m
        JOIN users u_from ON m.from_id = u_from.id
        JOIN users u_to ON m.to_id = u_to.id
        WHERE m.from_id = %s
        ORDER BY m.timestamp DESC
    """, (user_id,))
    rows = cur.fetchall()
    cur.close()
    return [
        {
            'id': row[0],
            'from': row[1],
            'to': row[2],
            'subject': row[3],
            'body': row[4],
            'timestamp': row[5].strftime('%Y-%m-%d %H:%M:%S'),
            'read': bool(row[6])
        } for row in rows
    ]

def mark_read(message_id):
    cur = current_app.mysql.connection.cursor()
    cur.execute("UPDATE messages SET `read`=1 WHERE id=%s", (message_id,))
    current_app.mysql.connection.commit()
    cur.close() 