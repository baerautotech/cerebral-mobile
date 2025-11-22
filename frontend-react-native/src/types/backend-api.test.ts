/**
 * Test file to verify generated types compile correctly
 * This file is used during type-checking only
 */

import type { paths, components, operations } from './backend-api';

// Test that types are properly generated
type HealthCheckResponse =
  paths['/health']['get']['responses']['200']['content']['application/json'];
type SignupRequest = paths['/auth/signup']['post']['requestBody']['content']['application/json'];
type AuthResponse = components['schemas']['AuthResponse'];
type SignupOperation = operations['authSignup'];

// Test that types are usable
const testHealthResponse: HealthCheckResponse = {
  status: 'healthy',
  version: '2.0.0',
  timestamp: '2025-10-13T12:00:00Z',
};

const testSignupRequest: SignupRequest = {
  email: 'test@example.com',
  password: 'StrongPassword123!',
};

const testAuthResponse: AuthResponse = {
  success: true,
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  tenant_id: '00000000-0000-0000-0000-000000000100',
  session_token: 'token123',
  access_token: 'access123',
  refresh_token: 'refresh123',
  expires_in: 3600,
  mfa_required: false,
  trust_score: 85,
};

// Export to prevent unused variable warnings
export { testHealthResponse, testSignupRequest, testAuthResponse };
