import {PrismaClient} from '@prisma/client'
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient()

export const requireAuthorization = (req: any, res: any, next: any) => {
    if (req.user) {
        next()
    } else {
        res.status(401).send({
                error:
                    {
                        code: 401,
                        message: "Authorization required"
                    }
            }
        )
    }
}

export const session = async (req: any, res: any, next: any) => {
    const authorization = req.headers.authorization
    if (authorization) {
        const [type, token] = authorization.split(' ')
        if (type.toLowerCase() === 'bearer') {
            try {
                const {sub: id} = jwt.verify(token, process.env.JWT_SECRET || "")
                req.user = await prisma.user.findFirst({
                    where: {
                        id: Number(id)
                    }
                })
            } catch (ignored) {
            }
        }
    }
    req.prisma = prisma;
    next()
}