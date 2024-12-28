import '../stylesheets/newCommentPageView.css';
import axios from 'axios'
import React, { useState } from 'react';

export default function NewCommentPageView({comments, setComments, setPage, posts, commentOrReply, setCommentOrReply, commentOrReplyParentID, setCommentOrReplyParentID, loggedIn, userInfo, editComment, selectedUser, handleButtonChange}) {
    console.log(editComment)
    const [formData, setFormData] = useState({
        comment_text: editComment?.content || '',
        comment_creator_username: userInfo[0],
    })

    const [errors, setErrors] = useState({
        comment_text: '',
        // comment_creator_username: '',
    })

    const validateForm = () => {
        //const newErrors = { comment_text: '', comment_creator_username: '' };// reset errors
        const newErrors = { comment_text: ''};
        let isValid = true;

        if(!formData.comment_text || formData.comment_text.length > 500){
            newErrors.comment_text= 'Comment description should be between 0 - 500 characters.';
            isValid = false;
        }
        if(!loggedIn){
            alert("You must be logged in to create a comment.");
            isValid = false;
        }
        // if(!formData.comment_creator_username){
        //     newErrors.comment_creator_username = 'Username is required.';
        //     isValid = false;
        // }

        setErrors(newErrors);
        return isValid;
    }

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,  
            [id]: value   
        });
    }

    const SubmitCommentFormButton = async (e) => {
        //console.log("dsjkhfkjldshafkljsdhflkjdshkjlsdfhkljdshfdjklsaf",commentOrReply, commentOrReplyParentID);
        e.preventDefault();
        if (!validateForm()) return;

        const newComment = {
            content: formData.comment_text,
            commentIDs: editComment ? editComment.commentIDs : [],//no comments
            commentedBy: formData.comment_creator_username,
            commentedDate: editComment ? editComment.commentedDate : new Date(),
        }

        try{
            if (editComment) {
                // Editing an existing comment
                const commentResponse = await axios.post(
                    `http://localhost:8000/comments/edit/${editComment._id}`,
                    newComment
                );
                setComments((prevComments) =>
                    prevComments.map((comment) =>
                        comment._id === editComment._id ? { ...comment, ...commentResponse.data } : comment
                    )
                );
                alert('Comment updated successfully!');
                e.stopPropagation();
                setPage('userProf', null, selectedUser, 'comments');
                //handleButtonChange('comments', selectedUser);
            } else {
                //send data to express with post request
                //console.log("new community being created");
                const response = await axios.post('http://localhost:8000/createNewComment', newComment);
                
                //update state for rerendering
                newComment._id = response.data._id;
                setComments([...comments, response.data]);
            

                //clear form
                setFormData({
                    communityName: '',
                    description: '',
                    username: ''
                });

                alert("Community created successfully!");
                // setPage('post', newComment.commentID);

                //console.log("NEW COMMENTttttttttttt", newComment);

                if(commentOrReply === "reply"){
                    for(const comment of comments){
                        //console.log("COMMMENT WBFGIWJGWG", comment);
                        if(comment._id === commentOrReplyParentID){
                            comment.commentIDs.push(newComment._id);
                        }
                        try{
                            await axios.post(`http://localhost:8000/comments/updateCommentCommentIDs/${comment._id}`, comment);
                        }
                        catch (error) {
                            console.log("Failed to update community postIDs array. Please try again.");
                        }
                    };
                }
                else if(commentOrReply === "comment"){
                    for(const post of posts){
                        //console.log(commentOrReplyParentID);
                        if(post._id === commentOrReplyParentID){
                            post.commentIDs.push(newComment._id);
                            //console.log("AFTER", post.commentIDs);
                            //console.log("Community ID:", post);
                            try{
                                await axios.post(`http://localhost:8000/posts/updatePostCommentIDs/${post._id}`, post);
                            }
                            catch (error) {
                                console.log("Failed to update community postIDs array. Please try again.");
                            }
                        }
                    };
                    //console.log("POSTSsssssssssssssss", posts);
                }
                setFormData({ //clear data
                    comment_text: '',
                    comment_creator_username: '',
                });
    
                setCommentOrReply(null); // reset commentOrReply
                setCommentOrReplyParentID(null); //reset parentID
                setCommentOrReply(null); // reset comment or reply value
                setPage('post', newComment.commentID);////set page back to the post
            }
        }
        catch (error){
            console.error("Error creating comment:", error);
        } 
    }

    const cancelButton = (e) => {
        e.preventDefault();
        setFormData({ //clear data
            comment_text: '',
            comment_creator_username: '',
        });

        setCommentOrReply(null); // reset commentOrReply
        setCommentOrReplyParentID(null); //reset parentID
        setCommentOrReply(null); // reset comment or reply value
        if(editComment){
            e.stopPropagation();
            setPage('userProf', null, selectedUser, 'comments');
            //handleButtonChange('comments', selectedUser);
        }
        else{
            setPage('post');////set page back to the post 
        }
        
    };

    return(
        <div id="newCommentPageView">
            <form id="newCommentForm" onSubmit={SubmitCommentFormButton}>
                <div id="create_comment_div">
                    {editComment ? (<h2 id="createCommentHTag">Edit Comment</h2>) : (<h2 id="createCommentHTag">Create New Comment</h2>)}
                </div>

                <div id="comment_text_div" className="post_divs">
                    <label htmlFor="text"><b>Comment Description<span className="required-indicator">*</span></b></label>
                    <textarea 
                        placeholder="Enter A Comment" 
                        maxLength="500" id="comment_text" 
                        className="post_input_box" 
                        value={formData.comment_text}
                        onChange={handleInputChange}
                        noValidate
                    ></textarea>
                    <div id="comment_text_error" className="error-message">{errors.comment_text}</div>
                </div>

                {/* <div id="post_user_div" className="post_divs">
                    <label htmlFor="username"><b>Comment Creator Name<span className="required-indicator">*</span></b></label>
                    <input 
                        type="text" 
                        placeholder="Enter Username" 
                        id="comment_creator_username" 
                        className="post_input_box" 
                        value={formData.comment_creator_username}
                        onChange={handleInputChange}
                        noValidate
                    ></input>
                    <div id="comment_creator_username_error" className="error-message">{errors.comment_creator_username}</div>
                </div> */}

                <div id="comment_button_div">
                    <button type="submit" id="submitCommentFormButton">Submit Comment</button> 
                    <button type="button" id="closeCommentFormButton" onClick={cancelButton}>Cancel Submission</button>
                </div>
            </form>
        </div>
    );
}
    