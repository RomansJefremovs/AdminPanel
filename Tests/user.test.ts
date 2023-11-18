import supertest from 'supertest';
import server from '../server';

const request = supertest(server);

// Your test cases here

beforeAll(async () => {
    await server.listen(3001)
    // Start your server here (e.g., await server.listen(3000))
});

afterAll(async () => {
    await server.close()
    // Stop your server here (e.g., await server.close())
});




describe('User Registration', () => {
    it('should register a new user', async () => {
        // Define the user registration data
        const userData = {
            username: 'testuser',
            password: 'testpassword',
            email: 'test@example.com',
        };

        // Send a POST request to the registration route
        const response = await request.post('/register').send(userData);

        // Check the response status code
        expect(response.status).toBe(200);

        // Check the response body
        expect(response.body).toEqual({ status: 'success', message: 'User registered successfully' });

        // You can add more assertions to check the database or other details if needed
    });

    // Add more test cases for edge cases, validation, etc.
});
