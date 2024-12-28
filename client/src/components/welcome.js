//import axios from 'axios';
import React from 'react';
import '../stylesheets/welcome.css';

export default class TheWelcomePage extends React.Component {
    // constructor(props) {
    //     super(props);

    //     this.state = {
    //         message: '',
    //         loggedIn: false,
    //     };

    //     this.handleLogout = this.handleLogout.bind(this);
    // }

    // async componentDidMount() {
    //     try {
    //         const response = await axios.get('http://localhost:8000/', { withCredentials: true });
    //         console.log(response.data.loggedIn)
    //         if (response.data.loggedIn) {
    //             this.setState({ 
    //                 loggedIn: true, 
    //                 message: response.data.message
    //             });
    //         } else {
    //             this.setState({ 
    //                 loggedIn: false, 
    //                 message: response.data.message
    //             });
    //         }
    //     } catch (error) {
    //         console.error('Error fetching session data:', error);
    //         this.setState({ message: '<p>Failed to load data. Please try again later.</p>' });
    //     }
    // }

    // async handleLogout() {
    //     try {
    //         await axios.post('http://localhost:8000/logout', {}, { withCredentials: true });
    //         this.setState({ loggedIn: false, message: 'Guest' });
    //         alert('You have been logged out.');
    //     } catch (error) {
    //         console.error('Error logging out:', error);
    //         alert('Failed to log out. Please try again.');
    //     }
    // }

    render() {
        const { loggedIn, user, setPage, message } = this.props;

        return (
            <div id="welcomePage" className="main_cont_divs">
                <h1 id="welcomeText">Welcome {message}<br></br> This is the user {user}</h1>
                <WelcomeButtons 
                    loggedIn={loggedIn} 
                    handleLogout={this.props.handleLogout} 
                    setPage={setPage} />
            </div>
        );
    }
}

class WelcomeButtons extends React.Component {
    render() {
        const { loggedIn, handleLogout, setPage } = this.props;

        console.log(loggedIn)

        return (
            <div id="welcomeButtons">
                    <>
                        <button
                            className="center"
                            id="Register"
                            onClick={() => setPage('register')}
                        >
                            Register as New User
                        </button>
                        <button
                            className="center"
                            id="Existing"
                            onClick={() => setPage('login')}
                        >
                            Login as Existing User
                        </button>
                        <button
                            className="center"
                            id="Guest"
                            onClick={() => setPage('home')}
                        >
                            Continue as Guest
                        </button>
                        {loggedIn && 
                        (<button
                        className="center"
                        id="Logout"
                        onClick={handleLogout}
                        >
                        Log Out
                        </button>)
                        }
                    </>
                
            </div>
        );
    }
}
