import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Avatar } from '../entities/Avatar';
import { UserAccount } from '../entities/UserAccount';
import { Session } from '../entities/Session';
import { WellnessTest } from '../entities/WellnessTest';
import { Steps } from '../entities/Steps';
import { Item } from '../entities/Item';
import { Keep } from '../entities/Keep';
import { Exercise } from '../entities/Exercise';
import { Routine } from '../entities/Routine';
import { Plan } from '../entities/Plan';
import { Execute } from '../entities/Execute';
import { Complete } from '../entities/Complete';
import { CoopChallenge } from '../entities/CoopChallenge';
import { Memorial } from '../entities/Memorial';
import { Has } from '../entities/has';
import { Audiovisual } from '../entities/Audiovisual';
import { MuscleGroup } from '../entities/MuscleGroup';
import { Equipment } from '../entities/Equipment';
import { MeasurementParameter } from '../entities/MeasurementParameter';

// Cargar variables de entorno
dotenv.config();

async function bootstrap() {
  // Crear conexión directa a la base de datos
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'usuario_tfg',
    password: process.env.DB_PASSWORD || 'password_seguro',
    database: process.env.DB_NAME || 'health_fitgame',
    entities: [
      UserAccount,
      Avatar,
      Session,
      WellnessTest,
      Steps,
      Item,
      Keep,
      Exercise,
      Routine,
      Plan,
      Execute,
      Complete,
      CoopChallenge,
      Memorial,
      Has,
      Audiovisual,
      MuscleGroup,
      Equipment,
      MeasurementParameter,
    ],
    synchronize: false,
  });

  try {
    await dataSource.initialize();

    const userRepository = dataSource.getRepository(UserAccount);
    const avatarRepository = dataSource.getRepository(Avatar);

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('1234', 10);

    // Verificar si el usuario ya existe
    const existingUser = await userRepository.findOne({ 
      where: { id: 821011 },
      relations: ['avatarEntity']
    });
    
    if (existingUser) {
      
      // Eliminar avatar asociado primero
      if (existingUser.avatarEntity) {
        await avatarRepository.remove(existingUser.avatarEntity);
      }
      
      await userRepository.remove(existingUser);
    }

    // Crear avatar primero (solo con FP)
    const avatar = avatarRepository.create({
      fp: 100,
      id: 1,
    });

    const savedAvatar = await avatarRepository.save(avatar);

    // Crear usuario con referencia al avatar
    const user = userRepository.create({
      id: 821011,
      password: hashedPassword,
      streak: 0,
      avatar: savedAvatar.id, // FK al avatar
    });

    await userRepository.save(user);

  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n Conexión cerrada');
    }
  }
}

bootstrap();