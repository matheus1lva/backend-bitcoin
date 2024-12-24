import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreatePlaidTokenDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  userId: string;
}
