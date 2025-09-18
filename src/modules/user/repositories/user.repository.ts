import { Prisma, PrismaClient, User } from "@prisma/client";
import { BaseRepository } from "@/shared/repositories/base.repository";
import { RegisterUserInput } from "@/modules/auth/types";

export class UserRepository extends BaseRepository<User> {
    constructor(prisma: PrismaClient) {
        super(prisma.user, prisma);
    }

    async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
        return this.model.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });
    }

    async createUser(data: RegisterUserInput, tx?: Prisma.TransactionClient) {
        const client = tx ?? this.prisma;
        return client.user.create({ data });
    }



    async findByEmail(email: string): Promise<User | null> {
        return this.model.findUnique({ where: { email } });
    }
}
