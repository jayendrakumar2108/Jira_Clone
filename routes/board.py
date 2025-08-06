from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.issue import get_issues_by_project

board_bp = Blueprint('board', __name__)

@board_bp.route('/projects/<int:project_id>/issues', methods=['GET'])
@jwt_required()
def get_project_issues(project_id):
    try:
        issues = get_issues_by_project(project_id)
        return jsonify(issues), 200
    except Exception as e:
        return jsonify({'msg': 'Failed to fetch issues', 'error': str(e)}), 500

@board_bp.route('/issues/<int:issue_id>/status', methods=['PATCH'])
@jwt_required()
def update_issue_status(issue_id):
    data = request.get_json(force=True, silent=True)
    print('[DEBUG] PATCH /issues/<id>/status received:', data)
    if not data or 'status' not in data:
        return jsonify({'error': 'Missing status'}), 400
    new_status = data['status']
    cur = current_app.mysql.connection.cursor()
    cur.execute("UPDATE issues SET status=%s WHERE id=%s", (new_status, issue_id))
    current_app.mysql.connection.commit()
    cur.close()
    return jsonify({'success': True})
