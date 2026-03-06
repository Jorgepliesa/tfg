import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { UserAccount } from "./UserAccount";
import { ApiProperty } from "@nestjs/swagger";

@Index("memorial_pkey", ["name"], { unique: true })
@Entity("memorial", { schema: "public" })
export class Memorial {
  @ApiProperty({
    example: 'Memorial de John Doe',
    description: 'The unique name of the memorial',
  })
  @PrimaryColumn({type: "varchar", name: "name", length: 255 })
  name: string;

  @ApiProperty({
    example: 'Este es un memorial en honor a John Doe.',
    description: 'A brief description of the memorial',
  })
  @Column("text", { name: "description" })
  description: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'The URL of the memorial image',
  })
  @Column("varchar", { name: "image", length: 255 })
  image: string;
}
