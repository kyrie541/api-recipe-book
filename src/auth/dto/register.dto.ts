import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  // At least 8 characters long.
  // At least 1 lowercase letter.
  // At least 1 uppercase letter.
  // At least 1 number.
  // At least 1 symbol (special character).
  @IsString()
  @IsStrongPassword()
  password: string;
}
