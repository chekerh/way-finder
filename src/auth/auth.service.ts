import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
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
    const existing = await this.userService.findByUsername(dto.username);
    if (existing) throw new ConflictException('Username already exists');
    
    // Check if email already exists
    const existingEmail = await this.userService.findByEmail(dto.email);
    if (existingEmail) throw new ConflictException('Email already exists');
    
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({ ...dto, password: hash });
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...result } = userObj;
    return { message: 'User registered successfully', user: result };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByUsername(dto.username);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.password);
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
