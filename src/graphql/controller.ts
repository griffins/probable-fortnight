import {DateTime} from 'luxon'
import bcrypt from 'bcryptjs';

interface Paginator {
    take: number
    skip: number,
    cursor?: {
        id: number
    }
}

const hash = (plaintext: string): string => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(plaintext, salt);
}
const checkHash = (hash: string, plaintext: string): boolean => {
    return bcrypt.compareSync(hash, plaintext);
}

class InputError extends Error {

}

export const savings = async (parent: any, args: any, ctx: any) => {
    const paginator: Paginator = {
        take: (args.pagination && args.pagination.take) || 3,
        skip: 1
    }
    if (args.pagination && args.pagination.cursor) {
        paginator.cursor = {id: args.pagination.cursor}
    }

    // Our savings are sorted to facilitate pagination. Old first, new last
    return await ctx.prisma.saving.findMany({
        where: {
            userId: {equals: ctx.user.id}
        },
        include: {user: true},
        orderBy: {
            id: 'asc'
        },
        ...paginator
    })
}

export const createSaving = async (parent: any, args: any, ctx: any) => {
    const date = DateTime.now().toFormat('yyyy-MM-dd')
    const exists = await ctx.prisma.saving.findFirst({
        where: {
            date,
            userId: {equals: ctx.user.id}
        }
    })
    if (!exists) {
        const {amount, description} = args.details
        if (amount > 0) {
            const data = {amount, description, date, userId: ctx.user.id}
            return await ctx.prisma.saving.create({data, include: {user: true}})
        } else {
            throw new InputError("Saving amount cannot be less than 0")
        }
    } else {
        throw new InputError(`Saving record for ${date} already exists`)
    }
}

export const createAccount = async (parent: any, args: any, ctx: any) => {
    const {email, name, password, password_confirmation} = args.details

    const exists = await ctx.prisma.user.findFirst({
        where: {
            email
        }
    })
    if (!exists) {
        if (password === password_confirmation) {
            const data = {email, password: hash(password), name}
            return await ctx.prisma.user.create({data})
        } else {
            throw new InputError("Password and password confirmation are not equal")
        }
    } else {
        throw new InputError(`Account with email ${email} already exists`)
    }
}
