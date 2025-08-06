from flask import Blueprint, request, jsonify
from models import sprints
from utils.jwt_handler import token_required
from flask_jwt_extended import jwt_required, get_jwt_identity

sprint_bp = Blueprint('sprints', __name__)

@sprint_bp.route('/sprints/<int:project_id>', methods=['GET'])
@jwt_required()
def get_sprints(project_id):
    return jsonify(sprints.get_sprints(project_id))

@sprint_bp.route('/sprints', methods=['POST'])
@token_required
def create_sprint(current_user):
    data = request.get_json()
    name = data.get('name')
    project_id = data.get('project_id')
    start = data.get('start_date')
    end = data.get('end_date')
    sprint_id = sprints.create_sprint(name, project_id, start, end)
    return jsonify({'sprint_id': sprint_id})

@sprint_bp.route('/sprints/<int:sprint_id>', methods=['PUT'])
@jwt_required()
def update_sprint(sprint_id):
    from models.sprints import update_sprint, get_sprints
    data = request.get_json()
    name = data.get('name')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    if not name:
        return jsonify({'msg': 'Sprint name required'}), 400
    update_sprint(sprint_id, name, start_date, end_date)
    return jsonify({'success': True, 'msg': 'Sprint updated'})

@sprint_bp.route('/sprints/<int:sprint_id>', methods=['DELETE'])
@jwt_required()
def delete_sprint(sprint_id):
    from models.sprints import delete_sprint, get_sprints
    from models.user import get_user_by_id
    user_id = get_jwt_identity()
    user = get_user_by_id(user_id)
    # For demo, only admin can delete; for full SRS, check project creator as well
    if user['role'].lower() != 'admin':
        return jsonify({'msg': 'Only admin can delete sprints'}), 403
    delete_sprint(sprint_id)
    return jsonify({'success': True, 'msg': 'Sprint deleted'})
