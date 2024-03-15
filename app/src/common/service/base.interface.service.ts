import { DeepPartial, FindManyOptions, FindOptionsWhere, UpdateResult } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export interface BaseInterfaceService<E> {
  findAll(skip?: number, take?: number): Promise<[E[], number]>;
  findOneByIdOrThrow(id: string): Promise<E>;
  findOneByConditionOrThrow(condition: FindOptionsWhere<E> | FindOptionsWhere<E>[]): Promise<E>;
  findAllByIds(ids: string[]): Promise<[E[], number]>;
  findAllByCondition(
    condition: FindOptionsWhere<E> | FindOptionsWhere<E>[],
    skip?: number,
    take?: number
  ): Promise<[E[], number]>;
  findOpenQuery(query: FindManyOptions<E>): Promise<[E[], number]>;
  mergeEntity(entity: E, updateEntityDto: DeepPartial<E>): E;
  updateOne(id: string, updateEntityDto: QueryDeepPartialEntity<E>): Promise<UpdateResult>;
  createOne(createEntityDto?: DeepPartial<E>): Promise<E>;
  createMany(createEntityDtos: DeepPartial<E[]>): Promise<E[]>;
  saveOneByEntity(entity: E): Promise<E>;
  saveManyByEntities(entities: E[]): Promise<E[]>;
  deleteOneByEntity(entity: E): Promise<E>;
  deleteManyByEntities(entities: E[]): Promise<E[]>;
  count(condition?: FindOptionsWhere<E> | FindOptionsWhere<E>[]): Promise<number>;
  clearAllTable(): Promise<void>;
}
