import { BaseEntity } from "@app/entities/base.entity";
import { NotFoundException } from "@nestjs/common";
import { DeepPartial, FindOneOptions, FindOptionsWhere, Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export abstract class BaseCrudRepository<E extends BaseEntity, CreateDTO, UpdateDTO> {
    private readonly errorMessage: string;

    constructor(private readonly repository: Repository<E>, errorMessage: string) {
        this.errorMessage = errorMessage;
    }

    async findAllBase(): Promise<E[]> {
        return await this.repository.find();
    }

    async findOneBase(id: string): Promise<E> {
        const result  = await this.repository.findOneBy({id} as FindOptionsWhere<E>);
        if(!result) {
            throw new NotFoundException(this.errorMessage);
        }
        return result;
    }

    async createOneBase(createEntityDto: CreateDTO): Promise<E> {
        const entity = await this.repository.create(createEntityDto as DeepPartial<E>);
        return await this.repository.save(entity);
    }

    async updateOneBase(id: string, updateEntityDto: UpdateDTO): Promise<E> {
        this.findOneBase(id);
        await this.repository.update({id} as FindOptionsWhere<E>, updateEntityDto as QueryDeepPartialEntity<E>);
        return this.findOneBase(id);
    }
    
    async deleteOneBase(id: string): Promise<E> {
        const entity = this.findOneBase(id);
        this.repository.delete(id);
        return entity;
    }
//------------------------------------------------------
    async findAllByUserIdBase(userId: string): Promise<E[]> {
        return await this.repository.findBy({userId} as FindOptionsWhere<E>);
    }

    async findOneByUserIdBase(userId: string, id: string): Promise<E> {
        const result  = await this.repository.findOneBy({userId, id} as FindOptionsWhere<E>);
        if(!result) {
            throw new NotFoundException(this.errorMessage);
        }
        return result;
    }

//------------------------------------------------------

    


    async findAllByPropertyBase(property: string, value: string): Promise<E[]> {
        return await this.repository.findBy({[property]: value} as FindOptionsWhere<E>);
    }

    async findOneByPropertyBase(property: string, value: string, id: string): Promise<E> {
        const result  = await this.repository.findOneBy({[property]: value, id} as FindOptionsWhere<E>);
        if(!result) {
            throw new NotFoundException(this.errorMessage);
        }
        return result;
    }

    async createOneByPropertyBase(createEntityDto: CreateDTO): Promise<E> {
        const entity = await this.repository.create(createEntityDto as DeepPartial<E>);
        return await this.repository.save(entity);
    }

    // async updateOneByPropertyBase(id: string, updateEntityDto: UpdateDTO): Promise<E> {

    // }

    // async deleteOneByPropertyBase(property: string, value: string, id: string): Promise<E> {

    // }
    
    // async deleteAllByPropertyBase(property: string, value: string) ??? 
}