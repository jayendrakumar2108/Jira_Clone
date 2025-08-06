from flask import Flask, render_template, request, redirect, url_for, session, send_from_directory, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mysqldb import MySQL
from config.config import Config
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

# Load config
app.config.from_object(Config)

# MySQL
app.mysql = MySQL(app)

# JWT
app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
jwt = JWTManager(app)

@jwt.unauthorized_loader
def unauthorized_callback(callback):
    return jsonify({'msg': 'Missing Authorization Header'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(callback):
    return jsonify({'msg': 'Invalid token'}), 422

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'msg': 'Token has expired'}), 401

CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"])

# Register blueprints
from routes.auth import auth_bp
from routes.projects import projects_bp
from routes.issues import issues_bp
from routes.comments import comments_bp
from routes.users import users_bp
from routes.messages import bp as messages_bp
from routes.board import board_bp
from routes.notifications import notifications_bp
from routes.sprints import sprint_bp

app.register_blueprint(auth_bp)
app.register_blueprint(projects_bp)
app.register_blueprint(issues_bp)
app.register_blueprint(comments_bp)
app.register_blueprint(users_bp)
app.register_blueprint(messages_bp)
app.register_blueprint(board_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(sprint_bp)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search')
def search():
    return render_template('search.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/<path:path>')
def static_proxy(path):
    if os.path.exists(os.path.join('templates', path)):
        return render_template(path)
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)

print(app.url_map)
