import '../stylesheets/navBar.css';
import React, { useState } from 'react';


export default function NavBar({page, communities, setPage, goToHomePage, goToCommunityPage, selectedCommunity, loggedIn, userInfo, setCommunities}) {
    const displayName = loggedIn ? userInfo[0] : "Guest";
    let sortedCommunities = sortCommunitiesByMembership(displayName, communities, setCommunities);
    return (
        <div id="navBarDiv">
            <Home goToHomePage={goToHomePage} page={page}/>
            <CommunitiesHeader/>
            <CreateCommunity setPage={setPage} page={page} loggedIn={loggedIn}/>
            <ListsOfCommunities page={page} selectedCommunity={selectedCommunity} communities={communities} goToCommunityPage={goToCommunityPage} loggedIn={loggedIn} userInfo={userInfo} sortCommunitiesByMembership={sortedCommunities} setCommunities={setCommunities}/>
        </div>
    );
}

function Home({goToHomePage, page}){
    const cssStyling = {
        backgroundColor: page === 'home' ? "rgb(255, 69, 1)" : "lightgrey",
        textDecoration: "none",
        color: "black",
        fontSize: "20px",
        width: "200px",
        height: "32px",
        textAlign: "center",
        paddingTop: "4px",
        cursor: "pointer",
    };

    const onHovered = {
        backgroundColor: "rgb(255, 69, 1)",
    }

    const [isHovered, setIsHovered] = useState(false);

    return(
        <div id="homeDiv" className="navBarElement" onClick={() => goToHomePage()}>
        <div
            id="homeATag"
            style = {{
                ...cssStyling,
                ...(isHovered ? onHovered : {}),
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >Home
        </div>
      </div>
    );
}

function CommunitiesHeader(){
    return(
        <div id="communitiesHeader" className="navBarElement">
            <header>Communities</header>
        </div>
    );
}

function CreateCommunity({setPage, page, loggedIn}){
    //console.log(setPage);
    const buttonStyle = {
        backgroundColor: page === "NewCommunityPageView" ? "rgb(255, 69, 1)" : "grey", // Change background based on page
        color: "white", 
        border: "none", 
        borderRadius: "24px", 
        cursor: "not-allowed", 
        width: "200px",
        height: "32px",
        fontSize: "14px",
    };

    // Define hover style
    const hoverStyle = {
        backgroundColor: "rgb(255, 69, 1)", // Change background on hover
        cursor: "pointer", 
    };

    const [isHovered, setIsHovered] = useState(false);

    return(
        <div id="createCommunityDiv" className="navBarElement">
            <button 
                id="createCommunityButton" 
                type="button" 
                disabled={!loggedIn}
                style={{
                    ...buttonStyle,
                    ...(isHovered ? hoverStyle : {}), // Apply hover style if hovered
                }}
                onMouseEnter={() => setIsHovered(true)} // Set hover state
                onMouseLeave={() => setIsHovered(false)} // Reset hover state
                onClick={() => setPage("NewCommunityPageView")}
            >Create Community
            </button>
        </div>
    );
}   

function sortCommunitiesByMembership(user, communities, setCommunities) {
    return communities.sort((a, b) => {
        const aIsMember = a.members.includes(user);
        const bIsMember = b.members.includes(user);

        // Prioritize communities the user has joined
        if (aIsMember && !bIsMember) return -1; // a should come first
        if (!aIsMember && bIsMember) return 1;  // b should come first
        return a.name.localeCompare(b.name);  // Sort alphabetically if both are same status
    });
}

function ListsOfCommunities({communities, goToCommunityPage, selectedCommunity, page, loggedIn, userInfo, sortCommunitiesByMembership, setCommunities}) {
    // const displayName = loggedIn ? userInfo[0] : "Guest";
    // let sortedCommunitites = sortCommunitiesByMembership(displayName);

    const handleCommunityClick = (community) => {
        // setSelectedCommunity(community);
        goToCommunityPage(community.name);
    };

    const cssStyling = (community) => {
        return{
            backgroundColor: community.name === selectedCommunity && page === "community"? "rgb(255, 208, 105)" : "white",
            cursor: "pointer",
        }
    };

    const whenHovered ={
        backgroundColor: "rgb(255, 208, 105)",
    }

    const [hoveredCommunity, setHoveredCommunity] = useState(null);

    return (
        <div id="communitiesList" className="navBarCommunityElement">
            {sortCommunitiesByMembership.map((community) => (
                <div key={community.name} className="navBarElement">
                    <div
                        className="link"
                        style={{
                            ...cssStyling(community),
                            ...(hoveredCommunity === community.name ? whenHovered : {}),
                        }}
                        onMouseEnter={() => setHoveredCommunity(community.name)} // Set the hovered community
                        onMouseLeave={() => setHoveredCommunity(null)}
                        onClick={() => {
                            handleCommunityClick(community)
                            //goToCommunityPage(community.name)
                        }}
                    >
                        {community.name}
                        {/* {console.log("this is if SELECTED IS COMMUNITY", selectedCommunity, community,  selectedCommunity === community)} */}
                    </div>
                </div>
            ))}
        </div>
    );
}
export { ListsOfCommunities };