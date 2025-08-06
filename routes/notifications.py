from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.notification import get_notifications, mark_notification_read

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/notifications', methods=['GET'])
@jwt_required()
def list_notifications():
    user_id = get_jwt_identity()
    return jsonify(get_notifications(user_id))

@notifications_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
@jwt_required()
def read_notification(notification_id):
    mark_notification_read(notification_id)
    return jsonify({'success': True})
