// Global test setup
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Increase timeouts for integration tests
jest.setTimeout(15000);

// Setup test database if needed
beforeAll(async () => {
  // Database setup
});

afterAll(async () => {
  // Database cleanup
});

// Mock external services
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));

console.log('✅ Jest test environment initialized');
