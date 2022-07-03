import {PrismaClient} from '@prisma/client'
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient()
export const context = async ({req}: { req: any }) => {
    const authorization = req.headers.authorization
    const [type, token] = authorization.split(' ')
    if (type.toLowerCase() === 'bearer') {
        if (jwt.verify(token, process.env.JWT_SECRET || "")) {
            // @ts-ignore
            const {sub: id} = jwt.decode(token)
            const user = await prisma.user.findFirst({
                where:{
                    id
                }
            })
            return {user, prisma};
        }
    }
    return {prisma};
}