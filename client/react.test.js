/**
 * Test 3 – react.test.js
 * - The filename containing the implementation for this test must be:
 *   client/react.test.js
 * - Your test must demonstrate that the “Create Post” button component is disabled when the
 *   user is viewing the application as a guest and is enabled when the user is viewing the
 *   application as a registered user.
 */

import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import TheBanner from './src/components/banner';

describe('Create Post Test', () => {
    const mockProps = {

        goToHomePage: jest.fn(),          
        goToSearchResultsPage: jest.fn(), 
        goToNewPostPageView: jest.fn(),  
        loggedIn: false,
        handleLogout: jest.fn(),
        setPage: jest.fn(),
        user: null,
        userInfo: [],
        page: 'home',
    };

    beforeEach(() => {
        jest.clearAllMocks(); 
    });

    it('renders correctly', () => {
        const { container } = render(<TheBanner {...mockProps} />);

        const bannerDiv = container.querySelector('#bannerDiv');
        expect(bannerDiv).toBeInTheDocument();
    });

    it('disables the Create Post button when logged in is false (Guest user)', () => {
        render(<TheBanner {...mockProps} />);

        const createPostButton = screen.getByRole('button', { name: /create post/i });
        expect(createPostButton).toBeDisabled();
    });

    it('enables the Create Post button when logged in is true (Registered user)', () => {
        render(<TheBanner {...mockProps} loggedIn={true} userInfo={['RegisteredUser']} />);

        const createPostButton = screen.getByRole('button', { name: /create post/i });
        expect(createPostButton).toBeEnabled();
    });

    it('calls goToNewPostPageView when the button is clicked and user is logged in', () => {
        render(<TheBanner {...mockProps} loggedIn={true} userInfo={['RegisteredUser']} />);

        const createPostButton = screen.getByRole('button', { name: /create post/i });
        fireEvent.click(createPostButton);

        expect(mockProps.goToNewPostPageView).toHaveBeenCalled();
    });

    it('does not call goToNewPostPageView when button is clicked and user is not logged in', () => {
        render(<TheBanner {...mockProps} />);

        const createPostButton = screen.getByRole('button', { name: /create post/i });
        fireEvent.click(createPostButton);

        expect(mockProps.goToNewPostPageView).not.toHaveBeenCalled();
    });
});



