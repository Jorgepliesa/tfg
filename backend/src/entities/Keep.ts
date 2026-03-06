import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Avatar } from "./Avatar";
import { Item } from "./Item";
import { ApiProperty } from "@nestjs/swagger";

@Index("keep_pkey", ["avatar", "item"], { unique: true })
@Entity("keep", { schema: "public" })
export class Keep {
  @ApiProperty({
    example: "Iron Helmet",
    description: "The unique name of the item",
  })
  @PrimaryColumn({type: "varchar", name: "item", length: 255 })
  item: string;

  @ApiProperty({
    example: 1,
    description: "The unique ID of the avatar",
  })
  @PrimaryColumn({type: "integer", primary: true, name: "avatar" })
  avatar: number;

  @ApiProperty({
    example: true,
    description: "Whether the avatar is wearing the item",
  })
  @Column({type: "boolean", name: "is_wearing" })
  isWearing: boolean;

  @ManyToOne(() => Avatar, (avatar) => avatar.keeps)
  @JoinColumn([{ name: "avatar", referencedColumnName: "id" }])
  avatarEntity: Avatar;

  @ManyToOne(() => Item)
  @JoinColumn([{ name: "item", referencedColumnName: "name" }])
  itemEntity: Item;
}
