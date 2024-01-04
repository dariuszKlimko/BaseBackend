import { DeepPartial, FindManyOptions, FindOptionsRelations, FindOptionsWhere } from "typeorm";

export interface BaseInterfaceRepository<E> {
  findAll(skip?: number, take?: number): Promise<[E[], number]>;
  findOneByIdOrThrow(id: string): Promise<E>;
  findAllByIds(ids: string[], skip?: number, take?: number): Promise<[E[], number]>;
  findOneByConditionOrThrow(condition: FindOptionsWhere<E>): Promise<E>;
  findOneByCondition(condition: FindOptionsWhere<E>): Promise<E>;
  findAllByCondition(condition: FindOptionsWhere<E>, skip?: number, take?: number): Promise<[E[], number]>;
  findWithRelation(rel: FindOptionsRelations<E>, skip?: number, take?: number): Promise<[E[], number]>;
  openFindQuery(query: FindManyOptions<E>): Promise<[E[], number]>;
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
