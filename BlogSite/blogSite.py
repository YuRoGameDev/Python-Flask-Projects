from flask import session
from datetime import datetime

import boto3
import uuid


AWSKEY = 'AWSKEY'
AWSSECRET = 'AWSSECRET'
BLOGTABLE_NAME = 'BLOGTABLE_NAME'
BLOGTABLE_PARTITIONKEY = 'BLOGTABLE_PARTITIONKEY'
USERTABLE_NAME = 'USERTABLE_NAME'
USERTABLE_PARITIONKEY = 'USERTABLE_PARTITIONKEY'

def get_table(name):
    client = boto3.resource(service_name='dynamodb',
                        region_name='REGION',
                        aws_access_key_id=AWSKEY,
                        aws_secret_access_key=AWSSECRET)
    table = client.Table(name)
    return table

#----- Blog Stuff

#---Get all blogs. Filter by user when logged in
def createBlog(formData):
    title = formData.get('title')
    description = formData.get('description')

    uuidVal = str(uuid.uuid4())
    blogId = session['blogemail']+"/"+uuidVal

    now = datetime.now()
    time = now.strftime("%Y-%m-%d %H:%M:%S")

    blog = { BLOGTABLE_PARTITIONKEY  : blogId,
        'title' : title,
        'description' : description,
        'date' : time
        }

    blogTable = get_table(BLOGTABLE_NAME)
    blogTable.put_item(Item=blog)

    return {'result':"OK"}
#--- Delete a blog based on id
def deleteBlog(form):
    blogid = form.get('id')
    blogTable = get_table(BLOGTABLE_NAME)

    blogTable.delete_item(Key={BLOGTABLE_PARTITIONKEY :blogid})

    return {'result':"OK"}
#--- Lists all the blogs
def listBlogs(isFiltering):
    userFilter = ""
    if isFiltering:
        userFilter = session.get("blogemail")

    blogTable = get_table(BLOGTABLE_NAME)
    items = []

    for item in blogTable.scan()['Items']:
        if not userFilter == "":
            blog_id = item.get(BLOGTABLE_PARTITIONKEY )
            #Matches the userid from the blogid before the /
            if blog_id.split('/')[0]  == userFilter:
                d = {'blogId':item[BLOGTABLE_PARTITIONKEY ],'title':item['title'], 'description':item['description'], 'date':item['date']}
                items.append(d)
        else:
            #Get the username for each blog based off the userid
            userEmail = item[BLOGTABLE_PARTITIONKEY ].split('/')
            user = getUserID(userEmail[0])
            d = {'user':user,'title':item[BLOGTABLE_PARTITIONKEY ], 'description':item['description'], 'date':item['date']}
            items.append(d)

    items.sort(key=lambda x: x['date'],reverse=True)

    return {'items':items}

#---- Account Stuff
def createAccount(form):
    email = form.get('email')
    password = form.get('password')
    user = form.get('username')

    userTable = get_table(USERTABLE_NAME)
    item = userTable.get_item(Key={USERTABLE_PARITIONKEY:email})
    if 'Item' in item:
         return {'result':0} #Email already used

    for item in userTable.scan()['Items']:
        if item['username'] == user:
            return {'result':0} #Username is already used

    userInfo = {USERTABLE_PARITIONKEY: email,
                'username':user,
                'password':password}

    userTable.put_item(Item=userInfo)

    session['blogemail'] = email

    return {'result':1}

#-- Log in
def logIn(form):
    email = form.get('email')
    password = form.get('password')
    userTable = get_table(USERTABLE_NAME)

    item = userTable.get_item(Key={USERTABLE_PARITIONKEY: email})
    if 'Item' not in item:
        return {'result': -1} #Doesnt exist

    user_data = item['Item']
    if user_data['password'] != password:
        return {'result': -1} #Wrong password

    session['blogemail'] = email
    return {'result': 1}

#-- Log in
def logOut():
    session.pop("blogemail",None)

#--If no email then they aint logged in
def checkIfLogged():
    if not session.get("blogemail"):
        return False
    return True

#--Grabs username from email
def getUserID(userEmail = ""):
    if userEmail == "":
        userEmail = session['blogemail']
    userTable = get_table(USERTABLE_NAME)

    item = userTable.get_item(Key={USERTABLE_PARITIONKEY:userEmail})
    if 'Item' not in item:
        return {'result':'Email not found'}

    user = item['Item']
    return user['username']










