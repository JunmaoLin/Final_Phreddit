import React from 'react';
import {PostSection, InfoSection, getTotalComments, getCommunity, ButtonDisplay, orderNewest} from './homePage.js';
import '../stylesheets/communityPage.css'
import axios from 'axios';


export default class TheCommunityPage extends React.Component{
    constructor(props){
      super(props);
      this.state = {
        order: orderNewest,
        isMember: false,
        memberCount: null,
      };

      this.updateOrder = this.updateOrder.bind(this);
      this.handleJoinLeave = this.handleJoinLeave.bind(this);
    }

    sortCommunitiesByMembership(user, communities) {
      const sortedCommunities = [...communities].sort((a, b) => {
        const aIsMember = a.members.includes(user);
        const bIsMember = b.members.includes(user);
        // Prioritize communities the user has joined
        if (aIsMember && !bIsMember) return -1; // a should come first
        if (!aIsMember && bIsMember) return 1;  // b should come first
        return a.name.localeCompare(b.name);  // Sort alphabetically if both are same status
      });
      return sortedCommunities;
    }

    async handleJoinLeave(goToCommunityPage, memberCount, setMemberCount) {
      const { community, communities } = this.props;
      const comName = communities.find((com) => com.name === community);
      const { isMember } = this.state;
  
      if (isMember) {
        // Handle leaving the community
        try {
          await axios.post(`http://localhost:8000/leaveCommunity`, { communityId: comName._id }, { withCredentials: true });
          this.setState({ isMember: false });
          setMemberCount(memberCount - 1);
          alert('You have left the community.');
        } catch (error) {
          console.error('Error leaving community:', error);
          alert('Failed to leave the community. Please try again.');
        }
      } else {
        // Handle joining the community
        try {
          await axios.post(`http://localhost:8000/joinCommunity`, { communityId: comName._id }, { withCredentials: true });
          this.setState({ isMember: true });
          setMemberCount(memberCount + 1);
          alert('You have joined the community.');
        } catch (error) {
          console.error('Error joining community:', error);
          alert('Failed to join the community. Please try again.');
        }
      }
      
      goToCommunityPage(comName.name);
    }

    async componentDidMount() {
      const { community, communities, loggedIn, userInfo } = this.props;
      console.log(community);
      const comName = communities.find((com) => com.name === community);
      console.log(comName)
      if (loggedIn) {
        const displayName = userInfo[0];
        const comID = comName._id
        try {
          const response = await axios.get(`http://localhost:8000/checkMembership`, {
            params: { communityId: comID, displayName: displayName }, withCredentials: true,});
          console.log("IS IT A MEMBER?", response.data)
          this.setState({ isMember: response.data.isMember });
        } catch (error) {
          console.error('Error checking membership:', error);
        }
      }
    }

    async componentDidUpdate(prevProps) {
      console.log("THIS IS PREV PROPS", prevProps)
      const { community, communities, loggedIn, userInfo } = this.props;
      console.log(community);
      if (community !== prevProps.community) {
        const comName = communities.find((com) => com.name === community);
        if (loggedIn) {
          const displayName = userInfo[0];
          const comID = comName._id
          try {
            const response = await axios.get(`http://localhost:8000/checkMembership`, {
              params: { communityId: comID, displayName: displayName }, withCredentials: true,});
            console.log("IS IT A MEMBER?", response.data)
            this.setState({ isMember: response.data.isMember });
          } catch (error) {
            console.error('Error checking membership:', error);
          }
        }
      }
    }

    updateOrder(newOrder){
      //console.log("UPDATING ORDER");
      this.setState({order: newOrder})
    }

    setMemberCount = (count) => {
      this.setState({ memberCount: count });
    }

    render(){
      const {community, communities, posts, comments, linkFlairs, goToPostPage, handleOrderButtonClick, loggedIn, userInfo, goToCommunityPage} = this.props;
      //const { isMember } = this.state;
      const { isMember, memberCount } = this.state;
      console.log("COMMUNITY PROPS", this.props);
      //console.log(comName);
      console.log("am i logggggged in?", loggedIn);
      const filtered = filterPosts('community', community, posts, communities, comments);
      //console.log("FILTERED POSTS", filtered)
      return(
        <div id="homePage" className="main_cont_divs">
          <CommunityPageHeader 
            comName={community} 
            communities={communities} 
            handleOrderButtonClick={handleOrderButtonClick} 
            updateOrder={this.updateOrder}
            loggedIn={loggedIn}
            userInfo={userInfo}
            memberCount={memberCount}
            setMemberCount={this.setMemberCount}
          />

          {loggedIn && (
          <div className="communityActions">
            <button onClick={() => this.handleJoinLeave(goToCommunityPage, memberCount, this.setMemberCount)} className="joinLeaveButton">
              {isMember ? 'Leave Community' : 'Join Community'}
            </button>
          </div>
          )}
          <div className='communityPosts'>
            <PostSection 
              page={'community'} 
              posts={filtered} 
              comments={comments} 
              linkFlairs={linkFlairs} 
              communities={communities} 
              order={this.state.order} 
              goToPostPage={goToPostPage}
              loggedIn={loggedIn}
              userInfo={userInfo}
            />
          </div>
        </div>
      );
    }
}

class CommunityPageHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // memberCount: null,
      createdBy: ''
    };
  }

  

  async fetchMemberCount(community) {
    try {
      const response = await axios.get(`http://localhost:8000/communityInformation/${community._id}`);
      console.log(response.data)
      this.props.setMemberCount(response.data.memberCount);
      this.setState({createdBy: response.data.createdBy});
    } catch (error) {
      console.log("No community found");
    }
  }

  componentDidMount() {
    const { communities, comName } = this.props;
    const community = communities.find((community) => community.name === comName);

    if (community) {
      this.fetchMemberCount(community);
    }
  }

  componentDidUpdate(prevProps) {
    const { communities, comName } = this.props;
    if (comName !== prevProps.comName) {
      const community = communities.find((community) => community.name === comName);
      if (community) {
        this.fetchMemberCount(community);
      }
    }
  }

  render() {
    const { communities, comName, updateOrder, handleOrderButtonClick  } = this.props;
    const community = communities.find((community) => community.name === comName);

    if (!community) return null;
    const {createdBy } = this.state;
    const {memberCount} = this.props
    const startDate = community.startDate;
    const comPostCount = community.postIDs.length;
    console.log("logggggedin???????", this.props.loggedIn);
    return (
      <div id="header">
        <InfoSection 
          page={'community'}
          startDate={startDate}
          comName={comName}
          memberCount={memberCount} // Using memberCount from state
          setMemberCount={this.props.setMemberCount}
          createdBy={createdBy}
          description={community.description}
          comPostCount={comPostCount}
          loggedIn={this.props.loggedIn}
          userInfo={this.props.userInfo}
        />
        <ButtonDisplay handleOrderButtonClick={handleOrderButtonClick} updateOrder={updateOrder} />
      </div>
    );
  }
}


export function filterPosts(page, comName, posts, communities, comments){
  //console.log("CHECKING THE POSTS", posts);
  let filter = [...posts];
  //console.log(filter);
  if(page === "community"){
    filter = filter.filter(function(element){
      // console.log("ELEMENT", element);
      // console.log(getCommunity(element._id, communities));
      return getCommunity(element._id, communities) === comName;
    });
  }

  if(page === "search"){
    filter = new Set();
    
    for(let i = 0; i < comName.length; i++){
      for(let j = 0; j < posts.length; j++){ 
        let commentArray = getTotalComments(posts[j], comments);
        for(const x of commentArray){
          if(x.content.toLowerCase().includes(comName[i])){
            filter.add(posts[j]);
          }
        }
        
        if(posts[j].title.toLowerCase().includes(comName[i])){
          filter.add(posts[j]);
        }
        else if(posts[j].content.toLowerCase().includes(comName[i])){
          filter.add(posts[j]);
        }
      }
    }
  }
  //console.log(filter);
  return filter;
}