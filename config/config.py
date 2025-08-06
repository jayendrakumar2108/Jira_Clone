import os
from datetime import timedelta

class Config:
    # Flask secrets
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-jwt-secret-key')

    # MySQL Configuration
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'hemanth')  # ✅ set your password here
    MYSQL_DB = os.environ.get('MYSQL_DB', 'jira_clone')
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))  # ✅ add this line

    # File Upload Configuration
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'static/uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB

    # JWT Expiration Times (optional but useful)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
