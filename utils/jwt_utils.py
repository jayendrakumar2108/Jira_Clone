from flask_jwt_extended import create_access_token, decode_token

def generate_token(identity, additional_claims=None):
    return create_access_token(identity=identity, additional_claims=additional_claims)

def decode_jwt(token):
    return decode_token(token) 