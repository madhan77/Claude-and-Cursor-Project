import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    // Generate MRN
    const count = await this.patientsRepository.count();
    const mrn = `MRN${String(count + 1).padStart(6, '0')}`;

    const patient = this.patientsRepository.create({
      ...createPatientDto,
      mrn,
    });

    return this.patientsRepository.save(patient);
  }

  findAll(search?: string) {
    if (search) {
      return this.patientsRepository.find({
        where: [
          { firstName: Like(`%${search}%`) },
          { lastName: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
          { mrn: Like(`%${search}%`) },
        ],
        take: 50,
        order: { createdAt: 'DESC' },
      });
    }

    return this.patientsRepository.find({
      take: 50,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const patient = await this.findOne(id);
    Object.assign(patient, updatePatientDto);
    return this.patientsRepository.save(patient);
  }

  async remove(id: string) {
    const patient = await this.findOne(id);
    await this.patientsRepository.softDelete(id);
    return { message: 'Patient deleted successfully' };
  }
}
