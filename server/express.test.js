/**
 * Test 2 – express.test.js
 * - The filename containing the implementation for this test must be:
 *   server/express.test.js
 * - Your test must demonstrate that the webserver is listening on port 8000.
 */

//assuming user is not logged in
const request = require('supertest');

describe('Express Server Tests', () => {
    it('server is listening on port 8000', async () => {
        const response = await request('http://localhost:8000').get('/');
        console.log(response.status,response.body.loggedIn, response.body.message )
        expect(response.status).toBe(200); 
        expect(response.body.loggedIn).toBe(false); 
        expect(response.body.message).toBe('Guest'); 
    });
});