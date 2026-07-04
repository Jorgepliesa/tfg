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
import { CoopChallenge, CoopChallengeStatus } from '../entities/CoopChallenge';
import { Memorial } from '../entities/Memorial';
import { Has } from '../entities/Has';
import { Audiovisual } from '../entities/Audiovisual';
import { MuscleGroup } from '../entities/MuscleGroup';
import { Equipment } from '../entities/Equipment';
import { MeasurementParameter } from '../entities/MeasurementParameter';
import { ClinicalProfile } from '../entities/ClinicalProfile';

// Cargar variables de entorno
dotenv.config();

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

async function bootstrap() {
  // Crear conexión directa a la base de datos
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'admin_821011',
    password: process.env.DB_PASSWORD || '0000',
    database: process.env.DB_NAME || 'fitgame',
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
      Complete,
      ClinicalProfile,
    ],
    synchronize: false,
  });

  try {
    await dataSource.initialize();

    const userRepository = dataSource.getRepository(UserAccount);
    const avatarRepository = dataSource.getRepository(Avatar);
    const stepsRepository = dataSource.getRepository(Steps);
    const hasRepository = dataSource.getRepository(Has);
    const clinicalProfileRepository = dataSource.getRepository(ClinicalProfile);

    const USUARIO = 821011;

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('1234', 10);

    // Verificar si el usuario ya existe
    const existingUser = await userRepository.findOne({
      where: { id: USUARIO },
      relations: ['avatarEntity', 'steps'] // Cargar relaciones para eliminar dependencias
    });

    if (existingUser) {
      // Eliminar los registros de la tabla "has" asociados a este usuario
      await hasRepository.delete({ userId: existingUser.id });

      // Eliminar los pasos primero (porque Steps DEPENDE de UserAccount)
      if (existingUser.steps && existingUser.steps.length > 0) {
        await stepsRepository.remove(existingUser.steps);
      }

      // Eliminar el usuario ANTES de eliminar el avatar
      // porque UserAccount TIENE la Foreign Key "avatar" que DEPENDE de la tabla Avatar.
      await userRepository.remove(existingUser);

      // Finalmente eliminar el avatar de forma segura
      if (existingUser.avatarEntity) {
        await avatarRepository.remove(existingUser.avatarEntity);
      }

      if (existingUser.clinicalProfileEntity) {
        await clinicalProfileRepository.remove(existingUser.clinicalProfileEntity);
      }
    }

    // Crear avatar primero (solo con FP)
    const avatar = avatarRepository.create({
      fp: 100,
    });

    const savedAvatar = await avatarRepository.save(avatar);

    // Crear los datos del perfil clínico
    const clinicalProfile = clinicalProfileRepository.create();

    const savedClinicalProfile = await clinicalProfileRepository.save(clinicalProfile);

    // Crear usuario con referencia al avatar
    const user = userRepository.create({
      id: USUARIO,
      password: hashedPassword,
      streak: 0,
      avatar: savedAvatar.id, // FK al avatar,
      clinicalProfile: savedClinicalProfile.id, // FK al perfil clínico
    });

    await userRepository.save(user);

    // Crear registro de pasos para el usuario
    const steps = stepsRepository.create({
      userId: user.id,
      date: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
      numSteps: 5000, // Pasos iniciales
      isReached: false, // Valor necesario porque la BBDD aplica NOT NULL
    });

    await stepsRepository.save(steps);
    /*
        // ──────────────────────────────────────────────────────────
        // Memorial de ejemplo con imagen estática servida por el backend
        // La imagen se sirve en: http://host:3000/uploads/memorials/android-icon-foreground.png
        // En la BD guardamos solo la ruta relativa (sin la base URL)
        // ──────────────────────────────────────────────────────────
        const memorialRepository = dataSource.getRepository(Memorial);
    
        const existingMemorial = await memorialRepository.findOne({
          where: { name: 'Memorial de Ejemplo' },
        });
    
        if (!existingMemorial) {
          const memorial = memorialRepository.create({
            name: 'Memorial de Ejemplo',
            description: 'Este es un memorial de ejemplo que muestra cómo se gestionan las imágenes en el backend.',
            image: 'uploads/memorials/android-icon-foreground.png', // ← ruta relativa
          });
          await memorialRepository.save(memorial);
          console.log('✅ Memorial de ejemplo creado');
        } else {
          console.log('ℹ️  El memorial de ejemplo ya existía, se omite');
        }
    
        // Desbloquear el memorial de ejemplo para el usuario 821011
        //const hasRepository = dataSource.getRepository(Has);
        const existingHas = await hasRepository.findOne({
          where: { userId: user.id, memorial: 'Memorial de Ejemplo' }
        });
    
        if (!existingHas) {
          const has = hasRepository.create({
            userId: user.id,
            memorial: 'Memorial de Ejemplo'
          });
          await hasRepository.save(has);
          console.log('✅ Memorial desbloqueado para el usuario 821011');
        } else {
          console.log('ℹ️  El memorial ya estaba desbloqueado para el usuario 821011');
        }
    
        // Seeding de Reto Cooperativo de prueba
        const challengeRepository = dataSource.getRepository(CoopChallenge);
        const existingChallenge = await challengeRepository.findOne({
          where: { name: 'El Dragón del Sedentarismo' }
        });
    
        if (!existingChallenge) {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 2); // hace 2 días
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 5); // en 5 días
          const challenge = challengeRepository.create({
            name: 'El Dragón del Sedentarismo',
            startDate,
            endDate,
            status: CoopChallengeStatus.ACTIVE,
            totalSteps: 100000,
          });
          await challengeRepository.save(challenge);
          console.log('✅ Reto cooperativo de prueba creado');
        } else {
          console.log('ℹ️  El reto cooperativo de prueba ya existía');
        }
    */
    console.log('✅ Usuario creado exitosamente con ID ', USUARIO);

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