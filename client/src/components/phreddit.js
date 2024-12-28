import '../stylesheets/phreddit.css';
import axios from 'axios';
import React, {createRef} from 'react';
//import  Model  from '../models/model.js';

import TheBanner from './banner.js';
import TheCommunityPage from './communityPage.js';
import TheHomePage from './homePage.js';
import ThePostPage from './postPage.js';
import TheSearchResultsPage from './searchResultsPage.js';

import TheWelcomePage from './welcome.js';
import TheRegisterPage from './register.js';
import TheLoginPage from './login.js';
import TheUserPage from './userProf.js';

import NavBar from './navBar.js';
import NewCommunityPageView from './newCommunityPageView.js';
import NewPostPageView from './newPostPageView.js';
import NewCommentPageView from './newCommentPageView.js';


//const model = new Model();

export default class Phreddit extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      page: 'welcome', 
      selectedPost: null, 
      selectedCommunity: null, 
      txtInput: null,

      communities: [],
      linkFlairs: [],
      posts: [],
      comments: [],

      commentOrReply: null,
      commentOrReplyParentID: null,
      isLoading: false,

      user: 'Guest',
      loggedIn: false,
      message: 'Guest',
      userInfo: [],

      userProf: {},
      userComs: [],
      userPosts: [],
      userComments: [],

      userProfActive: 'posts',

      postUser: null,
      comUser: null,
      commentUser: null,

      allPhredditUsers: [],

      isUserSelected: false,
      selectedUser: null,
    };
    this.goToPostPage = this.goToPostPage.bind(this);
    this.goToHomePage = this.goToHomePage.bind(this);
    this.goToCommunityPage = this.goToCommunityPage.bind(this);
    this.goToSearchResultsPage = this.goToSearchResultsPage.bind(this);
    this.goToNewPostPageView = this.goToNewPostPageView.bind(this);

    this.goToEditPostPage = this.goToEditPostPage.bind(this);
    this.goToEditCommunityPage = this.goToEditCommunityPage.bind(this);
    this.goToEditCommentPage = this.goToEditCommentPage.bind(this);

    this.setPage = this.setPage.bind(this);
    this.setCommunities = this.setCommunities.bind(this);
    this.setLinkFlairs = this.setLinkFlairs.bind(this);
    this.setPosts = this.setPosts.bind(this);
    this.setComments = this.setComments.bind(this);
    this.setUsers = this.setUsers.bind(this);

    this.setCommentOrReply = this.setCommentOrReply.bind(this);
    this.setCommentOrReplyParentID = this.setCommentOrReplyParentID.bind(this);

    this.fetchData = this.fetchData.bind(this);
    this.handleOrderButtonClick = this.handleOrderButtonClick.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.fetchUserData = this.fetchUserData.bind(this);
    this.handleButtonChange = this.handleButtonChange.bind(this);


    this.theHomePageRef = createRef();
  }

  async componentDidMount(){
    console.log("MOUNTED");
    await this.fetchData();
  }

  async handleLogout() {
    try {
      await axios.post('http://localhost:8000/logout', {}, { withCredentials: true });
      this.setState({ loggedIn: false, user: 'Guest', message: "Guest", page: "welcome"});
      alert('You have been logged out.');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  }
  
  //get all users for phredditUsers
  async fetchAllUsers(isAdmin) {
    try {
      if(isAdmin){
        const response = await axios.get('http://localhost:8000/getAllUsers', { withCredentials: true });
        //console.log("ALL USERS", response.data);
        //console.log("ALL USERSsssssssssss", response.data[0]);
        this.setState({allPhredditUsers: response.data});
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('System Failure. Please try again or refresh the page.');
    }
  };

  async fetchUserData(user) {
    console.log("FETCHING USER DATA")
    //console.log("Is there a user????????", user)
    if(user){
      //console.log("Is there a user????????", user.email)
    }
    try {
      await this.fetchData();
      let userRes;
      let communitiesRes;
      let postsRes;
      let commentsRes;
      if(user){
        console.log("AFTER FETCHING PURE DATA")
        userRes = await axios.get(`http://localhost:8000/userInfo`, { withCredentials: true, params: {userEmail: user.email} });
        //console.log(userRes.data)
        communitiesRes = await axios.get(`http://localhost:8000/userCommunities`, { withCredentials: true, params: {userEmail: user.email} });
        //console.log(communitiesRes.data)
        postsRes = await axios.get(`http://localhost:8000/userPosts`, { withCredentials: true, params: {userEmail: user.email} });
        //console.log(postsRes.data)
        commentsRes = await axios.get(`http://localhost:8000/userComments`, { withCredentials: true, params: {userEmail: user.email} });
        //console.log(commentsRes.data)
      }
      else{
        console.log("AFTER FETCHING PURE DATA")
        userRes = await axios.get(`http://localhost:8000/userInfo`, { withCredentials: true });
        //console.log(userRes.data)
        communitiesRes = await axios.get(`http://localhost:8000/userCommunities`, { withCredentials: true });
        //console.log(communitiesRes.data)
        postsRes = await axios.get(`http://localhost:8000/userPosts`, { withCredentials: true });
        //console.log(postsRes.data)
        commentsRes = await axios.get(`http://localhost:8000/userComments`, { withCredentials: true });
        //console.log(commentsRes.data)
      }

      //let pageProf = user ? "posts" : "phredditUsers";
      // console.log("active prof page", pageProf);
      let isUserSelected = user ? true : false;
      let selectedUser = user ? user : null;
      
      this.setState({
        userProf: userRes.data.user,
        userComs: communitiesRes.data,
        userPosts: postsRes.data,
        userComments: commentsRes.data,
        // userProfActive: pageProf,
        isUserSelected: isUserSelected,
        selectedUser: selectedUser,
        // isLoading: false,
      });

      //console.log("USER INFO000000000000", this.state.userInfo[3]);
      this.fetchAllUsers(this.state.userInfo[3]);
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert('System Failure. Please try again or refresh the page.');
    //   this.setState({ isLoading: false });
    }
  }

  async fetchData(){
    console.log("FETCHING PURE DATA")
    if (this.state.isLoading) return; 
    this.setState({ isLoading: true });
    //console.log("FETCHING DATA AGAIN");
    try{
      const sessionResponse = await axios.get("http://localhost:8000/", { withCredentials: true });
      //console.log(sessionResponse.data)
      this.setState({ 
        loggedIn: !!sessionResponse.data.loggedIn, 
        user: sessionResponse.data.user || "Guest",
        message: sessionResponse.data.message,
        userInfo: sessionResponse.data.userInfo
      });



      const communitiesRes = await axios.get("http://localhost:8000/communities");
      //console.log("Communities fetched:", communitiesRes.data);
      const postsRes = await axios.get("http://localhost:8000/posts");
      //console.log("Posts fetched:", postsRes.data);
      const commentsRes = await axios.get("http://localhost:8000/comments");
      //console.log("Comments fetched:", commentsRes.data);
      const linkFlairsRes = await axios.get("http://localhost:8000/linkflairs");
      //console.log("Link flairs fetched:", linkFlairsRes.data);


      this.setState({
        communities: communitiesRes.data,
        posts: postsRes.data,
        comments: commentsRes.data,
        linkFlairs: linkFlairsRes.data,
      });
    } catch (error) {
      console.error("Error fetching data", error);
      alert('System Failure. Please try again or refresh the page.');
    } finally {
      this.setState({ isLoading: false });
    }
    
  }

  async handleOrderButtonClick() {
    //console.log("Order button clicked, fetching new data...");
    await this.fetchData(); 
  }

  async handleButtonChange(opt, user) {
    console.log("SETTING ACTIVE BUTTON", opt);
    //console.log("is there a user after setting active button", user);
    if(user){
      await this.fetchUserData(user);
    }
    else{
      await this.fetchUserData();
    }
    this.setState({ userProfActive: opt });
    //console.log("After SETTING ACTIVE BUTTON", opt);
  }


  
  async goToPostPage(postTitle){
    //console.log("GO TO POST THE POST TITLE", postTitle);
    await this.fetchData();
    const post = this.state.posts.find(post => post.title === postTitle);

    if (post) {
      try{
      const postRes = await axios.get(`http://localhost:8000/posts/${post._id}`)
      this.setState({
        page: 'post',
        selectedPost: postRes.data, 
        selectedCommunity: null,
        txtInput: null,
      });
        
      } catch(error) {
        alert('System Failure. Please try again or refresh the page.');
        console.error("Error fetching data", error);
      }
    }
  }

  async goToHomePage(){
    await this.fetchData();
    if (this.theHomePageRef.current) {
      this.theHomePageRef.current.resetOrder();
    }
    this.setState({
      page: 'home',
      selectedPost: null, 
      selectedCommunity: null, 
      txtInput:null,
    })
  }


    
  async goToCommunityPage(comName){
    await this.fetchData();
      
    this.setState({
      page: 'community',
      selectedPost: null, 
      selectedCommunity: comName, 
      txtInput:null,
    });
  }
    
  async goToSearchResultsPage(txtInput){
    await this.fetchData();
    this.setState({page: 'search', selectedPost: null, selectedCommunity: null, txtInput: txtInput})
  }

  async goToNewPostPageView(){ // used for creating new posts
    await this.fetchData();
    await this.fetchUserData(); 
    this.setState({page: 'NewPostPageView'})
  }

  async goToEditPostPage(postTitle) {
    await this.fetchData();

    const post = this.state.posts.find(post => post.title === postTitle);

    if (post) {
      try{
      const postRes = await axios.get(`http://localhost:8000/getPost/${post._id}`)
      this.setState({
        page: 'NewPostPageView',
        postUser: postRes.data, 
      });
        
      } catch(error) {
        alert('System Failure. Please try again or refresh the page.');
        console.error("Error fetching data", error);
      }
    }
  }

  async goToEditCommunityPage(community) {
    await this.fetchData();
    console.log("EDITING COM uh hello?", community)

  
    if (community) {
      try{
      const comRes = await axios.get(`http://localhost:8000/communityInformation/${community.props._id}`);
      console.log("COM DATA:", comRes.data)
      this.setState({
        page: 'NewCommunityPageView',
        comUser: comRes.data.community, 
      });
        
      } catch(error) {
        alert('System Failure. Please try again or refresh the page.');
        console.error("Error fetching data", error);
      }
    }
  }

  async goToEditCommentPage(comment) {
    await this.fetchData();
    console.log("EDITING COMMENT", comment)

  
    if (comment) {
      try{
      const commentRes = await axios.get(`http://localhost:8000/commentInformation/${comment.props._id}`);
      console.log("COMMENT DATA:", commentRes.data)
      this.setState({
        page: 'NewCommentPageView',
        comUser: commentRes.data.comment, 
      });
        
      } catch(error) {
        alert('System Failure. Please try again or refresh the page.');
        console.error("Error fetching data", error);
      }
    }
  }


  //change this to make it work for everything
  async setPage(toGoPage, comName, user, userProfActive){
    //console.log("ABOUT TO SWITCH PAGES", toGoPage);
    await this.fetchData();
    
    if (toGoPage === 'userProf' || toGoPage === 'NewPostPageView' || toGoPage === 'NewCommunityPageView' || toGoPage === 'NewCommentPageView') {
      if(user){
        await this.fetchUserData(user);
      }
      else{
        await this.fetchUserData();  
      }
    }
    //console.log("Data fetched:", this.state.communities, this.state.posts);
    //console.log("SETTING PAGE TO:", toGoPage)
    //console.log("am i an adminn??????", this.state.userInfo, this.state.loggedIn);
    // let flag;
    // if(this.state.userInfo[3]){
    //   flag
    // }
    let pageToGo;
    if(userProfActive){
      pageToGo = userProfActive;
    }
    else{
      if(toGoPage === "userProf"){
        if(this.state.userInfo[3] && !user){
          pageToGo = "phredditUsers";
        }
        else{
          pageToGo = "posts";
        }
      }
      else{
        pageToGo = this.state.activeButton
      }
    }
    this.setState({ 
      postUser: null,
      comUser: null,
      commentUser: null,
      page: toGoPage, 
      selectedCommunity: comName, 
      userProfActive: pageToGo,
      //userProfActive: toGoPage === "userProf" ? (this.state.userInfo[3] ? "phredditUsers" : "posts") : this.state.activeButton
    });
  }

  setUsers(updater){

    this.setState((prevState) => {
        // Check if updater is a function
        const newUsers = typeof updater === 'function' ? updater(prevState.allPhredditUsers) : updater;

        //console.log("Setting users:", newUsers);
        return { allPhredditUsers: newUsers };
    });
  }

  setCommunities(updater){
    // console.log("setting communities", newCommunities)
    // this.setState({communities: newCommunities});

    this.setState((prevState) => {
      // Check if updater is a function
      const newCommunities = typeof updater === 'function' ? updater(prevState.communities) : updater;

      //console.log("Setting communities:", newCommunities);
      return { communities: newCommunities };
  });

  }

  setLinkFlairs(newLinkFlairs){
    this.setState({linkFlairs: newLinkFlairs});
  }
  setPosts(updater){
    this.setState((prevState) => {
      // Check if updater is a function
      const newPosts = typeof updater === 'function' ? updater(prevState.posts) : updater;

      //console.log("Setting Posts:", newPosts);
      return { posts: newPosts };
    });
    // console.log("SETTING NEW POSTS", newPosts)
    // this.setState({posts: newPosts});
  }
  setComments(updater){
    this.setState((prevState) => {
      // Check if updater is a function
      const newComments = typeof updater === 'function' ? updater(prevState.comments) : updater;

      //console.log("Setting comments:", newComments);
      return { comments: newComments };
  });

    // this.setState({comments: newComments});
  }
  
  setCommentOrReply(newCommentOrReply){// will be used for commenting and replying
    this.setState({commentOrReply: newCommentOrReply}); // either "comment" or "reply"
  }
  setCommentOrReplyParentID(newCommentOrReplyParentID){// will be used for commenting and replying
    this.setState({commentOrReplyParentID: newCommentOrReplyParentID}); // either "comment" or "reply"
  }
  
  changeMainContent(){
    switch(this.state.page){
      case 'userProf': return (<TheUserPage 
        posts={this.state.posts} 
        goToNewPostPageView={this.goToNewPostPageView}
        goToEditPostPage={this.goToEditPostPage}
        goToEditCommunityPage={this.goToEditCommunityPage}
        goToEditCommentPage={this.goToEditCommentPage}
        communities={this.state.communities} 
        comments={this.state.comments} 
        linkFlairs={this.state.linkFlairs}
        loggedIn={this.state.loggedIn}
        user={this.state.user}
        setPage={this.setPage} 
        userInfo={this.state.userInfo}
        userProf={this.state.userProf}
        userComs={this.state.userComs}
        userPosts={this.state.userPosts}
        userComments={this.state.userComments}
        activeButton={this.state.userProfActive}
        handleButtonChange={this.handleButtonChange}
        setComments={this.setComments}
        setPosts={this.setPosts}
        setCommunities={this.setCommunities}
        setUsers={this.setUsers}
        allPhredditUsers={this.state.allPhredditUsers}
        isUserSelected={this.state.isUserSelected}
        selectedUser={this.state.selectedUser}
        />
      );

      case 'welcome': return (
        <TheWelcomePage 
        setPage={this.setPage} 
        loggedIn={this.state.loggedIn}
        handleLogout={this.handleLogout}
        user={this.state.user} 
        message={this.state.message}
        />
      );
      case 'home':  return (
        <TheHomePage
        ref={this.theHomePageRef}
        posts={this.state.posts} 
        goToPostPage={this.goToPostPage} 
        communities={this.state.communities} 
        comments={this.state.comments} 
        linkFlairs={this.state.linkFlairs}
        setPage={this.setPage}
        handleOrderButtonClick={this.handleOrderButtonClick}
        loggedIn={this.state.loggedIn}
        user={this.state.user} 
        userInfo={this.state.userInfo}
        />
      );
      case 'NewCommunityPageView': return (
        <NewCommunityPageView 
        communities={this.state.communities} 
        setCommunities={this.setCommunities}
        setPage={this.setPage}
        loggedIn={this.state.loggedIn}
        userInfo={this.state.userInfo}
        editCom={this.state.comUser}
        selectedUser={this.state.selectedUser}
        handleButtonChange={this.handleButtonChange}
        />
      );
      case 'NewPostPageView': return (
        <NewPostPageView
        communities={this.state.communities}
        setCommunities={this.setCommunities}
        linkFlairs={this.state.linkFlairs}
        setLinkFlairs={this.setLinkFlairs}
        posts={this.state.posts}
        setPosts={this.setPosts}
        setPage={this.setPage}
        loggedIn={this.state.loggedIn}
        userInfo={this.state.userInfo}
        editPost={this.state.postUser}
        selectedUser={this.state.selectedUser}
        handleButtonChange={this.handleButtonChange}
        />
      );
      case 'community': return(
        <TheCommunityPage
        community={this.state.selectedCommunity}
        posts={this.state.posts} 
        communities={this.state.communities} 
        comments={this.state.comments} 
        linkFlairs={this.state.linkFlairs}
        goToPostPage={this.goToPostPage}
        handleOrderButtonClick={this.handleOrderButtonClick}
        loggedIn={this.state.loggedIn}
        user={this.state.user} 
        userInfo={this.state.userInfo}
        setCommunities={this.setCommunities}
        setPage={this.setPage}
        goToCommunityPage={this.goToCommunityPage}
        />
      );
      case 'post' : return (
        <ThePostPage 
        posts={this.state.posts}
        post={this.state.selectedPost} 
        communities={this.state.communities} 
        comments={this.state.comments} 
        linkFlairs={this.state.linkFlairs}
        setPage={this.setPage}
        setCommentOrReply={this.setCommentOrReply}
        setCommentOrReplyParentID={this.setCommentOrReplyParentID}
        loggedIn={this.state.loggedIn}
        userInfo={this.state.userInfo}
        />
      );
      case 'search' : return(
        <TheSearchResultsPage 
        posts={this.state.posts} 
        txtInput={this.state.txtInput} 
        goToPostPage={this.goToPostPage} 
        communities={this.state.communities} 
        comments={this.state.comments} 
        linkFlairs={this.state.linkFlairs}
        handleOrderButtonClick={this.handleOrderButtonClick}
        loggedIn={this.state.loggedIn}
        user={this.state.user} 
        userInfo={this.state.userInfo}
        />
      );
      case "NewCommentPageView": return(
        <NewCommentPageView
        posts={this.state.posts}
        setPosts={this.setPosts}
        comments={this.state.comments}
        setComments={this.setComments}
        setPage={this.setPage}
        commentOrReply={this.state.commentOrReply}
        setCommentOrReply={this.setCommentOrReply}
        commentOrReplyParentID={this.state.commentOrReplyParentID}
        setCommentOrReplyParentID={this.setCommentOrReplyParentID}
        loggedIn={this.state.loggedIn}
        userInfo={this.state.userInfo}
        editComment={this.state.comUser}
        selectedUser={this.state.selectedUser}
        handleButtonChange={this.handleButtonChange}
        />
      );
      case "welcome": return( 
        <TheWelcomePage
        setPage={this.setPage}
        />
      );
      case "register": return(
        <TheRegisterPage
        setPage={this.setPage}
        />
      );
      case 'login': return (
        <TheLoginPage 
        setPage={this.setPage}
        />
      );
      default: return (
        <TheWelcomePage 
        setPage={this.setPage} 
        loggedIn={this.state.loggedIn}
        handleLogout={this.handleLogout}
        user={this.state.user} 
        message={this.state.message}
        />
      );
    }
  }
  
  render(){
    const {page, loggedIn, user, userInfo} = this.state;


    const showHeaderAndNavBar = page !== 'welcome' && page !== 'register' && page !== 'login';

    return (
      <div>
        {showHeaderAndNavBar && (
          <TheBanner
            goToHomePage={this.goToHomePage}
            goToSearchResultsPage={this.goToSearchResultsPage}
            goToNewPostPageView={this.goToNewPostPageView}
            page={page}
            user={user}
            loggedIn={loggedIn}
            handleLogout={this.handleLogout}
            setPage={this.setPage}
            userInfo={userInfo}
          />
        )}
        <div id="body">
          {showHeaderAndNavBar && (
            <NavBar
              page={page}
              selectedCommunity={this.state.selectedCommunity}
              goToHomePage={this.goToHomePage}
              goToCommunityPage={this.goToCommunityPage}
              communities={this.state.communities}
              setPage={this.setPage}
              loggedIn={loggedIn}
              userInfo={userInfo}
              setCommunities={this.setCommunities}
            />
          )}
          {this.changeMainContent()}
        </div>
      </div>
    );
  }
}
