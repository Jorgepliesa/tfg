import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Memorial } from "./Memorial";
import { ApiProperty } from "@nestjs/swagger";
import { UserAccount } from "./UserAccount";

@Entity("has", { schema: "public" })
@Index("has_pkey", ["memorial", "userId"], { unique: true })
export class Has {
    @ApiProperty({
        example: "Memorial de John Doe",
        description: "The unique name of the memorial",
    })
    @PrimaryColumn({ type: "varchar", name: "memorial", length: 255 })
    memorial: string;

    @ApiProperty({
        example: 1,
        description: "The unique ID of the user",
    })
    @PrimaryColumn({ type: "integer", name: "user_id" })
    userId: number;

    @ManyToOne(() => Memorial)
    @JoinColumn({ name: "memorial", referencedColumnName: "name" })
    memorialEntity: Memorial;

    @ManyToOne(() => UserAccount, userAccount => userAccount.memorials)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    userAccount: UserAccount;
}