import '../stylesheets/newCommunityPageView.css';
import React, { useState } from 'react';
import axios from 'axios';

export default function NewCommunityPageView({communities, setCommunities, setPage, loggedIn, userInfo, editCom, selectedUser, handleButtonChange}) {
    console.log(editCom)
    const [formData, setFormData] = useState({
        communityName: editCom?.name || '',
        description: editCom?.description || '',
        username: userInfo[0],
    });
    const [errors, setErrors] = useState({
        communityName: '',
        description: '',
        // username: ''
    });
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,  
            [id]: value   
        });
    };
    const validateForm = () => {
        //const newErrors = { communityName: '', description: '', username: '' };
        const newErrors = { communityName: '', description: ''};
        let isValid = true;

        const exist = communities.some(community => community.name.trim().toLowerCase() === formData.communityName.trim().toLowerCase());

        if(exist && !editCom){
            newErrors.communityName = "Community name already exists. Please choose a different name.";
            isValid = false;
        }
        else if (formData.communityName === "" || formData.communityName.length > 100) {
            newErrors.communityName = "Community name should be between 0 - 100 characters.";
            isValid = false;
        }

        if (formData.description === "" || formData.description.length > 500) {
            newErrors.description = "Description should be between 0 - 500 characters.";
            isValid = false;
        }

        if(!loggedIn){
            alert("You must be logged in to create a community.");
            isValid = false;
        }
        // else{
        //     console.log("userInfo", userInfo[0]);
        //     const updatedFormData = { ...formData, username: userInfo[0] };
        //     setFormData(updatedFormData);
        // }
        // if (formData.username === "") {
        //     newErrors.username = 'Username is required.';
        //     isValid = false;
        //     alert("You must be logged in to create a community");
        // }

        setErrors(newErrors);
        return isValid;
    };

    const SubmitCommunityFormButton = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        //console.log("createdby:", formData.username);
        const newCommunity = {
            name: formData.communityName,   //name from form
            description: formData.description, //description from form
            members: editCom ? editCom.members : [formData.username], // Keep existing members for edits
            createdBy: editCom ? editCom.createdBy : formData.username,
            postIDs: editCom ? editCom.postIDs : [],
            startDate: editCom ? editCom.startDate : new Date(),
            // not needed
            //memberCount: 1, 
        };


        try{
            if (editCom) {
                const editResponse = await axios.post(`http://localhost:8000/communities/edit/${editCom._id}`, newCommunity);
                console.log(editResponse.data)
                // const updatedCommunities = communities.map((community) =>
                //     community._id === editCom._id ? { ...community, ...editResponse.data } : community
                // );
                
                // console.log("Updated communities array:", updatedCommunities);
                // setCommunities(updatedCommunities); // Directly set the new array

                setCommunities((prevCommunities) => {
                    console.log("Previous Communities in Callback:", prevCommunities);
                    const updated = prevCommunities.map((community) =>
                        community._id === editCom._id ? { ...community, ...newCommunity } : community
                    );
                    console.log("Updated Communities in Callback:", updated);
                    return updated;
                });
            
                alert("Community updated successfully!");
                e.stopPropagation();
                setPage('userProf', null, selectedUser, 'communities');
                //handleButtonChange('communities', selectedUser);
            }
            else{
                console.log("SENDING THIS TO GET CREATED", newCommunity)
                const response = await axios.post('http://localhost:8000/createNewCommunity', newCommunity);
                
                //update state for rerendering
                newCommunity.communityID = response.data._id;
                setCommunities([...communities, response.data]);
            

                //clear form
                setFormData({
                    communityName: '',
                    description: '',
                    username: ''
                });

                alert("Community created successfully!");
                setPage('community', newCommunity.name);
            }
        }
        catch (error){
            console.error("Error creating community:", error);
        }
    };

    const cancelButton = (e) =>{
        e.preventDefault();
        setFormData({
            communityName: '',
            description: '',
            username: ''
        });
        //setPage('home');
        if(editCom){
            e.stopPropagation();
            setPage('userProf', null, selectedUser, 'communities');
            //handleButtonChange('communities', selectedUser);
        }
        else{
            setPage('home');
        }
    };

    return(
        <div id="CreateCommunityDiv" className="main_cont_divs">
            <form id="communityFormContainer" onSubmit={SubmitCommunityFormButton}>
                {editCom ? (<h2 id="communityFormHeader">Edit your community</h2>) : (<h2 id="communityFormHeader">Tell us about your community</h2>)}
                {/* <h2 id="communityFormHeader">Tell us about your community</h2> */}
                <p id="communityFormDescription">A name and description help people understand what your community is all about</p>
                
                <label htmlFor="communityName"><b>Community Name<span className="requiredIndicator">*</span></b></label>
                <input
                    type="text"
                    maxLength="100"
                    placeholder="Enter Community Name"
                    id="communityName"
                    className="communityInputBox"
                    value={formData.communityName}
                    onChange={handleInputChange}
                    noValidate
                />
                <div id="community_name_error" className="errorMessage">{errors.communityName}</div>

                <label htmlFor="description"><b>Description<span className="requiredIndicator">*</span></b></label>
                <textarea
                    maxLength="500"
                    placeholder="Enter Description"
                    id="description"
                    className="communityInputBox"
                    value={formData.description}
                    onChange={handleInputChange}
                    noValidate
                />
                <div id="community_description_error" className="errorMessage">{errors.description}</div>

                {/* <label htmlFor="username"><b>Creator Username<span className="requiredIndicator">*</span></b></label>
                <input
                    type="text"
                    placeholder="Enter Username"
                    id="username"
                    className="communityInputBox"
                    value={formData.username}
                    onChange={handleInputChange}
                    noValidate
                />
                <div id="creator_username_error" className="errorMessage">{errors.username}</div> */}

                <div id="communityButtonDiv">
                    <button type="submit" id="SubmitCommunityFormButton">Engender Community</button>
                    <button type="cancel" id="cancelCommunityFormButton" onClick={cancelButton}>Cancel</button>
                </div>
            </form>
        </div>
    );
}