import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WellnessTestCreateDto, WellnessTestResponseDto } from "../dtos/wellnessTest.dto";
import { WellnessTest, WellnessTestType } from "../entities/WellnessTest";
import { Session } from "../entities/Session";


@Injectable()
export class WellnessTestService {
  constructor(
    @InjectRepository(WellnessTest)
    private wellnessTestRepository: Repository<WellnessTest>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async findByUser(userId: number): Promise<WellnessTestResponseDto[]> {
    const tests = await this.wellnessTestRepository.find({ 
      where: { userId: userId },
      order: { session: 'DESC' } 
    });
    return tests.map(test => this.toResponseDto(test));
  }

  async findBySession(
    sessionDate: Date,
    userId: number,
  ): Promise<WellnessTestResponseDto[]> {
    const tests = await this.wellnessTestRepository.find({
      where: {
        session: sessionDate,
        userId: userId,
      },
      order: { type: 'ASC' }, // initial primero
    });
    return tests.map(test => this.toResponseDto(test));
  }

  async createForCurrentSession(userId: number, createWellnessTestDto: WellnessTestCreateDto): Promise<WellnessTestResponseDto> {
    const activeSession = await this.sessionRepository.findOne({
      where: { userId: userId },
      order: { date: 'DESC' },
    });

    if (!activeSession) {
      throw new BadRequestException('No active session found for the user.');
    }

    return this.create(activeSession.date, userId, createWellnessTestDto);
  }

  async create(session: Date, userId: number, createWellnessTestDto: WellnessTestCreateDto): Promise<WellnessTestResponseDto> {
    //this.validateLikertScale(createWellnessTestDto); No hace falta que el usuario no puede equivocarse.

    // Validar que no exista un test del mismo tipo en esa sesión
    const existingTest = await this.wellnessTestRepository.findOne({
      where: {
        session: session,
        userId: userId,
        type: createWellnessTestDto.type,
      },
    });

    if (existingTest) {
      throw new BadRequestException(
        `${createWellnessTestDto.type} wellness test already exists for this session`,
      );
    }

    const test = this.wellnessTestRepository.create({
      session: session,
      userId: userId,
      type: createWellnessTestDto.type,
      pain: createWellnessTestDto.pain,
      sleepiness: createWellnessTestDto.sleepiness,
      mood: createWellnessTestDto.mood,
      fatigue: createWellnessTestDto.fatigue,
    });

    const savedTest = await this.wellnessTestRepository.save(test);
    
    if (!savedTest) {
      throw new BadRequestException('Failed to save wellness test');
    }

    return this.toResponseDto(savedTest);
  }

  async getInitialTest(
    sessionDate: Date,
    userId: number,
  ): Promise<WellnessTestResponseDto | null> {
    const test = await this.wellnessTestRepository.findOne({
      where: {
        session: sessionDate,
        userId: userId,
        type: WellnessTestType.INITIAL,
      },
    });
    return test ? this.toResponseDto(test) : null;
  }

  private toResponseDto(test: WellnessTest): WellnessTestResponseDto {
    if (!test) {
      throw new BadRequestException('Invalid wellness test data');
    }

    const dto = new WellnessTestResponseDto();
    dto.session = test.session;
    dto.userId = test.userId;
    dto.type = test.type;
    dto.pain = test.pain;
    dto.sleepiness = test.sleepiness;
    dto.mood = test.mood;
    dto.fatigue = test.fatigue;
    return dto;
  }
}
