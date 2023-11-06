import { BaseEntity } from "@app/entities/base.entity";
import { NotFoundException } from "@nestjs/common";
import { DeepPartial, FindOptionsRelations, FindOptionsWhere, In, Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export abstract class BaseCrudRepository<E extends BaseEntity, CreateDTO, UpdateDTO> {
  private readonly errorMessage: string;
  private readonly repository: Repository<E>;

  constructor(repository: Repository<E>, errorMessage: string) {
    this.errorMessage = errorMessage;
    this.repository = repository;
  }

  async findAll(): Promise<E[]> {
    return await this.repository.find();
  }

  async findAllByIds(ids: string[]): Promise<E[]> {
    return await this.repository.find({
      where: { id: In(ids) } as FindOptionsWhere<E>,
    });
  }

  async findOneById(id: string): Promise<E> {
    const row = await this.repository.findOneBy({ id } as FindOptionsWhere<E>);
    if (!row) {
      throw new NotFoundException(this.errorMessage);
    }
    return row;
  }

  async findWithRelation(rel: FindOptionsRelations<E>): Promise<E[]> {
    const rows = await this.repository.find({
      relations: rel,
    });
    if (rows.length === 0) {
      throw new NotFoundException(this.errorMessage);
    }
    return rows;
  }

  async findByCondition(condition: FindOptionsWhere<E>): Promise<E[]> {
    const rows = await this.repository.find({
      where: condition,
    });
    if (rows.length === 0) {
      throw new NotFoundException(this.errorMessage);
    }
    return rows;
  }

  async createOne(createEntityDto: CreateDTO): Promise<E> {
    const entity = await this.repository.create(createEntityDto as DeepPartial<E>);
    return await this.repository.save(entity);
  }

  async createMany(createEntityDtos: CreateDTO[]): Promise<E[]> {
    const entities = await this.repository.create(createEntityDtos as DeepPartial<E[]>);
    return await this.repository.save(entities);
  }

  async updateOne(id: string, updateEntityDto: UpdateDTO): Promise<E> {
    this.findOneById(id);
    await this.repository.update({ id } as FindOptionsWhere<E>, updateEntityDto as QueryDeepPartialEntity<E>);
    return this.findOneById(id);
  }

  async deleteOne(id: string): Promise<E> {
    const entity = this.findOneById(id);
    this.repository.delete(id);
    return entity;
  }

  async deleteMany(ids: string[]): Promise<E[]> {
    const entities = this.findAllByIds(ids);
    this.repository.delete(ids);
    return entities;
  }
}
