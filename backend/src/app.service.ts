import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'Health Game API is running!',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
