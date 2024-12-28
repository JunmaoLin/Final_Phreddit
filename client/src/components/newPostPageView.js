import '../stylesheets/newPostPageView.css';
import React, { useState } from 'react';
import axios from 'axios';

export default function NewPostPageView({communities, setCommunities, linkFlairs, setLinkFlairs, posts, setPosts, setPage, loggedIn, userInfo, editPost, selectedUser, handleButtonChange}){

    const initialCommunitySelection = editPost
    ? communities.find((community) =>
          community.postIDs.includes(editPost._id)
      )?.name || ''
    : '';

    const [formData, setFormData] = useState({
        communitySelection: initialCommunitySelection,
        postTitle: editPost?.title || '',
        linkFlair: editPost?.linkFlairID || '',
        postText: editPost?.content || '',
        creatorUsername: editPost?.postedBy || userInfo[0],
        createNewLinkFlair: '',
    });
    console.log("communities", communities)
    console.log("EDIT POST", editPost)

    const [errors, setErrors] = useState({
        communitySelection: '',
        postTitle: '',
        linkFlair: '',
        postText: '',
        // creatorUsername: '',
        createNewLinkFlair: '',
    });

    const handleInputChange = (e) => { 
        const { id, value } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [id]: value,
        }));

        //console.log("ID", id)
        if(id === 'linkFlair'){
            setErrors((prevErrors) => ({
                ...prevErrors,
                createNewLinkFlair: ''
            }));
        }
    };

    const validateForm = () => {
        //const newErrors = { communitySelection: '', postTitle: '', linkFlair: '', postText: '', creatorUsername: '', createNewLinkFlair: '' };
        const newErrors = { communitySelection: '', postTitle: '', linkFlair: '', postText: '', createNewLinkFlair: '' };
        let isValid = true;
    
        // Add validation logic
        if (!formData.communitySelection) {
          newErrors.communitySelection = 'Please select a community.';
          isValid = false;
        }
        if (!formData.postTitle || formData.postTitle.length > 100) {
          newErrors.postTitle = 'Post title should be between 0 - 100 characters.';
          isValid = false;
        }
        if (!formData.postText) {
          newErrors.postText = 'Post content cannot be empty.';
          isValid = false;
        }
        if ((formData.linkFlair === "CREATE_NEW_LINK_FLAIR" && !formData.createNewLinkFlair) || formData.createNewLinkFlair.length > 30) {
          newErrors.createNewLinkFlair = 'Link Flair should be between 0 - 30 characters.';
          isValid = false;
        }
        // if (!formData.creatorUsername) {
        //     newErrors.creatorUsername = 'Username is required.';
        //     isValid = false;
        // }
        if(!loggedIn){
            alert("You must be logged in to create a post.");
            isValid = false;
        }
        // else{
        //     console.log("userInfo", userInfo[0]);
        //     setFormData({...formData, creatorUsername: userInfo[0]});
        // }
    
        setErrors(newErrors);
        return isValid;
    };

    const submitForm = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        //pass in linkFlairID
        let linkFlairID = formData.linkFlair;
        //console.log(formData);

        if (formData.linkFlair === "CREATE_NEW_LINK_FLAIR" && formData.createNewLinkFlair) {
            const newLinkFlair = { 
                content: formData.createNewLinkFlair,
            };

            try{
                const response = await axios.post('http://localhost:8000/createNewLinkFlair', newLinkFlair);
                newLinkFlair.linkFlairID = response.data._id;
                linkFlairID = newLinkFlair.linkFlairID;
                setLinkFlairs([...linkFlairs, response.data]);
            }
            catch (error) {
                console.log("Failed to submit link flair. Please try again.");
            }
        }

        

        const newPost = {  
            title: formData.postTitle,
            content: formData.postText,
            linkFlairID: linkFlairID,
            postedBy: formData.creatorUsername,
            postedDate: editPost?.postedDate || new Date(), 
            commentIDs: editPost?.commentIDs || [],
            views: editPost?.views || 0,
        };

        try{
            if (editPost) {
                const editResponse = await axios.post(`http://localhost:8000/posts/edit/${editPost._id}`, newPost);
                console.log("BEFORE EDIT:", posts)
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post._id === editPost._id ? { ...post, ...editResponse.data.post } : post
                    )
                );
                console.log("AFTER EDIT:", posts)
                alert("Post updated successfully!");
                e.stopPropagation();
                setPage('userProf', null, selectedUser, 'posts');
                //handleButtonChange('posts', selectedUser);
            } else {
                const response = await axios.post('http://localhost:8000/createNewPost', newPost);

                newPost._id = response.data._id;
                setPosts([...posts, response.data]);//update post array

                // need to update it on the server side
                //console.log("new post id", newPost._id);
                for(const community of communities) {
                    //console.log(community.postIDs);
                    if (community.name === formData.communitySelection) {
                        community.postIDs.push(newPost._id);
                        //console.log("AFTER", community.postIDs);
                        // console.log("Community ID:", community._id);
                        // console.log("Community ID:", newPost._id);
                        try{
                            await axios.post(`http://localhost:8000/communities/updateCommunityPostIDs/${community._id}`, community);
                        }
                        catch (error) {
                            console.log("Failed to update community postIDs array. Please try again.");
                        }
                    }//update community postIDs array
                };
            
                // Clear form after submission
                setFormData({
                    communitySelection: '',
                    postTitle: '',
                    linkFlair: '',
                    postText: '',
                    creatorUsername: '',
                    createNewLinkFlair: '',
                });
                alert("Post submitted successfully!");
                setPage('home');
            }
        }
        catch (error) {
            console.log("Failed to submit post. Please try again.");
        }
    };

    const cancelButton = (e) =>{
        e.preventDefault();
        setFormData({
            communitySelection: '',
            postTitle: '',
            linkFlair: '',
            postText: '',
            creatorUsername: '',
            createNewLinkFlair: '',
        });
        //setPage('home');
        if(editPost){
            e.stopPropagation();
            setPage('userProf', null, selectedUser, 'posts');
            //handleButtonChange('posts', selectedUser);
        }
        else{
            setPage('home');
        }
    };
    return (
        <div id="newPostPageViewDiv" className="main_cont_divs">
            <div id="create_post_div">
                {editPost ? (<h2 id="createPostHTag">Edit Post</h2>) : (<h2 id="createPostHTag">Create Post</h2>)}
                {/* <h2 id="createPostHTag">Create Post</h2> */}
            </div>
        
            <form onSubmit={submitForm}>
                {/* This is the drop down menu */}
                <div id="create_post_drop_down_div" className="postDivs">
                    <label htmlFor="communitySelection"><b>Community Selection<span className="requiredIndicator">*</span></b></label>
                    <select disabled={editPost}
                    id="communitySelection" className="selectDropdown" value={formData.communitySelection} onChange={handleInputChange} noValidate>
                        <option key="" value="" disabled>Select Community</option>
                        {communities.map((community) => {//value will indicate community name
                            //console.log('Community ID:', community.name)
                            return (<option key={community._id} value={community.name} className="postBarElement">
                                {community.name}
                            </option>
                        )})}
                    </select>
                    <div className="error-message">{errors.communitySelection}</div>
                </div>
    
                {/* This is the post title input */}
                <div id="post_title_div" className="postDivs">
                    <label htmlFor="postTitle"><b>Post Title<span className="requiredIndicator">*</span></b></label>
                    <input type="text" maxLength="100" placeholder="Enter Post Title" id="postTitle" className="postInputBox" value={formData.postTitle} onChange={handleInputChange} noValidate/>
                    <div className="error-message">{errors.postTitle}</div>
                </div>
                        
                {/* This is the link flair selection menu */}
                <div id="link_flair_selection" className="postDivs">
                    <label htmlFor="linkFlair"><b>Link Flair Selection</b></label>
                    <div id="linkFlairDropdownAndInput">
                        <select id="linkFlair" className="selectDropdown" value={formData.linkFlair} onChange={handleInputChange}>
                            <option key="" value="">Select Link Flair</option>
                            {linkFlairs.map((linkFlair) => (//value will indicate linkFlair content
                                <option key={linkFlair._id} value={linkFlair._id} className="postBarElement">
                                {linkFlair.content}
                                </option>
                            ))}
                            <option key="CREATE_NEW_LINK_FLAIR" value="CREATE_NEW_LINK_FLAIR" className="navBarElement">CREATE NEW LINK FLAIR</option>
        
                        </select>
                        {formData.linkFlair === "CREATE_NEW_LINK_FLAIR" ? (
                            <input 
                                type="text" 
                                maxLength="30" 
                                placeholder="Enter New Link Flair" 
                                id="createNewLinkFlair" 
                                className="postInputBox" 
                                value={formData.createNewLinkFlair} 
                                onChange={handleInputChange} 
                            />
                        ) : null}
                        <div id="linkFlairInputError" className="error-message">{errors.createNewLinkFlair}</div>
                    </div>
                </div>
    
                {/* This is the post text input box */}
                <div id="post_text_div" className="postDivs">
                    <label htmlFor="postText"><b>Post Text<span className="requiredIndicator">*</span></b></label>
                    <textarea placeholder="Enter Post Text" id="postText" className="postInputBox" value={formData.postText} onChange={handleInputChange} noValidate/>
                    <div className="error-message">{errors.postText}</div>
                </div>
    
                {/* This is the creator username input box */}
                {/* <div id="post_user_div" className="postDivs">
                <label htmlFor="creatorUsername"><b>Content Creator Name<span className="requiredIndicator">*</span></b></label>
                <input type="text" placeholder="Enter Username" id="creatorUsername" className="postInputBox" value={formData.creatorUsername} onChange={handleInputChange} noValidate/>
                    <div className="error-message">{errors.creatorUsername}</div>
                </div> */}
    
                <div id="post_button_div">
                    <button type="submit" id="submitPostFormButton">Submit Post</button>
                    <button type="cancel" id="cancelPostFormButton" onClick={cancelButton}>Cancel</button>
                </div>
            </form>
        </div>
    );
};
//export default NewPostPageView;