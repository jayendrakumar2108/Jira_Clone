from flask import current_app as app

def create_notification(user_id, message):
    cursor = app.mysql.connection.cursor()
    cursor.execute(
        "INSERT INTO notifications (user_id, message) VALUES (%s, %s)",
        (user_id, message)
    )
    app.mysql.connection.commit()

def get_notifications(user_id):
    cursor = app.mysql.connection.cursor()
    cursor.execute(
        "SELECT * FROM notifications WHERE user_id = %s ORDER BY created_at DESC",
        (user_id,)
    )
    results = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    data = [dict(zip(columns, row)) for row in results]
    return data

def mark_notification_read(notification_id):
    cursor = app.mysql.connection.cursor()
    cursor.execute(
        "UPDATE notifications SET is_read = TRUE WHERE id = %s",
        (notification_id,)
    )
    app.mysql.connection.commit()
