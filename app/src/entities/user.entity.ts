import { Measurement } from "@app/entities/measurement.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { Profile } from "@app/entities/profile.entity";

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

  @Exclude({ toPlainOnly: true })
  @ApiProperty()
  @Column({
    name: "verification_code",
    type: "int",
    nullable: true,
  })
  verificationCode: number;

  @OneToMany(() => Measurement, (measurement: Measurement) => measurement.user, {
    cascade: ["remove"],
  })
  measurements: Measurement[];

  @OneToOne(() => Profile, (profile: Profile) => profile.user, {
    cascade: ["insert", "remove"],
  })
  profile: Profile;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
