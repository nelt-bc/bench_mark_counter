import * as dotenv from "dotenv"

dotenv.config()

export type Config = {
    masterAccount: {
        privateKey: string,
        accountId: string
    }
    singleRunTimes: number
}

export const config: Config = {
    masterAccount: {
        privateKey: process.env.M_PRIVATE_KEY!,
        accountId: process.env.M_ACCOUNT_ID!
    },
    singleRunTimes: 3
}