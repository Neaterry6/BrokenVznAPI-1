export interface PasswordOptions {
  length?: number;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeSimilar?: boolean;
  excludeAmbiguous?: boolean;
}

export interface PasswordResult {
  success: boolean;
  password?: string;
  strength?: 'weak' | 'medium' | 'strong' | 'very-strong';
  entropy?: number;
  error?: string;
}

export class PasswordService {
  async generatePassword(options: PasswordOptions = {}): Promise<PasswordResult> {
    try {
      const {
        length = 12,
        includeUppercase = true,
        includeLowercase = true,
        includeNumbers = true,
        includeSymbols = false,
        excludeSimilar = false,
        excludeAmbiguous = false
      } = options;

      if (length < 4 || length > 128) {
        return {
          success: false,
          error: 'Password length must be between 4 and 128 characters'
        };
      }

      let charset = '';
      
      if (includeLowercase) {
        charset += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
      }
      
      if (includeUppercase) {
        charset += excludeSimilar ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      }
      
      if (includeNumbers) {
        charset += excludeSimilar ? '23456789' : '0123456789';
      }
      
      if (includeSymbols) {
        charset += excludeAmbiguous ? '!@#$%^&*-_=+[]{}|;:,.<>?' : '!@#$%^&*()_+-=[]{}|;:,.<>?';
      }

      if (charset === '') {
        return {
          success: false,
          error: 'At least one character type must be included'
        };
      }

      let password = '';
      for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
      }

      const strength = this.calculateStrength(password);
      const entropy = Math.log2(charset.length) * length;

      return {
        success: true,
        password,
        strength,
        entropy: Math.round(entropy)
      };

    } catch (error) {
      console.error('Password generation error:', error);
      return {
        success: false,
        error: 'Failed to generate password'
      };
    }
  }

  private calculateStrength(password: string): 'weak' | 'medium' | 'strong' | 'very-strong' {
    let score = 0;

    // Length bonus
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 3) return 'weak';
    if (score <= 5) return 'medium';
    if (score <= 6) return 'strong';
    return 'very-strong';
  }
}

export const passwordService = new PasswordService();
