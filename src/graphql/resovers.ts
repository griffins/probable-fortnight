import {savings, createSaving, createAccount, auth, savingsReport} from './controller'

export default {
    Query: {
        savings,
        auth,
        savingsReport
    },
    Mutation: {
        createSaving,
        createAccount
    }
}