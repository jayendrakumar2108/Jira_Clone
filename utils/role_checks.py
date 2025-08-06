def is_admin(user):
    return user.get('role') == 'admin'

def is_developer(user):
    return user.get('role') == 'developer'

def is_reporter(user):
    return user.get('role') == 'reporter' 