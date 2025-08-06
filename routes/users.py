from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import get_all_users, get_user_full_by_id, update_user, delete_user, force_reset_password

users_bp = Blueprint('users', __name__)

@users_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    users = get_all_users()
    return jsonify(users)

@users_bp.route('/admin/users', methods=['GET'])
@jwt_required()
def admin_list_users():
    from models.user import get_all_users, get_user_by_id
    user_id = get_jwt_identity()
    user = get_user_by_id(user_id)
    if user['role'].lower() != 'admin':
        return jsonify({'msg': 'Only admin can view all users'}), 403
    users = get_all_users()
    return jsonify(users)

@users_bp.route('/admin/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def admin_update_user_role(user_id):
    from models.user import get_user_by_id
    from models.user import update_user_role  # You may need to implement this in models/user.py
    admin_id = get_jwt_identity()
    admin = get_user_by_id(admin_id)
    if admin['role'].lower() != 'admin':
        return jsonify({'msg': 'Only admin can update user roles'}), 403
    data = request.get_json()
    new_role = data.get('role')
    if new_role not in ['admin', 'developer', 'reporter']:
        return jsonify({'msg': 'Invalid role'}), 400
    update_user_role(user_id, new_role)
    return jsonify({'success': True, 'msg': 'User role updated'})

@users_bp.route('/admin/users/<int:user_id>', methods=['GET'])
@jwt_required()
def admin_get_user(user_id):
    from models.user import get_user_by_id
    admin_id = get_jwt_identity()
    admin = get_user_by_id(admin_id)
    if admin['role'].lower() != 'admin':
        return jsonify({'msg': 'Only admin can view user details'}), 403
    user = get_user_full_by_id(user_id)
    if not user:
        return jsonify({'msg': 'User not found'}), 404
    return jsonify(user)

@users_bp.route('/admin/users/<int:user_id>', methods=['PATCH'])
@jwt_required()
def admin_update_user(user_id):
    from models.user import get_user_by_id
    admin_id = get_jwt_identity()
    admin = get_user_by_id(admin_id)
    if admin['role'].lower() != 'admin':
        return jsonify({'msg': 'Only admin can update users'}), 403
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    role = data.get('role')
    ok = update_user(user_id, name, email, role)
    if not ok:
        return jsonify({'msg': 'No fields to update'}), 400
    return jsonify({'success': True, 'msg': 'User updated'})

@users_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_user(user_id):
    from models.user import get_user_by_id
    admin_id = get_jwt_identity()
    admin = get_user_by_id(admin_id)
    if admin['role'].lower() != 'admin':
        return jsonify({'msg': 'Only admin can delete users'}), 403
    ok = delete_user(user_id)
    if not ok:
        return jsonify({'msg': 'User not found or not deleted'}), 400
    return jsonify({'success': True, 'msg': 'User deleted'})

@users_bp.route('/admin/users/<int:user_id>/reset_password', methods=['POST'])
@jwt_required()
def admin_reset_password(user_id):
    from models.user import get_user_by_id
    admin_id = get_jwt_identity()
    admin = get_user_by_id(admin_id)
    if admin['role'].lower() != 'admin':
        return jsonify({'msg': 'Only admin can reset passwords'}), 403
    data = request.get_json()
    new_password = data.get('new_password')
    if not new_password:
        return jsonify({'msg': 'New password required'}), 400
    force_reset_password(user_id, new_password)
    return jsonify({'success': True, 'msg': 'Password reset'}) 

