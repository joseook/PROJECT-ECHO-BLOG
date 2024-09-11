import dotenv from 'dotenv';

dotenv.config();

export default {
    testEnvironment: 'node',
    setupFiles: ['dotenv/config'],
    globalSetup: './jest.global-setup.mjs', 
    testMatch: ['**/tests/controllers/**/*.test.js'],
    verbose: true,
};