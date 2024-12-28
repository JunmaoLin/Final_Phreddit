import React from 'react';
import {InfoSection, getPost, getComment, getTotalComments, TimeStamp} from './homePage.js';
import '../stylesheets/postPage.css'
import upvoteIcon from '../images/upvoteIcon.png'
import downVoteIcon from '../images/downvoteIcon.png'
import axios from 'axios';

export default class ThePostPage extends React.Component{

    render(){
        //console.log("THIS IS PROPS", this.props)
        const {posts, post, comments, communities, linkFlairs, setPage, setCommentOrReplyParentID, setCommentOrReply, loggedIn, userInfo} = this.props
        //console.log("RENDERING", post, comments)
        return (
            <div id="postMainDiv">
                <PostPageHeader posts={posts} post={post} communities={communities} comments={comments} linkFlairs={linkFlairs} setPage={setPage} setCommentOrReplyParentID={setCommentOrReplyParentID} setCommentOrReply={setCommentOrReply} loggedIn={loggedIn} userInfo={userInfo}/>
                <CommentThread posts={posts} post={post} communities={communities} comments={comments} linkFlairs={linkFlairs} setPage={setPage} setCommentOrReplyParentID={setCommentOrReplyParentID} setCommentOrReply={setCommentOrReply} loggedIn={loggedIn} userInfo={userInfo}/>
            </div>
        );
    }
}

class PostPageHeader extends React.Component{
    constructor(props) {
        super(props);
        this.state = {commentForm: false};
        this.createComment= this.createComment.bind(this);
    }

    createComment(){
        //console.log("Creating Comment");
        this.setState({commentForm: true});
    }

    render(){
        const {posts, post, communities, comments, linkFlairs, setPage, setCommentOrReplyParentID, setCommentOrReply, loggedIn, userInfo} = this.props
        //console.log("POST PAGE HEADER", post);
        return(
            <div id="header">
                {postPageView(posts, post, communities, comments, linkFlairs, setPage, setCommentOrReplyParentID, setCommentOrReply, loggedIn, userInfo)}
            </div>
        );
    }
}


function postPageView(posts, postName, communities, comments, linkFlairs, setPage, setCommentOrReplyParentID, setCommentOrReply, loggedIn, userInfo){
    // const commentSection = document.getElementById("posts");
    // commentSection.innerHTML = '';
    const post = posts.find(function(post){
        //console.log(post);
      return post.title === postName.title;
    });


    //console.log("POST PAGE VIEW", post)
    
    const postInfo = getPost(post, communities, comments, linkFlairs);
    const content = post.content;

    //console.log("POST INFO", postInfo);


    const linkFlair = postInfo[4] !== 'not FOUND' ?
        (
        <div>
            <span className="linkFlair">
                {postInfo[4]}
            </span>
        </div>
        ) : null;

    post.commentIDs.sort(function(a,b){
        //console.log("in the sort");
        return(new Date(getComment(b, comments).commentedDate) - new Date(getComment(a, comments).commentedDate))
    });
    //console.log("POST PAGE VIEW", post);
    //console.log("POST PAGE VIEWlogggggeddddinnnnn?", loggedIn);
    return(
    <InfoSection
        page={'post'}
        comName = {postInfo[0]}
        userName = {postInfo[1]}
        startDate = {postInfo[2]}
        title = {postInfo[3]}
        linkFlairInput = {linkFlair}
        content = {content}
        viewCount = {post.views}
        commentCount = {postInfo[7]}
        upVotes = {postInfo[9]}
        loggedIn = {loggedIn}
        userInfo = {userInfo}

        setPage = {setPage}
        setCommentOrReplyParentID = {setCommentOrReplyParentID}
        setCommentOrReply = {setCommentOrReply}
        postID = {post._id}
    />
    );
}

class CommentThread extends React.Component{
    constructor(props) {
        super(props);
        this.state = {replyForm: false};
        this.createReply= this.createReply.bind(this);
    }

    createReply(){
        //console.log("Creating Reply");
        this.setState({replyForm: true});
    }

    render(){
        const {posts, post, comments, setPage, setCommentOrReplyParentID, setCommentOrReply} = this.props
        //console.log(this.props);
        const postToDisplay = posts.find((postIter) => {return postIter.title === post.title});
        //console.log("COMMENT THREAD", postToDisplay);
      
        postToDisplay.commentIDs.sort(function(a,b){
            //console.log("A", getComment(a, comments), "B", getComment(b, comments));
            return(new Date(getComment(b, comments).commentedDate) - new Date(getComment(a, comments).commentedDate))
        });

        const commentArray = getTotalComments(postToDisplay,  comments);
        //console.log("THIS IS COMMENT ARRAY", commentArray);
        let marginMap = new Map();
        const listComments = commentArray.map((comment, index) =>{
            // Determine the margin for this comment
            //console.log(comment);
            let spacing = marginMap.get(comment._id) || "0.5rem";

            //console.log(marginMap)
            
            // Prepare the margin for child comments
            comment.commentIDs.forEach((childID) => {
                marginMap.set(childID, `${parseFloat(spacing) + 4}rem`);
            });
            
            // Render the comment with appropriate margin
            return (
                <div className="comment" key={comment._id} style={{ marginLeft: spacing }}>
                    <Comment
                        postName = {post.title}
                        id = {comment._id}
                        userName = {comment.commentedBy}
                        content = {comment.content}
                        timeStamp = {comment.commentedDate} 
                        setPage = {setPage}
                        setCommentOrReplyParentID = {setCommentOrReplyParentID}
                        setCommentOrReply = {setCommentOrReply}
                        loggedIn = {this.props.loggedIn}
                        upVotes = {comment.upVotes}
                        userInfo = {this.props.userInfo}
                    />
                </div>
            );})

        return(
            <div id="posts">
                {listComments}
            </div>
        );
    }
}

export class Comment extends React.Component{
    constructor(props) {
        super(props);
        this.state = {updateVote: this.props.upVotes};
    }

    async updateVoteCountNReputation(upOrDown, id, loggedIn){
        if (!loggedIn) {
            alert("You need to log in to vote.");
            return;
        }
        try {
            console.log("updateVoteCountNReputation is callllllleedddd", id, loggedIn);
            let userReputation;
            if(this.props.loggedIn && this.props.userInfo[0]){
                let userReputationData = await axios.get('http://localhost:8000/getUserReputation', { withCredentials: true });
                userReputation = userReputationData.data.userReputation
                // console.log("USER REPUTATION", userReputation);
                // console.log("USER REPUTATION", userReputation.data.userReputation);
            }
            if(userReputation < 50){
                alert("You need a reputation of at least 50 to vote");
                return;
            }
            if(userReputation >= 50){
                let vote = upOrDown === "up" ? 1 : -1;
                const updateComment = await axios.post('http://localhost:8000/updateCommentVoteCount', {
                    id: id,
                    vote: vote
                },{ withCredentials: true });
                console.log("RESPONSE", updateComment);
                if(updateComment.data.success){// refresh the page
                    this.setState({ updateVote: updateComment.data.upVotes });
                }
            }
            
        } catch (error) {
            console.error("Error updating vote count:", error);
            alert("An error occurred while updating your vote.");
        }
    }

    render(){
        //console.log("is loggggggggin?????", this.props.loggedIn);
        //console.log("props", this.props)
        if(this.props.page === 'userProf'){
            return(
                <span className="comment_style">
                <div className="commentInfo">
                <div className="commentTitle">
                    {/* {this.props.id} */}
                    {this.props.postTitle}
                    <span>•</span>
                    <div className="timeStamp">
                    <TimeStamp key={this.props.comment.commentedDate} postedDate={this.props.comment.commentedDate}/>
                    </div>
                </div>
                </div>
                <div className="commentContent">
                {this.props.comment.content}
                </div>

            </span>
            );
        }
        return(
            <span className="comment_style">
            <div className="commentInfo">
            <div className="commentTitle">
                {/* {this.props.id} */}
                {this.props.userName}
                <span>•</span>
                <div className="timeStamp">
                <TimeStamp key={this.props.timeStamp} postedDate={this.props.timeStamp}/>
                </div>
            </div>
            </div>
            <div className="commentContent">
            {this.props.content}
            </div>

            {/* comment up/down votes */}
            <div className="commentVoteDiv">
                <button className='upVoteButton' disabled={!this.props.loggedIn} onClick={() => this.updateVoteCountNReputation("up", this.props.id, this.props.loggedIn)}>
                    <img
                        className='upvoteIcon'
                        alt="voteCountIcon"
                        src={upvoteIcon}
                    />
                </button>
                <button className='downVoteButton' disabled={!this.props.loggedIn} onClick={() => this.updateVoteCountNReputation("down", this.props.id, this.props.loggedIn)}>
                    <img
                    className='downvoteIcon'
                    alt="voteCountIcon"
                    src={downVoteIcon}
                />
                </button>
                
                {this.state.updateVote}
            </div>

            <button 
                disabled={!this.props.loggedIn}
                data-commentunder={this.props.id} 
                data-post-name={this.props.postName} 
                className="replyButton" 
                onClick={() => { 
                    this.props.setPage("NewCommentPageView"); 
                    this.props.setCommentOrReplyParentID(this.props.id); 
                    this.props.setCommentOrReply("reply");
                }}
            >Reply
            </button>
        </span>
        );
    }
}
