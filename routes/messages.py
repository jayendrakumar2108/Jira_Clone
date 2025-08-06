from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import message
from models import user

bp = Blueprint('messages', __name__)

@bp.route('/messages/inbox')
@jwt_required()
def inbox():
    user_id = get_jwt_identity()
    msgs = message.get_inbox(user_id)
    return jsonify(msgs)

@bp.route('/messages/sent')
@jwt_required()
def sent():
    user_id = get_jwt_identity()
    msgs = message.get_sent(user_id)
    return jsonify(msgs)

@bp.route('/messages/send', methods=['POST'])
@jwt_required()
def send():
    user_id = get_jwt_identity()
    data = request.get_json()
    to_id = data.get('to')
    subject = data.get('subject')
    body = data.get('body')
    if not (to_id and subject and body):
        return jsonify({'error': 'Missing fields'}), 400
    message.create_message(user_id, to_id, subject, body)
    return jsonify({'success': True})

@bp.route('/messages/read/<int:msg_id>', methods=['PATCH'])
@jwt_required()
def mark_read(msg_id):
    message.mark_read(msg_id)
    return jsonify({'success': True})

# For user dropdown and sidebar username
@bp.route('/api/users')
@jwt_required()
def api_users():
    users = user.get_all_users()
    return jsonify([{'id': u['id'], 'name': u['name']} for u in users])

@bp.route('/api/me')
@jwt_required()
def api_me():
    user_id = get_jwt_identity()
    u = user.get_user_by_id(user_id)
    return jsonify({'id': u['id'], 'name': u['name']}) 