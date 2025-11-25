import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

@Entity({ name: 'patients', schema: 'healthcare' })
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ unique: true })
  mrn: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'middle_name', nullable: true })
  middleName?: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender?: Gender;

  @Column({ nullable: true })
  ssn?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'mobile_phone', nullable: true })
  mobilePhone?: string;

  @Column({ name: 'address_line1', nullable: true })
  addressLine1?: string;

  @Column({ name: 'address_line2', nullable: true })
  addressLine2?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ name: 'zip_code', nullable: true })
  zipCode?: string;

  @Column({ default: 'USA' })
  country: string;

  @Column({ name: 'emergency_contact_name', nullable: true })
  emergencyContactName?: string;

  @Column({ name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone?: string;

  @Column({ name: 'emergency_contact_relationship', nullable: true })
  emergencyContactRelationship?: string;

  @Column({ name: 'blood_type', nullable: true })
  bloodType?: string;

  @Column({ name: 'height_cm', type: 'decimal', precision: 5, scale: 2, nullable: true })
  heightCm?: number;

  @Column({ name: 'weight_kg', type: 'decimal', precision: 5, scale: 2, nullable: true })
  weightKg?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  get fullName(): string {
    return this.middleName
      ? `${this.firstName} ${this.middleName} ${this.lastName}`
      : `${this.firstName} ${this.lastName}`;
  }

  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
