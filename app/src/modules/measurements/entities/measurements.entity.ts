import { ApiProperty } from "@nestjs/swagger";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("measurements")
export class Measurements extends BaseEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ApiProperty()
    @Column({
        type: "int",
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
        name: "callories_delivered",
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
}