import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { Exercise } from "./Exercise";
import { ApiProperty } from "@nestjs/swagger";

@Index("audiovisual_pkey", ["url"], { unique: true })
@Entity("audiovisual", { schema: "public" })
export class Audiovisual {
  @ApiProperty({
    example: 'https://example.com/video.mp4',
    description: 'The URL of the audiovisual content',
  })
  @PrimaryColumn({type: "varchar", name: "url", length: 255 })
  url: string;

  @ManyToMany(() => Exercise, (exercise) => exercise.audiovisuals)
  @JoinTable({
    name: "contains",
    joinColumns: [{ name: "audiovisual", referencedColumnName: "url" }],
    inverseJoinColumns: [{ name: "exercise", referencedColumnName: "name" }],
    schema: "public",
  })
  exercises: Exercise[];
}
