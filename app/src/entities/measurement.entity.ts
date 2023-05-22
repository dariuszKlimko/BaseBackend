import { User } from "@app/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "@app/entities/base.entity";

@Entity("measurements")
export class Measurement extends BaseEntity {
  @ApiProperty()
  @Column({
    type: "float",
    nullable: true,
  })
  bmi: number;

  @ApiProperty()
  @Column({
    type: "int",
    nullable: true,
  })
  weight: number;

  @ApiProperty()
  @Column({
    name: "calories_delivered",
    type: "int",
    nullable: true,
  })
  caloriesDelivered: number;

  @ApiProperty()
  @Column({
    name: "distance_traveled",
    type: "int",
    nullable: true,
  })
  distanceTraveled: number;

  @ApiProperty()
  @Column({
    name: "measurement_date",
    type: "text",
    nullable: true,
  })
  measurementDate: string;

  @ManyToOne(() => User, (user: User) => user.measurements, {
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
