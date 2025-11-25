import { Injectable } from '@nestjs/common';

@Injectable()
export class AppointmentsService {
  findAll() {
    return {
      message: 'Appointments module - Coming soon',
      appointments: [],
    };
  }
}
