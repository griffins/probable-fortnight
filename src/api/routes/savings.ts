import {DateTime} from 'luxon'
import {createObjectCsvWriter} from 'csv-writer'
import fs from 'fs'
import {Paginator} from '../utils'

export const savings = async (req: any, res: any) => {
    const {take, cursor} = req.query

    const paginator: Paginator = {
        take: Number(take) || 15,
        skip: 0
    }
    if (cursor) {
        paginator.cursor = {id: Number(cursor)}
        paginator.skip = 1
    }

    // Our savings are sorted to facilitate pagination. Old first, new last
    const savings = await req.prisma.saving.findMany({
        where: {
            userId: {equals: req.user.id}
        },
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
    res.send(savings)
}

export const savingsReport = async (req: any, res: any) => {
    const {from, to} = req.query
    if (from && to) {
        const path = `saving_report_${req.user.id}_${from}_${to}.csv`
        if (!fs.existsSync(`public/${path}`)) {
            const savings = await req.prisma.saving.findMany({
                where: {
                    userId: {equals: req.user.id},
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
        return res.redirect(`${process.env.URL || 'http://localhost:4000'}/${path}`)
    } else {
        res.status(400).send({
                error:
                    {
                        code: 400,
                        message: "Invalid date range"
                    }
            }
        )
    }
}

export const createSaving = async (req: any, res: any) => {
    const date = DateTime.now().startOf('day')
    const exists = await req.prisma.saving.findFirst({
        where: {
            date: date.toISO(),
            userId: {equals: req.user.id}
        }
    })
    if (!exists) {
        const {amount, description} = req.body
        if (amount > 0) {
            const data = {amount, description, date: date.toISO(), userId: req.user.id}
            const saving = await req.prisma.saving.create({data})
            saving.date = date.toISO()
            res.send(saving)
        } else {
            res.status(400).send({
                    error:
                        {
                            code: 400,
                            message: "Saving amount cannot be less than 0"
                        }
                }
            )
        }
    } else {
        res.status(400).send({
                error:
                    {
                        code: 400,
                        message: `Saving record for ${date.toFormat('yyyy-MM-dd')} already exists`
                    }
            }
        )
    }
}
