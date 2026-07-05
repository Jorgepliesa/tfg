import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CoopChallenge } from "./CoopChallenge";
import { Keep } from "./Keep";
import { UserAccount } from "./UserAccount";
import { ApiProperty } from "@nestjs/swagger";
import { Complete } from "./Complete";

@Index("avatar_pkey", ["id"], { unique: true })
@Entity("avatar", { schema: "public" })
export class Avatar {
  @ApiProperty({
    description: "Unique identifier for the avatar",
    example: 1,
  })
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @ApiProperty({
    description: "Fitness points of the avatar, representing the user's currency",
    example: 150,
  })
  @Column("integer", { name: "fp" })
  fp: number;

  @OneToMany(() => Complete, (complete) => complete.avatarEntity)
  completes: Complete[];

  @OneToMany(() => Keep, (keep) => keep.avatarEntity)
  keeps: Keep[];

  @OneToOne(() => UserAccount, (userAccount) => userAccount.avatarEntity)
  userAccount: UserAccount;
}