import { BadRequestException, ConflictException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto, GoogleSignInDto, VerifyEmailDto, SendOTPDto, VerifyOTPDto } from './auth.dto';
import { GoogleAuthService } from './google-auth.service';
import { EmailService } from './email.service';
import { OTP, OTPDocument } from './otp.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly emailService: EmailService,
    @InjectModel(OTP.name) private readonly otpModel: Model<OTPDocument>,
  ) {}

  async register(dto: RegisterDto) {
    const username = dto.username.trim();
    const email = dto.email.trim().toLowerCase();
    const firstName = dto.first_name.trim();
    const lastName = dto.last_name.trim();

    if (!username || !email || !firstName || !lastName) {
      throw new BadRequestException('All fields are required');
    }

    const existing = await this.userService.findByUsername(username);
    if (existing) throw new ConflictException('Username already exists');
    
    // Check if email already exists
    const existingEmail = await this.userService.findByEmail(email);
    if (existingEmail) throw new ConflictException('Email already exists');
    
    const rawPassword = dto.password.trim();
    if (!rawPassword) throw new BadRequestException('Password is required');

    const hash = await bcrypt.hash(rawPassword, 10);
    
    // Generate email verification token
    const emailVerificationToken = this.emailService.generateVerificationToken();
    
    try {
      const user = await this.userService.create({
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        password: hash,
        email_verified: false, // Email not verified yet
        email_verification_token: emailVerificationToken,
      });
      
      // Send verification email
      try {
        await this.emailService.sendVerificationEmail(email, emailVerificationToken, firstName);
      } catch (error) {
        // Log error but don't fail registration if email fails
        console.error('Failed to send verification email:', error);
      }
      
      const userObj = (user as any).toObject ? (user as any).toObject() : user;
      const { password: _password, ...result } = userObj;
      return { 
        message: 'User registered successfully. Please check your email to verify your account.', 
        user: result 
      };
    } catch (error: any) {
      // Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        // MongoDB duplicate key error
        let duplicateField: string | null = null;
        
        // Try to get the field from keyPattern
        if (error.keyPattern) {
          duplicateField = Object.keys(error.keyPattern)[0];
        }
        
        // If not found, try to extract from error message
        if (!duplicateField && error.message) {
          const message = error.message.toLowerCase();
          if (message.includes('email') || message.includes('email_1')) {
            duplicateField = 'email';
          } else if (message.includes('username') || message.includes('username_1')) {
            duplicateField = 'username';
          }
        }
        
        // If still not found, do a final check by querying the database
        if (!duplicateField) {
          const checkEmail = await this.userService.findByEmail(email);
          const checkUsername = await this.userService.findByUsername(username);
          
          if (checkEmail) {
            duplicateField = 'email';
          } else if (checkUsername) {
            duplicateField = 'username';
          }
        }
        
        // Determine the error message based on the duplicate field
        if (duplicateField === 'email') {
          throw new ConflictException('Email already exists');
        }
        if (duplicateField === 'username') {
          throw new ConflictException('Username already exists');
        }
        
        // Fallback: check if we can determine from the values we tried to insert
        // This handles cases where the error structure is unexpected
        throw new ConflictException('Email or username already exists');
      }
      // Re-throw other errors
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const identifier = dto.username.trim();
    if (!identifier) throw new BadRequestException('Username or email is required');

    const rawPassword = dto.password.trim();
    if (!rawPassword) throw new BadRequestException('Password is required');

    let user = await this.userService.findByUsername(identifier);
    if (!user) {
      user = await this.userService.findByEmail(identifier.toLowerCase());
    }
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Check if user has a password (Google OAuth users might not have one)
    if (!user.password) {
      throw new UnauthorizedException('Please sign in with Google');
    }

    const passwordMatch = await bcrypt.compare(rawPassword, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: (user as any)._id.toString(), username: user.username };
    const token = await this.jwtService.signAsync(payload);
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password: _password, ...userData } = userObj;
    return { 
      access_token: token,
      user: userData,
      onboarding_completed: user.onboarding_completed || false
    };
  }

  /**
   * Google Sign-In / Sign-Up
   * If user exists with Google ID, login; otherwise create new user
   */
  async googleSignIn(dto: GoogleSignInDto) {
    const clientType = dto.client_type || 'android';
    
    // Check configuration based on client type
    if (clientType === 'android' && !this.googleAuthService.isAndroidConfigured()) {
      throw new BadRequestException('Google OAuth Android is not configured. Please set GOOGLE_CLIENT_ID_ANDROID');
    }
    
    if (clientType === 'web' && !this.googleAuthService.isConfigured()) {
      throw new BadRequestException('Google OAuth Web is not configured. Please set GOOGLE_CLIENT_ID_WEB and GOOGLE_CLIENT_SECRET_WEB');
    }

    // Verify Google ID token
    const googleUser = await this.googleAuthService.verifyIdToken(dto.id_token, clientType);

    // Check if user exists with this Google ID
    let user = await this.userService.findByGoogleId(googleUser.googleId);

    if (!user) {
      // Check if user exists with this email
      user = await this.userService.findByEmail(googleUser.email);

      if (user) {
        // User exists with email but not Google ID - link Google account
        user = await this.userService.updateGoogleId((user as any)._id.toString(), googleUser.googleId);
      } else {
        // Create new user with Google account
        // Generate username from email (remove @domain.com)
        const usernameBase = googleUser.email.split('@')[0];
        let username = usernameBase;
        let counter = 1;
        
        // Ensure username is unique
        while (await this.userService.findByUsername(username)) {
          username = `${usernameBase}${counter}`;
          counter++;
        }

        // Generate email verification token (even though Google verified it)
        const emailVerificationToken = this.emailService.generateVerificationToken();

        user = await this.userService.create({
          username,
          email: googleUser.email,
          first_name: googleUser.firstName,
          last_name: googleUser.lastName,
          password: undefined, // No password for Google OAuth users
          google_id: googleUser.googleId,
          email_verified: googleUser.emailVerified, // Google already verified email
          email_verification_token: emailVerificationToken,
          email_verified_at: googleUser.emailVerified ? new Date() : undefined,
          profile_image_url: googleUser.picture,
        });

        // If Google didn't verify email, send verification email
        if (!googleUser.emailVerified) {
          try {
            await this.emailService.sendVerificationEmail(
              googleUser.email, 
              emailVerificationToken, 
              googleUser.firstName
            );
          } catch (error) {
            console.error('Failed to send verification email:', error);
          }
        }
      }
    }

    // Generate JWT token
    const payload = { sub: (user as any)._id.toString(), username: user.username };
    const token = await this.jwtService.signAsync(payload);
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password: _password, ...userData } = userObj;

    return {
      access_token: token,
      user: userData,
      onboarding_completed: user.onboarding_completed || false,
      email_verified: user.email_verified || false,
    };
  }

  /**
   * Verify email address using verification token
   */
  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.userService.findByVerificationToken(dto.token);

    if (!user) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    // Update user to mark email as verified
    await this.userService.verifyEmail((user as any)._id.toString());

    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    return {
      message: 'Email verified successfully',
      user: {
        ...userObj,
        email_verified: true,
      },
    };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email_verified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const emailVerificationToken = this.emailService.generateVerificationToken();
    await this.userService.updateVerificationToken((user as any)._id.toString(), emailVerificationToken);

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email, 
      emailVerificationToken, 
      user.first_name
    );

    return {
      message: 'Verification email sent successfully',
    };
  }

  /**
   * Send OTP code to user's email
   * If user doesn't exist, return error
   */
  async sendOTP(dto: SendOTPDto) {
    const email = dto.email.trim().toLowerCase();
    
    // Check if user exists with this email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Aucun compte trouvé avec cet email');
    }

    // Generate 4-digit OTP code
    const otpCode = this.emailService.generateOTPCode();
    
    // Calculate expiration time (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Invalidate any existing OTPs for this email
    await this.otpModel.updateMany(
      { email, used: false },
      { $set: { used: true } }
    ).exec();

    // Create new OTP record
    const otp = new this.otpModel({
      email,
      code: otpCode,
      expires_at: expiresAt,
      used: false,
    });
    await otp.save();

    // Send OTP email
    try {
      await this.emailService.sendOTPEmail(email, otpCode, user.first_name);
    } catch (error) {
      // If email fails, mark OTP as used so it can't be used
      await this.otpModel.findByIdAndUpdate(otp._id, { used: true }).exec();
      throw new BadRequestException('Impossible d\'envoyer l\'email. Veuillez réessayer plus tard.');
    }

    return {
      message: 'Code de vérification envoyé avec succès',
      email: email, // Return email for client confirmation
    };
  }

  /**
   * Verify OTP code and login user
   */
  async verifyOTP(dto: VerifyOTPDto) {
    const email = dto.email.trim().toLowerCase();
    const code = dto.code.trim();

    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      throw new BadRequestException('Le code doit être composé de 4 chiffres');
    }

    // Find valid OTP
    const otp = await this.otpModel.findOne({
      email,
      code,
      used: false,
      expires_at: { $gt: new Date() }, // Not expired
    }).exec();

    if (!otp) {
      throw new UnauthorizedException('Code invalide ou expiré');
    }

    // Mark OTP as used
    await this.otpModel.findByIdAndUpdate(otp._id, { used: true }).exec();

    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Generate JWT token
    const payload = { sub: (user as any)._id.toString(), username: user.username };
    const token = await this.jwtService.signAsync(payload);
    
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password: _password, ...userData } = userObj;

    return {
      access_token: token,
      user: userData,
      onboarding_completed: user.onboarding_completed || false,
    };
  }
}
