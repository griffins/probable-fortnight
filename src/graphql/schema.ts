import {gql} from 'apollo-server';

export default gql`
    type Saving {
        id: Int
        amount: Float
        description: String
        date: String
        user: User
    }
    
    type User {
        id: ID
        name: String
        email: String
        token : String
    }
    
    type File {
        url : String
    }

    type Query {
        savings (pagination: Pagination): [Saving]
        savingsReport (dateRange: DateRange): File
        auth (user: UserDetails): User
    }

    input UserId {
        userId: Int
    }

    input SavingDetails {
        amount: Float
        description: String
    }

    input Pagination {
        take: Int
        cursor: Int
    } 
    
    input DateRange {
        from: String
        to: String
    }

    input UserDetails {
        name: String
        email: String
        password: String
        password_confirmation: String
    }

    type Mutation {
        createSaving (user: UserId, details: SavingDetails): Saving
        createAccount (details: UserDetails): User
    }
`;