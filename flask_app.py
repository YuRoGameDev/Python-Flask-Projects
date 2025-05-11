from flask import Flask, request, redirect, render_template

import JSONParser
import imgUploader
import blogSite
import twitter

app = Flask(__name__)
app.secret_key = 'session_not_secret_key'


#----------------- Apartment JSONParser

@app.route('/apartments')
def apartment_list():
    return render_template('apartment.html', data={"result":[]})

@app.route('/apartments/<arguments>')
def apartment_search(arguments):
    data = JSONParser.data(arguments, request.args.get('search'),request.args.get('bedrooms'),request.args.get('sort'))
    if(arguments == "json"):
        return data
    else:
        return render_template('apartment.html', data=data)

#---------------- Image Uploader

@app.route('/imgUploader')
def load_imgUploader():
    return render_template('images.html')

@app.route('/imgUploader/uploadfile', methods=['POST'])
def imgUploader_uploadfile():
    file = request.files["file"]
    x = request.form
    return imgUploader.uploadfile(file, x)

@app.route('/imgUploader/listfiles')
def imgUploader_listfiles():
    return imgUploader.listfiles()

#---------------- Blog Site

#Pages Stuff----
#Always render this
@app.route('/blog')
def load_blog():
    return render_template('bloghome.html')

#Load this if not logged in. Else redirect to edit page
@app.route('/blog/login')
def load_login():
    if blogSite.checkIfLogged():
        return redirect('/blog/editor')
    else:
        return render_template('bloglogin.html')

#Load this if logged in. Else redirect to home page
@app.route('/blog/editor')
def load_editor():
    if(blogSite.checkIfLogged()):
        return render_template('blogedit.html')
    else:
        return redirect('/blog/login')

#Blog Stuff---
@app.route('/blog/editcreate', methods = ['POST'])
def create_blog():
    return blogSite.createBlog(request.form)

@app.route('/blog/editdelete', methods = ['POST'])
def delete_blog():
    return blogSite.deleteBlog(request.form)

#when on home page
@app.route('/blog/loadBlog')
def loadBlog():
    return blogSite.listBlogs(False)

#when on edit page
@app.route('/blog/loadBlogEdit')
def loadBlogEdit():
    return blogSite.listBlogs(True)


#Account stuff----
@app.route('/blog/create', methods = ['POST'])
def create_account():
    return blogSite.createAccount(request.form)

@app.route('/blog/logIn', methods = ['POST'])
def log_in():
    return blogSite.logIn(request.form)

@app.route('/blog/logCheck')
def checkifLogged():
    return "true" if blogSite.checkIfLogged() else "false"

@app.route('/blog/logOut')
def log_out():
    blogSite.logOut()
    return redirect('/blog')

@app.route('/blog/session')
def getSession():
    return blogSite.getUserID()

#---------------- Twitter

@app.route('/twitter')
@app.route('/twitter/')
def loadtwitter():
    name = ""
    if twitter.checkIfLogged():
        name = getSessiontwitter()

    return render_template('twitfeed.html', username = name)

@app.route('/twitter/login')
def loadtwitterlogin():
    if twitter.checkIfLogged():
        return redirect('/twitter')
    else:
        return render_template('twitlogin.html')

@app.route('/twitter/u/<arguments>')
def user(arguments):
    if twitter.checkIfLogged():
        username = request.args.get('user')
        if username:
            if not isinstance(twitter.getUserEmail(username), dict):
                return render_template('twituser.html', username = request.args.get('user'), myUsername = twitter.getUserID())

        return redirect('/twitter')
    else:
        return redirect('/twitter/login')

#-----Tweets
@app.route('/twitter/uploadTweet', methods = ['POST'])
def create_tweet_twitter():
    return twitter.uploadTweet(request.form, False)

@app.route('/twitter/uploadReply', methods = ['POST'])
def create_reply_twitter():
    return twitter.uploadTweet(request.form, True)

@app.route('/twitter/deleteTweet', methods = ['POST'])
def delete_tweet_twitter():
    return twitter.deleteTweet(request.form, False)

@app.route('/twitter/deleteReply', methods = ['POST'])
def delete_reply_twitter():
    return twitter.deleteTweet(request.form, True)

@app.route('/twitter/getTweets', methods = ['POST'])
def listTweets():
    return twitter.listTweets(request.form)

#-----Account
@app.route('/twitter/create', methods = ['POST'])
def create_account_twitter():
    return twitter.createAccount(request.form)

@app.route('/twitter/logIn', methods = ['POST'])
def log_in_twitter():
    return twitter.logIn(request.form)

@app.route('/twitter/logCheck')
def checkifLoggedtwitter():
    return "true" if twitter.checkIfLogged() else "false"

@app.route('/twitter/logOut')
def log_out_twitter():
    twitter.logOut()
    return redirect('/twitter')

@app.route('/twitter/session')
def getSessiontwitter():
    return twitter.getUserID()

@app.route('/twitter/sessionEmail', methods = ['POST'])
def getSessionEmailtwitter():
    username = request.form.get("username")
    return twitter.getUserEmail(username)

@app.route('/twitter/profile', methods = ['POST'])
def twitter_getProfile():
    return twitter.getProfilePic(request.form)

@app.route('/twitter/profileChange', methods = ['Post'])
def twitter_changeProfile():
    file = request.files["file"]
    x = request.form.get("type")
    return twitter.changeProfilePic(file, x)









