import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "@app/entities/user.entity";

@Entity("profiles")
export class Profile extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty()
  @Column({
    type: "int",
    nullable: true,
  })
  height: number;

  @OneToOne(() => User, (user: User) => user.profile, {
    onDelete: "CASCADE",
    orphanedRowAction: "delete",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ApiProperty()
  @Column({
    name: "user_id",
    nullable: false,
  })
  userId: string;
}
