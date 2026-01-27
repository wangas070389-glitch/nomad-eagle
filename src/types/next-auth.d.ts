
import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            householdId: string | null
            displayName: string | null
            avatarUrl: string | null
            currency: string | null
            role: string
            status: string
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        id: string
        role: string
        status: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        status: string
    }
}
