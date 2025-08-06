from flask import Blueprint, request, jsonify
from utils.jwt_handler import token_required
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.issue import create_issue, get_issues_by_project, get_issue_by_id, delete_issue, admin_update_issue, admin_delete_issue, get_all_issues
from flask import current_app as app
from flask import current_app

issues_bp = Blueprint('issues', __name__)

@issues_bp.route('/issues', methods=['POST'])
@jwt_required()
def add_issue():
    data = request.json
    user_id = get_jwt_identity()  # This returns the user ID string
    required = ['title', 'type', 'status', 'priority', 'project_id']
    if not all(data.get(f) for f in required):
        return jsonify({'msg': 'Missing required fields'}), 400
    
    issue_id = create_issue(
        data['title'],
        data.get('description', ''),
        data['type'],
        data['status'],
        data['priority'],
        data.get('assignee_id'),  # Make assignee optional
        user_id,  # Use user_id string directly
        data['project_id'],
        data.get('due_date'),
        data.get('sprint_id')
    )
    return jsonify({'msg': 'Issue created', 'issue_id': issue_id}), 201

@issues_bp.route('/issues/project/<int:project_id>', methods=['GET'])
@jwt_required()
def list_issues_by_project(project_id):
    return jsonify(get_issues_by_project(project_id))

@issues_bp.route('/issues/<int:issue_id>', methods=['GET'])
@jwt_required()
def get_issue(issue_id):
    issue = get_issue_by_id(issue_id)
    if not issue:
        return jsonify({'msg': 'Issue not found'}), 404
    return jsonify(issue)

@issues_bp.route('/issues/<int:issue_id>', methods=['PUT'])
@jwt_required()
def update_issue_full(issue_id):
    from models.issue import update_issue, get_issue_by_id
    from models.user import get_user_by_id
    data = request.get_json()
    user_id = get_jwt_identity()
    issue = get_issue_by_id(issue_id)
    if not issue:
        return jsonify({'msg': 'Issue not found'}), 404
    # Only assignee, reporter, or admin can update
    user = get_user_by_id(user_id)
    if user['role'].lower() != 'admin' and user['id'] not in [issue['assignee_id'], issue['reporter_id']]:
        return jsonify({'msg': 'Not authorized'}), 403
    update_issue(
        issue_id,
        data.get('title', issue['title']),
        data.get('description', issue['description']),
        data.get('type', issue['type']),
        data.get('status', issue['status']),
        data.get('priority', issue['priority']),
        data.get('assignee_id', issue['assignee_id']),
        data.get('due_date', issue['due_date']),
        data.get('sprint_id', issue.get('sprint_id'))
    )
    return jsonify({'success': True, 'msg': 'Issue updated'})

@issues_bp.route('/issues/<int:issue_id>/status', methods=['PUT', 'PATCH'])
@jwt_required()
def update_issue_status(issue_id):
    data = request.get_json()
    new_status = data.get('status')
    
    if not new_status:
        return jsonify({'msg': 'Status is required'}), 400
    
    # Update only the status
    cursor = app.mysql.connection.cursor()
    cursor.execute('UPDATE issues SET status = %s WHERE id = %s', (new_status, issue_id))
    app.mysql.connection.commit()
    
    return jsonify({'success': True, 'msg': 'Status updated'})

@issues_bp.route('/issues/<int:issue_id>', methods=['DELETE'])
@jwt_required()
def delete_issue_route(issue_id):
    deleted = delete_issue(issue_id)
    if deleted:
        return jsonify({'msg': 'Issue deleted'}), 200
    else:
        return jsonify({'msg': 'Issue not found'}), 404

@issues_bp.route('/admin/issues', methods=['GET'])
@jwt_required()
def admin_get_all_issues():
    from models.user import get_user_by_id
    admin_id = get_jwt_identity()
    admin = get_user_by_id(admin_id)
    if admin['role'].lower() != 'admin':
        return jsonify({'msg': 'Only admin can view all issues'}), 403
    return jsonify(get_all_issues())

@issues_bp.route('/admin/issues/<int:issue_id>', methods=['PATCH'])
@jwt_required()
def admin_update_issue_route(issue_id):
    from models.user import get_user_by_id
    admin_id = get_jwt_identity()
    admin = get_user_by_id(admin_id)
    if admin['role'].lower() != 'admin':
        return jsonify({'msg': 'Only admin can update issues'}), 403
    data = request.get_json()
    ok = admin_update_issue(issue_id, **data)
    if not ok:
        return jsonify({'msg': 'No fields to update'}), 400
    return jsonify({'success': True, 'msg': 'Issue updated'})

@issues_bp.route('/admin/issues/<int:issue_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_issue_route(issue_id):
    from models.user import get_user_by_id
    admin_id = get_jwt_identity()
    admin = get_user_by_id(admin_id)
    if admin['role'].lower() != 'admin':
        return jsonify({'msg': 'Only admin can delete issues'}), 403
    ok = admin_delete_issue(issue_id)
    if not ok:
        return jsonify({'msg': 'Issue not found or not deleted'}), 400
    return jsonify({'success': True, 'msg': 'Issue deleted'})
