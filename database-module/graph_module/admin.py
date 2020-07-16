# This module contains functions to manage user and project settings.
# User and project details are stored within a SQLite database

# importing modules
import os
import sqlite3
from graph_module import arango_api
from graph_module import s3
from graph_module import S3BUCKET


# Creates or opens a SQLite database
db = sqlite3.connect('db/credentials')

# get cursor object
cur = db.cursor()

# create user table
cur.execute('''
CREATE TABLE IF NOT EXISTS user 
    ( 
    user_name text NOT NULL PRIMARY KEY, 
    account_type TEXT NOT NULL CHECK (account_type='GENERIC' OR account_type='GOOGLE' OR account_type='FACEBOOK'), 
    password TEXT, 
    email TEXT,
    CONSTRAINT PWD_CHK CHECK ((account_type='GENERIC' and password NOT NULL) OR account_type='GOOGLE' OR account_type='FACEBOOK')
    )
''')
db.commit()


# create project table
cur.execute('''
CREATE TABLE IF NOT EXISTS project
    (projectid INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name NOT NULL,
    project_name text NOT NULL, 
    CONSTRAINT USER_UNQ UNIQUE (user_name, project_name)
    )
''')
db.commit()
db.close()

# User Methods
# adds a new user to database
def add_user(user_name, account_type, password, email):
    # initialise connection
    connection = sqlite3.connect('db/credentials')
    cursor = connection.cursor()

    # allow only alphanumeric
    if not user_name.isalnum():
        return {"result": False, "message": "User name must contain alphanumeric characters only."}

    # Check if user already exists
    if user_exists(user_name)['result']:
        return user_exists(user_name)

    # adjust username depending on the account-type
    if account_type == 'GENERIC':
        user_name = user_name
    elif account_type == 'GOOGLE':
        user_name = user_name + '-G'
    elif account_type == 'FACEBOOK':
        user_name = user_name + '-F'

    # add user to database
    cursor.execute('''INSERT INTO user(user_name, account_type, password, email) VALUES(?,?,?,?) ''',
                (user_name, account_type, password, email))
    connection.commit()
    connection.close()

    # create an s3 directory
    s3.touch("{}/{}/touch".format(S3BUCKET, user_name))

    # return results
    message = "Created user {} of {} type.".format(user_name, account_type)
    return {"result": True, "message": message, "user_name": user_name}


# checks whether user exists
def user_exists(user_name):
    # initialise connection
    connection = sqlite3.connect('db/credentials')
    cursor = connection.cursor()

    # check if user exists in database
    cursor.execute('''
    SELECT count(*) 
    FROM user
    where user_name = ?
    ''', (user_name,))

    # generate response
    if cursor.fetchone()[0] > 0:
        message = "User {} already exists.".format(user_name)
        result = {"result": True, "message": message}
    else:
        message = "User {} does not exist.".format(user_name)
        result = {"result": False, "message": message}

    connection.close()
    return result

# delete user
def delete_user(user_name, password):
    # initialise connection
    connection = sqlite3.connect('db/credentials')
    cursor = connection.cursor()

    # Check that password matches
    if not check_password(user_name, password)['result']:
        return check_password(user_name, password)

    # check that user doesn't have any live projects
    if len(list_projects(user_name)['project_list']) > 0:
        return {"result": False, "message": "Delete user projects before deleting user."}

    # delete record from database
    cursor.execute('''
    DELETE  
    FROM user
    where user_name = ? AND password = ?
    ''', (user_name, password))
    connection.commit()
    connection.close()

    # remove an s3 directory
    s3.rm("{}/{}/".format(S3BUCKET, user_name), True)

    # generate response
    message = 'User {} has been deleted successfully.'.format(user_name)
    return {"result": True, "message": message, "user_name": user_name}


# checks password for generic account types
def check_password(user_name, password):
    # initialise connection
    connection = sqlite3.connect('db/credentials')
    cursor = connection.cursor()

    # check that user actually exists
    if not user_exists(user_name)['result']:
        return user_exists(user_name)

    # check password against database
    cursor.execute('''
    SELECT count(*) 
    FROM user
    WHERE user_name = ? AND password = ?
    ''', (user_name, password))
    if cursor.fetchone()[0] > 0:
        message = "User name and password match."
        return {"result": True, "message": message}
    else:
        message = "Password does not match user name."
        return {"result": False, "message": message}


# updates a user's password
def update_password(user_name, old_password, new_password):
    # initialise connection
    connection = sqlite3.connect('db/credentials')
    cursor = connection.cursor()

    # Check that password matches
    if not check_password(user_name, old_password)['result']:
        return check_password(user_name, old_password)

    # update password
    cursor.execute('''
    UPDATE user
    SET password = ?
    WHERE user_name = ?
    ''', (new_password, user_name))
    connection.commit()
    connection.close()

    # generate response
    message = "Password for user {} was updated successfully.".format(user_name)
    result = True
    return {"result": result, "message": message}


# updates a user's email
def update_email(user_name, email):
    if not user_exists(user_name):
        return False
    cur.execute('''
    UPDATE user
    SET email = ?
    WHERE user_name = ?
''', (email, user_name))
    print("Email updated")
    return True


# list a user's projects
def list_users():
    # initialise connection
    connection = sqlite3.connect('db/credentials')
    cursor = connection.cursor()

    # return list of projects from database
    cursor.execute('''SELECT user_name FROM user  ''')
    user_list = cursor.fetchall()
    user_list = [x[0] for x in user_list]
    connection.close()

    # generate response
    message = 'Generated list of users.'
    return {"result": True, "message": message, "user_list": user_list}


# Project Methods
# adds a new project to database
def add_project(user_name, password, project_name):
    # initialise connection
    connection = sqlite3.connect('db/credentials')
    cursor = connection.cursor()

    # Check that password matches
    if not check_password(user_name, password)['result']:
        return check_password(user_name, password)

    # allow only alphanumeric
    if not project_name.isalnum():
        return {"result": False, "message": "Project name must contain alphanumeric characters only."}

    # check that project already exists
    if project_exists(user_name, project_name)['result']:
        return {"result": False, "message": project_exists(user_name, project_name)['message']}

    # insert new project in database
    cursor.execute('''INSERT INTO project(user_name, project_name) VALUES(?,?) ''',
                (user_name, project_name))
    connection.commit()
    connection.close()

    # create an s3 directory
    s3.connect()
    s3.touch("{}/{}/{}/nlp_outputs/touch".format(S3BUCKET, user_name, project_name))
    s3.touch("{}/{}/{}/source_documents/touch".format(S3BUCKET, user_name, project_name))

    #generate responses
    message = "Created project {} for user {}.".format(project_name, user_name)
    return {"result": True, "message": message}


# checks whether project exists
def project_exists(user_name, project_name):
    # initialise connection
    connection = sqlite3.connect('db/credentials')
    cursor = connection.cursor()

    # check that user actually exists
    if not user_exists(user_name)['result']:
        return user_exists(user_name)

    # check project name in database
    cursor.execute('''
    SELECT count(*) 
    FROM project
    where user_name = ? AND project_name = ?
    ''', (user_name, project_name))

    # generate response
    if cursor.fetchone()[0] > 0:
        message = "Project {} for user {} exists.".format(project_name, user_name)
        result = {"result": True, "message": message}
    else:
        message = "Project {} for user {} does not exist.".format(project_name, user_name)
        result = {"result": False, "message": message}
    connection.close()
    return result


# delete project
def delete_project(user_name, password, project_name):
    # initialise connection
    connection = sqlite3.connect('db/credentials')
    cursor = connection.cursor()

    # Check that password matches
    if not check_password(user_name, password)['result']:
        return check_password(user_name, password)

    # check that project already exists
    if not project_exists(user_name, project_name)['result']:
        return {"result": False, "message": project_exists(user_name, project_name)['message']}


    # truncate project from arango
    arango_api.truncate_project(user_name, project_name)


    # delete project from database
    cursor.execute('''
    DELETE  
    FROM project
    where user_name = ? AND project_name = ?
    ''', (user_name, project_name))
    connection.commit()
    connection.close()

    # remove an s3 directory
    s3.connect()
    s3.rm("{}/{}/{}/nlp_outputs/".format(S3BUCKET, user_name, project_name), True)
    s3.rm("{}/{}/{}/source_documents/".format(S3BUCKET, user_name, project_name), True)

    # generate response
    message = "Deleted project {} for user {}.".format(project_name, user_name)
    return {"result": True, "message": message}


# list a user's projects
def list_projects(user_name):
    # initialise connection
    connection = sqlite3.connect('db/credentials')
    cursor = connection.cursor()

    # check that user actually exists
    if not user_exists(user_name)['result']:
        return user_exists(user_name)

    # return list of projects from database
    cursor.execute('''
    SELECT project_name 
    FROM project
    where user_name = ? 
    ''', (user_name, ))
    project_list = cursor.fetchall()
    project_list = [x[0] for x in project_list]
    connection.close()

    # generate response
    message = 'Generated list of projects for user {}.'.format(user_name)
    return {"result": True, "message": message, "project_list": project_list}
