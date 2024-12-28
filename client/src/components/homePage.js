import '../stylesheets/homePage.css';
import viewIcon from '../images/view.svg'
import commentIcon from '../images/comment.svg'
import noSearchIcon from '../images/no-search-result-icon.svg'
import memberCountIcon from '../images/memberCountIcon.svg'
import postCountIcon from '../images/postCountIcon.svg'
import upvoteIcon from '../images/upvoteIcon.png'
import downVoteIcon from '../images/downvoteIcon.png'
import React, {useState} from 'react';
import axios from 'axios';


export default class TheHomePage extends React.Component{
    constructor(props){
        super(props);
        this.state = {order: orderNewest};
    
        this.updateOrder = this.updateOrder.bind(this);
        this.resetOrder = this.resetOrder.bind(this);
    }

    updateOrder(newOrder){
        //console.log("Updating order to: ", newOrder);
        this.setState({order: newOrder}, () => {
            console.log("Updated state:", this.state.order);
        });
    }

    resetOrder(){
        //console.log("Resetting to newest");
        this.setState({order: orderNewest});
    }

    render(){
        const {setPage, goToPostPage, posts, communities, comments, linkFlairs, handleOrderButtonClick, loggedIn, userInfo} = this.props
        //console.log("HOME PAGE PROPS", this.props);

        let userCommunityPosts = [];
        let otherCommunityPosts = posts;

        if (loggedIn) {
            const userCommunities = communities.filter((community) =>
                community.members.includes(userInfo[0])
            );

            userCommunityPosts = posts.filter((post) =>
                userCommunities.some((community) => community.postIDs.includes(post._id))
            );

            otherCommunityPosts = posts.filter(
                (post) => !userCommunityPosts.some((userPost) => userPost._id === post._id)
            );
        }
        
        const noPostsFound = userCommunityPosts.length === 0 && otherCommunityPosts.length === 0;

        return(
            <div id="homePage" className="main_cont_divs">
                <HomePageHeader handleOrderButtonClick={handleOrderButtonClick} updateOrder={this.updateOrder} setPage={setPage}/>
                <div id="totalPostDiv">
                    <PostCount arrayLength = {posts.length}/><span id="spanSpacing"> </span><p>Total</p>
                </div>

                {noPostsFound && (
                    <div className="noPostsImage">
                        <img
                            id="noSearchIcon"
                            alt="No search results"
                            src={noSearchIcon}
                            height="100%"
                            width="100%"
                        />
                    </div>
                )}

                {(!noPostsFound && loggedIn) && (
                    <>
                        <h3>Your Communities</h3>
                        <PostSection
                                posts={userCommunityPosts}
                                order={this.state.order}
                                comments={comments}
                                linkFlairs={linkFlairs}
                                communities={communities}
                                goToPostPage={goToPostPage}
                                page={"home"}
                                loggedIn={loggedIn}
                        />
                    </>
                )}
                {!noPostsFound && (
                    <>
                    <h3>{loggedIn ? "Other Communities" : "All Communities"}</h3>
                    <PostSection
                        posts={otherCommunityPosts}
                        order={this.state.order}
                        comments={comments}
                        linkFlairs={linkFlairs}
                        communities={communities}
                        goToPostPage={goToPostPage}
                        page={"home"}
                        loggedIn={loggedIn}
                    />
                    </>
                )}
            </div>
        ); 
    }
    
}

class HomePageHeader extends React.Component{   
    render(){
        const {setPage} = this.props;
        //console.log("IN HOME PAGE HEADER", this.props);
        return(
            <div id="header">
                <InfoSection page={"home"} setPage={setPage}/>
                <ButtonDisplay
                    handleOrderButtonClick = {this.props.handleOrderButtonClick}
                    updateOrder={this.props.updateOrder}
                    orderNewest={orderNewest}
                    orderOldest={orderOldest}
                    orderActive={orderActive}
                />
            </div>
        );
    }
}

export function InfoSection(props){
    const [upVotes, setUpVotes] = useState(props.upVotes);
    const updatePostVoteCountNReputation = async (upOrDown, postID, loggedIn, setUpVotes) => {
        if (!loggedIn) {
            alert("You need to log in to vote.");
            return;
        }
        try {
            console.log("updatePostVoteCountNReputation is callllllleedddd", postID, loggedIn);
            let userReputation;
            if(loggedIn){
                let userReputationData = await axios.get('http://localhost:8000/getUserReputation', { withCredentials: true });
                userReputation = userReputationData.data.userReputation
                // console.log("USER REPUTATION", userReputation);
                // console.log("USER REPUTATION", userReputation.data.userReputation);
            }
            if(userReputation < 50){
                alert("You need a reputation of at least 50 to vote");
                return
            }
            if(userReputation >= 50){
                let vote = upOrDown === "up" ? 1 : -1;
                const response = await axios.post('http://localhost:8000/updatePostVoteCount', {
                    id: postID,
                    vote: vote
                }, { withCredentials: true });
                console.log("RESPONSE", response);
                if (response.data.success) {
                    setUpVotes(response.data.upVotes); // Update state here
                }
            }
        } catch (error) {
            console.error("Error updating vote count:", error);
            alert("An error occurred while updating your vote.");
        }
    };
    const checkprops = props.page.toLowerCase().trim();
    //console.log("propppppppssssssss",props)
    if(checkprops === 'home'){
        return(
            <header id="left-side">
                All Posts 
            </header>
        );
    }
    else if(checkprops === 'community'){
        return(
        <header id="left-side">
            <div className="comName">
            {props.comName}
            </div>
            <div className="description">
            {props.description}  
            </div>

            Created:  <TimeStamp key={props.startDate} postedDate={props.startDate}/>
            <br></br>
            Created By: {props.createdBy}  
            
            <div className="postCount"> 
            {/* Post Count: {props.comPostCount} Member Count: {props.memberCount} */}
            {<img id="postCountIcon" alt="postCountIcon" src={postCountIcon}/>} {props.comPostCount} {<img id="memberCountIcon" alt="memberCountIcon" src={memberCountIcon}/>} {props.memberCount}
            </div> 
        </header>
        );
    }else if(checkprops === 'search'){
        if(props.posts.length > 0){
            return(
                <header id="left-side">
                    Results for: {props.txtInput}
                </header>
            );
        }
        else{
            return(
                <header id="left-side">
                    No results found for: {props.txtInput}
                </header>
            );
        }
    }else if(checkprops === 'userprof'){
        //console.log(props)
        return(
            <header id="left-side">
                {/* User info: */}
                <div className="postTitle">
                Display Name: {props.user.displayName}
                </div>
                <div className="postTitle">
                    <div className="comName">
                        Email: {props.user.email}
                    </div>
                    <br></br>
                    {/* <span>•</span>  */}
                    {/* Created: <TimeStamp key={props.user.memberSince} postedDate={props.user.memberSince}/> */}
                    Member since: <TimeStamp key={props.user.memberSince} postedDate={props.user.memberSince}/>
                </div>
                <div className="postTitle">
                Reputation: {props.user.reputation}
                </div>
            </header>
        );
    }else{
        //console.log("IN HERE BRO", props);
        return(
            <header id="left-side">
                <div className="postTitle">
                    <div className="comName">{props.comName}</div> 
                    <span>•</span> 
                        <TimeStamp key={props.startDate} postedDate={props.startDate}/>
                </div>
                <div className="postTitle">
                {props.userName}
                </div>
                <div id="postInfo">
                <div className="comName">
                {props.title}
                </div> 
                {props.linkFlairInput}
                <div className="content">
                {props.content}
                </div>
                </div>
                <div className="counters">
                    <div className='counterDivs'>
                        <img
                            alt="viewingIcon"
                            className="viewIcon"
                            src={viewIcon}
                            height="20"
                            width="20"
                        />
                        {props.viewCount}
                    </div>
                
                    <div className='counterDivs'>
                        <img
                            alt="commentingIcon"
                            src={commentIcon}
                            height="17"
                            width="17"
                        />
                        {props.commentCount}
                    </div>
                    
                    {/* Post Page up/down votes */}
                    <div className="voteDiv">
                        <button className='upVoteButton' disabled={!props.loggedIn} onClick={() => updatePostVoteCountNReputation("up", props.postID, props.loggedIn, setUpVotes)}>
                            <img
                                className='upvoteIcon'
                                alt="voteCountIcon"
                                src={upvoteIcon}
                            />
                        </button>
                        <button className='downVoteButton' disabled={!props.loggedIn} onClick={() => updatePostVoteCountNReputation("down", props.postID, props.loggedIn, setUpVotes)}>
                            <img
                            className='downvoteIcon'
                            alt="voteCountIcon"
                            src={downVoteIcon}
                        />
                        </button>
                        {upVotes}
                    </div>
                    {/* up and down votes */}
                </div>
                <button id="create_comment_button" 
                    disabled={!props.loggedIn}
                    onClick={() => { 
                    props.setPage("NewCommentPageView"); 
                    props.setCommentOrReplyParentID(props.postID); 
                    props.setCommentOrReply("comment");

                }}
                >Add a Comment
                </button>
                {/* comment button */}
            </header>
        );
    }
}

export class ButtonDisplay extends React.Component{
    constructor(props) {
        super(props);
        this.orderNewest = this.orderNewest.bind(this);
        this.orderOldest = this.orderOldest.bind(this);
        this.orderActive = this.orderActive.bind(this);
    }
    
    orderNewest(){
        //console.log("Newest Clicked");
        this.props.handleOrderButtonClick();
        this.props.updateOrder(orderNewest);
    }

    orderOldest(){
        //console.log("Oldest Clicked");
        this.props.handleOrderButtonClick();
        this.props.updateOrder(orderOldest)
    }

    orderActive(){
        //console.log("Active Clicked");
        this.props.handleOrderButtonClick();
        this.props.updateOrder(orderActive);
    }


    render(){
        return(
            <div id="buttonSection">
                <button className="rightSide" id="newest" onClick={this.orderNewest}>
                    Newest
                </button>
                <button className="rightSide" id="oldest" onClick={this.orderOldest}>
                    Oldest
                </button>
                
                <button className="rightSide" id="active" onClick={this.orderActive}>
                    Active
                </button>
            </div>
        );
    }
}

export function PostCount(props){
    return(
        <div id="postCount">
            {props.arrayLength} Posts
        </div>
    );
}

export class PostSection extends React.Component{

    render(){
        const {posts, communities, order, comments, linkFlairs} = this.props;
        // console.log("THIS SI THE ORDER", order)
        //console.log("IN POST SECTION", this.props.page)
        //console.log("IN POST SECTION", this.props.goToPostPage)
        //console.log("POST SECTION COMMUNITIES", communities);
        const sortedPosts = postsList(posts, order, communities, comments, linkFlairs)
        let listPosts;
        sortedPosts && sortedPosts.length > 0 ? (
            listPosts = sortedPosts.map((post, index) =>{
                //console.log("THIS IS POST", this.openPostView)
                // console.log("CURRENT POST TITLE", post)
                // console.log(post.props.postID)
                //console.log("IN THE POST SECTION", post.props)
                return (
                <div key={post.props.postID} id={"id-" + post.props.first20} onClick={
                    () => {
                        //console.log("BEFORE ASSIGNMENT")
                        this.props.goToPostPage(post.props.postTitle)
                        //console.log("AFTER ASSIGNMENT")
                        }}>
                    
                    <Post 
                        {...post.props}
                        page={this.props.page}
                        loggedIn={this.props.loggedIn}
                        onUserInfo={this.props.page}
                        //openPost={this.openPostView} // Pass the function as prop
                    />
                    {this.props.page === "userInfo" && (<button className='userDeletePostButton'
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the `goToPostPage` click
                            const confirmDelete = window.confirm("Are you sure you want to delete this post?");
                            if (confirmDelete) {
                                this.props.handleDeletePost(post.props.postID);
                            }
                        }}
                    >
                        Delete Post
                    </button>)}
                </div>
                );
            })
        ) : (
            listPosts = <div>No posts found</div>
        )
        //console.log("listPosts", listPosts)
        let postSectionInfo;
        if(this.props.page === "home"){
            postSectionInfo = 
            (
            <div key={sortedPosts.length} className="posts">
                <PostCount arrayLength = {sortedPosts.length}/>
                {listPosts}
            </div>);
            //console.log(postSectionInfo);
        }
        else if(this.props.page === "community"){
            postSectionInfo = (<div key={"community"} id="posts">{listPosts}</div>);
        }
        else if(this.props.page === "userInfo"){
            postSectionInfo = 
            (
            <div key={sortedPosts.length} className="posts">
                <PostCount arrayLength = {sortedPosts.length}/>
                {listPosts}
            </div>);
        }
        //console.log(listPosts);

        //console.log("BEFORE IF");
        if (Array.isArray(postSectionInfo)) {
            console.warn("postSectionInfo is an array!:", postSectionInfo);
        }
        return postSectionInfo;
    }
}


export class Post extends React.Component{
    render(){
    // console.log("THIS IS THE DATE", this.props.startDate);
    let topOfPost;
    if(this.props.page === "home"){
        topOfPost = (<div className="topOfPost">
            <div className="comName">
                {this.props.community}
            </div>
            <span>•</span>
            <div className="user">
            {this.props.userName}
            </div>
            <span>•</span>
            <TimeStamp key={this.props.startDate} postedDate={this.props.startDate}/>
        </div>);
    }
    else if(this.props.page === "community"){
        topOfPost = (<div className="topOfPost">
            <div className="user">
            {this.props.userName}
            </div>
            <span>•</span>
            <TimeStamp key={this.props.startDate} postedDate={this.props.startDate}/>
        </div>);
    }
    return(
       <div className={`post${this.props.page === "userInfo" ? "UserInfoStyle" : ""}`} 
       onClick={this.handlePostView}>
        
        {topOfPost}
        <div className="postTitle">
        {this.props.postTitle}
        </div>
        {this.props.postlinkFlairID}
        {this.props.first20}
        <div className="counters">
            <div className='counterDivs'>
                <img
                    alt="viewIcon"
                    id="viewIcon"
                    src={viewIcon}
                    height="20"
                    width="20"
                />
                <span className="counters">
                {this.props.viewCount}
                </span>
            </div>
            
            <div className='counterDivs'>   
                <img
                    alt="commentIcon"
                    src={commentIcon}
                    height="17"
                    width="17"
                />
                <span className="counters">
                {this.props.commentCount}
                </span>
            </div>
            

            {/* homepage up/down votes*/}
            <div className="voteDiv">
                <button className='HomePageUpVoteButton' disabled={!this.props.loggedIn}>
                    <img
                        className='upvoteIcon'
                        alt="voteCountIcon"
                        src={upvoteIcon}
                    />
                </button>
                <button className='HomePageDownVoteButton' disabled={!this.props.loggedIn}>
                    <img
                    className='downvoteIcon'
                    alt="voteCountIcon"
                    src={downVoteIcon}
                />
                </button>
                <span className="counters">
                {this.props.upVotes}
                </span>
            </div>
            {/* up and down votes*/}

        </div>
       </div> 
    );
}
}

export function getPost(post, communities, comments, linkFlairs){
    //console.log(post);
    // console.log(linkFlairs);
    //console.log("THIS IS THE COMMUNITIES in Get post", communities)
    //console.log("GETPOST", post)
    const postID = post._id;
    const community = getCommunity(post._id, communities);
    const userName = post.postedBy;
    const startDate = post.postedDate;
    const postTitle = post.title;
    const postlinkFlairID = getLinkFlair(post.linkFlairID, linkFlairs)
    const first20 = post.content.substring(0, 80);
    const viewCount = post.views
    const commentCount = getCommentNum(post, comments);
    const upVotes = post.upVotes;
  
    return [community, userName, startDate, postTitle, postlinkFlairID, first20, viewCount, commentCount, postID, upVotes];
}


export class TimeStamp extends React.Component{
    constructor(props)
    {
        super(props);
        this.state = {date: new Date(), startDate: new Date(props.postedDate)};
    }
    
    updateTime(diff){
        const seconds = Math.floor(diff/1000);
        const minutes = Math.floor(diff/(1000 * 60));
        const hours = Math.floor(diff/(1000 * 60 * 60));
        const days = Math.floor(diff/(1000 * 60 * 60 * 24));
        const months = Math.floor(diff/(1000 * 60 * 60 * 24 * 30));
        const years = Math.floor(diff/(1000 * 60 * 60 * 24 * 30 * 12));
    
    
        if(seconds < 60){
        //console.log("Time Difference: " + seconds + " seconds");
        return seconds + " second(s) ago";
        }
        else if(minutes < 60){
        //console.log("Time Difference: " + minutes + " minutes");
        return minutes + " minute(s) ago";
        }
        else if(hours < 24){
        //console.log("Time Difference: " + hours + " hours");
        return hours + " hour(s) ago";
        }
        else if(days < 30){
        //console.log("Time Difference: " + days + " days");
        return days + " day(s) ago";
        }
        else if(months < 12){
        //console.log("Time Difference: " + months + " months");
        return months + " month(s) ago";
        }
        else{
        //console.log("Time Difference: " + years + " years");
        return years + " year(s) ago";
        }
    }
    
    render()
    {   
        return (
          <div className="timeStamp" id={this.props.id}>
              {this.updateTime(this.state.date - this.state.startDate)}
          </div>
        );
    }
    
    componentDidMount()
    {
        //this.timerID = setInterval(
        //  ()=> this.setState({date: new Date()}), 1000
        //);
        this.timerID = setInterval(()=> this.tick(), 1000);
    }
    
    componentWillUnmount()
    {
        clearInterval(this.timerID);
    }
    
    tick()
    {
        this.setState({date: new Date()});
    }
}

export function getCommunity(postID, communities){
    //console.log("POST ID", postID)
    //console.log("COMMUNITIES", communities)
    const community = communities.find(community => {
        //console.log("Checking community:", community.postIDs);
        //console.log("Checking for:", postID);
        return community.postIDs.includes(postID);
      }) || { name: "hsjkdhkfj" };
    
    //console.log("POST IDS", postID)
    //console.log("COMMUNITY NAME", community.name)
    return community.name
  }
  
  function getCommentNum(post, comments){
    // console.log("POST OR COMMENT: ");
    // console.log(post);
    //console.log("THESE ARE THE COMMENTS", comments);
  
    if(post === null || post.commentIDs.length === 0 || post.commentIDs === null){
      // console.log("IN NULL RN BRO");
      return 0;
    }
    let comment;
    let total = post.commentIDs.length;
    for(let i = 0; i < total; i++){
      comment = getComment(post.commentIDs[i], comments);
      if(comment != null){
        total += getCommentNum(comment, comments);
      }
    }
    return total;
  }
  
  function getLinkFlair(linkFlairID, linkFlairs){
    // console.log("THIS IS THE LINK FLAIR ID", linkFlairs)
    // console.log("THIS IS THE linkflair id to look for", linkFlairID)
    const linkFlair = linkFlairs.find(flair => flair._id === linkFlairID);
    if(!linkFlair){
      return "not FOUND";
    }
    return linkFlair.content;
  }
  
  export function getComment(commentName, comments){
    //console.log("getComment", comments);
    //console.log("RETURNING THIS: ", comments.find(comment => String(comment._id) === String(commentName)));
    return comments.find(comment => String(comment._id) === String(commentName)) || 
    console.log("CANT FIND THIS", commentName);
  }

function postsList(postsToDisplay, order, communities, comments, linkFlairs){
    //console.log("THIS IS THE POST BEFORE GOING TO ORDER", postsToDisplay);
    // console.log("IN POSTSLIST", postsToDisplay);
    //console.log("BEFORE communities in postsList", communities);
    const sortedList = order(postsToDisplay, comments);
    //console.log("Sorted posts:", sortedList);
    //console.log(postsToDisplay);
    const postsList = sortedList.map(function(post, index){
        //console.log("AFTER communities in postsList", communities);
        let postInfo = getPost(post, communities, comments, linkFlairs);
        //console.log("postsLIST", postInfo)
        const linkFlair = postInfo[4] !== 'not FOUND' ?
        (
        <div>
            <span className="linkFlair">
                {postInfo[4]}
            </span>
        </div>
        ) : null;
        return(
        <Post
            postID = {postInfo[8]}
            community = {postInfo[0]}
            userName = {postInfo[1]}
            startDate = {postInfo[2]}
            postTitle= {postInfo[3]}
            postlinkFlairID = {linkFlair}
            first20 = {postInfo[5]}
            viewCount = {postInfo[6]}
            commentCount = {postInfo[7]}
            upVotes = {postInfo[9]}
        />);
    })

    return postsList;
}

export const orderNewest = (postToDisplay) => {
    //console.log("pressed newest");
    //console.log("This is conName:" + comName);
    //console.log("THESE ARE THE POSTS TO DISPLAY IN NEWEST: ",postToDisplay)
    let comPosts = postToDisplay;
    // if(page == "community"){
    //   comPosts = filterPosts("community", comName);
    // }
  
    // if(page == "search"){
    //   comPosts = Array.from(filterPosts("search", comName));
    // }
    //console.log("IN HERE");
    comPosts.sort(function(a, b){
      return(new Date(b.postedDate) - new Date(a.postedDate))
    })
    //console.log(comPosts);

    return comPosts;
  
    //console.log("Newest");
    //console.log(comPosts);
    
    //postsList(comPosts, page);
    //console.log(posts);
  }
  
  export const orderOldest = (postToDisplay) => {
    //console.log("BEING ORDERED BY OLDEST")
    // console.log("pressed oldest");
    let comPosts = postToDisplay;
    // if(page == "community"){
    //   comPosts = filterPosts("community", comName);
    // }
  
    // if(page == "search"){
    //   comPosts = Array.from(filterPosts("search", comName));
    // }

   // console.log("BEFORE", comPosts);
  
    comPosts.sort(function(a, b){
        // console.log("A", a.postedDate)
        // console.log("B", b.postedDate)
      return(new Date(a.postedDate) - new Date(b.postedDate))
    })
    //console.log("After", comPosts);
    return comPosts;
    
    //postsList(comPosts, page);

  }
  
  export const orderActive = (postToDisplay, comments) => {
    //console.log("pressed active");
    let comPosts = postToDisplay;
    // if(page == "community"){
    //   comPosts = filterPosts("community", comName);
    // }
  
    // if(page == "search"){
    //   comPosts = Array.from(filterPosts("search", comName));
    // }
  
    let activePost = new Map([]);
    for(const post of comPosts){
        //let commentNum = getCommentNum(x, comments)
        //console.log("COMMENTS", comments);
        let commentArray = getTotalComments(post, comments);
        //console.log("COMMENT ARRAY", commentArray);
        commentArray.sort(function(a, b){
            return(new Date(b.commentedDate) - new Date(a.commentedDate))
        });

        // If the post has comments, take the most recent comment date
        // If no comments, use the post creation date
        let recentDate = commentArray.length > 0 ? new Date(commentArray[0].commentedDate) : new Date(post.postedDate);
        activePost.set(post, recentDate);

        //activePost.set(post, commentArray[0].commentedDate);
    }
    comPosts = Array.from(activePost)
    //console.log("BEFORE");
    //console.log(comPosts);
  
    comPosts.sort(function(a, b){
        //console.log("THIS IS A", a[0].postID,  "THIS IS B", b[0].postID)
        if(b[1] === a[1]){
            //console.log("SAME DATES FOR COMMENTS DETECTED");
            return (new Date(b[0].postedDate) - new Date(a[0].postedDate))
        }
      return(b[1] - a[1]);
    });
  
    //console.log("AFTER");
    //console.log(comPosts);
    comPosts = comPosts.map(function(element){
      return element[0];
    })
    
    return comPosts;
    //postsList(comPosts, page);
  }



export function getTotalComments(post, comments){
    let commentArray = [];
    if(post === null || post.commentIDs.length === 0 || post.commentIDs === null){
      return commentArray;
    }

    post.commentIDs.sort(function(a,b){
      //console.log("in the sort", a, b);
      return(new Date(getComment(b, comments).commentedDate) - new Date(getComment(a,  comments).commentedDate))
    });
    // console.log("THIS IS SORTED");
    //console.log("COMMENT IDS", post.commentIDs);
  
    let total = post.commentIDs.length;
    for(let i = 0; i < total; i++){
      let comment = getComment(post.commentIDs[i], comments);
      if(comment != null){
        // console.log("COMMENT GETTING PUSHED INTO ARRAY");
        // console.log(comment);
        commentArray.push(comment);
  
        let children = getTotalComments(comment,  comments);
        // console.log("CHILDREN BEING CONCAT");
        // console.log(children);
  
        
        commentArray = commentArray.concat(children);
        // console.log("CONCATING");
        // console.log(commentArray.concat(children));
        // console.log("ARRAY AFTER");
        // console.log(commentArray);
      }
    }
    // console.log("ARRAY BEING RETURNED");
    // console.log(commentArray);
    return commentArray;
  }