from flask import Blueprint, request, jsonify
from models import components
from utils.jwt_handler import token_required
from flask_jwt_extended import jwt_required, get_jwt_identity

components_bp = Blueprint('components', __name__)

@components_bp.route('/components/<int:project_id>', methods=['GET'])
@token_required
def get_components(current_user, project_id):
    result = components.get_components_by_project(project_id)
    return jsonify({'components': result})

@components_bp.route('/components', methods=['POST'])
@token_required
def add_component(current_user):
    data = request.json
    name = data.get('name')
    project_id = data.get('project_id')
    component_id = components.create_component(name, project_id)
    return jsonify({'success': True, 'component_id': component_id})

@components_bp.route('/components/<int:component_id>', methods=['PUT'])
@jwt_required()
def update_component(component_id):
    from models.components import update_component, get_components_by_project
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({'msg': 'Component name required'}), 400
    update_component(component_id, name)
    return jsonify({'success': True, 'msg': 'Component updated'})

@components_bp.route('/components/<int:component_id>', methods=['DELETE'])
@jwt_required()
def delete_component(component_id):
    from models.components import delete_component, get_components_by_project
    from models.user import get_user_by_id
    user_id = get_jwt_identity()
    user = get_user_by_id(user_id)
    # For demo, only admin can delete; for full SRS, check project creator as well
    if user['role'].lower() != 'admin':
        return jsonify({'msg': 'Only admin can delete components'}), 403
    delete_component(component_id)
    return jsonify({'success': True, 'msg': 'Component deleted'})
