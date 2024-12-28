// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const mongoose = require("mongoose"); // Import mongoose
const express = require('express');
const session = require('express-session'); // for session management
const MongoStore = require('connect-mongo'); //access to DB for session data
const bcrypt = require('bcrypt'); // for password hashing and verifcation
const cors = require('cors'); // This will allow requests from all origins by default

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// //const MongoStore = require('connect-mongo');
// // Import express-session
// const session = require('express-session'); // Import express-session
// const day = 1000 * 60 * 60 * 24; // 1 day
// app.use(session({
//         secret: `${"secret"}`, // basis for key generation
//         cookie: { httpOnly: true, maxAge: day, sameSite: "strict"}, //used to change cookie settings: httpOnly - accessible only to the server, maxAge - expiration time, sameSite -  strict same-site policy
//         resave: false, // Ensures the session is not saved back to the session store unless it was modified
//         saveUninitialized: false, //Ensures a session is not created and saved unless it's explicitly modified
//         store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1:27017/phreddit"}), // saves the session data in the database
//     })
// ); // The configuration options will include options for the cookie used to carry the session ID.




// Import the models/Schema
const commentSchema = require('./models/comments.js');
const communitySchema = require('./models/communities.js');
const postSchema = require('./models/posts.js');
const linkFlairSchema = require('./models/linkflairs.js');
const userSchema = require('./models/user.js');

//const mongoDB = "mongodb://127.0.0.1:27017/fake"; for testing purpose

const mongoDB = "mongodb://127.0.0.1:27017/phreddit";
const port = 8000;


app.listen(port, () => {console.log(`Server listening on port ${port}...`);}); // Start the server and listen on port 8000

// app.use((req, res, next) => {
//     console.log("Incoming Cookies:", req.cookies);
//     next();
// });

app.use(
    session({
        secret: "supersecret difficult to guess string",
        cookie: {
            httpOnly: true,
            secure: false, // Use true for HTTPS
            sameSite: 'lax', // Allows cross-origin cookies
            //maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/phreddit' }),
    })
);

// const oneHour = 1000 * 60 * 60;

// app.use(
//   session({
//     secret: "supersecret difficult to guess string",
//     cookie: {httpOnly: true, maxAge: oneHour},
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/phreddit'})
//   })
// );


function isAuthenticated(req, res, next) {
    // console.log("Session Cookie:", req.cookies['connect.sid']);
    console.log("Session Data:", req.session);
    if (req.session.user) {
        console.log("User authenticated:", req.session.user);
        next();
    } else {
        console.log("No valid session. Redirecting to login...");
        next('route');
    }
}

app.delete('/users/:id', async (req, res) => {
    console.log("ATTEMPTING TO DELETE USER", req.params);
    const userId = req.params.id;

    try {
        // Fetch the user to delete
        const deletedUser = await userSchema.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log("DELETED USER:", deletedUser);


        const deletedComments = []; 
        const deletedPosts= [];
        const deletedCommunities = [];

        const userComments = await commentSchema.find({ commentedBy: deletedUser.display });

        //console.log("DELETED COMMENTS:", deletedComments);

        const deleteNestedComments = async (commentId) => {
            console.log("Deleting nested comments for:", commentId);

            const parentComment = await commentSchema.findById(commentId);

            if (!parentComment || !parentComment.commentIDs) {
                console.log("No nested comments to delete for:", commentId);
                return;
            }
    
            for (const replyId of parentComment.commentIDs) {
                console.log("Deleting nested comment:", replyId);
        
                
                deletedComments.push(replyId.toString());
        

                await deleteNestedComments(replyId);
                await commentSchema.findByIdAndDelete(replyId);
            }
        
            parentComment.commentIDs = [];
            await parentComment.save();
        };

        for (const comment of userComments) {
            //
            console.log("Processing comment:", comment._id);

            deletedComments.push(comment._id.toString());

            
            const parentPost = await postSchema.findOne({ commentIDs: comment._id });
            if (parentPost) {
                console.log("Updating post for deleted comment:", parentPost._id);

                await postSchema.findByIdAndUpdate(
                    parentPost._id,
                    { $pull: { commentIDs: comment._id } }, 
                    { new: true }
                );
            }

            const parentComment = await commentSchema.findOne({ commentIDs: comment._id });
            if (parentComment) {
                console.log("Updating parent comment for deleted comment:", parentComment._id);

                await commentSchema.findByIdAndUpdate(
                    parentComment._id,
                    { $pull: { commentIDs: comment._id } }, 
                    { new: true }
                );
            }

            await deleteNestedComments(comment._id);

            await commentSchema.findByIdAndDelete(comment._id);

            //old code
            // deletedComments.push(comment._id.toString());
            // await deleteNestedComments(comment._id);
            // await commentSchema.findByIdAndDelete(comment._id);
        }

        console.log("DELETED COMMENTS:", deletedComments);

        // Delete all posts created by the user
        const userPosts = await postSchema.find({ postedBy: deletedUser.display });

        for (const post of userPosts) {
            deletedPosts.push(post._id.toString());

            const parentCommunity = await communitySchema.findOne({ postIDs: post._id });
            if (parentCommunity) {
                console.log("Updating community for deleted post:", parentCommunity._id);

                await communitySchema.findByIdAndUpdate(
                    parentCommunity._id,
                    { $pull: { postIDs: post._id } }, 
                    { new: true }
                );
            }
            
            for (const commentId of post.commentIDs) {
                deletedComments.push(commentId.toString());
                await deleteNestedComments(commentId); // Handle nested comments
                await commentSchema.findByIdAndDelete(commentId); // Delete the top-level comment
            }

            await postSchema.findByIdAndDelete(post._id);
        }

        console.log("DELETED POSTS:", deletedPosts);

        const userCommunities = await communitySchema.find({ createdBy: deletedUser.display });

        for (const community of userCommunities) {
            console.log("Processing community:", community._id);
        
            deletedCommunities.push(community._id.toString());
    
            for (const postId of community.postIDs) {
                console.log("Processing post in community:", postId);
    
                const post = await postSchema.findById(postId);
                if (post) {
                    deletedPosts.push(post._id.toString());
        
                    for (const commentId of post.commentIDs) {
                        deletedComments.push(commentId.toString());
                        await deleteNestedComments(commentId); 
                        await commentSchema.findByIdAndDelete(commentId);
                    }
        
                    // Delete the post itself
                    await postSchema.findByIdAndDelete(post._id);
                }
            }
            await communitySchema.findByIdAndDelete(community._id);
        }
        
        console.log("DELETED COMMUNITIES:", deletedCommunities);
        console.log("DELETED POSTS:", deletedPosts);
        console.log("DELETED COMMENTS:", deletedComments);

        res.status(200).json({
            deletedUser,
            deletedPosts,
            deletedComments,
            deletedCommunities,
            message: 'User and all associated data deleted successfully',
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// DELETE /communities/:id
app.delete('/communities/:id', async (req, res) => {
    console.log("ATTEMPTING TO DELETE THE community", req.params)
    const communityId = req.params.id;

    try {
        const deletedCommunity = await communitySchema.findByIdAndDelete(communityId);
        console.log("THIS IS THE DELETED COMMUNITY", deletedCommunity)

        if (!deletedCommunity) {
            return res.status(404).json({ message: 'Community not found' });
        }

        // let deletedPosts = [];
        // for(const postIDs of deletedCommunity.postIDs){
        //     const post = await postSchema.find({ _id: postIDs})
        //     deletedPosts  = [...deletedPosts, ...post];
        // }

        // console.log("POSTS TO DELETE", deletedPosts)
        const deletedPosts = await postSchema.find({ _id: { $in: deletedCommunity.postIDs } });
        console.log("POSTS TO DELETE:", deletedPosts);

        let deletedComments = [];
        for (const post of deletedPosts) {
            deletedComments = [...deletedComments, ...post.commentIDs];
            await postSchema.findByIdAndDelete(post._id);
        }

        const deleteNestedComments = async (commentId) => {
            console.log("Deleting nested comments for:", commentId);
    

            const parentComment = await commentSchema.findById(commentId);
        
            if (!parentComment || !parentComment.commentIDs) {
                console.log("No nested comments to delete for:", commentId);
                return;
            }
    
            for (const replyId of parentComment.commentIDs) {
                console.log("Deleting nested comment:", replyId);
        
                
                deletedComments.push(replyId.toString());
        

                await deleteNestedComments(replyId);

                await commentSchema.findByIdAndDelete(replyId);
            }
        
            parentComment.commentIDs = [];
            await parentComment.save();
        };

        if (deletedComments.length > 0) {
            for (const commentId of deletedComments) {
                await deleteNestedComments(commentId);
                await commentSchema.findByIdAndDelete(commentId);
            }
        }

        res.status(200).json({
            deletedCommunity,
            deletedPosts,
            deletedComments,
            message: 'Community and associated posts/comments deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting comment' });
    }
});

// DELETE /posts/:id
app.delete('/posts/:id', async (req, res) => {
    console.log("ATTEMPTING TO DELETE THE POST", req.params)
    const postId = req.params.id;

    try {
        const deletedPost = await postSchema.findByIdAndDelete(postId);
        console.log("THIS IS THE DELETED POST", deletedPost)

        let updatedCommunity= null;
        const deletedComments = [...deletedPost.commentIDs];

        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }


        const parentCommuity = await communitySchema.findOne({ postIDs: postId });

        if (parentCommuity) {
            updatedCommunity = await communitySchema.findByIdAndUpdate(parentCommuity._id, {
                $pull: { postIDs: postId }},
                { new: true }
        );}


        const deleteNestedComments = async (commentId) => {
            console.log("Deleting nested comments for:", commentId);
        

            const parentComment = await commentSchema.findById(commentId);
        
            if (!parentComment || !parentComment.commentIDs) {
                console.log("No nested comments to delete for:", commentId);
                return;
            }
    
            for (const replyId of parentComment.commentIDs) {
                console.log("Deleting nested comment:", replyId);
        
                
                deletedComments.push(replyId.toString());
        

                await deleteNestedComments(replyId);

                await commentSchema.findByIdAndDelete(replyId);
            }
        
            parentComment.commentIDs = [];
            await parentComment.save();
        };

        if (deletedPost.commentIDs.length > 0) {
            for (const commentId of deletedPost.commentIDs) {
                await deleteNestedComments(commentId);
                await commentSchema.findByIdAndDelete(commentId);
            }
        }

        await postSchema.findByIdAndDelete(postId);

        res.status(200).json({ 
            deletedPost: deletedPost,
            deletedComments,
            updatedCommunity, 
            message: 'Comment and associated replies deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting comment' });
    }
});

// DELETE /comments/:id
app.delete('/comments/:id', async (req, res) => {
    console.log("ATTEMPTING TO DELETE THE COMMENT", req.params)
    const commentId = req.params.id;

    try {
        const comment = await commentSchema.findById(commentId);

        let updatedPost = null;
        let updatedComment = null;
        const deletedComments = [commentId];

        console.log("FOUND COMMENT", comment)
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const parentPost = await postSchema.findOne({ commentIDs: commentId });
        const parentComment = await commentSchema.findOne({ commentIDs: commentId });

        if (parentPost) {
            updatedPost = await postSchema.findByIdAndUpdate(parentPost._id, {
                $pull: { commentIDs: commentId }},
                { new: true }
            );
        } else if (parentComment) {
            updatedComment = await commentSchema.findByIdAndUpdate(parentComment._id, {
                $pull: { commentIDs: commentId }},
                { new: true }
            );
        }

        const deleteNestedComments = async (commentId) => {
            console.log("Deleting nested comments for:", commentId);
        

            const parentComment = await commentSchema.findById(commentId);
        
            if (!parentComment || !parentComment.commentIDs) {
                console.log("No nested comments to delete for:", commentId);
                return;
            }
    
            for (const replyId of parentComment.commentIDs) {
                console.log("Deleting nested comment:", replyId);
        
                
                deletedComments.push(replyId.toString());
        

                await deleteNestedComments(replyId);

                await commentSchema.findByIdAndDelete(replyId);
            }
        
            parentComment.commentIDs = [];
            await parentComment.save();
        };

        await deleteNestedComments(commentId); 
        await commentSchema.findByIdAndDelete(commentId);

        res.status(200).json({ updatedPost, updatedComment, deletedComments, message: 'Comment and associated replies deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting comment' });
    }
});

app.get('/getAllUsers', async (req, res) => {
    try {
        const users = await userSchema.find();
        res.json(users);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/comments/edit/:id', async (req, res) => {
    console.log("EDITING AND UPDATING COMMENT", req.params, req.body)
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedComment = await commentSchema.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        //6757c601e9a9ab0d8ce0e93d
        if (!updatedComment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        res.json(updatedComment);
    } catch (error) {
        console.error("Error updating Comment:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

app.get("/commentInformation/:commentID", async function (req, res) {
    try {
        const { commentID } = req.params
        console.log("THIS IS THE PARAMS", req.params)
        const comment = await commentSchema.findById(commentID);
        res.json({comment: comment});
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});



app.post('/communities/edit/:id', async (req, res) => {
    console.log("EDITING AND UPDATING Community", req.params.id, req.body)
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedCommunity = await communitySchema.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedCommunity) {
            return res.status(404).json({ message: "Community not found." });
        }

        res.json(updatedCommunity);
    } catch (error) {
        console.error("Error updating community:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

app.post('/posts/edit/:id', async (req, res) => {
    console.log("EDITING AND UPDATING POST", req.params.id, req.body)
    const postId = req.params.id;
    const updatedPost = {
        ...req.body,
        linkFlairID: req.body.linkFlairID || null, 
    };

    try {
        const post = await postSchema.findByIdAndUpdate(postId, updatedPost, { new: true });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ success: true, post });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/', isAuthenticated, async (req, res) => {
    //console.log("Session User in /:", req.session.user);
    const email = req.session.user
    const userInfo = await userSchema.findOne({ email });
    //console.log(userInfo)
    res.status(200).send({loggedIn: true, user: req.session.user, message: `back, ${req.session.user}`, userInfo: [userInfo.display, userInfo.first, userInfo.last, userInfo.admin]});
});

app.get('/userComments', isAuthenticated, async (req, res) => {
    try {
        const {userEmail} = req.query;
        let email;
        console.log("User in userInfo emailllllllll????:", userEmail);
        if(userEmail){
            email = userEmail
            console.log("userEmail now has valueeeeeee:", userEmail);
        }
        else{
            email = req.session.user
            console.log("Session User in dsgfdgfdgdfgfdgdfg:", req.session.user);
        }
        //const email = req.session.user
        const userInfo = await userSchema.findOne({ email });
        
        const comments = await commentSchema.find({ commentedBy: userInfo.display });
        console.log("GRABBING COMMENTS USER INFO", userInfo, comments)
  
        res.send({comments: comments});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

app.get('/userPosts', isAuthenticated, async (req, res) => {
    try {
        const {userEmail} = req.query;
        let email;
        console.log("User in userInfo emailllllllll????:", userEmail);
        if(userEmail){
            email = userEmail
            console.log("userEmail now has valueeeeeee:", userEmail);
        }
        else{
            email = req.session.user
            console.log("Session User in dsgfdgfdgdfgfdgdfg:", req.session.user);
        }
        //const email = req.session.user
        const userInfo = await userSchema.findOne({ email });
        
        const posts = await postSchema.find({ postedBy: userInfo.display });
        console.log("GRABBING POSTS USER INFO", userInfo, posts)
    
        res.send({posts: posts});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/userCommunities', isAuthenticated, async (req, res) => {
    try {
        const {userEmail} = req.query;
        let email;
        console.log("User in userInfo emailllllllll????:", userEmail);
        if(userEmail){
            email = userEmail
            console.log("userEmail now has valueeeeeee:", userEmail);
        }
        else{
            email = req.session.user
            console.log("Session User in dsgfdgfdgdfgfdgdfg:", req.session.user);
        }
        //const email = req.session.user
        const userInfo = await userSchema.findOne({ email });
        
        const communities = await communitySchema.find({ createdBy: userInfo.display });

        const communitiesWithMemberCount = communities.map(community => ({
            ...community.toObject(), 
            memberCount: community.memberCount 
        }));
        console.log("GRABBING COMMUNITIES USER INFO", communitiesWithMemberCount);
  
        res.send({communities: communitiesWithMemberCount});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/userInfo', isAuthenticated, async (req, res) => {
    try {
        const {userEmail} = req.query;
        let email;
        console.log("User in userInfo emailllllllll????:", userEmail);
        if(userEmail){
            email = userEmail
            console.log("userEmail now has valueeeeeee:", userEmail);
        }
        else{
            email = req.session.user
            console.log("Session User in dsgfdgfdgdfgfdgdfg:", req.session.user);
        }
        // const email = req.session.user
        const userInfo = await userSchema.findOne({ email });

        console.log("GRABBING USER INFO", userInfo)
        const currentUser = {
            displayName: userInfo.display,
            email: userInfo.email,
            reputation: userInfo.reputation,
            memberSince: userInfo.createdDate,
        };
        res.send({user: currentUser});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/getUserReputation', isAuthenticated, async (req, res) => {
    console.log("Session User in /:", req.session.user);////
    const email = req.session.user
    const userInfo = await userSchema.findOne({ email });
    console.log(userInfo)
    res.send({userReputation: userInfo.reputation});
});

app.post('/updateCommentVoteCount', isAuthenticated, async (req, res) => {
    const { id, vote } = req.body;
    console.log("id:", id);
    console.log("vote:", vote);

    try {
        const updateComment = await commentSchema.findById(id);
        updateComment.upVotes = updateComment.upVotes + vote;
        await updateComment.save();

        commentCreator = updateComment.commentedBy;
        const userInfo = await userSchema.findOne({ display: commentCreator });
        if (!userInfo) {
            return res.status(404).send("User not found");
        }
        let rep;
        if(vote === 1){
            rep = 5; 
        }
        else if(vote === -1){
            rep = -10;
        }
        console.log("current user rep:", userInfo.reputation)
        console.log("User display name with rep change:", userInfo.display);
        userInfo.reputation = userInfo.reputation + rep;
        console.log("user rep after update:", userInfo.reputation)
        await userInfo.save();

        if (!updateComment) {
            return res.status(404).send("Community not found");
        }
        console.log("UPDATED THIS NEW COMMUNITY", updateComment)
        res.json({ success: true, upVotes: updateComment.upVotes });

    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/updatePostVoteCount', isAuthenticated, async (req, res) => {
    const { id, vote } = req.body;
    console.log("id:", id);
    console.log("vote:", vote);

    try {
        const updatePost = await postSchema.findById(id);
        updatePost.upVotes = updatePost.upVotes + vote;
        await updatePost.save();

        postCreator = updatePost.postedBy;
        const userInfo = await userSchema.findOne({ display: postCreator });
        if (!userInfo) {
            return res.status(404).send("User not found");
        }
        let rep;
        if(vote === 1){
            rep = 5; 
        }
        else if(vote === -1){
            rep = -10;
        }
        console.log("current user rep:", userInfo.reputation)
        console.log("User display name with rep change:", userInfo.display);
        userInfo.reputation = userInfo.reputation + rep;
        console.log("user rep after update:", userInfo.reputation)
        await userInfo.save();

        if (!updatePost) {
            return res.status(404).send("Community not found");
        }
        console.log("UPDATED THIS NEW COMMUNITY", updatePost)
        res.json({ success: true, upVotes: updatePost.upVotes });

    } catch (error) {
        console.log("ERROR IN UPDATEPOSTVOTECOUNT", error);
        res.status(500).send(error.message);
    }
});



app.get('/', (req, res) => {
    console.log("Guest user")
    res.status(200).send({loggedIn: false, message: `Guest`});
});

const saltRounds = 10;

mongoose.connect(mongoDB)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err))
;

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', function() {
  console.log('Connected to database');
});

app.post('/joinCommunity', async (req, res) => {
    console.log("JOINING COMMUNITY", req.session, req.body)
    const { communityId } = req.body;
    const email = req.session.user
    const userInfo = await userSchema.findOne({ email });

    const community = await communitySchema.findById(communityId);
    if (!community.members.includes(userInfo.display)) {
      community.members.push(userInfo.display);
      await community.save();

      console.log("NEW COMMUNITY", community);
      res.status(200).send("Joined community successfully.");
    } else {
      res.status(400).send("Already a member.");
    }
  });
  

app.post('/leaveCommunity', async (req, res) => {
    console.log("LEAVING COMMUNITY", req.session, req.body)
    const { communityId } = req.body;
    const email = req.session.user
    const userInfo = await userSchema.findOne({ email });

    const community = await communitySchema.findById(communityId);
    const memberIndex = community.members.indexOf(userInfo.display);
    if (memberIndex !== -1) {
      community.members.splice(memberIndex, 1);
      await community.save();

      console.log("NEW COMMUNITY", community);
      res.status(200).send("Left community successfully.");
    } else {
      res.status(400).send("Not a member.");
    }
  });
  

app.get('/checkMembership', async (req, res) => {
    const { communityId, displayName } = req.query;
    console.log("CHECKING BODY", req.body)
    const community = await communitySchema.findById(communityId);
    console.log(community)
    const isMember = community.members.includes(displayName);
    res.json({ isMember });
});

app.get('/sessionStatus', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.post('/checkUserAvailability', async (req, res) => {
    const { email, displayName } = req.body;
    console.log("this name is displayed:",displayName);
    try {
        const emailExists = await userSchema.findOne({ email });
        const displayNameExists = await userSchema.findOne({ display: displayName });
        console.log("this email is displayed:",emailExists);
        console.log("this name is displayed:",displayNameExists);
        res.json({
            emailAvailable: !emailExists,
            displayNameAvailable: !displayNameExists,
        });
    } catch (error) {
        console.error("Error checking user availability:", error);
        res.status(500).send("Internal server error");
    }
});


app.post('/createNewUser', async (req, res) => {
    const { first, last, email, display, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the new user
        const newUser = new userSchema({
            first,
            last,
            email,
            display,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "User created successfully." });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ errorMessage: "Internal server error." });
    }
});

app.post('/login', async (req, res) => {
    console.log("LOGGING IN")
    console.log(req.body)
    const uid = req.body.email;
    const epw = req.body.password;
    try {
        const user = (await userSchema.find({ email: uid }).exec())[0];
        console.log("UID:", uid);
        console.log("USER:", user);

        const verdict = await bcrypt.compare(epw, user.password);
        console.log("VERDICT:", verdict);

        if (verdict) {
            // req.session.user = uid.trim();
            req.session.regenerate(function(err) {
                if (err) {
                    console.error("Session regeneration error:", err);
                    return next(err);
                }
                req.session.user = uid.trim();
                req.session.save(function(err) {
                    if (err) {
                        console.error("Session save error:", err);
                        return next(err);
                    }
                    console.log("Session saved:", req.session);
                    res.send({ success: true, user: uid });
                });
            });            
        } else {
            return res.json({ success: false, errorMessage: "Wrong email address or password" });
        }
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, errorMessage: "An internal error occurred." });
    }
});

app.get("/comments", async function (req, res) {
    console.log("GETTING COMMENTS")
    try {
        const comments = await commentSchema.find();
        res.json(comments);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/posts", async function (req, res) {
    console.log("GETTING POSTS")
    try {
        const posts = await postSchema.find(); 
        //console.log("THIS IS THE POSTS RETRIEVED", posts)
        res.json(posts);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/getPost/:postID", async function (req, res) {
    try {
        const { postID } = req.params
        console.log("THIS IS THE PARAMS", postID)
        const posts = await postSchema.findById(postID);
        console.log("THIS IS THE POSTS RETRIEVED", posts)
        res.json(posts);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/posts/:postID", async function (req, res) {
    try {
        const { postID } = req.params
        console.log("THIS IS THE PARAMS", postID)
        const posts = await postSchema.findById(postID);
        posts.views = (posts.views || 0) + 1;
        await posts.save();
        console.log("THIS IS THE POSTS RETRIEVED", posts)
        res.json(posts);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/communities", async function (req, res) {
    console.log("GETTING COMMUNITIES")
    try {
        const communities = await communitySchema.find();
        //console.log(communities);
        res.json(communities);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/linkflairs", async function (req, res) {
    console.log("GETTING LINKFLAIRS")
    try {
        const linkflairs = await linkFlairSchema.find(); 
        res.json(linkflairs);
    } catch (error) {
        res.status(500).send(error);
    }
});

//for Creating new community
app.post("/createNewCommunity", async function (req, res) {
    console.log("CREATING NEW COM INFO:", req.body)

    try {
        const newCommunity = new communitySchema({
            name: req.body.name,
            description: req.body.description,
            postIDs: req.body.postIDs,
            startDate: req.body.startDate,
            members: req.body.members,
            createdBy: req.body.createdBy
        });
        console.log(newCommunity);
        await newCommunity.save();
        console.log("THIS IS THE NEW COMMUNITY CREATED", newCommunity)
        res.status(201).json(newCommunity);
    } catch (error) {
        console.log("ERROR IN CREATE NEW COMMUNITY");
        res.status(500).send(error.message);
    }
});

//for creating new link flair
app.post("/createNewLinkFlair", async function (req, res) {
    try {
        const newLinkFlair = new linkFlairSchema({
            content: req.body.content
        });
        await newLinkFlair.save();
        console.log("THIS IS THE NEW LINK FLAIR CREATED", newLinkFlair)
        res.status(201).json(newLinkFlair);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

//for creating new post
app.post("/createNewPost", async function (req, res) {
    try {
        console.log("IN CREATE NEW POST", req.body)
        const newPost= new postSchema({
            title: req.body.title,
            content: req.body.content,
            linkFlairID: req.body.linkFlairID || null,
            postedBy: req.body.postedBy,
            postedDate: req.body.postedDate,
            commentIDs: req.body.commentIDs,
            views: req.body.views,
        });
        console.log(newPost);
        await newPost.save();
        console.log("THIS IS THE NEW POST CREATED", newPost)
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).send(error);
    }
});

//for updating postIDs array in a community
app.post("/communities/updateCommunityPostIDs/:communityID", async function (req, res) {
    //console.log("I AM IN THE UPDATE COMMUNITY POST IDS")
    try {
        const { communityID } = req.params; 
        const updatedCommunity = await communitySchema.findByIdAndUpdate(
            communityID,  // Use the communityID from the URL
            { postIDs: req.body.postIDs },  // Update only the postIDs array
            { new: true }  // Return the updated community
        );
        if (!updatedCommunity) {
            return res.status(404).send("Community not found");
        }
        console.log("UPDATED THIS NEW COMMUNITY", updatedCommunity)
        res.json(updatedCommunity);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post("/createNewComment", async function (req, res) {
    try {
        console.log("IN CREATE NEW COMMENT", req.body)
        const newComment= new commentSchema({
            content: req.body.content,
            commentIDs: req.body.commentIDs,
            commentedBy : req.body.commentedBy,
            commentedDate : req.body.commentedDate,
        });
        console.log(newComment);
        await newComment.save();
        console.log("THIS IS THE NEW POST CREATED", newComment)
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post("/posts/updatePostCommentIDs/:postID", async function (req, res) {
    console.log("I AM IN THE UPDATE Comment IDS")
    try {
        console.log(req.params , req.body);
        const { postID } = req.params;
        const updatedComments = await postSchema.findByIdAndUpdate(
            postID,  // Use the communityID from the URL
            { commentIDs: req.body.commentIDs },  // Update only the postIDs array
            { new: true }  // Return the updated community
        );
        if (!updatedComments) {
            return res.status(404).send("Community not found");
        }
        console.log("UPDATED THIS NEW COMMUNITY", updatedComments)
        res.json(updatedComments);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post("/comments/updateCommentCommentIDs/:commentID", async function (req, res) {
    console.log("I AM IN THE UPDATE Comment IDS INSIDE COMMENT")
    try {
        console.log(req.params , req.body);
        const { commentID } = req.params;
        const updatedComments = await commentSchema.findByIdAndUpdate(
            commentID,  // Use the communityID from the URL
            { commentIDs: req.body.commentIDs },  // Update only the postIDs array
            { new: true }  // Return the updated community
        );
        if (!updatedComments) {
            return res.status(404).send("Community not found");
        }
        console.log("UPDATED THIS NEW COMMUNITY", updatedComments)
        res.json(updatedComments);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/communityInformation/:communityID", async function (req, res) {
    try {
        const { communityID } = req.params
        console.log("THIS IS THE PARAMS", req.params)
        const community = await communitySchema.findById(communityID);
        res.json({memberCount: community.memberCount, createdBy: community.createdBy, community: community});
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });
});



const terminateServer = () => { // used for terminating the server
    mongoose.connection.close();
    console.log('Server closed. Database instance disconnected.');
    process.exit();
}

process.on('SIGINT', terminateServer);//shutdown server on CTRL+C

module.exports = app;