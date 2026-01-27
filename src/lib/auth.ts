import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { loginRateLimiter } from "@/lib/rate-limit";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/sign-in",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },


            // ...

            async authorize(credentials) {
                if (!credentials?.email) return null;

                // Rate Limit Check
                // We use email as key because IP detection in next-auth authorize can be tricky without request object access in some versions
                // Or we can try to use a combination if possible. For now, email + global generic check.
                // Actually, restricting by Email prevents brute forcing a Specific User.
                // But doesn't prevent spraying multiple users.
                // Ideally we'd pass req IP. 
                // In next-auth v4, 'authorize' receives 'req' as second arg?
                // Let's rely on email for now as "Account Lockout" protection.

                if (!loginRateLimiter.check(credentials.email)) {
                    throw new Error("Too many login attempts. Please try again in a minute.");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                // 2. The Auth Patch: Verify Hash
                if (!user) {
                    return null
                }

                if (!user.password) {
                    return null
                }

                // Dynamically import bcrypt to avoid build issues if types are missing, though we installed them.
                const bcrypt = require("bcryptjs")
                const isValid = await bcrypt.compare(credentials.password, user.password)

                if (!isValid) {
                    throw new Error("Invalid credentials")
                }
                // To make it easy: If user exists, return it. If not, create it (Auto-signup).
                // WARNING: IN PROD this is insecure without email verification.

                if (!user) {
                    // Create User -> Create Household -> Connect
                    // We need the User ID to set ownerId, but need Household ID to set user.householdId.
                    // Circular dependency? Prisma handles this with connect, or update.

                    // 1. Create User first (without household)

                    // IMPORT BCRYPT
                    const bcrypt = require("bcryptjs")
                    const hashedPassword = await bcrypt.hash(credentials.password, 12)

                    const newUser = await prisma.user.create({
                        data: {
                            email: credentials.email,
                            name: credentials.email.split("@")[0],
                            password: hashedPassword // Secure storage
                        }
                    })

                    // 2. Create Household with Owner = User
                    const household = await prisma.household.create({
                        data: {
                            name: `${newUser.name}'s Household`,
                            ownerId: newUser.id
                        }
                    })

                    // 3. Update User with Household
                    await prisma.user.update({
                        where: { id: newUser.id },
                        data: { householdId: household.id }
                    })

                    return {
                        id: newUser.id,
                        email: newUser.email,
                        name: newUser.name,
                        role: "USER",
                        status: "PENDING",
                        householdId: household.id,
                        image: null
                    };
                }

                if (!user.householdId) {
                    const household = await prisma.household.create({
                        data: {
                            name: `${user.name || user.email}'s Household`,
                            ownerId: user.id
                        }
                    })
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { householdId: household.id }
                    })
                }

                return {
                    ...user,
                    role: user.role || "USER",
                    status: user.status || "PENDING"
                };
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;

                // Fetch basic user profile fields for session
                const user = await prisma.user.findUnique({ where: { id: token.sub } });

                session.user.householdId = user?.householdId || null;
                session.user.displayName = user?.displayName || null;
                session.user.avatarUrl = user?.avatarUrl || null;
                session.user.currency = user?.currency || "MXN";

                // Ghost Protocol: Bridge JWT data to Session (Priority)
                // This ensures we don't rely on the DB fetch for critical role access if the schema is cached stale
                session.user.role = (token.role as string) || (user?.role as string) || "USER";
                session.user.status = (token.status as string) || (user?.status as string) || "PENDING";
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                token.role = user.role;
                token.status = user.status;
            }
            return token;
        }
    },
};
