import { Measurement } from "@app/modules/measurements/entities/measurement.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import * as bcrypt from "bcrypt";

@Entity("users")
export class User extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty()
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
  @Exclude({ toPlainOnly: true })
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

  @Exclude({ toPlainOnly: true })
  @ApiProperty()
  @Column({
    name: "refresh_tokens",
    type: "text",
    nullable: true,
    array: true,
    default: [],
  })
  refreshTokens: string[];

  @ApiProperty()
  @Column({
    type: "boolean",
    default: false,
  })
  verified: boolean;

  @OneToMany(() => Measurement, (measurement: Measurement) => measurement.user, {
    cascade: ["remove"],
  })
  measurements: Measurement[];

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compareSync(password, this.password);
  }
}
