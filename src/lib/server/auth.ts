import type { Cookies } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import ms from "ms";
import { z } from "zod";
import { maxCookieAge, newSessionToken, serverConfig } from ".";
import { orm, schema } from "./db";

export const sessionTokenSecret = serverConfig.sessionTokenSecret;

export const hashPassword = async (plaintext: string) => {
	return await bcrypt.hash(plaintext, serverConfig.passwordSaltRounds);
};

export const checkHashedPassword = async (plaintext: string, hashedPassword: string) => {
	return await bcrypt.compare(plaintext, hashedPassword);
};

const SESSION_TOKEN_KEY = "session-token";
const REFRESH_TOKEN_KEY = "refresh-token";

export const getAndRefreshAuth = async (
	cookies: Cookies,
): Promise<{
	token: string;
	isAdmin: boolean;
} | null> => {
	// check session token JWT
	const jwtToken = cookies.get(SESSION_TOKEN_KEY);

	try {
		if (jwtToken && jwt.verify(jwtToken, serverConfig.sessionTokenSecret)) {
			const jwtData = jwt.decode(jwtToken);

			const { data } = z
				.object({
					token: z.string(),
					isAdmin: z.boolean(),
				})
				.safeParse(jwtData);

			if (data) {
				return data;
			}
		}
	} catch {}

	// refresh session token with refresh token
	const sessionToken = cookies.get(REFRESH_TOKEN_KEY);
	if (!sessionToken) {
		return null;
	}

	const session = await orm.query.session.findFirst({
		where: (t) => eq(t.token, sessionToken),
		columns: {
			token: true,
			isAdmin: true,
		},
	});

	if (!session) {
		// session does not exist
		return null;
	}

	// update last active time on the session
	orm
		.update(schema.session)
		.set({
			activeAt: new Date(),
		})
		.where(eq(schema.session.token, sessionToken));

	const newJwtToken = jwt.sign({}, serverConfig.sessionTokenSecret, {
		expiresIn: serverConfig.sessionTokenTimeToLive,
	});

	cookies.set(SESSION_TOKEN_KEY, newJwtToken, {
		path: "/",
		maxAge: ms(serverConfig.sessionTokenTimeToLive) / 1000,
	});

	// refresh expiration of session token
	cookies.set(REFRESH_TOKEN_KEY, session.token, {
		path: "/",
		maxAge: maxCookieAge,
	});

	return session;
};

export const grantSession = async (cookies: Cookies, adminSession = false) => {
	// create session
	const session = (
		await orm
			.insert(schema.session)
			.values({
				token: newSessionToken(),
				isAdmin: adminSession,
			})
			.returning()
	)[0];

	// save session token as cookie on client
	cookies.set(REFRESH_TOKEN_KEY, session.token, {
		path: "/",
		maxAge: maxCookieAge,
	});
};

// Returns true if a valid session was deleted
export const deleteSessionUsingCookie = async (cookies: Cookies): Promise<boolean> => {
	const refreshToken = cookies.get(REFRESH_TOKEN_KEY);
	if (!refreshToken) return false;

	await orm.delete(schema.session).where(eq(schema.session.token, refreshToken));

	cookies.delete(REFRESH_TOKEN_KEY, { path: "/" });
	cookies.delete(SESSION_TOKEN_KEY, { path: "/" });

	return true;
};

// /**
//  * Deletes all refresh tokens and optionally invalidates all sessions
//  */
// export const nukeAll = async (): Promise<void> => {};
