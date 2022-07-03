import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()
export const context = async () => {
    const user = await prisma.user.findFirst();
    return {user, prisma};
}