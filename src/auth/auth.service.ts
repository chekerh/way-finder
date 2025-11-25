import { BadRequestException, ConflictException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto, GoogleSignInDto, VerifyEmailDto, SendOTPDto, VerifyOTPDto, RegisterWithOTPDto, SendOTPForRegistrationDto } from './auth.dto';
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

    // Check if username already exists
    const existing = await this.userService.findByUsername(username);
    if (existing) {
      const userId = (existing as any)._id || (existing as any).id || 'unknown';
      console.log(`[Register] Username conflict: ${username} already exists (user ID: ${userId})`);
      throw new ConflictException('Username already exists');
    }
    
    // Check if email already exists
    const existingEmail = await this.userService.findByEmail(email);
    if (existingEmail) {
      const userId = (existingEmail as any)._id || (existingEmail as any).id || 'unknown';
      console.log(`[Register] Email conflict: ${email} already exists (user ID: ${userId})`);
      throw new ConflictException('Email already exists');
    }
    
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
      throw new UnauthorizedException('Cet compte a été créé via Google ou Apple. Veuillez vous connecter avec cette méthode ou utilisez la connexion par code OTP.');
    }

    const passwordMatch = await bcrypt.compare(rawPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Email ou mot de passe incorrect. Si vous avez oublié votre mot de passe, utilisez la connexion par code OTP.');
    }

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
    
    // Check if user exists with this email - STRICT CHECK
    const user = await this.userService.findByEmail(email);
    if (!user) {
      console.log(`[Send OTP] User not found for email: ${email}`);
      throw new NotFoundException('Aucun compte trouvé avec cet email. Veuillez d\'abord créer un compte.');
    }
    
    console.log(`[Send OTP] User found for email: ${email}, user ID: ${(user as any)._id}`);

    // Check cooldown period (30 seconds)
    const recentOTP = await this.otpModel.findOne({
      email,
      last_sent_at: { $gte: new Date(Date.now() - 30 * 1000) }, // Within last 30 seconds
    }).sort({ last_sent_at: -1 }).exec();

    if (recentOTP) {
      const secondsRemaining = Math.ceil((30 * 1000 - (Date.now() - recentOTP.last_sent_at.getTime())) / 1000);
      throw new BadRequestException(`Veuillez attendre ${secondsRemaining} seconde(s) avant de renvoyer le code.`);
    }

    // Generate 4-digit OTP code
    const otpCode = this.emailService.generateOTPCode();
    // Normalize code to ensure it's exactly 4 digits
    const normalizedCode = otpCode.replace(/\D/g, '').padStart(4, '0').slice(0, 4);
    
    // Calculate expiration time (5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    const now = new Date();

    // Invalidate any existing OTPs for this email
    await this.otpModel.updateMany(
      { email, used: false },
      { $set: { used: true } }
    ).exec();

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
      await this.emailService.sendOTPEmail(email, normalizedCode, user.first_name);
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
    const code = dto.code.trim().replace(/\D/g, '').padStart(4, '0').slice(0, 4);

    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      throw new BadRequestException('Le code doit être composé de 4 chiffres');
    }

    // Check if any OTP was sent for this email
    const anyOTP = await this.otpModel.findOne({ email }).sort({ last_sent_at: -1 }).exec();
    if (!anyOTP) {
      throw new BadRequestException('Aucun code n\'a été envoyé. Veuillez d\'abord demander un code.');
    }

    // Find valid OTP
    const otp = await this.otpModel.findOne({
      email,
      code,
      used: false,
      expires_at: { $gt: new Date() }, // Not expired
    }).exec();

    if (!otp) {
      // Check if code exists but is used
      const usedOtp = await this.otpModel.findOne({ email, code, used: true }).exec();
      if (usedOtp) {
        throw new UnauthorizedException('Ce code a déjà été utilisé. Veuillez demander un nouveau code.');
      }
      
      // Check if code exists but is expired
      const expiredOtp = await this.otpModel.findOne({ 
        email, 
        code,
        expires_at: { $lte: new Date() }
      }).exec();
      if (expiredOtp) {
        throw new UnauthorizedException('Le code a expiré. Veuillez demander un nouveau code.');
      }
      
      throw new UnauthorizedException('Code invalide. Veuillez vérifier le code et réessayer.');
    }

    // Mark OTP as used
    await this.otpModel.findByIdAndUpdate(otp._id, { used: true }).exec();

    // Find user by email - MUST exist for OTP login
    const user = await this.userService.findByEmail(email);
    if (!user) {
      console.log(`[Verify OTP] User not found for email: ${email} after OTP verification`);
      throw new NotFoundException('Utilisateur introuvable. Le code OTP a été vérifié mais aucun compte n\'existe avec cet email. Veuillez d\'abord créer un compte.');
    }
    
    console.log(`[Verify OTP] User found for email: ${email}, user ID: ${(user as any)._id}`);

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

  /**
   * Send OTP for registration - checks that email does NOT exist
   */
  async sendOTPForRegistration(dto: SendOTPForRegistrationDto) {
    const email = dto.email.trim().toLowerCase();
    
    // Check if user already exists with this email
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      console.log(`[Register OTP] Email already exists: ${email}`);
      // Check if user has a password or was created via OAuth
      if (!existingUser.password) {
        throw new ConflictException('Cet email est déjà enregistré via Google ou Apple. Veuillez vous connecter avec cette méthode ou utiliser un autre email.');
      }
      throw new ConflictException('Cet email est déjà enregistré. Veuillez vous connecter avec votre mot de passe ou utiliser la connexion par code OTP.');
    }

    // Check cooldown period (30 seconds)
    const recentOTP = await this.otpModel.findOne({
      email,
      last_sent_at: { $gte: new Date(Date.now() - 30 * 1000) }, // Within last 30 seconds
    }).sort({ last_sent_at: -1 }).exec();

    if (recentOTP) {
      const secondsRemaining = Math.ceil((30 * 1000 - (Date.now() - recentOTP.last_sent_at.getTime())) / 1000);
      throw new BadRequestException(`Veuillez attendre ${secondsRemaining} seconde(s) avant de renvoyer le code.`);
    }

    // Generate 4-digit OTP code
    const otpCode = this.emailService.generateOTPCode();
    console.log(`[Register OTP] Generated OTP code: ${otpCode} for ${email}`);
    
    // Calculate expiration time (5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    const now = new Date();
    console.log(`[Register OTP] OTP will expire at: ${expiresAt.toISOString()}`);

    // Invalidate any existing OTPs for this email
    await this.otpModel.updateMany(
      { email, used: false },
      { $set: { used: true } }
    ).exec();

    // Create new OTP record - ensure code is normalized (4 digits, no spaces)
    const normalizedCode = otpCode.replace(/\D/g, '').padStart(4, '0').slice(0, 4);
    console.log(`[Register OTP] Saving OTP for ${email}, code: ${normalizedCode} (original: ${otpCode})`);
    
    const otp = new this.otpModel({
      email,
      code: normalizedCode,
      expires_at: expiresAt,
      used: false,
      last_sent_at: now,
    });
    await otp.save();
    console.log(`[Register OTP] OTP saved with ID: ${otp._id}`);

    // Send OTP email - use normalized code to ensure consistency
    try {
      await this.emailService.sendOTPEmail(email, normalizedCode);
      console.log(`[Register OTP] OTP sent successfully to ${email}`);
    } catch (error) {
      // If email fails, mark OTP as used so it can't be used
      await this.otpModel.findByIdAndUpdate(otp._id, { used: true }).exec();
      console.error(`[Register OTP] Failed to send email to ${email}:`, error);
      throw new BadRequestException('Impossible d\'envoyer l\'email. Veuillez réessayer plus tard.');
    }

    return {
      message: 'Code de vérification envoyé avec succès',
      email: email,
    };
  }

  /**
   * Register user with OTP verification
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

    // Verify OTP - add detailed logging
    console.log(`[Register OTP] Verifying OTP for ${email}, code: ${code}`);
    
    // Check if any OTP was sent for this email
    const anyOTP = await this.otpModel.findOne({ email }).sort({ last_sent_at: -1 }).exec();
    if (!anyOTP) {
      throw new BadRequestException('Aucun code n\'a été envoyé. Veuillez d\'abord demander un code.');
    }
    
    // First, find all OTPs for this email to debug
    const allOtps = await this.otpModel.find({ email }).exec();
    console.log(`[Register OTP] Found ${allOtps.length} OTP records for ${email}`);
    allOtps.forEach((otp, index) => {
      console.log(`[Register OTP] OTP ${index + 1}: code="${otp.code}", used=${otp.used}, expires_at=${otp.expires_at}, now=${new Date()}`);
    });
    
    // Verify OTP
    const otp = await this.otpModel.findOne({
      email,
      code,
      used: false,
      expires_at: { $gt: new Date() }, // Not expired
    }).exec();

    if (!otp) {
      // Check if code exists but is used
      const usedOtp = await this.otpModel.findOne({ email, code, used: true }).exec();
      if (usedOtp) {
        console.log(`[Register OTP] OTP found but already used for ${email}`);
        throw new UnauthorizedException('Ce code a déjà été utilisé. Veuillez demander un nouveau code.');
      }
      
      // Check if code exists but is expired
      const expiredOtp = await this.otpModel.findOne({ 
        email, 
        code,
        expires_at: { $lte: new Date() }
      }).exec();
      if (expiredOtp) {
        console.log(`[Register OTP] OTP found but expired for ${email}`);
        throw new UnauthorizedException('Le code a expiré. Veuillez demander un nouveau code.');
      }
      
      console.log(`[Register OTP] No valid OTP found for ${email} with code ${code}`);
      throw new UnauthorizedException('Code invalide. Veuillez vérifier le code et réessayer.');
    }
    
    console.log(`[Register OTP] Valid OTP found for ${email}`);

    // Mark OTP as used
    await this.otpModel.findByIdAndUpdate(otp._id, { used: true }).exec();

    // Double-check that email doesn't exist (race condition protection)
    console.log(`[Register OTP] Checking if email exists: ${email}`);
    const existingEmail = await this.userService.findByEmail(email);
    console.log(`[Register OTP] Email check result: ${existingEmail ? 'EXISTS' : 'NOT FOUND'}`);
    
    if (existingEmail) {
      console.log(`[Register OTP] Email already exists: ${email}. Auto-logging in user with valid OTP.`);
      console.log(`[Register OTP] User ID: ${(existingEmail as any)._id}, Username: ${existingEmail.username}`);
      
      // If user exists and OTP is valid, automatically log them in instead of rejecting
      // This provides a better user experience
      const payload = { sub: (existingEmail as any)._id.toString(), username: existingEmail.username };
      const token = await this.jwtService.signAsync(payload);
      console.log(`[Register OTP] Token generated successfully for auto-login`);
      
      const userObj = (existingEmail as any).toObject ? (existingEmail as any).toObject() : existingEmail;
      const { password: _password, ...userData } = userObj;
      
      console.log(`[Register OTP] Returning auto-login response for ${email}`);
      return {
        message: 'Connexion réussie avec le code OTP',
        access_token: token,
        user: userData,
        onboarding_completed: existingEmail.onboarding_completed || false,
        auto_login: true, // Flag to indicate this was an auto-login
      };
    }
    
    console.log(`[Register OTP] Email does not exist, proceeding with registration for ${email}`);

    // Check if username already exists
    const existing = await this.userService.findByUsername(username);
    if (existing) {
      console.log(`[Register OTP] Username conflict: ${username} already exists`);
      throw new ConflictException('Ce nom d\'utilisateur est déjà utilisé. Veuillez en choisir un autre.');
    }

    if (!username || !email || !firstName || !lastName) {
      throw new BadRequestException('Tous les champs sont requis');
    }

    const rawPassword = dto.password.trim();
    if (!rawPassword) throw new BadRequestException('Le mot de passe est requis');

    const hash = await bcrypt.hash(rawPassword, 10);
    
    // Generate email verification token (OTP already verified email)
    const emailVerificationToken = this.emailService.generateVerificationToken();
    
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
      
      console.log(`[Register OTP] User registered successfully: ${email}`);

      const userObj = (user as any).toObject ? (user as any).toObject() : user;
      const { password: _password, ...result } = userObj;
      return { 
        message: 'Compte créé avec succès', 
        user: result 
      };
    } catch (error: any) {
      // Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        let duplicateField: string | null = null;
        
        if (error.keyPattern) {
          duplicateField = Object.keys(error.keyPattern)[0];
        }
        
        if (!duplicateField && error.message) {
          const message = error.message.toLowerCase();
          if (message.includes('email') || message.includes('email_1')) {
            duplicateField = 'email';
          } else if (message.includes('username') || message.includes('username_1')) {
            duplicateField = 'username';
          }
        }
        
        // If duplicateField is not determined, try to find it by checking the database
        if (!duplicateField) {
          const checkEmail = await this.userService.findByEmail(email);
          const checkUsername = await this.userService.findByUsername(username);
          if (checkEmail) {
            duplicateField = 'email';
          } else if (checkUsername) {
            duplicateField = 'username';
          }
        }
        
        if (duplicateField === 'email') {
          // Check if user has a password
          const existingUser = await this.userService.findByEmail(email);
          if (existingUser && !existingUser.password) {
            throw new ConflictException('Cet email est déjà enregistré via Google ou Apple. Veuillez vous connecter avec cette méthode ou utilisez la connexion par code OTP.');
          }
          throw new ConflictException('Cet email est déjà enregistré. Veuillez vous connecter avec votre mot de passe ou utilisez la connexion par code OTP.');
        }
        if (duplicateField === 'username') {
          throw new ConflictException('Ce nom d\'utilisateur est déjà utilisé. Veuillez en choisir un autre.');
        }
        // Fallback: check email as it's the most common case
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
          if (!existingUser.password) {
            throw new ConflictException('Cet email est déjà enregistré via Google ou Apple. Veuillez vous connecter avec cette méthode ou utilisez la connexion par code OTP.');
          }
          throw new ConflictException('Cet email est déjà enregistré. Veuillez vous connecter avec votre mot de passe ou utilisez la connexion par code OTP.');
        }
        throw new ConflictException('Un utilisateur avec ces informations existe déjà. Veuillez vous connecter avec votre mot de passe ou utilisez la connexion par code OTP.');
      }
      throw error;
    }
  }
}
