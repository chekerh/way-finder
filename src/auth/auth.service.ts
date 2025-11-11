import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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
    
    const password = dto.password.trim();
    if (!password) throw new BadRequestException('Password is required');

    const hash = await bcrypt.hash(password, 10);
    const user = await this.userService.create({
      ...dto,
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      password: hash,
    });
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...result } = userObj;
    return { message: 'User registered successfully', user: result };
  }

  async login(dto: LoginDto) {
    const username = dto.username.trim();
    if (!username) throw new BadRequestException('Username is required');

    const password = dto.password.trim();
    if (!password) throw new BadRequestException('Password is required');

    const user = await this.userService.findByUsername(username);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: (user as any)._id.toString(), username: user.username };
    const token = await this.jwtService.signAsync(payload);
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...userData } = userObj;
    return { 
      access_token: token,
      user: userData,
      onboarding_completed: user.onboarding_completed || false
    };
  }
}
