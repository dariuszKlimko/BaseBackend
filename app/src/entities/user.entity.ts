import { Measurement } from "@app/entities/measurement.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, OneToOne } from "typeorm";
import * as bcrypt from "bcrypt";
import { Profile } from "@app/entities/profile.entity";
import { BaseEntity } from "@app/entities/base.entity";
import { Role } from "@app/common/types/enum/role.enum";

@Entity("users")
export class User extends BaseEntity {
  @ApiProperty()
  @Column({
    type: "text",
    nullable: false,
    unique: true,
  })
  email: string;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  @Column({
    type: "text",
    nullable: false,
  })
  password: string;

  @ApiProperty()
  @Expose({ groups: [Role.Admin_0] })
  @Column({
    type: "enum",
    enum: Role,
    nullable: true,
  })
  role: string;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  @Column({
    name: "refresh_tokens",
    type: "text",
    array: true,
    default: [],
  })
  refreshTokens: string[];

  @ApiProperty()
  @Column({
    type: "boolean",
    nullable: false,
    default: false,
  })
  verified: boolean;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  @Column({
    name: "verification_code",
    type: "int",
    nullable: true,
  })
  verificationCode: number;

  @OneToMany(() => Measurement, (measurement: Measurement) => measurement.user, {
    cascade: true,
  })
  measurements: Measurement[];

  @OneToOne(() => Profile, (profile: Profile) => profile.user, {
    cascade: true,
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
