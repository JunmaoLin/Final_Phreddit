/**
 * Test 1 – mongoDB.test.js
 * - The filename containing the implementation for this test must be:
 *   server/mongoDB.test.js
 * - Your test must demonstrate that when a post is deleted, it and all of its comments are
 *   removed from the database.
 * - I believe the simplest strategy for this is the following:
 *   - Build a list of the postID and the commentIDs for each comment on the post
 *     (you’ll have to recursively collect the commentIDs for comments that are replies
 *     to other comments).
 *   - Run your deletion operation.
 *   - The expect clause should be passed the result of querying by the postID and each
 *     of the commentIDs in a loop.
 *   - The assertion should be that the query result is empty (or that its length is 0).
 */

const mongoose = require('mongoose');
const request = require('supertest');
const PostModel = require("./models/posts.js");
const CommentModel = require("./models/comments.js");
const UserModel = require('./models/user.js');
const CommunityModel = require('./models/communities');

const mongo = "mongodb://127.0.0.1:27017/phreddit";
let db;

function createCommunity(communityObj) {
    let newCommunityDoc = new CommunityModel({
        name: communityObj.name,
        description: communityObj.description,
        postIDs: communityObj.postIDs,
        startDate: communityObj.startDate,
        members: communityObj.members,
        createdBy: communityObj.createdBy
    });
    return newCommunityDoc.save();
}

function createUser(userObj) {
    let newUserDoc = new UserModel({
        first : userObj.first,
        last: userObj.last,
        email :userObj.email, 
        display : userObj.display,
        password : userObj.password,
        reputation: userObj.reputation,
        admin : userObj.admin,
        reputation: userObj.reputation,
        //createdDate: userObj.createdDate,
    });
    return newUserDoc.save();
}

function createComment(commentObj) {
    let newCommentDoc = new CommentModel({
        content: commentObj.content,
        commentedBy: commentObj.commentedBy,
        commentedDate: commentObj.commentedDate,
        commentIDs: commentObj.commentIDs,
    });
    return newCommentDoc.save();
}

function createPost(postObj) {
    let newPostDoc = new PostModel({
        title: postObj.title,
        content: postObj.content,
        postedBy: postObj.postedBy,
        postedDate: postObj.postedDate,
        views: postObj.views,
        linkFlairID: postObj.linkFlairID,
        commentIDs: postObj.commentIDs,
    });
    return newPostDoc.save();
}

beforeAll(async () => {
    await mongoose.connect(mongo);
    db = await mongoose.connection
});

afterAll(async () => {
    await db.dropDatabase();
    await db.close();
});

describe("MongoDB Deletion Test", () => {
    it("Post and all associated comments", async () => {

        const user1 = {
            first: "jest",
            last: "test",
            display: "jest_test",
            password: "jest_test",
            email: "jest_test@gmail.com",
        };

        const userRef1 = await createUser(user1);

        const comment5 = {
            content: 'jest_test_comment5',
            commentIDs: [],
            commentedBy: 'jest_test',
            commentedDate: new Date(),
        };

        const commentRef5 = await createComment(comment5);

        const comment4 = {
            content: 'jest_test_comment4',
            commentIDs: [],
            commentedBy: 'jest_test',
            commentedDate: new Date(),
        };

        const commentRef4 = await createComment(comment4);

        const comment3 = {
            content: 'jest_test_comment3',
            commentIDs: [],
            commentedBy: 'jest_test',
            commentedDate: new Date(),
        };

        const commentRef3 = await createComment(comment3);

        const comment2 = {
            content: 'jest_test_comment2',
            commentIDs: [commentRef5._id],
            commentedBy: 'jest_test',
            commentedDate: new Date(),
        };

        const commentRef2 = await createComment(comment2);

        const comment1 = {
            content: 'jest_test_comment1',
            commentIDs: [commentRef2._id, commentRef4._id ],
            commentedBy: 'jest_test',
            commentedDate: new Date(),
        };

        const commentRef1 = await createComment(comment1);

        const post1 = {
            title: 'jest_test_post',
            content: 'jest_test_post',
            postedBy: 'jest_test',
            postedDate: new Date(),
            commentIDs: [commentRef1._id],
            views: 14,
        };
        const postRef1 = await createPost(post1);

        const post2 = {
            title: 'jest_test_post2',
            content: 'jest_test_post2',
            postedBy: 'jest_test2',
            postedDate: new Date(),
            commentIDs: [commentRef3._id],
            views: 14,
        };
        const postRef2 = await createPost(post2);

        const jestCom1 ={
            name: "jest Community",
            description: "test Community",
            postIDs: [postRef1._id, postRef2._id],
            startDate: new Date(),
            members: ["jest", 'MarcoArelius'],
            createdBy: 'MarcoArelius'
        }

        const communityRef1 = await createCommunity(jestCom1);

        const response = await request('http://localhost:8000').delete(`/posts/${postRef1._id}`);

        const deletedPost = await PostModel.findById(postRef1._id);
        const Post = await PostModel.findById(postRef2._id);
        const deletedComment1 = await CommentModel.findById(commentRef1._id);
        const deletedComment2 = await CommentModel.findById(commentRef2._id);
        const Comment3 = await CommentModel.findById(commentRef3._id);
        const deletedComment4 = await CommentModel.findById(commentRef4._id);
        const deletedComment5 = await CommentModel.findById(commentRef5._id);
        const expectedDeletedComments = [
            commentRef1._id.toString(),
            commentRef2._id.toString(),
            commentRef4._id.toString(),
            commentRef5._id.toString(),
        ];
        const updatedCommunity = await CommunityModel.findById(communityRef1._id);

        //console.log(response.body)

        expect(response.status).toBe(200);
        expect(response.body.deletedPost._id.toString()).toBe(postRef1._id.toString());
        expect(response.body.deletedComments).toEqual(expect.arrayContaining(expectedDeletedComments));
        expect(response.body.updatedCommunity._id.toString()).toBe(communityRef1._id.toString());
        expect(response.body.message).toBe('Comment and associated replies deleted successfully');

        expect(updatedCommunity.postIDs[0].toString()).toBe(postRef2._id.toString());
        expect(updatedCommunity.postIDs).toHaveLength(1);
        
        expect(deletedPost).toBeNull();
        expect(Post).not.toBeNull();
        expect(deletedComment1).toBeNull();
        expect(deletedComment2).toBeNull();
        expect(Comment3).not.toBeNull();
        expect(deletedComment4).toBeNull();
        expect(deletedComment5).toBeNull();
    });
});
