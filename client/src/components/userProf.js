import React from 'react';
import axios from 'axios';
import {PostSection, InfoSection, orderNewest, TimeStamp, getTotalComments} from './homePage.js';
import { Comment }  from './postPage.js';
import '../stylesheets/userProf.css';
import memberCountIcon from '../images/memberCountIcon.svg'
import postCountIcon from '../images/postCountIcon.svg'

export default class TheUserPage extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
          order: orderNewest,
        };
        
        this.handleDeleteComment = this.handleDeleteComment.bind(this)
    }

    handleDeleteComment = async (commentId) => {
        console.log("COMMENT ID IN DELETE", commentId)
        try {
            const response = await axios.delete(`http://localhost:8000/comments/${commentId}`, { withCredentials: true });

            console.log(response.data)

            if (response.data.updatedPost) {
                this.props.setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        {//console.log("THIS IS THE POST", post)
                        return post._id === response.data.updatedPost._id ? { ...post, ...response.data.updatedPost } : post}
                    )
                );
            }

            if (response.data.updatedComment) {
                this.props.setComments((prevComments) =>
                    prevComments.map((comment) =>
                        {//console.log("THIS IS THE COMMENT", comment)
                        return comment._id === response.data.updatedComment._id ? { ...comment, ...response.data.updatedComment } : comment}
                    )
                );
            }
    
            this.props.setComments((prevComments) =>
                prevComments.filter((comment) => 
                    {//console.log("THIS IS THE COMMENT", comment)
                    return !response.data.deletedComments.includes(comment._id)}
                )
            );
            alert('Comment deleted successfully!');
            this.props.handleButtonChange("comments", this.props.selectedUser)
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment. Please try again.');
        }
    };

    handleDeletePost = async (postID) => {
        console.log("POST ID IN DELETE", postID)
        try {
            const response = await axios.delete(`http://localhost:8000/posts/${postID}`, { withCredentials: true });

            console.log(response.data)

            if (response.data.deletedPost) {
                this.props.setPosts((prevPosts) =>
                    prevPosts.filter((post) => 
                        {//console.log("THIS IS THE post", post)
                        return post._id !== response.data.deletedPost._id
                    })
                );
            }
    
            if (response.data.updatedCommunity) {
                this.props.setCommunities((prevCommunities) =>
                    prevCommunities.map((community) =>
                        {//console.log("THIS IS THE community", community)
                        return community._id === response.data.updatedCommunity._id
                            ? { ...community, ...response.data.updatedCommunity }
                            : community
                        })
                );
            }
    
            if (response.data.deletedComments) {
                this.props.setComments((prevComments) =>
                    prevComments.filter((comment) => 
                        {//console.log("THIS IS THE comment", comment)
                        return !response.data.deletedComments.includes(comment._id)})
                );
            }
            alert('POST deleted successfully!');
            this.props.handleButtonChange("posts", this.props.selectedUser)
        } catch (error) {
            console.error('Error deleting posts:', error);
            alert('Failed to delete posts. Please try again.');
        }
    };

    handleDeleteCommunity = async (comID) => {
        console.log("COMMUNITY ID IN DELETE", comID)
        try {
            const response = await axios.delete(`http://localhost:8000/communities/${comID}`, { withCredentials: true });

            console.log(response.data)

            if (response.data.deletedCommunity) {
                this.props.setCommunities((prevCommunities) =>
                    prevCommunities.filter((community) => 
                        {//console.log("THIS IS THE community", community)
                        return community._id !== response.data.deletedCommunity._id
                        })
                );
            }
    
            if (response.data.deletedPosts) {
                const deletedPostIds = response.data.deletedPosts.map((post) => 
                    {//console.log("DELETED POSTS", post)
                    return post._id});
                this.props.setPosts((prevPosts) =>
                    prevPosts.filter((post) => 
                        {//console.log("THIS IS THE post", post)
                        return !deletedPostIds.includes(post._id)
                        })
                );
            }
    
            if (response.data.deletedComments) {
                this.props.setComments((prevComments) =>
                    prevComments.filter((comment) => 
                        {//console.log("THIS IS THE comment", comment)
                        return !response.data.deletedComments.includes(comment._id)
                        })
                );
            }
            alert('COMMUNITY deleted successfully!');
            this.props.handleButtonChange("communities", this.props.selectedUser)
        } catch (error) {
            console.error('Error deleting communities:', error);
            alert('Failed to delete communities. Please try again.');
        }
    };

    handleDeleteUser = async (userID) => {
        console.log("USER ID IN DELETE", userID)
        try {
            const response = await axios.delete(`http://localhost:8000/users/${userID}`, { withCredentials: true });

            console.log(response.data)

            if (response.data.deletedUser) {
                this.props.setUsers((prevUsers) =>
                    prevUsers.filter((user) => 
                        {console.log("THIS IS THE user", user)
                        return user._id !== response.data.deletedUser._id
                        })
                );
            }

            if (response.data.deletedCommunities) {
                this.props.setCommunities((prevCommunities) =>
                    prevCommunities.filter((community) => 
                        {console.log("THIS IS THE community", community)
                        return !response.data.deletedCommunities.includes(community._id)
                        })
                );
            }
    
            if (response.data.deletedPosts) {
                this.props.setPosts((prevPosts) =>
                    prevPosts.filter((post) => 
                        {console.log("THIS IS THE post", post)
                        return !response.data.deletedPosts.includes(post._id)
                        })
                );
            }
    
            if (response.data.deletedComments) {
                this.props.setComments((prevComments) =>
                    prevComments.filter((comment) => 
                        {console.log("THIS IS THE comment", comment)
                        return !response.data.deletedComments.includes(comment._id)
                        })
                );
            }
            alert('USER deleted successfully!');
            this.props.handleButtonChange("phredditUsers")
        } catch (error) {
            console.error('Error deleting USER:', error);
            alert('Failed to delete USER. Please try again.');
        }
    };

    //get all users for phredditUsers
    // async fetchAllUsers() {
    //     try {
    //         const response = await axios.get('http://localhost:8000/getAllUsers', { withCredentials: true });
    //         console.log("ALL USERS", response.data);
    //         console.log("ALL USERS", response.data[0]);
    //         return response.data;
    //     } catch (error) {
    //         console.error('Error fetching users:', error);
    //     }
    // };

    render(){
        const {activeButton } = this.props;
        console.log(this.props)
        const {goToEditCommunityPage, goToEditPostPage, goToEditCommentPage, posts, communities, comments, linkFlairs, loggedIn, userInfo, allPhredditUsers, isUserSelected, selectedUser, handleButtonChange} = this.props
        const allUsers = allPhredditUsers;
        console.log("ALL USERSsssssssssss", allUsers)
        console.log("HOME PAGE PROPS", this.props);
        return (
        <div id="homePage" className="main_cont_divs">
            {/* <>this is the user info tab</> */}
            <TheUserPageHeader 
                user={this.props.userProf}
                activeButton={activeButton}
                handleButtonChange={this.props.handleButtonChange}
                loggedIn={loggedIn}
                userInfo={userInfo}
                isUserSelected={isUserSelected}
                selectedUser={selectedUser}
            >

            </TheUserPageHeader>
            {
                activeButton === 'phredditUsers' && userInfo[3] && !isUserSelected && (
                    <div>
                        <h3>User Accounts</h3>
                        {
                            allUsers && allUsers.length > 1 ? (
                                allUsers.map((user) => {
                                    // don't display admin users
                                    // if(user.admin){
                                    // }
                                    // else{
                                        return user.admin ? null : (
                                            <div key={user._id} className="userAccounts">
                                                <button className='userAccountDiv'
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent triggering the `goToPostPage` click
                                                        console.log("I am at user account userProf", user)
                                                        //setPage('userProf', null, user);
                                                        handleButtonChange('posts', user);
                                                    }}
                                                >
                                                    <p>Display Name: {user.display}</p>
                                                    <p>Email Address: {user.email}</p>
                                                    <p>Reputation: {user.reputation}</p>
                                                    <div className="userAccountsSpaceDivTag"></div>
                                                </button>
                                                <button className='deleteUserButton'
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent triggering the `goToPostPage` click
                                                        console.log(user)
                                                        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
                                                        if (confirmDelete) {
                                                            this.handleDeleteUser(user._id);
                                                        }
                                                    }}
                                                >
                                                    Delete User
                                                </button>
                                            </div>

                                        )
                                    //}
                                })
                            ) : (
                                <p id='noUserAccountPTag'>No users found</p>
                            )
                        }
                    </div>
                )
            }
            {activeButton === 'posts' && (
                <>
                <h3>Your Posts</h3>
                <PostSection
                    posts={this.props.userPosts.posts}
                    goToPostPage={goToEditPostPage}
                    comments={comments} 
                    linkFlairs={linkFlairs} 
                    communities={communities}
                    order={this.state.order} 
                    page={'userInfo'}
                    loggedIn={loggedIn}
                    userInfo={userInfo}
                    handleDeletePost={this.handleDeletePost}
                /> 
                </>
            )}
            {activeButton === 'communities' && (
                <>
                <h3>Your Communities</h3>
                <CommunitySection
                communities={this.props.userComs}
                goToEditCommunityPage={goToEditCommunityPage}
                handleDeleteCommunity={this.handleDeleteCommunity}
                />
                </>
            )}

            {activeButton === 'comments' && (
                <>
                <h3>Your Comments</h3>
                <CommentSection
                comments={comments}
                userComments={this.props.userComments}
                posts={posts}
                userPosts={this.props.userPosts}
                goToEditCommentPage={goToEditCommentPage}
                handleDeleteComment={this.handleDeleteComment}
                />
                </>
            )}
        </div>
        )
        
    }
    
}

class TheUserPageHeader extends React.Component{

    render(){
        console.log(this.props)
        const { user } = this.props
        return(
            <div id="header">
                <InfoSection
                    user={user}
                    page={'userProf'}
                />
                <UserButtons 
                    activeButton={this.props.activeButton} 
                    handleButtonChange={this.props.handleButtonChange} 
                    loggedIn={this.props.loggedIn}
                    userInfo={this.props.userInfo}
                    isUserSelected={this.props.isUserSelected}
                    selectedUser={this.props.selectedUser}
                />
                {/* user button display here */}
            </div>
        );
    }
}

class CommentSection extends React.Component{
    render(){
        const {posts, comments, userComments, userPosts, handleDeleteComment} = this.props;
        console.log("COMMENT SECTION hello?", comments)
        const sortedComments = commmentsList(comments, userPosts.posts, userComments.comments, posts)
        let listComs;
        console.log("SORTED COMMENTSsssss:", sortedComments)
        sortedComments && sortedComments.length > 0 ? (
            listComs = sortedComments.map((com, index) =>{
                return (
                    <div className="userCommunitiesComment" key={com.props._id} id={"id-" + com.props._id} onClick={
                        () => {
                            console.log("BEFORE ASSIGNMENT")
                            this.props.goToEditCommentPage(com)
                            //console.log("AFTER ASSIGNMENT")
                            }}>
                            
                        <div className='userComments'>
                            {com.props.postTitle} • <TimeStamp key={com.props.comment.commentedDate} postedDate={com.props.comment.commentedDate}/>
                            <p>{com.props.comment.content.length > 20 ? `${com.props.comment.content.slice(0, 20)}...` : com.props.comment.content}</p>
                        </div>
                        {/* <Comment 
                            {...com.props}
                        /> */}
                        <br></br>
                        <button className='deleteCommentButton'
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the `goToPostPage` click
                                console.log(com.props)
                                const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
                                if (confirmDelete) {
                                    handleDeleteComment(com.props._id);
                                }
                            }}
                        >
                        Delete Comment
                    </button>
                    </div>
                );
            })
        ) : (
            listComs = <p>No comments found</p>
        )

        let commentSectionInfo = 
(
            <div key={sortedComments.length} className="posts">
                {listComs}
            </div>);


        return commentSectionInfo;
    }
}

function commmentsList(comments, userPosts, userComments, posts){
    console.log("comments B4", comments, posts)
    const sortedList = commentNewest(userComments);

    //console.log("SORTED LIST", sortedList)

    const comsList = sortedList.map(function(com, index){
        let postWithComment;
        let commentArray;
    
        for (const post of posts) {
            // Flatten the comments for the current post
            console.log("this is the post info from",post.title, post.commentIDs, comments)
            commentArray = getTotalComments(post, comments);
            //console.log("THIS SI THE COMMENT ARRAY FOR THIS POST", post, commentArray)
    
            // Check if the current comment exists in the flattened comment array
            if (commentArray.some(nestedComment => nestedComment._id === com._id)) {
                postWithComment = post;
                break; // Exit the loop once the matching post is found
            }
        }
    
        // Get the post title if found, or default to "Post Not Found"
        const postTitle = postWithComment ? postWithComment.title : "Post Not Found";

        //console.log(com, postTitle)
        return(
            <Comment
                _id={com._id}
                page={'userProf'} 
                postTitle={postTitle} 
                comment={com} 
            />
        );
    })

    return comsList;
}

const commentNewest = (comToDisplay) => {

    let com = comToDisplay;

    com.sort(function(a, b){
      return(new Date(b.commentedDate) - new Date(a.commentedDate))
    })


    return com;

}


class CommunitySection extends React.Component{
    render(){
        const {communities} = this.props;
        //console.log("COM SECTION hello?", communities)
        const sortedCommunity = comsList(communities.communities)
        let listComs;
        sortedCommunity && sortedCommunity.length > 0 ? (
            listComs = sortedCommunity.map((com, index) =>{
                //console.log(com)
                return (
                    <div key={com.props._id} id={"id-" + com.props._id} onClick={
                        () => {
                            //console.log("BEFORE ASSIGNMENT")
                            this.props.goToEditCommunityPage(com)
                            //console.log("AFTER ASSIGNMENT")
                            }}>
                        
                        <Community 
                            {...com.props}
                        />
                        <button className='deleteCommunityButton'
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the `goToPostPage` click
                                // console.log(com.props)
                                const confirmDelete = window.confirm("Are you sure you want to delete this community?");
                                if (confirmDelete) {
                                // If the user confirms, proceed with the delete action
                                this.props.handleDeleteCommunity(com.props._id);
                                }
                                //this.props.handleDeleteCommunity(com.props._id);
                            }}
                        >
                        Delete Community
                        </button>
                    </div>
                );
            })
        ) : (
            listComs = <p>No communities found</p>
        )

        let comSectionInfo = 
            (
            <div key={sortedCommunity.length} className="posts">
                {listComs}
            </div>);
            //console.log(postSectionInfo);

        return comSectionInfo;
    }
}

function comsList(communities){
    //console.log("COMMUNITIES B4", communities)
    const sortedList = comNewest(communities);

    //console.log("SORTED LIST", sortedList)

    const comsList = sortedList.map(function(com, index){
        return(<Community
            name={com.name}
            description={com.description}
            startDate={com.startDate}
            createdBy={com.createdBy}
            memberCount={com.memberCount}
            postIDs={com.postIDs}
            _id={com._id}
        />);
    })

    return comsList;
}

class Community extends React.Component{
    render(){
        return (
            <div className="userCommunities">
                {/*title*/}<p className='userCommunitiesName'>{this.props.name}</p> 
                {/* Description:  */} <p>{this.props.description}</p>
                Created: <TimeStamp key={this.props.startDate} postedDate={this.props.startDate}/>
                <p>Created By: {this.props.createdBy}</p>
                {/* <p>Post Count: {this.props.postIDs.length}</p> */}

                {<img id="postCountIcon" alt="postCountIcon" src={postCountIcon}/>} {this.props.postIDs.length} {<img id="memberCountIcon" alt="memberCountIcon" src={memberCountIcon}/>} {this.props.memberCount}
                
            </div>
        )
    }
}

const comNewest = (comToDisplay) => {

    let com = comToDisplay;

    com.sort(function(a, b){
      return(new Date(b.startDate) - new Date(a.startDate))
    })


    return com;

}


class UserButtons extends React.Component {
    render() {
        const { activeButton, handleButtonChange, userInfo, isUserSelected, selectedUser } = this.props;
        console.log("am i adminnnnnnn", userInfo[3]); //userInfo[3] is admin value
        console.log("I am the selected userrrrrrrrr", selectedUser);
        return (
            <div id="buttonSection">
                {/* display div if admin */}
                {userInfo[3] && !isUserSelected && 
                    <div className='userButtons' >
                    <button
                        className={activeButton === 'phredditUsers' ? 'active' : ''} 
                        onClick={() => handleButtonChange('phredditUsers')}
                    >
                    Phreddit Users
                    </button>
                    </div>
                }
                {/* display button to go back to admin */}
                {userInfo[3] && isUserSelected && 
                    <div className='userButtons' >
                    <button
                        className={activeButton === 'phredditUsers' ? 'active' : ''} 
                        onClick={() => handleButtonChange('phredditUsers')}
                    >
                    Back to Admin Profile
                    </button>
                    </div>
                }
                <div className='userButtons'>
                    <button 
                        className={activeButton === 'posts' ? 'active' : ''} 
                        onClick={() => handleButtonChange('posts', selectedUser)}
                    >
                    Post
                    </button>
                </div>
                <div className='userButtons'>
                    <button 
                        className={activeButton === 'communities' ? 'active' : ''} 
                        onClick={() => handleButtonChange('communities', selectedUser)}
                    >
                    Communities
                    </button>
                </div>
                <div className='userButtons'>
                    <button 
                        className={activeButton === 'comments' ? 'active' : ''} 
                        onClick={() => handleButtonChange('comments', selectedUser)}
                    >
                    Comments
                    </button>
                </div>
            </div>
        );
    }
}

