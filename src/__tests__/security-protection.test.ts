/**
 * 安全防护功能测试
 */
import {
  CSRFProtection,
  InputSanitizer,
  IPUtils,
  DataEncryption,
  AuditLogger,
  DataMasking,
} from '@/lib/security';

describe('Security Protection', () => {
  describe('CSRF Protection', () => {
    beforeEach(() => {
      // Clear tokens before each test
      CSRFProtection['tokens'].clear();
    });

    it('should generate and validate CSRF tokens', () => {
      const sessionId = 'test-session-123';
      const token = CSRFProtection.generateToken(sessionId);
      
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
      
      const isValid = CSRFProtection.validateToken(sessionId, token);
      expect(isValid).toBe(true);
    });

    it('should reject invalid tokens', () => {
      const sessionId = 'test-session-123';
      const validToken = CSRFProtection.generateToken(sessionId);
      const invalidToken = 'invalid-token';
      
      expect(CSRFProtection.validateToken(sessionId, invalidToken)).toBe(false);
      expect(CSRFProtection.validateToken('wrong-session', validToken)).toBe(false);
    });

    it('should handle token expiration', () => {
      const sessionId = 'test-session-123';
      const token = CSRFProtection.generateToken(sessionId);
      
      // Manually expire the token
      const tokenData = CSRFProtection['tokens'].get(sessionId);
      if (tokenData) {
        tokenData.expires = Date.now() - 1000; // Expired 1 second ago
      }
      
      const isValid = CSRFProtection.validateToken(sessionId, token);
      expect(isValid).toBe(false);
    });

    it('should cleanup expired tokens', () => {
      const sessionId1 = 'session-1';
      const sessionId2 = 'session-2';
      
      CSRFProtection.generateToken(sessionId1);
      CSRFProtection.generateToken(sessionId2);
      
      // Manually expire one token
      const tokenData = CSRFProtection['tokens'].get(sessionId1);
      if (tokenData) {
        tokenData.expires = Date.now() - 1000;
      }
      
      CSRFProtection.cleanup();
      
      expect(CSRFProtection['tokens'].has(sessionId1)).toBe(false);
      expect(CSRFProtection['tokens'].has(sessionId2)).toBe(true);
    });
  });

  describe('Input Sanitizer', () => {
    it('should escape HTML characters', () => {
      const input = '<script>alert("xss")</script>';
      const escaped = InputSanitizer.escapeHtml(input);
      
      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(escaped).not.toContain('<script>');
    });

    it('should sanitize SQL injection attempts', () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "1' UNION SELECT * FROM passwords",
        "admin'/**/OR/**/1=1",
      ];

      maliciousInputs.forEach(input => {
        const sanitized = InputSanitizer.sanitizeSqlInput(input);
        expect(sanitized).not.toContain("'");
        expect(sanitized).not.toContain('"');
        expect(sanitized).not.toContain('--');
        expect(sanitized).not.toContain('UNION');
        expect(sanitized).not.toContain('SELECT');
        expect(sanitized).not.toContain('DROP');
      });
    });

    it('should sanitize XSS attempts', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<img onerror="alert(1)" src="x">',
        '<div onclick="alert(1)">Click me</div>',
        '<p style="background:url(javascript:alert(1))">Text</p>',
      ];

      maliciousInputs.forEach(input => {
        const sanitized = InputSanitizer.sanitizeUserInput(input);
        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('<iframe>');
        expect(sanitized).not.toContain('javascript:');
        expect(sanitized).not.toContain('onerror=');
        expect(sanitized).not.toContain('onclick=');
        expect(sanitized).not.toContain('style=');
      });
    });

    it('should validate email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email@domain.co.uk',
        'user+tag@example.org',
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..double.dot@example.com',
        'a'.repeat(250) + '@example.com', // Too long
      ];

      validEmails.forEach(email => {
        expect(InputSanitizer.validateEmail(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(InputSanitizer.validateEmail(email)).toBe(false);
      });
    });

    it('should validate URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://sub.domain.com/path?query=value',
      ];

      const invalidUrls = [
        'javascript:alert(1)',
        'ftp://example.com',
        'not-a-url',
        'data:text/html,<script>alert(1)</script>',
      ];

      validUrls.forEach(url => {
        expect(InputSanitizer.validateUrl(url)).toBe(true);
      });

      invalidUrls.forEach(url => {
        expect(InputSanitizer.validateUrl(url)).toBe(false);
      });
    });

    it('should validate file names', () => {
      const validFileNames = [
        'document.pdf',
        'image-file.jpg',
        'report_2024.xlsx',
      ];

      const invalidFileNames = [
        '../../../etc/passwd',
        'file<script>.txt',
        'file|pipe.txt',
        'file:colon.txt',
        'a'.repeat(300) + '.txt', // Too long
        '', // Empty
      ];

      validFileNames.forEach(fileName => {
        expect(InputSanitizer.validateFileName(fileName)).toBe(true);
      });

      invalidFileNames.forEach(fileName => {
        expect(InputSanitizer.validateFileName(fileName)).toBe(false);
      });
    });
  });

  describe('IP Utils', () => {
    it('should check IP whitelist', () => {
      const whitelist = ['192.168.1.1', '10.0.0.1', '127.0.0.1'];
      
      expect(IPUtils.isIPWhitelisted('192.168.1.1', whitelist)).toBe(true);
      expect(IPUtils.isIPWhitelisted('192.168.1.2', whitelist)).toBe(false);
    });

    it('should check IP blacklist', () => {
      const blacklist = ['192.168.1.100', '10.0.0.100'];
      
      expect(IPUtils.isIPBlacklisted('192.168.1.100', blacklist)).toBe(true);
      expect(IPUtils.isIPBlacklisted('192.168.1.1', blacklist)).toBe(false);
    });
  });

  describe('Data Encryption', () => {
    it('should generate encryption keys', () => {
      const key = DataEncryption.generateKey();
      
      expect(key).toBeTruthy();
      expect(typeof key).toBe('string');
      expect(key.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should encrypt and decrypt data', () => {
      const originalText = 'This is sensitive data';
      const key = DataEncryption.generateKey();
      
      const encrypted = DataEncryption.encrypt(originalText, key);
      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(originalText);
      
      const decrypted = DataEncryption.decrypt(encrypted, key);
      expect(decrypted).toBe(originalText);
    });

    it('should hash and verify sensitive data', () => {
      const sensitiveData = 'sensitive-information';
      
      const hashed = DataEncryption.hashSensitiveData(sensitiveData);
      expect(hashed).toBeTruthy();
      expect(hashed).not.toBe(sensitiveData);
      expect(hashed).toContain(':'); // Should contain salt separator
      
      const isValid = DataEncryption.verifyHashedData(sensitiveData, hashed);
      expect(isValid).toBe(true);
      
      const isInvalid = DataEncryption.verifyHashedData('wrong-data', hashed);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Audit Logger', () => {
    beforeEach(() => {
      // Clear logs before each test
      AuditLogger['logs'] = [];
    });

    it('should log audit entries', () => {
      const entry = {
        userId: 'user-123',
        action: 'LOGIN',
        resource: '/api/auth/login',
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        success: true,
        details: { method: 'email' },
      };

      AuditLogger.log(entry);
      
      const logs = AuditLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject(entry);
      expect(logs[0].timestamp).toBeInstanceOf(Date);
    });

    it('should filter logs by criteria', () => {
      const entries = [
        {
          userId: 'user-1',
          action: 'LOGIN',
          resource: '/api/auth/login',
          ip: '192.168.1.1',
          success: true,
        },
        {
          userId: 'user-2',
          action: 'LOGOUT',
          resource: '/api/auth/logout',
          ip: '192.168.1.2',
          success: true,
        },
        {
          userId: 'user-1',
          action: 'VIEW_PRODUCT',
          resource: '/api/products/123',
          ip: '192.168.1.1',
          success: true,
        },
      ];

      entries.forEach(entry => AuditLogger.log(entry));

      // Filter by user
      const user1Logs = AuditLogger.getLogs({ userId: 'user-1' });
      expect(user1Logs).toHaveLength(2);

      // Filter by action
      const loginLogs = AuditLogger.getLogs({ action: 'LOGIN' });
      expect(loginLogs).toHaveLength(1);
    });

    it('should cleanup old logs', () => {
      const oldEntry = {
        action: 'OLD_ACTION',
        resource: '/old',
        ip: '192.168.1.1',
        success: true,
      };

      const newEntry = {
        action: 'NEW_ACTION',
        resource: '/new',
        ip: '192.168.1.1',
        success: true,
      };

      AuditLogger.log(oldEntry);
      AuditLogger.log(newEntry);

      // Manually set old timestamp
      AuditLogger['logs'][0].timestamp = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      AuditLogger.cleanup(oneDayAgo);

      const remainingLogs = AuditLogger.getLogs();
      expect(remainingLogs).toHaveLength(1);
      expect(remainingLogs[0].action).toBe('NEW_ACTION');
    });
  });

  describe('Data Masking', () => {
    it('should mask email addresses', () => {
      expect(DataMasking.maskEmail('user@example.com')).toBe('us***@example.com');
      expect(DataMasking.maskEmail('a@example.com')).toBe('a***@example.com');
      expect(DataMasking.maskEmail('ab@example.com')).toBe('ab***@example.com');
    });

    it('should mask phone numbers', () => {
      expect(DataMasking.maskPhone('1234567890')).toBe('123***90');
      expect(DataMasking.maskPhone('123')).toBe('***');
      expect(DataMasking.maskPhone('12345')).toBe('123***45');
    });

    it('should mask ID cards', () => {
      expect(DataMasking.maskIdCard('123456789012345678')).toBe('1234***5678');
      expect(DataMasking.maskIdCard('1234567')).toBe('***');
    });

    it('should mask bank card numbers', () => {
      expect(DataMasking.maskBankCard('1234567890123456')).toBe('1234***3456');
      expect(DataMasking.maskBankCard('1234567')).toBe('***');
    });

    it('should mask IP addresses', () => {
      expect(DataMasking.maskIP('192.168.1.1')).toBe('192.168.***.***.'); 
      expect(DataMasking.maskIP('invalid-ip')).toBe('***');
    });
  });
});