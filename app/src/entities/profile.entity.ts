import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "@app/entities/user.entity";
import { BaseEntity } from "@app/common/entity/base.entity";

@Entity("profiles")
export class Profile extends BaseEntity {
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
