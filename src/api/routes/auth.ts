import {checkHash, hash} from "../utils";
import jwt from "jsonwebtoken";

export const createAccount = async (req: any, res: any, next: any) => {
    const {email, name, password, password_confirmation} = req.body
    if (email && name && password && password_confirmation) {
        const exists = await req.prisma.user.findFirst({
            where: {
                email
            }
        })
        if (!exists) {
            if (password === password_confirmation) {
                const data = {email, password: hash(password), name}
                const user = await req.prisma.user.create({data})
                user.token = jwt.sign({sub: user.id}, process.env.JWT_SECRET || "")
                delete user.password
                res.send(user)
            } else {
                res.status(400).send({
                        error:
                            {
                                code: 400,
                                message: "Password and password confirmation are not equal"
                            }
                    }
                )
            }
        } else {
            res.status(400).send({
                    error:
                        {
                            code: 400,
                            message: `Account with email ${email} already exists`
                        }
                }
            )
        }
    } else {
        res.status(400).send({
                error:
                    {
                        code: 400,
                        message: 'Invalid account details'
                    }
            }
        )
    }
}

export const auth = async (req: any, res: any, next: any) => {
    const {email, password} = req.body

    if (email && password) {
        const user = await req.prisma.user.findFirst({
            where: {
                email
            }
        })

        if (user && checkHash(password, user.password)) {
            user.token = jwt.sign({sub: user.id}, process.env.JWT_SECRET || "")
            res.send(user)
        } else {
            res.status(401).send({
                    error:
                        {
                            code: 401,
                            message: 'Invalid email or password combination'
                        }
                }
            )
        }
    } else {
        res.status(400).send({
                error:
                    {
                        code: 401,
                        message: 'Invalid email or password'
                    }
            }
        )
    }
}