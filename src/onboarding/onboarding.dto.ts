import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class AnswerDto {
  @IsNotEmpty()
  @IsString()
  session_id: string;

  @IsNotEmpty()
  @IsString()
  question_id: string;

  @IsNotEmpty()
  answer: string | number | string[] | object;
}

export class ResumeOnboardingDto {
  @IsOptional()
  @IsString()
  session_id?: string;
}
