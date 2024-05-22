import { BaseEntity } from "@app/common/entity/base.entity";
import { Injectable } from "@nestjs/common";
import { DeepPartial, FindManyOptions, FindOptionsWhere, UpdateResult } from "typeorm";
import { BaseAbstractRepository } from "@app/common/repository/base.abstract.repository";
import { BaseInterfaceRepository } from "@app/common/repository/base.interface.repository";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export abstract class BaseAbstractService<E extends BaseEntity> implements BaseInterfaceRepository<E> {
  private readonly repository: BaseInterfaceRepository<E>;

  constructor(repository: BaseAbstractRepository<E>) {
    this.repository = repository;
  }

  async findAll(skip?: number, take?: number): Promise<[E[], number]> {
    return await this.repository.findAll(skip, take);
  }

  async findOneByIdOrThrow(id: string): Promise<E> {
    return await this.repository.findOneByIdOrThrow(id);
  }

  async findOneByConditionOrThrow(condition: FindOptionsWhere<E> | FindOptionsWhere<E>[]): Promise<E> {
    return await this.repository.findOneByConditionOrThrow(condition);
  }

  async findAllByIds(ids: string[]): Promise<[E[], number]> {
    return await this.repository.findAllByIds(ids);
  }

  async findAllByCondition(
    condition: FindOptionsWhere<E> | FindOptionsWhere<E>[],
    skip?: number,
    take?: number
  ): Promise<[E[], number]> {
    return await this.repository.findAllByCondition(condition, skip, take);
  }

  async findOpenQuery(query: FindManyOptions<E>): Promise<[E[], number]> {
    return await this.repository.findOpenQuery(query);
  }

  mergeEntity(entity: E, updateEntityDto: DeepPartial<E>): E {
    return this.repository.mergeEntity(entity, updateEntityDto);
  }

  async updateOne(id: string, updateEntityDto: QueryDeepPartialEntity<E>): Promise<UpdateResult> {
    return await this.repository.updateOne(id, updateEntityDto);
  }

  async createOne(createEntityDto?: DeepPartial<E>): Promise<E> {
    return await this.repository.createOne(createEntityDto);
  }

  async createMany(createEntityDtos: DeepPartial<E[]>): Promise<E[]> {
    return await this.repository.createMany(createEntityDtos);
  }

  async saveOneByEntity(entity: E): Promise<E> {
    return await this.repository.saveOneByEntity(entity);
  }

  async saveManyByEntities(entities: E[]): Promise<E[]> {
    return await this.repository.saveManyByEntities(entities);
  }

  async deleteOneByEntity(entity: E): Promise<E> {
    return await this.repository.deleteOneByEntity(entity);
  }

  async deleteManyByEntities(entities: E[]): Promise<E[]> {
    return await this.repository.deleteManyByEntities(entities);
  }

  async count(condition?: FindOptionsWhere<E> | FindOptionsWhere<E>[]): Promise<number> {
    return await this.repository.count(condition);
  }

  async clearAllTable(): Promise<void> {
    return await this.repository.clearAllTable();
  }
}
