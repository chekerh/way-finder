import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import {
  RegisterDto,
  LoginDto,
  GoogleSignInDto,
  VerifyEmailDto,
  SendOTPDto,
  VerifyOTPDto,
  RegisterWithOTPDto,
  SendOTPForRegistrationDto,
} from './auth.dto';
import { GoogleAuthService } from './google-auth.service';
import { EmailService } from './email.service';
import { OTP, OTPDocument } from './otp.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly emailService: EmailService,
    @InjectModel(OTP.name) private readonly otpModel: Model<OTPDocument>,
  ) {}

  /**
   * Register a new user with email and password
   * Creates user account, sends verification email, and handles duplicate key errors gracefully
   *
   * @param dto - Registration data containing username, email, password, first_name, last_name
   * @returns User object (without password) and success message
   * @throws BadRequestException if required fields are missing or invalid
   * @throws ConflictException if username or email already exists
   *
   * @example
   * const result = await authService.register({
   *   username: 'johndoe',
   *   email: 'john@example.com',
   *   password: 'SecurePass123!',
   *   first_name: 'John',
   *   last_name: 'Doe'
   * });
   *
   * Note: Email verification token is automatically generated and sent
   * Note: Password is hashed using bcrypt with 10 salt rounds for security
   */
  async register(dto: RegisterDto) {
    const username = dto.username.trim();
    const email = dto.email.trim().toLowerCase();
    const firstName = dto.first_name.trim();
    const lastName = dto.last_name.trim();

    if (!username || !email || !firstName || !lastName) {
      throw new BadRequestException('All fields are required');
    }

    // Check if username already exists
    const existing = await this.userService.findByUsername(username);
    if (existing) {
      const userId = (existing as any)._id || (existing as any).id || 'unknown';
      this.logger.warn(
        `Username conflict: ${username} already exists (user ID: ${userId})`,
      );
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await this.userService.findByEmail(email);
    if (existingEmail) {
      const userId =
        (existingEmail as any)._id || (existingEmail as any).id || 'unknown';
      this.logger.warn(
        `Email conflict: ${email} already exists (user ID: ${userId})`,
      );
      throw new ConflictException('Email already exists');
    }

    const rawPassword = dto.password.trim();
    if (!rawPassword) throw new BadRequestException('Password is required');

    const hash = await bcrypt.hash(rawPassword, 10);

    // Generate email verification token
    const emailVerificationToken =
      this.emailService.generateVerificationToken();

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
        await this.emailService.sendVerificationEmail(
          email,
          emailVerificationToken,
          firstName,
        );
      } catch (error) {
        // Log error but don't fail registration if email fails
        this.logger.error(
          'Failed to send verification email',
          error.stack || error,
        );
      }

      const userObj = (user as any).toObject ? (user as any).toObject() : user;
      const { password: _password, ...result } = userObj;
      return {
        message:
          'User registered successfully. Please check your email to verify your account.',
        user: result,
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
          } else if (
            message.includes('username') ||
            message.includes('username_1')
          ) {
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

  /**
   * Authenticate user with email and password
   * Validates credentials, updates login streak, and returns JWT token
   *
   * @param dto - Login data containing email and password
   * @returns JWT access token, user object (without password), and onboarding status
   * @throws BadRequestException if email or password is missing
   * @throws UnauthorizedException if credentials are invalid or user doesn't exist
   *
   * @example
   * const result = await authService.login({
   *   email: 'john@example.com',
   *   password: 'SecurePass123!'
   * });
   *
   * Note: Only accepts email addresses for login (not usernames)
   * Note: Updates user's day streak on successful login
   * Note: Google OAuth users without password cannot use this method
   */
  async login(dto: LoginDto) {
    // Only accept email addresses for login
    const email = dto.email.trim().toLowerCase();
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const rawPassword = dto.password.trim();
    if (!rawPassword) throw new BadRequestException('Password is required');

    // Search user by email only
    const user = await this.userService.findByEmail(email);
    this.logger.debug(
      `Searching by email: ${email}, found: ${user ? 'YES' : 'NO'}`,
    );

    if (!user) {
      this.logger.warn(`User not found for email: ${email}`);
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }

    // Check if user has a password (Google OAuth users might not have one)
    if (!user.password) {
      throw new UnauthorizedException(
        'Cet compte a été créé via Google ou Apple. Veuillez vous connecter avec cette méthode ou utilisez la connexion par code OTP.',
      );
    }

    const passwordMatch = await bcrypt.compare(rawPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Email ou mot de passe incorrect. Si vous avez oublié votre mot de passe, utilisez la connexion par code OTP.',
      );
    }

    // Update day streak on login
    try {
      await this.userService.updateDayStreak((user as any)._id.toString());
    } catch (error) {
      this.logger.warn(`Failed to update day streak: ${error.message}`);
      // Don't fail login if streak update fails
    }

    const payload = {
      sub: (user as any)._id.toString(),
      username: user.username,
    };
    const token = await this.jwtService.signAsync(payload);
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password: _password, ...userData } = userObj;
    return {
      access_token: token,
      user: userData,
      onboarding_completed: user.onboarding_completed || false,
    };
  }

  /**
   * Google Sign-In / Sign-Up
   * If user exists with Google ID, login; otherwise create new user
   */
  async googleSignIn(dto: GoogleSignInDto) {
    const clientType = dto.client_type || 'android';

    // Check configuration based on client type
    if (
      clientType === 'android' &&
      !this.googleAuthService.isAndroidConfigured()
    ) {
      throw new BadRequestException(
        'Google OAuth Android is not configured. Please set GOOGLE_CLIENT_ID_ANDROID',
      );
    }

    if (clientType === 'web' && !this.googleAuthService.isConfigured()) {
      throw new BadRequestException(
        'Google OAuth Web is not configured. Please set GOOGLE_CLIENT_ID_WEB and GOOGLE_CLIENT_SECRET_WEB',
      );
    }

    // Verify Google ID token
    this.logger.debug(`Verifying token for client_type: ${clientType}`);
    const googleUser = await this.googleAuthService.verifyIdToken(
      dto.id_token,
      clientType,
    );
    this.logger.debug(
      `Token verified - email: ${googleUser.email}, googleId: ${googleUser.googleId}`,
    );

    // Check if user exists with this Google ID
    let user = await this.userService.findByGoogleId(googleUser.googleId);
    this.logger.debug(
      `User lookup by Google ID: ${user ? 'FOUND' : 'NOT FOUND'}`,
    );

    if (!user) {
      // Check if user exists with this email
      this.logger.debug(
        `Checking for existing user with email: ${googleUser.email}`,
      );
      user = await this.userService.findByEmail(googleUser.email);

      if (user) {
        // User exists with email but not Google ID - link Google account
        this.logger.log(
          `User found by email, linking Google ID. Existing username: ${user.username}`,
        );
        try {
          user = await this.userService.updateGoogleId(
            (user as any)._id.toString(),
            googleUser.googleId,
          );
          this.logger.log(
            `Successfully linked Google ID to existing user: ${(user as any)._id}`,
          );
        } catch (error: any) {
          // Handle potential duplicate key error (Google ID already linked to another user)
          if (error.code === 11000 || error.message?.includes('duplicate')) {
            this.logger.warn(
              `Google ID ${googleUser.googleId} is already linked to another user. Attempting to find user with this Google ID.`,
            );
            // Try to find the user with this Google ID (might have been linked between checks)
            const userWithGoogleId = await this.userService.findByGoogleId(
              googleUser.googleId,
            );
            if (userWithGoogleId) {
              this.logger.log(
                `Found user with Google ID. Using that user instead.`,
              );
              user = userWithGoogleId;
            } else {
              // This shouldn't happen, but if it does, throw a more descriptive error
              this.logger.error(
                `Failed to link Google ID: ${error.message}`,
                error.stack,
              );
              throw new ConflictException(
                'Ce compte Google est déjà lié à un autre compte. Veuillez utiliser le compte associé ou contactez le support.',
              );
            }
          } else {
            // Re-throw other errors
            this.logger.error(
              `Error linking Google ID: ${error.message}`,
              error.stack,
            );
            throw error;
          }
        }
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
        this.logger.log(
          `Creating new user - email: ${googleUser.email}, generated username: ${username}`,
        );

        // Generate email verification token (even though Google verified it)
        const emailVerificationToken =
          this.emailService.generateVerificationToken();

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
              googleUser.firstName,
            );
          } catch (error) {
            this.logger.error(
              'Failed to send verification email',
              error.stack || error,
            );
          }
        }
      }
    }

    // Update day streak on login
    try {
      await this.userService.updateDayStreak((user as any)._id.toString());
    } catch (error) {
      this.logger.warn(`Failed to update day streak: ${error.message}`);
      // Don't fail login if streak update fails
    }

    // Generate JWT token
    const payload = {
      sub: (user as any)._id.toString(),
      username: user.username,
    };
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
   * Verify user email address using verification token
   * Marks email as verified and removes verification token
   *
   * @param dto - Email verification data containing verification token
   * @returns Success message and user object with verified email status
   * @throws NotFoundException if verification token is invalid or expired
   *
   * @example
   * const result = await authService.verifyEmail({
   *   token: 'verification-token-from-email'
   * });
   *
   * Note: Verification tokens are single-use and expire after a set period
   * Note: After verification, email_verified is set to true and email_verified_at is set
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
   * Resend email verification token to user
   * Generates new verification token and sends verification email
   *
   * @param email - User email address to resend verification to
   * @returns Success message
   * @throws NotFoundException if user doesn't exist with the provided email
   * @throws BadRequestException if email is already verified
   *
   * @example
   * const result = await authService.resendVerificationEmail('user@example.com');
   *
   * Note: Generates a new verification token, invalidating the previous one
   * Note: Only works for unverified email addresses
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
    const emailVerificationToken =
      this.emailService.generateVerificationToken();
    await this.userService.updateVerificationToken(
      (user as any)._id.toString(),
      emailVerificationToken,
    );

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      emailVerificationToken,
      user.first_name,
    );

    return {
      message: 'Verification email sent successfully',
    };
  }

  /**
   * Send OTP code to existing user's email for login
   * Validates user exists, generates OTP, and sends verification email
   *
   * @param dto - OTP request containing email address
   * @returns Success message and email confirmation
   * @throws NotFoundException if user doesn't exist with the provided email
   * @throws BadRequestException if cooldown period hasn't elapsed (30 seconds) or email service fails
   *
   * @example
   * const result = await authService.sendOTP({
   *   email: 'existinguser@example.com'
   * });
   *
   * Note: OTP code is 4 digits and expires after 5 minutes
   * Note: 30-second cooldown between OTP requests
   * Note: Existing OTPs for the email are invalidated when new one is sent
   * Note: Use sendOTPForRegistration() for new user signups
   */
  async sendOTP(dto: SendOTPDto) {
    const email = dto.email.trim().toLowerCase();

    // Check if user exists with this email - STRICT CHECK
    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.warn(`Send OTP: User not found for email: ${email}`);
      throw new NotFoundException(
        "Aucun compte trouvé avec cet email. Veuillez d'abord créer un compte.",
      );
    }

    this.logger.debug(
      `Send OTP: User found for email: ${email}, user ID: ${(user as any)._id}`,
    );

    // Check cooldown period (30 seconds)
    const recentOTP = await this.otpModel
      .findOne({
        email,
        last_sent_at: { $gte: new Date(Date.now() - 30 * 1000) }, // Within last 30 seconds
      })
      .sort({ last_sent_at: -1 })
      .exec();

    if (recentOTP) {
      const secondsRemaining = Math.ceil(
        (30 * 1000 - (Date.now() - recentOTP.last_sent_at.getTime())) / 1000,
      );
      throw new BadRequestException(
        `Veuillez attendre ${secondsRemaining} seconde(s) avant de renvoyer le code.`,
      );
    }

    // Generate 4-digit OTP code
    const otpCode = this.emailService.generateOTPCode();
    // Normalize code to ensure it's exactly 4 digits
    const normalizedCode = otpCode
      .replace(/\D/g, '')
      .padStart(4, '0')
      .slice(0, 4);

    // Calculate expiration time (5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    const now = new Date();

    // Invalidate any existing OTPs for this email
    await this.otpModel
      .updateMany({ email, used: false }, { $set: { used: true } })
      .exec();

    // Create new OTP record - use normalized code
    const otp = new this.otpModel({
      email,
      code: normalizedCode,
      expires_at: expiresAt,
      used: false,
      last_sent_at: now,
    });
    await otp.save();

    // Send OTP email - use normalized code to ensure consistency
    try {
      this.logger.debug(`Send OTP: Attempting to send OTP email to ${email}`);
      await this.emailService.sendOTPEmail(
        email,
        normalizedCode,
        user.first_name,
      );
      this.logger.log(`Send OTP: OTP email sent successfully to ${email}`);
    } catch (error: any) {
      // Log detailed error information
      this.logger.error(
        `Send OTP: Failed to send email to ${email}: ${error.message || error}`,
        error.stack,
      );
      this.logger.debug(
        `Send OTP: Error details: ${JSON.stringify(error, null, 2)}`,
      );

      // Don't mark OTP as used if email fails - allow user to retry
      this.logger.error(
        `Send OTP: Email service error - OTP code was generated but email failed to send`,
      );
      throw new BadRequestException(
        `Impossible d'envoyer l'email. Erreur: ${error.message || 'Service email non configuré'}. Veuillez vérifier la configuration email sur Render ou réessayer plus tard.`,
      );
    }

    return {
      message: 'Code de vérification envoyé avec succès',
      email: email, // Return email for client confirmation
    };
  }

  /**
   * Verify OTP code and authenticate user
   * Validates 4-digit OTP, marks it as used, and returns JWT token for login
   *
   * @param dto - OTP verification data containing email and 4-digit code
   * @returns JWT access token, user object (without password), and onboarding status
   * @throws BadRequestException if code format is invalid or no OTP was sent
   * @throws UnauthorizedException if code is invalid, expired, or already used
   * @throws NotFoundException if user doesn't exist after OTP verification
   *
   * @example
   * const result = await authService.verifyOTP({
   *   email: 'john@example.com',
   *   code: '1234'
   * });
   *
   * Note: OTP code is normalized to 4 digits (removes non-digit characters)
   * Note: OTP expires after 5 minutes
   * Note: Each OTP can only be used once
   * Note: Updates user's day streak on successful login
   */
  async verifyOTP(dto: VerifyOTPDto) {
    const email = dto.email.trim().toLowerCase();
    // Normalize code: remove all non-digit characters and ensure it's exactly 4 digits
    const code = dto.code
      .trim()
      .replace(/\D/g, '')
      .padStart(4, '0')
      .slice(0, 4);

    this.logger.debug(`Verifying OTP for ${email}`);

    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      throw new BadRequestException('Le code doit être composé de 4 chiffres');
    }

    // Check if any OTP was sent for this email
    const anyOTP = await this.otpModel
      .findOne({ email })
      .sort({ last_sent_at: -1 })
      .exec();
    if (!anyOTP) {
      this.logger.warn(`No OTP found for email: ${email}`);
      throw new BadRequestException(
        "Aucun code n'a été envoyé. Veuillez d'abord demander un code.",
      );
    }

    // Debug: List all OTPs for this email (only in debug mode)
    if (process.env.NODE_ENV === 'development') {
      const allOtps = await this.otpModel.find({ email }).exec();
      this.logger.debug(`Found ${allOtps.length} OTP records for ${email}`);
    }

    // Find valid OTP - use exact code match
    const otp = await this.otpModel
      .findOne({
        email,
        code: code, // Exact match with normalized code
        used: false,
        expires_at: { $gt: new Date() }, // Not expired
      })
      .exec();

    if (!otp) {
      this.logger.warn(`No valid OTP found for ${email}`);

      // Check if code exists but is used
      const usedOtp = await this.otpModel
        .findOne({ email, code: code, used: true })
        .exec();
      if (usedOtp) {
        this.logger.warn(`OTP found but already used for ${email}`);
        throw new UnauthorizedException(
          'Ce code a déjà été utilisé. Veuillez demander un nouveau code.',
        );
      }

      // Check if code exists but is expired
      const expiredOtp = await this.otpModel
        .findOne({
          email,
          code: code,
          expires_at: { $lte: new Date() },
        })
        .exec();
      if (expiredOtp) {
        this.logger.warn(`OTP found but expired for ${email}`);
        throw new UnauthorizedException(
          'Le code a expiré. Veuillez demander un nouveau code.',
        );
      }

      this.logger.warn(`Invalid OTP code provided for ${email}`);
      throw new UnauthorizedException(
        'Code invalide. Veuillez vérifier le code et réessayer.',
      );
    }

    this.logger.debug(`Valid OTP found for ${email}`);

    // Mark OTP as used
    await this.otpModel.findByIdAndUpdate(otp._id, { used: true }).exec();

    // Find user by email - MUST exist for OTP login
    const user = await this.userService.findByEmail(email);
    if (!user) {
      this.logger.error(
        `User not found for email: ${email} after OTP verification`,
      );
      throw new NotFoundException(
        "Utilisateur introuvable. Le code OTP a été vérifié mais aucun compte n'existe avec cet email. Veuillez d'abord créer un compte.",
      );
    }

    this.logger.debug(`User found for email: ${email}`);

    // Update day streak on login
    try {
      await this.userService.updateDayStreak((user as any)._id.toString());
    } catch (error) {
      this.logger.warn(`Failed to update day streak: ${error.message}`);
      // Don't fail login if streak update fails
    }

    // Generate JWT token
    const payload = {
      sub: (user as any)._id.toString(),
      username: user.username,
    };
    const token = await this.jwtService.signAsync(payload);

    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password: _password, ...userData } = userObj;

    return {
      access_token: token,
      user: userData,
      onboarding_completed: user.onboarding_completed || false,
    };
  }

  /**
   * Send OTP code for new user registration
   * Validates that email doesn't exist, generates OTP, and sends verification email
   *
   * @param dto - Registration OTP request containing email address
   * @returns Success message and email confirmation
   * @throws ConflictException if email already exists (user should login instead)
   * @throws BadRequestException if cooldown period hasn't elapsed (30 seconds) or email service fails
   *
   * @example
   * const result = await authService.sendOTPForRegistration({
   *   email: 'newuser@example.com'
   * });
   *
   * Note: OTP code is 4 digits and expires after 5 minutes
   * Note: 30-second cooldown between OTP requests
   * Note: Existing OTPs for the email are invalidated when new one is sent
   * Note: For existing users, use sendOTP() instead
   */
  async sendOTPForRegistration(dto: SendOTPForRegistrationDto) {
    const email = dto.email.trim().toLowerCase();

    // Check if user already exists with this email - DO THIS FIRST, BEFORE ANY OTP CREATION
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      this.logger.warn(
        `Email already exists: ${email} - NOT sending OTP, redirecting to login`,
      );
      // Check if user has a password or was created via OAuth
      if (!existingUser.password) {
        throw new ConflictException(
          'Cet email est déjà enregistré via Google ou Apple. Veuillez vous connecter avec cette méthode ou utiliser un autre email.',
        );
      }
      // User exists with password - tell them to login instead
      throw new ConflictException(
        'Un utilisateur avec cet email existe déjà. Veuillez vous connecter avec votre mot de passe ou utilisez la connexion par code OTP.',
      );
    }

    this.logger.debug(
      `Email ${email} does not exist - proceeding with OTP generation`,
    );

    // Check cooldown period (30 seconds)
    const recentOTP = await this.otpModel
      .findOne({
        email,
        last_sent_at: { $gte: new Date(Date.now() - 30 * 1000) }, // Within last 30 seconds
      })
      .sort({ last_sent_at: -1 })
      .exec();

    if (recentOTP) {
      const secondsRemaining = Math.ceil(
        (30 * 1000 - (Date.now() - recentOTP.last_sent_at.getTime())) / 1000,
      );
      throw new BadRequestException(
        `Veuillez attendre ${secondsRemaining} seconde(s) avant de renvoyer le code.`,
      );
    }

    // Generate 4-digit OTP code
    const otpCode = this.emailService.generateOTPCode();
    this.logger.debug(`Generated OTP code for ${email}`);

    // Calculate expiration time (5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    const now = new Date();
    this.logger.debug(`OTP will expire at: ${expiresAt.toISOString()}`);

    // Invalidate any existing OTPs for this email
    await this.otpModel
      .updateMany({ email, used: false }, { $set: { used: true } })
      .exec();

    // Create new OTP record - ensure code is normalized (4 digits, no spaces)
    const normalizedCode = otpCode
      .replace(/\D/g, '')
      .padStart(4, '0')
      .slice(0, 4);
    this.logger.debug(`Saving OTP for ${email}`);

    const otp = new this.otpModel({
      email,
      code: normalizedCode,
      expires_at: expiresAt,
      used: false,
      last_sent_at: now,
    });
    await otp.save();
    this.logger.debug(`OTP saved with ID: ${otp._id}`);

    // Send OTP email - use normalized code to ensure consistency
    try {
      this.logger.debug(`Attempting to send OTP email to ${email}`);
      await this.emailService.sendOTPEmail(email, normalizedCode);
      this.logger.log(`OTP email sent successfully to ${email}`);
    } catch (error: any) {
      // Log detailed error information
      this.logger.error(
        `Failed to send email to ${email}: ${error.message || error}`,
        error.stack,
      );
      this.logger.debug(`Error details: ${JSON.stringify(error, null, 2)}`);

      // Don't mark OTP as used if email fails - allow user to retry
      // The OTP is still valid, they just need to request a new one
      this.logger.error(
        `Email service error - OTP code was generated but email failed to send`,
      );
      throw new BadRequestException(
        `Impossible d'envoyer l'email. Erreur: ${error.message || 'Service email non configuré'}. Veuillez vérifier la configuration email sur Render ou réessayer plus tard.`,
      );
    }

    return {
      message: 'Code de vérification envoyé avec succès',
      email: email,
    };
  }

  /**
   * Register a new user using OTP verification code
   * Verifies OTP code, creates user account with email already verified
   *
   * @param dto - Registration data with OTP code, username, email, first_name, last_name
   * @returns User object (without password) and success message
   * @throws BadRequestException if OTP format is invalid, required fields missing, or username format invalid
   * @throws UnauthorizedException if OTP is invalid, expired, or already used
   * @throws ConflictException if username or email already exists
   *
   * @example
   * const result = await authService.registerWithOTP({
   *   email: 'newuser@example.com',
   *   otp_code: '1234',
   *   username: 'newuser',
   *   first_name: 'New',
   *   last_name: 'User'
   * });
   *
   * Note: Email is automatically verified since OTP was sent to it
   * Note: No password required for OTP-based registration
   * Note: User can login later using OTP code or set password
   */
  async registerWithOTP(dto: RegisterWithOTPDto) {
    const email = dto.email.trim().toLowerCase();
    // Normalize code: remove all non-digit characters and ensure it's exactly 4 digits
    const code = dto.otp_code.replace(/\D/g, '').padStart(4, '0').slice(0, 4);
    const username = dto.username.trim();
    const firstName = dto.first_name.trim();
    const lastName = dto.last_name.trim();

    // Validate OTP code format
    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      throw new BadRequestException('Le code doit être composé de 4 chiffres');
    }

    // Verify OTP
    this.logger.debug(`Verifying OTP for ${email}`);

    // Check if any OTP was sent for this email
    const anyOTP = await this.otpModel
      .findOne({ email })
      .sort({ last_sent_at: -1 })
      .exec();
    if (!anyOTP) {
      throw new BadRequestException(
        "Aucun code n'a été envoyé. Veuillez d'abord demander un code.",
      );
    }

    // First, find all OTPs for this email to debug
    const allOtps = await this.otpModel.find({ email }).exec();
    this.logger.debug(`Found ${allOtps.length} OTP records for ${email}`);
    allOtps.forEach((otp, index) => {
      // Debug logging removed - use Logger if needed
    });

    // Verify OTP - use exact code match with normalized code
    const otp = await this.otpModel
      .findOne({
        email,
        code: code, // Exact match with normalized code
        used: false,
        expires_at: { $gt: new Date() }, // Not expired
      })
      .exec();

    if (!otp) {
      // Check if code exists but is used
      const usedOtp = await this.otpModel
        .findOne({ email, code, used: true })
        .exec();
      if (usedOtp) {
        this.logger.warn(`OTP found but already used for ${email}`);
        throw new UnauthorizedException(
          'Ce code a déjà été utilisé. Veuillez demander un nouveau code.',
        );
      }

      // Check if code exists but is expired
      const expiredOtp = await this.otpModel
        .findOne({
          email,
          code,
          expires_at: { $lte: new Date() },
        })
        .exec();
      if (expiredOtp) {
        this.logger.warn(`OTP found but expired for ${email}`);
        throw new UnauthorizedException(
          'Le code a expiré. Veuillez demander un nouveau code.',
        );
      }

      this.logger.warn(`No valid OTP found for ${email}`);
      throw new UnauthorizedException(
        'Code invalide. Veuillez vérifier le code et réessayer.',
      );
    }

    this.logger.debug(`Valid OTP found for ${email}`);

    // Mark OTP as used
    await this.otpModel.findByIdAndUpdate(otp._id, { used: true }).exec();

    // Double-check that email doesn't exist (race condition protection)
    this.logger.debug(`Checking if email exists: ${email}`);
    const existingEmail = await this.userService.findByEmail(email);

    if (existingEmail) {
      this.logger.warn(
        `Email already exists: ${email} (race condition - user created between OTP send and verify)`,
      );

      // If user exists and OTP is valid, automatically log them in instead of rejecting
      // This handles race conditions where user was created between OTP send and verify
      const payload = {
        sub: (existingEmail as any)._id.toString(),
        username: existingEmail.username,
      };
      const token = await this.jwtService.signAsync(payload);
      this.logger.log(`Token generated successfully for auto-login`);

      const userObj = (existingEmail as any).toObject
        ? (existingEmail as any).toObject()
        : existingEmail;
      const { password: _password, ...userData } = userObj;
      return {
        message: 'Connexion réussie avec le code OTP',
        access_token: token,
        user: userData,
        onboarding_completed: existingEmail.onboarding_completed || false,
        auto_login: true, // Flag to indicate this was an auto-login
      };
    }

    this.logger.debug(
      `Email does not exist, proceeding with registration for ${email}`,
    );

    // Check if username already exists
    const existingUsername = await this.userService.findByUsername(username);
    if (existingUsername) {
      this.logger.warn(`Username conflict: ${username} already exists`);
      throw new ConflictException(
        "Ce nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre.",
      );
    }
    
    // Additional safety check: try to find user by email one more time
    // This handles edge cases where the user might exist but wasn't found in the first check
    const finalEmailCheck = await this.userService.findByEmail(email);
    if (finalEmailCheck) {
      this.logger.warn(
        `Email found in final check: ${email} - user may have been created concurrently`,
      );
      // Auto-login if user exists
      const payload = {
        sub: (finalEmailCheck as any)._id.toString(),
        username: finalEmailCheck.username,
      };
      const token = await this.jwtService.signAsync(payload);
      const userObj = (finalEmailCheck as any).toObject
        ? (finalEmailCheck as any).toObject()
        : finalEmailCheck;
      const { password: _password, ...userData } = userObj;
      return {
        message: 'Connexion réussie avec le code OTP',
        access_token: token,
        user: userData,
        onboarding_completed: finalEmailCheck.onboarding_completed || false,
        auto_login: true,
      };
    }

    if (!username || !email || !firstName || !lastName) {
      throw new BadRequestException('Tous les champs sont requis');
    }

    const rawPassword = dto.password.trim();
    if (!rawPassword)
      throw new BadRequestException('Le mot de passe est requis');

    const hash = await bcrypt.hash(rawPassword, 10);

    // Generate email verification token (OTP already verified email)
    const emailVerificationToken =
      this.emailService.generateVerificationToken();

    try {
      const user = await this.userService.create({
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        password: hash,
        email_verified: true, // Email verified via OTP
        email_verification_token: emailVerificationToken,
        email_verified_at: new Date(),
      });

      this.logger.log(`User registered successfully: ${email}`);

      const userObj = (user as any).toObject ? (user as any).toObject() : user;
      const { password: _password, ...result } = userObj;
      return {
        message: 'Compte créé avec succès',
        user: result,
      };
    } catch (error: any) {
      // Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        this.logger.warn(
          `MongoDB duplicate key error for email: ${email}, username: ${username}`,
        );
        this.logger.debug(`Error keyPattern: ${JSON.stringify(error.keyPattern)}`);
        this.logger.debug(`Error message: ${error.message}`);

        let duplicateField: string | null = null;

        // First, try to extract from keyPattern (most reliable)
        if (error.keyPattern) {
          const keys = Object.keys(error.keyPattern);
          if (keys.length > 0) {
            // Map MongoDB field names to our field names
            const fieldName = keys[0];
            if (fieldName === 'email' || fieldName.includes('email')) {
              duplicateField = 'email';
            } else if (fieldName === 'username' || fieldName.includes('username')) {
              duplicateField = 'username';
            }
          }
        }

        // If not found in keyPattern, try to extract from error message
        if (!duplicateField && error.message) {
          const message = error.message.toLowerCase();
          if (message.includes('email') || message.includes('email_1')) {
            duplicateField = 'email';
          } else if (
            message.includes('username') ||
            message.includes('username_1')
          ) {
            duplicateField = 'username';
          }
        }

        // If still not determined, check the database directly
        // This handles cases where the error doesn't specify the field
        if (!duplicateField) {
          this.logger.debug(
            `Duplicate field not determined from error, checking database...`,
          );
          const checkEmail = await this.userService.findByEmail(email);
          const checkUsername = await this.userService.findByUsername(username);
          
          if (checkEmail) {
            this.logger.debug(`Found existing user by email: ${email}`);
            duplicateField = 'email';
          } else if (checkUsername) {
            this.logger.debug(`Found existing user by username: ${username}`);
            duplicateField = 'username';
          } else {
            // If MongoDB says duplicate but we can't find the user,
            // it's likely a race condition or index issue
            // Default to email as it's the most common case
            this.logger.warn(
              `MongoDB duplicate key error but user not found in database. Assuming email duplicate.`,
            );
            duplicateField = 'email';
          }
        }

        // Handle based on duplicate field
        if (duplicateField === 'email') {
          // Check if user has a password (Google/Apple OAuth user)
          const existingUser = await this.userService.findByEmail(email);
          if (existingUser) {
            if (!existingUser.password) {
              throw new ConflictException(
                'Cet email est déjà enregistré via Google ou Apple. Veuillez vous connecter avec cette méthode ou utilisez la connexion par code OTP.',
              );
            }
            throw new ConflictException(
              'Cet email est déjà enregistré. Veuillez vous connecter avec votre mot de passe ou utilisez la connexion par code OTP.',
            );
          } else {
            // User exists in DB but findByEmail didn't find it (unlikely but possible)
            // This could happen if there's a case sensitivity or normalization issue
            throw new ConflictException(
              'Cet email est déjà enregistré. Veuillez vous connecter avec votre mot de passe ou utilisez la connexion par code OTP.',
            );
          }
        }
        
        if (duplicateField === 'username') {
          throw new ConflictException(
            "Ce nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre.",
          );
        }

        // Final fallback (should rarely reach here)
        throw new ConflictException(
          'Un utilisateur avec ces informations existe déjà. Veuillez vous connecter avec votre mot de passe ou utilisez la connexion par code OTP.',
        );
      }
      throw error;
    }
  }
}
