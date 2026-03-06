import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { Session } from "./Session";
import { Steps } from "./Steps";
import { Avatar } from "./Avatar";
import { ApiProperty } from "@nestjs/swagger";
import { Has } from "./has";

@Index("user_account_pkey", ["id"], { unique: true })
@Entity("user_account", { schema: "public" })
export class UserAccount {
  @ApiProperty({
    example: 1,
    description: "The unique identifier of the user account",
  })
  @PrimaryColumn({ type: "integer", name: "id" })
  id: number;

  @ApiProperty({
    example: 5,
    description: "The current streak of the user account",
  })
  @Column({ type: "integer", name: "streak", default: 0 })
  streak: number;

  @ApiProperty({
    example: "password123",
    description: "The password of the user account",
  })
  @Column({ type: "varchar", name: "password", length: 255 })
  password: string;

  @ApiProperty({
    example: 1,
    description: "The unique identifier of the avatar associated with the user account",
  })
  @Column({ name: "avatar" })
  avatar: number;

  @OneToMany(() => Has, (has) => has.userId)
  memorials: Has[];

  @OneToMany(() => Session, (session) => session.userAccount)
  sessions: Session[];

  @OneToMany(() => Steps, (steps) => steps.userAccount)
  steps: Steps[];

  @OneToOne(() => Avatar, (avatar) => avatar.userAccount)
  @JoinColumn([{ name: "avatar", referencedColumnName: "id" }])
  avatarEntity: Avatar;
}
