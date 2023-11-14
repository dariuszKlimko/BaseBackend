import { BaseEntity } from "@app/entities/base.entity";
import { FindOptionsRelations, FindOptionsWhere } from "typeorm";

export interface BaseInterfaceRepository<E extends BaseEntity, CreateDTO, UpdateDTO> {
  findAll(): Promise<E[]>;
  findAllByIds(ids: string[]): Promise<E[]>;
  findOneById(id: string): Promise<E>;
  findWithRelation(rel: FindOptionsRelations<E>): Promise<E[]>;
  findByCondition(condition: FindOptionsWhere<E>): Promise<E[]>;
  createOne(createEntityDto: CreateDTO): Promise<E>;
  createMany(createEntityDtos: CreateDTO[]): Promise<E[]>;
  updateOne(id: string, updateEntityDto: UpdateDTO): Promise<E>;
  deleteOne(id: string): Promise<E>;
  deleteMany(ids: string[]): Promise<E[]>;
}
