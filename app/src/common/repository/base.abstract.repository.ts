import { BaseEntity } from "@app/common/entity/base.entity";
import {
  DeepPartial,
  EntityNotFoundError,
  FindManyOptions,
  FindOptionsWhere,
  In,
  Repository,
  UpdateResult,
} from "typeorm";
import { BaseInterfaceRepository } from "@app/common/repository/base.interface.repository";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export abstract class BaseAbstractRepository<E extends BaseEntity> implements BaseInterfaceRepository<E> {
  private readonly errorMessage: string;
  private readonly repository: Repository<E>;

  constructor(repository: Repository<E>, errorMessage: string) {
    this.errorMessage = errorMessage;
    this.repository = repository;
  }

  async findAll(skip?: number, take?: number): Promise<[E[], number]> {
    return await this.repository.findAndCount({ skip, take });
  }

  async findOneByIdOrThrow(id: string): Promise<E> {
    try {
      if (id === undefined) {
        throw new EntityNotFound(this.errorMessage);
      }
      return await this.repository.findOneByOrFail({ id } as FindOptionsWhere<E> | FindOptionsWhere<E>[]);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new EntityNotFound(this.errorMessage);
      }
      throw error;
    }
  }

  async findOneByConditionOrThrow(condition: FindOptionsWhere<E> | FindOptionsWhere<E>[]): Promise<E> {
    try {
      return await this.repository.findOneByOrFail(condition);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new EntityNotFound(this.errorMessage);
      }
      throw error;
    }
  }

  async findAllByIds(ids: string[]): Promise<[E[], number]> {
    return await this.repository.findAndCount({
      where: { id: In(ids) } as FindOptionsWhere<E> | FindOptionsWhere<E>[],
    });
  }

  async findAllByCondition(
    condition: FindOptionsWhere<E> | FindOptionsWhere<E>[],
    skip?: number,
    take?: number
  ): Promise<[E[], number]> {
    return await this.repository.findAndCount({
      where: condition,
      skip,
      take,
    });
  }

  async findOpenQuery(query: FindManyOptions<E>): Promise<[E[], number]> {
    return await this.repository.findAndCount(query);
  }

  mergeEntity(entity: E, updateEntityDto: DeepPartial<E>): E {
    return this.repository.merge(entity, updateEntityDto);
  }

  async updateOne(id: string, updateEntityDto: QueryDeepPartialEntity<E>): Promise<UpdateResult> {
    return await this.repository.update(id, updateEntityDto);
  }

  async createOne(createEntityDto?: DeepPartial<E>): Promise<E> {
    return await this.repository.create(createEntityDto);
  }

  async createMany(createEntityDtos: DeepPartial<E[]>): Promise<E[]> {
    return await this.repository.create(createEntityDtos);
  }

  async saveOneByEntity(entity: E): Promise<E> {
    return await this.repository.save(entity);
  }

  async saveManyByEntities(entities: E[]): Promise<E[]> {
    return await this.repository.save(entities);
  }

  async deleteOneByEntity(entity: E): Promise<E> {
    return await this.repository.remove(entity);
  }

  async deleteManyByEntities(entities: E[]): Promise<E[]> {
    return await this.repository.remove(entities);
  }

  async count(condition?: FindOptionsWhere<E> | FindOptionsWhere<E>[]): Promise<number> {
    return await this.repository.count({
      where: condition,
    });
  }

  async clearAllTable(): Promise<void> {
    return await this.repository.clear();
  }
}
