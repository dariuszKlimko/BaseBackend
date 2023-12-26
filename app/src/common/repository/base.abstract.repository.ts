import { BaseEntity } from "@app/entities/base.entity";
import { DeepPartial, EntityNotFoundError, FindOptionsRelations, FindOptionsWhere, In, Repository } from "typeorm";
import { BaseInterfaceRepository } from "@app/common/repository/base.interface.repository";
import { EntityNotFound } from "@app/common/exceptions/entity.not.found.exception";

export abstract class BaseAbstractRepository<E extends BaseEntity> implements BaseInterfaceRepository<E> {
  private readonly errorMessage: string;
  private readonly repository: Repository<E>;

  constructor(repository: Repository<E>, errorMessage: string) {
    this.errorMessage = errorMessage;
    this.repository = repository;
  }

  async findAll(skip?: number, take?: number): Promise<[E[], number]> {
    return await this.repository.findAndCount({skip, take});
  }

  async findOneByIdOrThrow(id: string): Promise<E> {
    try {
      return await this.repository.findOneByOrFail({ id } as FindOptionsWhere<E>);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new EntityNotFound(this.errorMessage);
      }
      throw error;
    }
  }

  async findAllByIds(ids: string[], skip?: number, take?: number): Promise<[E[], number]> {
    return await this.repository.findAndCount({
      where: { id: In(ids) } as FindOptionsWhere<E>,
      skip,
      take,
    });
  }

  async findOneByConditionOrThrow(condition: FindOptionsWhere<E>): Promise<E> {
    try {
      return await this.repository.findOneByOrFail(condition);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new EntityNotFound(this.errorMessage);
      }
      throw error;
    }
  }

  async findOneByCondition(condition: FindOptionsWhere<E>): Promise<E> {
    const rows: E[] = await this.repository.find({
      where: condition,
    });
    if (rows.length === 0) {
      return;
    } else {
      return rows[0];
    }
  }

  async findAllByCondition(condition: FindOptionsWhere<E>, skip?: number, take?: number): Promise<[E[], number]> {
    return await this.repository.findAndCount({
      where: condition,
      skip,
      take,
    });
  }

  async findWithRelation(rel: FindOptionsRelations<E>, skip?: number, take?: number): Promise<[E[], number]> {
    return await this.repository.findAndCount({
      relations: rel,
      skip,
      take,
    });
  }

  async createOne(createEntityDto?: DeepPartial<E>): Promise<E> {
    return await this.repository.create(createEntityDto);
  }

  async createMany(createEntityDtos: DeepPartial<E[]>): Promise<E[]> {
    return await this.repository.create(createEntityDtos);
  }

  async saveOne(entity: E): Promise<E> {
    return await this.repository.save(entity);
  }

  async saveMany(entities: E[]): Promise<E[]> {
    return await this.repository.save(entities);
  }

  async updateOneById(id: string, updateEntityDto: DeepPartial<E>): Promise<E> {
    const entity: E = await this.findOneByIdOrThrow(id);
    this.repository.merge(entity, updateEntityDto);
    return await this.repository.save(entity);
  }

  async updateOneByCondition(condition: FindOptionsWhere<E>, updateEntityDto: DeepPartial<E>): Promise<E> {
    const entity: E = await this.findOneByConditionOrThrow(condition);
    this.repository.merge(entity, updateEntityDto);
    return await this.repository.save(entity);
  }

  async deleteOneById(id: string): Promise<E> {
    const entity: E = await this.findOneByIdOrThrow(id);
    return await this.repository.remove(entity);
  }

  async deleteManyByIds(ids: string[]): Promise<E[]> {
    const [entities]: [E[], number] = await this.findAllByIds(ids);
    return await this.repository.remove(entities);
  }

  async deleteOneByCondition(condition: FindOptionsWhere<E>): Promise<E> {
    const entity: E = await this.findOneByConditionOrThrow(condition);
    return await this.repository.remove(entity);
  }

  async deleteManyByCondition(condition: FindOptionsWhere<E>): Promise<E[]> {
    const [entities]: [E[], number] = await this.findAllByCondition(condition);
    return await this.repository.remove(entities);
  }

  async countAll(): Promise<number> {
    return await this.repository.count();
  }

  async countAllWithCondition(condition: FindOptionsWhere<E>): Promise<number> {
    return await this.repository.count({
      where: condition,
    });
  }
}

// async updateOne(id: string, updateEntityDto: UpdateDTO): Promise<E> {
//   const entity: E = await this.findOneById(id);
//   this.repository.merge(entity, updateEntityDto as DeepPartial<E>);
//   return await this.repository.save(entity);
// }

// async findAllByCondition(condition: FindOptionsWhere<E>): Promise<E[]> {
// if (rows.length === 0) {
//   throw new NotFoundException(this.errorMessage);
// }
// return rows;
// const rows: E[] = await this.repository.find({
//   where: condition,
// });
// if (rows.length === 0) {
//   throw new NotFoundException(this.errorMessage);
// }
// return rows;
// }

// async findWithRelation(rel: FindOptionsRelations<E>): Promise<E[]> {
// if (rows.length === 0) {
//   throw new NotFoundException(this.errorMessage);
// }
// return rows;
// const rows: E[] = await this.repository.find({
//   relations: rel,
// });
// if (rows.length === 0) {
//   throw new NotFoundException(this.errorMessage);
// }
// return rows;
// }

// async findOneById(id: string): Promise<E> {
// const row: E = await this.repository.findOneBy({ id } as FindOptionsWhere<E>);
// if (!row) {
//   throw new NotFoundException(this.errorMessage);
// }
// return row;
// }
// async createOne(createEntityDto: CreateDTO): Promise<E> {
//   const entity: E = await this.repository.create(createEntityDto as DeepPartial<E>);
//   return await this.repository.save(entity);
// }

// async createMany(createEntityDtos: CreateDTO[]): Promise<E[]> {
//   const entities: E[] = await this.repository.create(createEntityDtos as DeepPartial<E[]>);
//   return await this.repository.save(entities);
// }

// async updateOne(id: string, updateEntityDto: UpdateDTO): Promise<E> {
//   await this.findOneById(id);
//   await this.repository.update({ id } as FindOptionsWhere<E>, updateEntityDto as QueryDeepPartialEntity<E>);
//   return this.findOneById(id);
// }
