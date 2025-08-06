import re

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def is_strong_password(password):
    return len(password) >= 8

def require_fields(data, fields):
    return all(field in data and data[field] for field in fields) 