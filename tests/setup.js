// Test setup file
import "dotenv/config";
import { beforeAll, afterAll } from 'vitest';
// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.SESSION_SECRET = 'test-secret';
// Console log interceptor for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
beforeAll(() => {
    // Suppress console logs during tests unless DEBUG=true
    if (!process.env.DEBUG) {
        console.log = () => { };
        console.warn = () => { };
        console.error = () => { };
    }
});
afterAll(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
});
