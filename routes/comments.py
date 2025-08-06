from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.comment import create_comment, get_comments_by_issue

comments_bp = Blueprint('comments', __name__)

@comments_bp.route('/comments/<int:issue_id>', methods=['GET'])
@jwt_required()
def list_comments(issue_id):
    return jsonify(get_comments_by_issue(issue_id))

@comments_bp.route('/comments/<int:issue_id>', methods=['POST'])
@jwt_required()
def add_comment(issue_id):
    user_id = get_jwt_identity()  # This is the user ID (string or int)
    data = request.json or {}
    content = data.get('content')
    if not content:
        return jsonify({'msg': 'Content required'}), 400
    comment_id = create_comment(user_id, issue_id, content)
    return jsonify({'msg': 'Comment added', 'comment_id': comment_id}), 201

@comments_bp.route('/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    from models.comment import update_comment, get_comments_by_issue
    from models.user import get_user_by_id
    user_id = get_jwt_identity()
    # Find the comment and check author
    comments = get_comments_by_issue(None)  # You may want a get_comment_by_id function for efficiency
    comment = next((c for c in comments if c['id'] == comment_id), None)
    if not comment:
        return jsonify({'msg': 'Comment not found'}), 404
    user = get_user_by_id(user_id)
    if user['role'].lower() != 'admin' and user['id'] != comment['user_id']:
        return jsonify({'msg': 'Not authorized'}), 403
    data = request.get_json()
    content = data.get('content')
    if not content:
        return jsonify({'msg': 'Content required'}), 400
    update_comment(comment_id, content)
    return jsonify({'success': True, 'msg': 'Comment updated'})

@comments_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    from models.comment import delete_comment, get_comments_by_issue
    from models.user import get_user_by_id
    user_id = get_jwt_identity()
    comments = get_comments_by_issue(None)
    comment = next((c for c in comments if c['id'] == comment_id), None)
    if not comment:
        return jsonify({'msg': 'Comment not found'}), 404
    user = get_user_by_id(user_id)
    if user['role'].lower() != 'admin' and user['id'] != comment['user_id']:
        return jsonify({'msg': 'Not authorized'}), 403
    delete_comment(comment_id)
    return jsonify({'success': True, 'msg': 'Comment deleted'}) 