from flask import session
from datetime import datetime

import boto3
from boto3.dynamodb.conditions import Key

import uuid

AWSKEY = 'AWSKEY'
AWSSECRET = 'AWSSECRET'
PUBLIC_BUCKET = 'BUCKETNAME'
STORAGE_URL = 'https://s3.amazonaws.com/' + PUBLIC_BUCKET + '/'
USER_TABLENAME = "USER_TABLENAME"
USER_TABLEKEY = "USER_TABLE_PARITIONKEY"
TWEET_TABLENAME = "USER_TABLENAME"
TWEET_TABLEKEY = "TWEET_TABLE_PARTITIONKEY"

s3client = boto3.resource(service_name='s3',
                          region_name='REGION',
                          aws_access_key_id=AWSKEY,
                          aws_secret_access_key=AWSSECRET
                          )

bucket = s3client.Bucket(PUBLIC_BUCKET)

def get_table(name):
    client = boto3.resource(service_name='dynamodb',
                        region_name='REGION',
                        aws_access_key_id=AWSKEY,
                        aws_secret_access_key=AWSSECRET)
    table = client.Table(name)
    return table

#-- Create Account
def createAccount(form):
    email = form.get('email')
    password = form.get('password')
    user = form.get('username')

    userTable = get_table(USER_TABLENAME)
    item = userTable.get_item(Key={USER_TABLEKEY:email})
    if 'Item' in item:
         return {'result':0} #Email already used

    for item in userTable.scan()['Items']:
        if item['username'] == user:
            return {'result':0} #Username is already used

    userInfo = {USER_TABLEKEY: email,
                'username':user,
                'password':password}

    userTable.put_item(Item=userInfo)

    session['twitemail'] = email

    return {'result':1, 'username':user}

#-- Log in
def logIn(form):
    email = form.get('email')
    password = form.get('password')
    userTable = get_table(USER_TABLENAME)

    item = userTable.get_item(Key={USER_TABLEKEY: email})
    if 'Item' not in item:
        return {'result': -1} #Doesnt exist

    user_data = item['Item']
    if user_data['password'] != password:
        return {'result': -1} #Wrong password

    session['twitemail'] = email
    return {'result': 1, 'username':user_data['username']}

#-- Log Out
def logOut():
    session.pop("twitemail",None)

#--If no email then they aint logged in
def checkIfLogged():
    if not session.get("twitemail"):
        return False
    return True

#--Grabs username from email
def getUserID(userEmail = ""):
    if userEmail == "":
        userEmail = session['twitemail']
    userTable = get_table(USER_TABLENAME)

    item = userTable.get_item(Key={USER_TABLEKEY:userEmail})
    if 'Item' not in item:
        return {'result':'Email not found'}

    user = item['Item']
    return user['username']

#--Grabs email from username using the second dynamodb index
def getUserEmail(username = ""):
    if username == "":
        return {'result':'Username blank'}
    userTable = get_table(USER_TABLENAME)

    #IMPORTANT - For the user table you must have a Global secondary index called username (It will default to username-index)
    items = userTable.query(
        IndexName="username-index",
        KeyConditionExpression=Key("username").eq(username)
    )

    if not items.get('Items'):
        print("Username not found")
        return {'result':'Username not found'}

    user = items['Items'][0]
    return user['email']

#--Grabs profile pic using email
def getProfilePic(form):
    imageId = "default.jpg"
    email = form.get('email')

    if email == "":
        email = session['twitemail']

    userTable = get_table(USER_TABLENAME)
    url = STORAGE_URL+imageId

    item = userTable.get_item(Key={USER_TABLEKEY:email})
    if 'Item' not in item:
        return {'url':url}

    if 'profileId' not in item['Item']:
        return {'url':url}

    imageId = item['Item']['profileId']
    url = STORAGE_URL+imageId

    return {'url':url}

#--Changes profile pic
def changeProfilePic(file, type):
    profileId = str(uuid.uuid4())

    email = session['twitemail']
    userTable = get_table(USER_TABLENAME)
    item = userTable.get_item(Key={USER_TABLEKEY:email})
    if 'Item' not in item:
        return {'result':-2}

    if 'profileId' in item['Item']:
        profileId = item['Item']['profileId']

    userTable.update_item(
        Key={USER_TABLEKEY:email},
        UpdateExpression='set profileId=:r',
        ExpressionAttributeValues={':r':profileId}
    )

    bucket.upload_fileobj(file, profileId, ExtraArgs={'ContentType': type})
    return {'result':'OK'}


#--Create tweet
def uploadTweet(form, isReply):
    description = form.get('description')
    uuidVal = str(uuid.uuid4())
    user = getUserID()
    tweetId = ""

    if(isReply):
        parentId = form.get('parentId')
        tweetId = uuidVal+"/"+user+"/reply/"+parentId
    else:
        tweetId = uuidVal+"/"+user+"/parent"


    now = datetime.now()
    time = now.strftime("%Y-%m-%d %H:%M:%S")

    tweet = { TWEET_TABLEKEY : tweetId,
        'user':user,
        'description' : description,
        'date' : time
        }

    tweetTable = get_table(TWEET_TABLENAME)
    tweetTable.put_item(Item=tweet)

    return {'result':"OK"}

#--- Delete a tweet and its replies based on id
def deleteTweet(form, isReply):
    tweetid = form.get('id')
    tweetTable = get_table(TWEET_TABLENAME)


    if not isReply:
        for item in tweetTable.scan()['Items']:
            if tweetid in item[TWEET_TABLEKEY]:
                tweetTable.delete_item(Key={TWEET_TABLEKEY:item[TWEET_TABLEKEY]})
    else:
        tweetTable.delete_item(Key={TWEET_TABLEKEY:tweetid})

    return {'result':"OK"}


def listTweets(form):
    tweetTable = get_table(TWEET_TABLENAME)
    items = []

    filter = form.get("filter");
    getReply = False
    isGettingReply = form.get("reply")
    if isGettingReply:
        getReply = True

    for item in tweetTable.scan()['Items']:
        id = item.get(TWEET_TABLEKEY)
        splitId = id.split('/')
        if not getReply:
            if splitId[2] == "parent":
                if filter:
                    if splitId[1] != filter:
                        continue

                d = {'tweetId':item[TWEET_TABLEKEY], 'username':item['user'], 'description':item['description'], 'date':item['date']}
                items.append(d)
        else:
            if filter in id:
                if splitId[2] == "parent":
                    d = {'tweetId':item[TWEET_TABLEKEY], 'username':item['user'], 'description':item['description'], 'date':item['date'], 'type':0}
                else:
                    d = {'tweetId':item[TWEET_TABLEKEY], 'username':item['user'], 'description':item['description'], 'date':item['date'], 'type':1}
                items.append(d)

    items.sort(key=lambda x: x['date'],reverse=not getReply)

    return {'items':items}
