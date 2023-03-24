import { User } from "@app/modules/user/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("measurements")
export class Measurement extends BaseEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn("uuid")
  id: string;

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
