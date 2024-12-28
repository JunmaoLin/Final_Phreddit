import React, { useState } from 'react';
import '../stylesheets/banner.css';

export default class TheBanner extends React.Component {
    constructor(props){
        super(props);
        this.state = {searchText: ''};

        this.handleSearch = this.handleSearch.bind(this);
        this.setText = this.setText.bind(this);
    }

    setText(value){
        this.setState({searchText: value});
    }

    handleSearch(e){
        if (e.key === 'Enter') {
            //console.log("THE PERSON PRESSED ENTER", this.props);
            this.props.goToSearchResultsPage(this.state.searchText);
        }
    }
    
  render(){
    //console.log(this.props);
    return (
        <div id="bannerDiv">
            <PhredditLogo 
            loggedIn={this.props.loggedIn} 
            // goToHomePage={this.props.goToHomePage} 
            setPage={this.props.setPage} />
            <SearchBar searchText={this.state.searchText} setText={this.setText} handleSearch={this.handleSearch}/>
            <CreatePost 
                goToNewPostPageView={this.props.goToNewPostPageView} 
                page={this.props.page} 
                loggedIn={this.props.loggedIn} 
                handleLogout={this.props.handleLogout}
            />
            <UserProfileButton user={this.props.user} loggedIn={this.props.loggedIn} userInfo={this.props.userInfo} setPage={this.props.setPage}/>
            {this.props.loggedIn && (
                <LogoutButton handleLogout={this.props.handleLogout} setPage={this.props.setPage} />
            )}
        </div>
    );
    }
}

function PhredditLogo(props){
    return(
        <div id="phredditDiv" onClick={() => props.setPage('welcome')}>
            <div id="phredditATage" className="goToHomePage">
            <h3 id="phredditLogo">phreddit</h3>
            </div>
        </div>
    );
}

function SearchBar(props){
    return(
        <div id="searchBarDiv">
            <input 
            id="searchBar" 
            type="text" 
            placeholder="Search Phreddit..."
            value={props.searchText}
            onChange={(e) => props.setText(e.target.value)}
            onKeyDown={props.handleSearch}> 
            </input>
        </div>
    );
}

function CreatePost(props){
    const cssStyling = {
        backgroundColor: props.page === "NewPostPageView" ? "rgb(255, 69, 1)" : "grey",
        color: "white",
        borderRadius: "24px",
        border: "none",
        width: "80px",
        height: "40px",
        fontSize: "15px",
        cursor: "not-allowed",
    }

    const onHovered = {
        backgroundColor: "rgb(255, 69, 1)",
        cursor: "pointer",
    }

    const [isHovered, setIsHovered] = useState(false);

    return(
        <div id="createPostDiv">
            <button 
                id="createPostButton" 
                type="button" 
                disabled={!props.loggedIn}
                onClick={() => props.loggedIn && props.goToNewPostPageView()}
                style={{
                    ...cssStyling,
                    ...(isHovered ? onHovered : {}),
                }}
                onMouseEnter={() => props.loggedIn && setIsHovered(true)}
                onMouseLeave={() => props.loggedIn && setIsHovered(false)}
            >Create Post
            </button>
        </div>
    );
}

function UserProfileButton(props) {
    const displayName = props.loggedIn ? props.userInfo[0].length > 7 
      ? `${props.userInfo[0].substring(0, 7)}...` 
      : props.userInfo[0]
    : "Guest";
    return (
        <div id="userProfileDiv">
            <button id="userProfileButton" disabled={!(props.loggedIn)} onClick={()=> props.setPage('userProf')}>
                {displayName}
            </button>
        </div>
    );
}

function LogoutButton(props) {
    return (
        <div id="logoutDiv">
            <button
                id="logoutButton"
                type="button"
                onClick={() => {
                    props.handleLogout();
                }}
            >
                Log Out
            </button>
        </div>
    );
}