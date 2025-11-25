import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsEmail,
  IsOptional,
  IsNumberString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../entities/patient.entity';

export class CreatePatientDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty({ example: '1980-05-15' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ enum: Gender, required: false })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  mobilePhone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ required: false })
  @IsNumberString()
  @IsOptional()
  zipCode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bloodType?: string;
}
