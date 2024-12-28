import React from 'react';
import axios from 'axios';
import '../stylesheets/login.css';
// import { set } from 'mongoose';

export default class TheLoginPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            value: 0,
        };
    }
    render() {
        return (
            <div id="loginPage" className="main_cont_divs">
                {/* <h1>Login</h1> */}
                <Login onLoginSuccess={() => this.props.setPage('home')}  cancelButton={() => this.props.setPage('welcome')}/>
            </div>
        );
    }
}

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            errors: {
                email: '',
                password: '',
            },
            loginError: '',
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(event) {
        const { id, value } = event.target;
        this.setState({ [id]: value, loginError: '' });
    }

    async handleSubmit(event) {
        event.preventDefault();

        const { email, password } = this.state;
        console.log("emaillll",email)
        const errors = {};
        const response = await axios.post('http://localhost:8000/checkUserAvailability', {
            email: email,
            displayName: null,
        });
        if(email.length < 1){
            errors.email = 'Email is required.';
        }
        else if(response.data.emailAvailable){
            errors.email = 'Email does not exist.';
        }
        else{
            if (!email) errors.email = 'Email is required.';
        }
        if (!password) errors.password = 'Password is required.';

        if (Object.keys(errors).length > 0) {
            this.setState({ errors });
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/login', {
                email,
                password,
            },{ withCredentials: true });

            console.log(response.data.success)

            if (response.data.success) {
                // Redirect to the homepage
                this.props.onLoginSuccess();
            } else {
                this.setState({ loginError: 'Password is incorrect.' });
                //errors.password = 'Password is incorrect.';
            }
        } catch (error) {
            //errors.password = 'Password is incorrect.';
            //this.setState({ loginError: 'An error occurred during login.' });
            console.error('Login error:', error);
        }
    }

    render() {
        //const { setPage } = this.props;
        const { email, password, errors, loginError } = this.state;

        return (
            <div id="loginFormContainer">
                <form id="loginForm" onSubmit={this.handleSubmit}>
                    <div>
                        <h2>Login as Existing User</h2>
                    </div>

                    {/* Email Field */}
                    <div className="form-group">
                        <label htmlFor="email"><b>Email<span className="required-indicator">*</span></b></label>
                        <input
                            type="test"
                            id="email"
                            placeholder="Enter Your Email"
                            className="form-control"
                            value={email}
                            onChange={this.handleInputChange}
                            //required
                            noValidate
                        />
                        {errors.email && <div className="error-message">{errors.email}</div>}
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label htmlFor="password">
                            <b>Password<span className="required-indicator">*</span></b>
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Enter Your Password"
                            className="form-control"
                            value={password}
                            onChange={this.handleInputChange}
                            //required
                            noValidate
                        />
                        {errors.password && <div className="error-message">{errors.password}</div>}
                    </div>

                    {/* Login Error */}
                    {loginError && <div className="error-message">{loginError}</div>}

                    {/* Submit and Cancel Buttons */}
                    <div className="button-group">
                        <button type="submit" id="submitLoginFormButton">
                            Login
                        </button>
                        <button
                            type="button"
                            id="cancelLoginFormButton"
                            onClick={() => {
                                this.setState(
                                    { email: '', password: '', errors: {}, loginError: '' }, 
                                    this.props.cancelButton
                                );
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}
