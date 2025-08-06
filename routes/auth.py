from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user import create_user, get_user_by_email, check_password
from utils.validators import is_valid_email, is_strong_password, require_fields

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    if not require_fields(data, ['name', 'email', 'password', 'role']):
        return jsonify({'msg': 'Missing fields'}), 400
    if not is_valid_email(data['email']):
        return jsonify({'msg': 'Invalid email'}), 400
    if not is_strong_password(data['password']):
        return jsonify({'msg': 'Weak password'}), 400
    if get_user_by_email(data['email']):
        return jsonify({'msg': 'Email already registered'}), 400
    user_id = create_user(data['name'], data['email'], data['password'], data['role'])
    return jsonify({'msg': 'User registered', 'user_id': user_id}), 201

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    if not require_fields(data, ['email', 'password']):
        return jsonify({'msg': 'Missing fields'}), 400
    user = get_user_by_email(data['email'])
    if not user or not check_password(user['password_hash'], data['password']):
        return jsonify({'msg': 'Invalid credentials'}), 401

    user_id = str(user['id'])  # ✅ IMPORTANT: Must be str or int
    access_token = create_access_token(identity=user_id)

    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user['id'],
            'name': user['name'],
            'role': user['role']
        }
    }), 200
