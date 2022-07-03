import {savings, createSaving, createAccount} from './controller'

export default {
    Query: {
        savings,
    },
    Mutation: {
        createSaving,
        createAccount
    }
}