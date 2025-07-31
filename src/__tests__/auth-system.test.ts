/**
 * 认证系统测试
 */
import {
  generateToken,
  verifyToken,
  hashPassword,
  verifyPassword,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  validatePasswordStrength,
  generateSecurePassword,
  UserRole,
  Permission,
  SessionManager,
} from '@/lib/auth';

describe('Auth System', () => {
  describe('JWT Token Management', () => {
    it('should generate and verify JWT tokens', () => {
      const payload = {
        userId: 'user_001',
        email: 'test@example.com',
        role: UserRole.ADMIN,
      };

      const token = generateToken(payload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.role).toBe(payload.role);
    });

    it('should return null for invalid tokens', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);
      expect(decoded).toBeNull();
    });
  });

  describe('Password Management', () => {
    it('should hash and verify passwords', async () => {
      const password = 'testPassword123!';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeTruthy();
      expect(hashedPassword).not.toBe(password);
      
      const isValid = await verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
      
      const isInvalid = await verifyPassword('wrongPassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });

    it('should validate password strength', () => {
      // Weak passwords
      expect(validatePasswordStrength('123').isValid).toBe(false);
      expect(validatePasswordStrength('password').isValid).toBe(false);
      expect(validatePasswordStrength('Password').isValid).toBe(false);
      expect(validatePasswordStrength('Password1').isValid).toBe(false);
      
      // Strong password
      const strongPassword = 'StrongPass123!';
      const validation = validatePasswordStrength(strongPassword);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should generate secure passwords', () => {
      const password = generateSecurePassword(12);
      
      expect(password).toHaveLength(12);
      expect(/[A-Z]/.test(password)).toBe(true);
      expect(/[a-z]/.test(password)).toBe(true);
      expect(/\d/.test(password)).toBe(true);
      expect(/[!@#$%^&*(),.?":{}|<>]/.test(password)).toBe(true);
      
      const validation = validatePasswordStrength(password);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Permission System', () => {
    it('should check admin permissions correctly', () => {
      expect(hasPermission(UserRole.ADMIN, Permission.PRODUCT_CREATE)).toBe(true);
      expect(hasPermission(UserRole.ADMIN, Permission.USER_DELETE)).toBe(true);
      expect(hasPermission(UserRole.ADMIN, Permission.SYSTEM_CONFIG)).toBe(true);
    });

    it('should check manager permissions correctly', () => {
      expect(hasPermission(UserRole.MANAGER, Permission.PRODUCT_CREATE)).toBe(true);
      expect(hasPermission(UserRole.MANAGER, Permission.USER_DELETE)).toBe(false);
      expect(hasPermission(UserRole.MANAGER, Permission.SYSTEM_CONFIG)).toBe(false);
    });

    it('should check editor permissions correctly', () => {
      expect(hasPermission(UserRole.EDITOR, Permission.PRODUCT_READ)).toBe(true);
      expect(hasPermission(UserRole.EDITOR, Permission.PRODUCT_CREATE)).toBe(true);
      expect(hasPermission(UserRole.EDITOR, Permission.PRODUCT_DELETE)).toBe(false);
      expect(hasPermission(UserRole.EDITOR, Permission.USER_CREATE)).toBe(false);
    });

    it('should check viewer permissions correctly', () => {
      expect(hasPermission(UserRole.VIEWER, Permission.PRODUCT_READ)).toBe(true);
      expect(hasPermission(UserRole.VIEWER, Permission.INQUIRY_READ)).toBe(true);
      expect(hasPermission(UserRole.VIEWER, Permission.PRODUCT_CREATE)).toBe(false);
      expect(hasPermission(UserRole.VIEWER, Permission.INQUIRY_UPDATE)).toBe(false);
    });

    it('should check any permission correctly', () => {
      const permissions = [Permission.PRODUCT_CREATE, Permission.USER_DELETE];
      
      expect(hasAnyPermission(UserRole.ADMIN, permissions)).toBe(true);
      expect(hasAnyPermission(UserRole.MANAGER, permissions)).toBe(true);
      expect(hasAnyPermission(UserRole.EDITOR, permissions)).toBe(true);
      expect(hasAnyPermission(UserRole.VIEWER, permissions)).toBe(false);
    });

    it('should check all permissions correctly', () => {
      const permissions = [Permission.PRODUCT_CREATE, Permission.USER_DELETE];
      
      expect(hasAllPermissions(UserRole.ADMIN, permissions)).toBe(true);
      expect(hasAllPermissions(UserRole.MANAGER, permissions)).toBe(false);
      expect(hasAllPermissions(UserRole.EDITOR, permissions)).toBe(false);
      expect(hasAllPermissions(UserRole.VIEWER, permissions)).toBe(false);
    });
  });

  describe('Session Management', () => {
    beforeEach(() => {
      // Clear all sessions before each test
      SessionManager['activeSessions'].clear();
    });

    it('should create and validate sessions', () => {
      const userId = 'user_001';
      const sessionId = SessionManager.createSession(userId, '127.0.0.1', 'test-agent');
      
      expect(sessionId).toBeTruthy();
      expect(SessionManager.validateSession(sessionId)).toBe(true);
      expect(SessionManager.getActiveSessionCount()).toBe(1);
    });

    it('should destroy individual sessions', () => {
      const userId = 'user_001';
      const sessionId = SessionManager.createSession(userId);
      
      expect(SessionManager.validateSession(sessionId)).toBe(true);
      
      SessionManager.destroySession(sessionId);
      expect(SessionManager.validateSession(sessionId)).toBe(false);
      expect(SessionManager.getActiveSessionCount()).toBe(0);
    });

    it('should destroy all user sessions', () => {
      const userId = 'user_001';
      const sessionId1 = SessionManager.createSession(userId);
      const sessionId2 = SessionManager.createSession(userId);
      const otherUserSessionId = SessionManager.createSession('user_002');
      
      expect(SessionManager.getActiveSessionCount()).toBe(3);
      
      SessionManager.destroyUserSessions(userId);
      
      expect(SessionManager.validateSession(sessionId1)).toBe(false);
      expect(SessionManager.validateSession(sessionId2)).toBe(false);
      expect(SessionManager.validateSession(otherUserSessionId)).toBe(true);
      expect(SessionManager.getActiveSessionCount()).toBe(1);
    });

    it('should return false for invalid sessions', () => {
      expect(SessionManager.validateSession('invalid-session-id')).toBe(false);
    });
  });

  describe('Password Strength Validation', () => {
    it('should reject passwords that are too short', () => {
      const result = validatePasswordStrength('short');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePasswordStrength('lowercase123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePasswordStrength('UPPERCASE123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePasswordStrength('PasswordOnly!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject passwords without special characters', () => {
      const result = validatePasswordStrength('Password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should accept strong passwords', () => {
      const result = validatePasswordStrength('StrongPassword123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Secure Password Generation', () => {
    it('should generate passwords of specified length', () => {
      const password8 = generateSecurePassword(8);
      const password16 = generateSecurePassword(16);
      
      expect(password8).toHaveLength(8);
      expect(password16).toHaveLength(16);
    });

    it('should generate different passwords each time', () => {
      const password1 = generateSecurePassword(12);
      const password2 = generateSecurePassword(12);
      
      expect(password1).not.toBe(password2);
    });

    it('should generate passwords that meet strength requirements', () => {
      for (let i = 0; i < 10; i++) {
        const password = generateSecurePassword(12);
        const validation = validatePasswordStrength(password);
        expect(validation.isValid).toBe(true);
      }
    });
  });
});