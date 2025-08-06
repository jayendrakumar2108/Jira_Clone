from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.project import create_project, get_project_by_id, get_all_projects, update_project, delete_project, admin_update_project, transfer_project_ownership
from models.team import create_team, assign_team_to_project, get_teams_by_project

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/projects', methods=['GET'])
@jwt_required()
def list_projects():
    return jsonify(get_all_projects())

@projects_bp.route('/projects', methods=['POST'])
@jwt_required()
def add_project():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()

        name = data.get('name')
        description = data.get('description')
        priority = data.get('priority')  # ✅ NEW

        if not name or not priority:
            return jsonify({'msg': 'Project name and priority required'}), 400

        project_id = create_project(name, description, priority, user_id)
        return jsonify({'success': True, 'msg': 'Project created', 'project_id': project_id}), 201
    except Exception as e:
        print("ERROR in /projects POST:", str(e))
        return jsonify({'msg': 'Internal error', 'error': str(e)}), 422

@projects_bp.route('/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    priority = data.get('priority')
    if not name or not priority:
        return jsonify({'msg': 'Project name and priority required'}), 400
    update_project(project_id, name, description, priority)
    return jsonify({'success': True, 'msg': 'Project updated'})

@projects_bp.route('/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    from models.user import get_user_by_id
    user_id = get_jwt_identity()
    user = get_user_by_id(user_id)
    if user['role'].lower() != 'admin':
        return jsonify({'msg': 'Only admin can delete projects'}), 403
    delete_project(project_id)
    return jsonify({'success': True, 'msg': 'Project deleted'})

@projects_bp.route('/projects/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    project = get_project_by_id(project_id)
    if not project:
        return jsonify({'msg': 'Project not found'}), 404
    return jsonify(project)

@projects_bp.route('/teams', methods=['POST'])
@jwt_required()
def add_team():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        name = data.get('name')
        description = data.get('description')
        if not name:
            return jsonify({'msg': 'Team name required'}), 400
        team_id = create_team(name, description, user_id)
        return jsonify({'success': True, 'msg': 'Team created', 'team_id': team_id}), 201
    except Exception as e:
        return jsonify({'msg': 'Internal error', 'error': str(e)}), 422

@projects_bp.route('/projects/<int:project_id>/teams', methods=['POST'])
@jwt_required()
def add_team_to_project(project_id):
    try:
        data = request.get_json()
        team_id = data.get('team_id')
        if not team_id:
            return jsonify({'msg': 'Team ID required'}), 400
        assign_team_to_project(team_id, project_id)
        return jsonify({'success': True, 'msg': 'Team assigned to project'}), 201
    except Exception as e:
        return jsonify({'msg': 'Internal error', 'error': str(e)}), 422

@projects_bp.route('/projects/<int:project_id>/teams', methods=['GET'])
@jwt_required()
def get_project_teams(project_id):
    try:
        teams = get_teams_by_project(project_id)
        return jsonify(teams), 200
    except Exception as e:
        return jsonify({'msg': 'Internal error', 'error': str(e)}), 422

@projects_bp.route('/admin/projects/<int:project_id>', methods=['PATCH'])
@jwt_required()
def admin_update_project_route(project_id):
    from models.user import get_user_by_id
    admin_id = get_jwt_identity()
    admin = get_user_by_id(admin_id)
    if admin['role'].lower() != 'admin':
        return jsonify({'msg': 'Only admin can update projects'}), 403
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    priority = data.get('priority')
    created_by = data.get('created_by')
    ok = admin_update_project(project_id, name, description, priority, created_by)
    if not ok:
        return jsonify({'msg': 'No fields to update'}), 400
    return jsonify({'success': True, 'msg': 'Project updated'})

@projects_bp.route('/admin/projects/<int:project_id>/transfer', methods=['POST'])
@jwt_required()
def admin_transfer_project_ownership(project_id):
    from models.user import get_user_by_id
    admin_id = get_jwt_identity()
    admin = get_user_by_id(admin_id)
    if admin['role'].lower() != 'admin':
        return jsonify({'msg': 'Only admin can transfer project ownership'}), 403
    data = request.get_json()
    new_owner_id = data.get('new_owner_id')
    if not new_owner_id:
        return jsonify({'msg': 'New owner ID required'}), 400
    transfer_project_ownership(project_id, new_owner_id)
    return jsonify({'success': True, 'msg': 'Project ownership transferred'})
