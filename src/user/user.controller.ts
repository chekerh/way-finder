import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { UpdateUserDto } from './user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ImgBBService } from '../journey/imgbb.service';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import * as path from 'node:path';
import * as fs from 'node:fs';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly imgbbService: ImgBBService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const user = await this.userService.findById(req.user.sub);
    if (!user) return null;
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...result } = userObj;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req: any, @Body() dto: UpdateUserDto) {
    const user = await this.userService.updateProfile(req.user.sub, dto);
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...result } = userObj;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req, file, cb) => {
          const userId = (req as any).user?.sub;
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `profile-${userId}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadProfileImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.logger.log(
      `Uploading profile image to ImgBB for user ${req.user.sub}`,
    );

    let imageUrl: string;
    const filePath = path.join(file.destination, file.filename);

    try {
      // Upload to ImgBB
      const imgbbUrl = await this.imgbbService.uploadImage(
        filePath,
        `profile-${req.user.sub}.jpg`,
      );

      // Clean up local file after successful upload
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          this.logger.debug(`Deleted local profile file: ${filePath}`);
        }
      } catch (cleanupError) {
        this.logger.warn(
          `Failed to delete local profile file ${filePath}: ${cleanupError.message}`,
        );
      }

      imageUrl = imgbbUrl;
      this.logger.log(
        `Profile image uploaded successfully to ImgBB: ${imageUrl}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to upload profile image to ImgBB: ${error.message}`,
        error.stack,
      );
      // Fallback to local storage if ImgBB fails
      const publicBaseUrl = (
        process.env.PUBLIC_BASE_URL ||
        process.env.BASE_URL ||
        'http://localhost:3000'
      ).replace(/\/$/, '');
      imageUrl = `${publicBaseUrl}/uploads/profiles/${file.filename}`;
      this.logger.warn(
        `Using local storage fallback for profile image: ${imageUrl}`,
      );
    }

    // Update user profile with image URL
    const user = await this.userService.updateProfile(req.user.sub, {
      profile_image_url: imageUrl,
    });

    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...result } = userObj;

    return {
      message: 'Profile image uploaded successfully',
      profile_image_url: imageUrl,
      user: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('fcm-token')
  async registerFcmToken(@Req() req: any, @Body() body: { token: string }) {
    await this.userService.updateFcmToken(req.user.sub, body.token);
    return { message: 'FCM token registered successfully' };
  }
}
