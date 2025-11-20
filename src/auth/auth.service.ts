import { BadRequestException, ConflictException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto, GoogleSignInDto, VerifyEmailDto } from './auth.dto';
import { GoogleAuthService } from './google-auth.service';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly emailService: EmailService,
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
    
    const user = await this.userService.create({
      ...dto,
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
}
