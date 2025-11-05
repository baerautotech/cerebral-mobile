/**
 * Validation utilities tests
 */

import {
  validateEmail,
  validatePassword,
  validateTaskTitle,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  sanitizeInput,
} from '../../src/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('should reject invalid email format', () => {
      const result = validateEmail('invalid-email');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should accept valid email', () => {
      const result = validateEmail('user@example.com');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validatePassword', () => {
    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
    });

    it('should reject short password', () => {
      const result = validatePassword('Short1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 8 characters');
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('password123');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('uppercase');
    });

    it('should reject password without lowercase', () => {
      const result = validatePassword('PASSWORD123');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('lowercase');
    });

    it('should reject password without number', () => {
      const result = validatePassword('Password');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('number');
    });

    it('should accept valid password', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateTaskTitle', () => {
    it('should reject empty title', () => {
      const result = validateTaskTitle('');
      expect(result.valid).toBe(false);
    });

    it('should reject title too short', () => {
      const result = validateTaskTitle('Ab');
      expect(result.valid).toBe(false);
    });

    it('should reject title too long', () => {
      const result = validateTaskTitle('a'.repeat(201));
      expect(result.valid).toBe(false);
    });

    it('should accept valid title', () => {
      const result = validateTaskTitle('Valid Task Title');
      expect(result.valid).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).toContain('&lt;');
      expect(sanitized).toContain('&gt;');
    });

    it('should escape quotes', () => {
      const input = 'Test "quotes" and \'apostrophes\'';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toContain('&quot;');
      expect(sanitized).toContain('&#x27;');
    });
  });
});
