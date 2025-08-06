from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

def token_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user = get_jwt_identity()
        except Exception as e:
            return jsonify({"message": "Token is invalid or missing", "error": str(e)}), 401
        return fn(current_user, *args, **kwargs)
    return wrapper
