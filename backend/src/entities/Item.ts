import { Check, Column, Entity, Index, OneToMany, PrimaryColumn } from "typeorm";
import { Keep } from "./Keep";
import { ApiProperty } from "@nestjs/swagger";

export enum ItemType {
  HEAD = 'head',
  BODY = 'body',
  LEGS = 'legs',
  FEET = 'feet',
  ARMS = 'arms',
  ACCESSORY = 'accessory',
  FACE = 'face',
}

@Index("item_pkey", ["name"], { unique: true })
@Entity("item", { schema: "public" })
@Check('"cost" > 0 AND "cost" <= 1000')
export class Item {
  @ApiProperty({
    example: "Iron Helmet",
    description: "The unique name of the item",
  })
  @PrimaryColumn({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    example: ItemType.HEAD,
    description: "The type of the item",
  })
  @Column("enum", {
    name: "type",
    enum: ItemType,
  })
  type: ItemType;

  @ApiProperty({
    example: "https://example.com/images/iron_helmet.png",
    description: "The URL of the item's image",
  })
  @Column({ type: "varchar", name: "image" })
  image: string;

  @ApiProperty({
    example: 100,
    description: "The cost of the item in in-game currency",
  })
  @Column({ type: "integer", name: "cost" })
  cost: number;
}
