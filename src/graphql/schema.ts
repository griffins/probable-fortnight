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
    }

    type Query {
        savings (pagination: Pagination): [Saving]
        user: [User]
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