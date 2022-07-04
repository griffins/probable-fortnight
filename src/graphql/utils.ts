import bcrypt from "bcryptjs";
import {AuthenticationError} from "apollo-server";

export interface Paginator {
    take: number
    skip: number,
    cursor?: {
        id: number
    }
}

export const hash = (plaintext: string): string => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(plaintext, salt);
}
export const checkHash = (plaintext: string, hash: string): boolean => {
    return bcrypt.compareSync(plaintext, hash);
}

export const requireUser = (ctx: any) => {
    if (!ctx.user) {
        throw new AuthenticationError("Authorization required")
    }
}

export class InputError extends Error {

}