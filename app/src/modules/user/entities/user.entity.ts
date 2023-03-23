import { Measurement } from "@app/modules/measurements/entities/measurement.entity";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  createdAt: number;

  @ApiProperty()
  @Column({
    type: "text",
    unique: true,
  })
  email: string;

  @ApiProperty()
  @Column({
    type: "text",
    nullable: true,
  })
  password: string;

  @ApiProperty()
  @Column({
    type: "int",
    nullable: true,
  })
  height: number;

  @ApiProperty()
  @Column({
    name: "refresh_tokens",
    type: "text",
    nullable: true,
    unique: true,
    array: true,
    default: [],
  })
  refreshTokens: string[];

  @ApiProperty()
  @Column({
    name: "verification_code",
    type: "text",
    nullable: true,
    unique: true,
  })
  verificationCode: string;

  @ApiProperty()
  @Column({
    type: "boolean",
    default: false,
  })
  verified: boolean;

  @OneToMany(() => Measurement, (measurement: Measurement) => measurement.user, {
    cascade: ["remove"]
  })
  measurements: Measurement[];
}
