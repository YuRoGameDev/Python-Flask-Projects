import boto3
import uuid

AWSKEY = 'AWSKEY'
AWSSECRET = 'AWSSECRET'
PUBLIC_BUCKET = 'BUCKETNAME'
STORAGE_URL = 'https://s3.amazonaws.com/' + PUBLIC_BUCKET + '/'

dbclient = boto3.resource(service_name = 'dynamodb',
    region_name = 'REGION',
    aws_access_key_id = AWSKEY,
    aws_secret_access_key = AWSSECRET)

table = dbclient.Table('TABLENAME')

s3client = boto3.resource(service_name='s3',
                          region_name='REGION',
                          aws_access_key_id=AWSKEY,
                          aws_secret_access_key=AWSSECRET
                          )

bucket = s3client.Bucket(PUBLIC_BUCKET)


def uploadfile(file, form):
    caption = form.get('caption')
    content_type = form.get('type')
    filename = file.filename
    imageid = str(uuid.uuid4())

    image = {'DYNAMO_PARTITIONKEY': imageid,
            'caption':caption,
            'name':filename}

    table.put_item(Item=image)

    bucket.upload_fileobj(file, imageid, ExtraArgs={'ContentType': content_type})
    return {'result':'OK'}


def listfiles():
    items = []
    for item in table.scan()['Items']:
        d = {'id':item['DYNAMO_PARTITIONKEY'],'caption':item['caption']}
        items.append(d)

    return {'url':STORAGE_URL, 'items':items}




