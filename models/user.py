from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash
import MySQLdb.cursors

def create_user(name, email, password, role):
    cursor = current_app.mysql.connection.cursor()
    password_hash = generate_password_hash(password)
    cursor.execute('INSERT INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, %s)', (name, email, password_hash, role))
    current_app.mysql.connection.commit()
    return cursor.lastrowid

def get_user_by_email(email):
    cursor = current_app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
    return cursor.fetchone()

def get_user_by_id(user_id):
    cur = current_app.mysql.connection.cursor()
    cur.execute("SELECT id, name FROM users WHERE id=%s", (user_id,))
    row = cur.fetchone()
    cur.close()
    if row:
        return {'id': row[0], 'name': row[1]}
    return None

def check_password(stored_hash, password):
    return check_password_hash(stored_hash, password)

def get_all_users():
    cur = current_app.mysql.connection.cursor()
    cur.execute("SELECT id, name FROM users")
    rows = cur.fetchall()
    cur.close()
    return [{'id': row[0], 'name': row[1]} for row in rows]

def update_user_role(user_id, new_role):
    cursor = current_app.mysql.connection.cursor()
    cursor.execute('UPDATE users SET role = %s WHERE id = %s', (new_role, user_id))
    current_app.mysql.connection.commit()

def get_user_full_by_id(user_id):
    cur = current_app.mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cur.execute("SELECT * FROM users WHERE id=%s", (user_id,))
    user = cur.fetchone()
    cur.close()
    return user

def update_user(user_id, name=None, email=None, role=None):
    cursor = current_app.mysql.connection.cursor()
    fields = []
    values = []
    if name:
        fields.append('name = %s')
        values.append(name)
    if email:
        fields.append('email = %s')
        values.append(email)
    if role:
        fields.append('role = %s')
        values.append(role)
    if not fields:
        return False
    values.append(user_id)
    sql = f"UPDATE users SET {', '.join(fields)} WHERE id = %s"
    cursor.execute(sql, tuple(values))
    current_app.mysql.connection.commit()
    return True

def delete_user(user_id):
    cursor = current_app.mysql.connection.cursor()
    cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
    current_app.mysql.connection.commit()
    return True

def force_reset_password(user_id, new_password):
    cursor = current_app.mysql.connection.cursor()
    password_hash = generate_password_hash(new_password)
    cursor.execute('UPDATE users SET password_hash = %s WHERE id = %s', (password_hash, user_id))
    current_app.mysql.connection.commit()
    return True 