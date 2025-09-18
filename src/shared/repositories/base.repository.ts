import { PrismaClient } from "@prisma/client";

export abstract class BaseRepository<T> {
    protected prisma: PrismaClient;
    protected model: any;

    constructor(model: any, prismaClient: PrismaClient) {
        this.model = model;
        this.prisma = prismaClient;
    }

    async findAll(params?: object): Promise<T[]> {
        return this.model.findMany(params);
    }

    async findById(id: string): Promise<T | null> {
        return this.model.findUnique({ where: { id } });
    }

    async create(data: Partial<T>): Promise<T> {
        return this.model.create({ data });
    }

    async update(id: string, data: Partial<T>): Promise<T> {
        return this.model.update({ where: { id }, data });
    }

    async delete(id: string): Promise<T> {
        return this.model.delete({ where: { id } });
    }
}
