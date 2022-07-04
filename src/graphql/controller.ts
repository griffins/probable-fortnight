import {DateTime} from 'luxon'
import jwt from 'jsonwebtoken'
import {createObjectCsvWriter} from 'csv-writer'
import fs from 'fs'
import {InputError, checkHash, hash, Paginator, requireUser} from './utils'

export const savings = async (parent: any, args: any, ctx: any) => {
    requireUser(ctx)

    const paginator: Paginator = {
        take: (args.pagination && args.pagination.take) || 15,
        skip: 0
    }
    if (args.pagination && args.pagination.cursor) {
        paginator.cursor = {id: args.pagination.cursor}
        paginator.skip = 1
    }

    // Our savings are sorted to facilitate pagination. Old first, new last
    const savings = await ctx.prisma.saving.findMany({
        where: {
            userId: {equals: ctx.user.id}
        },
        include: {user: true},
        orderBy: {
            id: 'asc'
        },
        ...paginator
    })
    //change dates to the preferred format, or it will default to a local format
    savings.map((s: any) => {
        s.date = DateTime.fromJSDate(s.date).toISO()
        return s
    })
    return savings
}

export const savingsReport = async (parent: any, args: any, ctx: any) => {
    requireUser(ctx)
    const {from, to} = args.dateRange
    const path = `saving_report_${ctx.user.id}_${from}_${to}.csv`
    if (!fs.existsSync(`public/${path}`)) {
        const savings = await ctx.prisma.saving.findMany({
            where: {
                userId: {equals: ctx.user.id},
                date: {
                    lte: new Date(to).toISOString(),
                    gte: new Date(from).toISOString()
                }
            },
            orderBy: {
                id: 'asc'
            }
        })
        //change dates to the preferred format, or it will default to a local format
        savings.map((s: any) => {
            s.date = DateTime.fromJSDate(s.date).toISO()
            return s
        })
        const csvWriter = createObjectCsvWriter({
            path: `public/${path}`,
            header: [
                {id: 'id', title: 'id'},
                {id: 'date', title: 'date'},
                {id: 'amount', title: 'amount'},
                {id: 'description', title: 'description'},
            ]
        });
        await csvWriter.writeRecords(savings)
    }
    return {url: `${process.env.URL || 'http://localhost:4000'}/${path}`}
}

export const createSaving = async (parent: any, args: any, ctx: any) => {
    requireUser(ctx)
    const date = DateTime.now().startOf('day').toISO()
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
            const saving = await ctx.prisma.saving.create({data, include: {user: true}})
            saving.date = DateTime.fromJSDate(saving.date).toISO()
            return saving
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

export const auth = async (parent: any, args: any, ctx: any) => {
    const {email, password} = args.user

    const user = await ctx.prisma.user.findFirst({
        where: {
            email
        }
    })

    if (user && checkHash(password, user.password)) {
        user.token = jwt.sign({sub: user.id}, process.env.JWT_SECRET || "")
        return user
    }

    throw new InputError(`Invalid email, password combination`)
}
