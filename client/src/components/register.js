import '../stylesheets/register.css';
import React, { useState } from 'react';
import axios from 'axios';

export default function TheRegisterPage({setPage, }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        displayName: '',
        secretPassword: '',
        confirmPassword: ''

    });

    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        email: '',
        displayName: '',
        secretPassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,  
            [id]: value   
        });
    };

    const validateForm = async () => {
        const newErrors = { firstName: '', lastName: '', email: '', displayName: '',  secretPassword: "", confirmPassword: '' };
        let isValid = true;
        //send object to backend
        // const currentEmailAndDisplayName = {
        //     firstName: formData.firstName,
        //     lastName: formData.lastName,
        //     email: formData.email,
        //     displayName: formData.displayName,
        //     secretPassword: formData.secretPassword,
        // };

        const forbiddenWords = [
            formData.firstName.toLowerCase().trim(),
            formData.lastName.toLowerCase().trim(),
            formData.displayName.toLowerCase().trim(),
            formData.email.toLowerCase().trim(),
        ];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        //Name fields cannot be empty
        if (formData.firstName === "") {
            newErrors.firstName = "First name is required.";
            isValid = false;
        }
        if (formData.lastName === "") {
            newErrors.lastName = "Last name is required.";
            isValid = false;
        }

        

        //check if it is already in the database
        if (formData.email === "") {
            newErrors.email = "Email cannot be empty.";
            isValid = false;
        }
        else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Invalid email format.";
            isValid = false;
        }

        //check if it is already in the database
        if (formData.displayName === "") {
            newErrors.displayName = "Display name cannot be empty.";
            isValid = false;
        }


        //check if it is the same as secret password and send it back to backend for hashing
        if (formData.secretPassword === "") {
            newErrors.secretPassword = 'Password cannot be empty.';
            isValid = false;
        }else if (forbiddenWords.some(word => formData.secretPassword.toLowerCase().includes(word))) {
            newErrors.secretPassword = "Password cannot include your name, email, or display name.";
            isValid = false;
        }
        if (formData.confirmPassword === "" || formData.confirmPassword !== formData.secretPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
            isValid = false;
        }

        //if (isValid) {
            try {
                const response = await axios.post('http://localhost:8000/checkUserAvailability', {
                    email: formData.email,
                    displayName: formData.displayName,
                });
    
                if (!response.data.emailAvailable) {
                    newErrors.email = "This email is already in use.";
                    isValid = false;
                }
                console.log("is the user name avaiablesdfddfdasfasd",response.data.displayNameAvailable);
                if (!response.data.displayNameAvailable) {
                    newErrors.displayName = "This display name is already in use.";
                    isValid = false;
                }
            } catch (error) {
                console.error("Error checking user availability:", error);
                newErrors.email = "Error validating email or display name. Please try again.";
                isValid = false;
            }
        //}

        setErrors(newErrors);
        return isValid;
    };

    const SubmitCommunityFormButton = async (e) => {
        e.preventDefault();
        if (!(await validateForm())) return;

        const newUser = {
            first: formData.firstName,
            last: formData.lastName,
            email: formData.email, 
            display: formData.displayName,
            password: formData.secretPassword, //password needs to be hashed in the backend
        };
        try{
            const response = await axios.post('http://localhost:8000/createNewUser', newUser);

            //clear form
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                displayName: '',
                secretPassword: '',
                confirmPassword: '',
            });

            console.log(response)

            alert("New User Registered successfully!");
            setPage('welcome');

        }
        catch (error){
            console.error("Error registering user:", error);
        }
    };

    const cancelButton = () =>{
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            displayName: '',
            secretPassword: '',
            confirmPassword: '',
        });
        setPage('welcome');
    };

    return(
        <div id="registerUserDiv" className="main_cont_divs">
            <form id="registerFormContainer" onSubmit={SubmitCommunityFormButton}>
                <h2 id="registerFormHeader">Register a New Account</h2>
                <p id="registerFormDescription">Please enter the following fields to create your account.</p>
                
                {/* <label htmlFor="firstName"><b>First Name<span className="requiredIndicator">*</span></b></label>
                <input
                    type="text"
                    maxLength="100"
                    placeholder="Enter First Name"
                    id="firstName"
                    className="registerInputBox"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    noValidate
                />
                <div id="register_name_error" className="errorMessage">{errors.firstName}</div> */}

                <label htmlFor="firstName"><b>First Name<span className="requiredIndicator">*</span></b></label>
                <input
                    type="text"
                    // maxLength="100"
                    placeholder="Enter your first name"
                    id="firstName"
                    className="registerInputBox"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    noValidate
                />
                <div id="register_firstName_error" className="errorMessage">{errors.firstName}</div>

                <label htmlFor="LastName"><b>Last Name<span className="requiredIndicator">*</span></b></label>
                <input
                    type="text"
                    //maxLength="100"
                    placeholder="Enter your last name"
                    id="lastName"
                    className="registerInputBox"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    noValidate
                />
                <div id="register_lastName_error" className="errorMessage">{errors.lastName}</div>

                <label htmlFor="email"><b>Email Address<span className="requiredIndicator">*</span></b></label>
                <input
                    type="text"
                    //maxLength="100"
                    placeholder="Enter your email"
                    id="email"
                    className="registerInputBox"
                    value={formData.email}
                    onChange={handleInputChange}
                    noValidate
                />
                <div id="register_email_error" className="errorMessage">{errors.email}</div>

                <label htmlFor="displayName"><b>Display Name<span className="requiredIndicator">*</span></b></label>
                <input
                    type="text"
                    //maxLength="100"
                    placeholder="Enter a display name"
                    id="displayName"
                    className="registerInputBox"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    noValidate
                />
                <div id="register_displayName_error" className="errorMessage">{errors.displayName}</div>

                <label htmlFor="secretPassword"><b>Password<span className="requiredIndicator">*</span></b></label>
                <input
                    type="password"
                    //maxLength="100"
                    placeholder="Enter a password"
                    id="secretPassword"
                    className="registerInputBox"
                    value={formData.secretPassword}
                    onChange={handleInputChange}
                    noValidate
                />
                <div id="register_secretPassword_error" className="errorMessage">{errors.secretPassword}</div>

                <label htmlFor="confirmPassword"><b>Confirm Your Password<span className="requiredIndicator">*</span></b></label>
                <input
                    type="password"
                    //maxLength="100"
                    placeholder="Re-enter your password"
                    id="confirmPassword"
                    className="registerInputBox"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    noValidate
                />
                <div id="register_confirmPassword_error" className="errorMessage">{errors.confirmPassword}</div>

                <div id="registerButtonDiv">
                    <button type="submit" id="SubmitRegisterFormButton">Sign Up</button>
                    <button type="cancel" id="cancelRegisterFormButton" onClick={cancelButton}>Cancel</button>
                </div>
            </form>
        </div>
    );
}