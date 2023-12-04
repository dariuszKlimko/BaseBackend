import { BaseEntity } from "@app/entities/base.entity";
import { DeepPartial, FindOptionsRelations, FindOptionsWhere } from "typeorm";

export interface BaseInterfaceRepository<E extends BaseEntity, CreateDTO, UpdateDTO> {
  findAll(): Promise<E[]>;
  findOneByIdOrThrow(id: string): Promise<E>;
  findAllByIds(ids: string[]): Promise<E[]>;
  findOneByConditionOrThrow(condition: FindOptionsWhere<E>): Promise<E>;
  findOneByCondition(condition: FindOptionsWhere<E>): Promise<E>
  findAllByCondition(condition: FindOptionsWhere<E>): Promise<E[]>;
  findWithRelation(rel: FindOptionsRelations<E>): Promise<E[]>;
  createOne(createEntityDto?: DeepPartial<E>): Promise<E>;
  createMany(createEntityDtos: DeepPartial<E[]>): Promise<E[]>;
  saveOne(entity: E): Promise<E>;
  saveMany(entities: E[]): Promise<E[]>;
  updateOneById(id: string, updateEntityDto: DeepPartial<E>): Promise<E>;
  updateOneByCondition(condition: FindOptionsWhere<E>, updateEntityDto: DeepPartial<E>): Promise<E>;
  deleteOneById(id: string): Promise<E>;
  deleteManyByIds(ids: string[]): Promise<E[]>;
  deleteOneByCondition(condition: FindOptionsWhere<E>): Promise<E>;
  deleteManyByCondition(condition: FindOptionsWhere<E>): Promise<E[]>;
  countAll(): Promise<number>;
  countAllWithCondition(condition: FindOptionsWhere<E>): Promise<number>;
}
