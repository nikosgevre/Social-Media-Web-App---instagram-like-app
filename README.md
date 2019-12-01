# thesis

# Social network web application for uploading and sharing photos and videos. (Instagram like application)

## Summary
Each user has his own profile page. The user can upload images and videos and also update his status. Users can see the posts and status of the other users they follow. Users can like and comment on posts.

## Development
#### Backend frameworks
* NodeJs 
* ExpressJs 
* mongoose
#### Frontend frameworks
* ReactJs (react hooks, redux)
#### Database
* MongoDb (NoSQL)


***

#### Services provided to the user
##### User Interface
* Sign up
* Sign in
* User Profile
* Reset password
* Reset username
* Reset email

##### Services
* Image upload
* Video upload
* Text description on post
* Post “like”
* Post comment
* Edit post (edit description)
* Delete post
* User status
* Search users by username
* Follow/unfollow users
* Chat (instant messaging)

***

## How to run
1. Download and install nodejs
2. Install npm to both backend and frontend directories: npm install
5. To start the web app: npm start
6. Open browser and go to: [localhost:3000/](127.0.0.1:3000/) (if not already redirect there after starting the frontend server)

***

#### Author: Nikos Gkevrekis AEM:1611

***
#### Requirments
In order to use the application it is required to have a free mongodb account and a free sendgrid account. The two required keys have been removed from this repository and you must user your own mongodb URI and sendgrid api key!
* mondodb URI is set in backend/app.js 
* sendgrid api key is set in backend/controllers/auth.js
