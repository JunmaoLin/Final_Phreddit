import React from 'react';
import {PostSection, InfoSection, ButtonDisplay, orderNewest, PostCount} from './homePage.js';
import noSearchIcon from '../images/no-search-result-icon.svg'
import { filterPosts } from './communityPage.js';

//console.log("IN THE SEARCH PAGE NOW");


export default class TheSearchResultsPage extends React.Component{
    constructor(props){
        super(props);
        this.state = {order: orderNewest};

        this.updateOrder = this.updateOrder.bind(this);
    }

    updateOrder(newOrder){
        //console.log("UPDATING ORDER");
        this.setState({order: newOrder})
    }


    render(){
        const {txtInput, goToPostPage, posts, communities,  comments, linkFlairs, handleOrderButtonClick, loggedIn, userInfo } = this.props;
        //console.log("this is search text input", txtInput);
        const wordArray = txtInput.trim().toLowerCase().split(" ");
        //console.log(wordArray);
        const filtered = Array.from(filterPosts('search', wordArray, posts, communities,  comments, linkFlairs));

        let userCommunityPosts = [];
        let otherCommunityPosts = filtered;

        if (loggedIn) {
            const userCommunities = communities.filter((community) =>
                community.members.includes(userInfo[0])
            );

            userCommunityPosts = filtered.filter((post) =>
                userCommunities.some((community) => community.postIDs.includes(post._id))
            );

            otherCommunityPosts = filtered.filter(
                (post) => !userCommunityPosts.some((userPost) => userPost._id === post._id)
            );
        }

        const noPostsFound = userCommunityPosts.length === 0 && otherCommunityPosts.length === 0;

        //console.log("FILTERED", Array.from(filtered));
        return(
            <div id="homePage" className="main_cont_divs">
                <SearchResultPageHeader txtInput={txtInput} posts={filtered} handleOrderButtonClick={handleOrderButtonClick}  updateOrder={this.updateOrder}/>
                <div id="totalPostDiv">
                    <PostCount arrayLength = {filtered.length}/><span id="spanSpacing"> </span><p>Total</p>
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
                            comments={comments} 
                            linkFlairs={linkFlairs} 
                            communities={communities} 
                            order={this.state.order} 
                            goToPostPage={goToPostPage}
                            page={'home'}
                            loggedIn={loggedIn}
                        />
                    </>
                )}
                {!noPostsFound && (
                    <>
                    <h3>{loggedIn ? "Other Communities" : "All Communities"}</h3>
                        <PostSection
                            posts={otherCommunityPosts}
                            comments={comments} 
                            linkFlairs={linkFlairs} 
                            communities={communities} 
                            order={this.state.order} 
                            goToPostPage={goToPostPage}
                            page={'home'}
                            loggedIn={loggedIn}
                        />
                    </>
                )}
            </div>
        );
    }
}

class SearchResultPageHeader extends React.Component{
    render(){
        
        return(
            <div id="header">
                <InfoSection
                    txtInput={this.props.txtInput}
                    page={'search'}
                    posts={this.props.posts}
                />
                <ButtonDisplay
                    handleOrderButtonClick={this.props.handleOrderButtonClick} 
                    updateOrder={this.props.updateOrder}
                />
            </div>
        );
    }
}