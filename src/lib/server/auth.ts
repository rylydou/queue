import type { Auth } from "$lib/types";
import type { Cookies } from "@sveltejs/kit";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import ms from "ms";
import { z } from "zod";
import { maxCookieAge, newSessionToken, serverConfig } from ".";
import { orm, schema } from "./db";

export const hashPassword = async (plaintext: string) => {
	return await bcrypt.hash(plaintext, serverConfig.passwordSaltRounds);
};

export const checkHashedPassword = async (plaintext: string, hashedPassword: string) => {
	return await bcrypt.compare(plaintext, hashedPassword);
};

const JWT_TOKEN_KEY = "jwt";
const SESSION_TOKEN_KEY = "session";

export const isAuthed = async (cookies: Cookies): Promise<string | undefined> => {
	// check session token JWT
	const jwtToken = cookies.get(JWT_TOKEN_KEY);

	try {
		if (jwtToken && jwt.verify(jwtToken, serverConfig.jwtSecret)) {
			const jwtData = jwt.decode(jwtToken);

			const { data } = z
				.object({
					id: z.string(),
				})
				.safeParse(jwtData);

			if (data) {
				return data.id;
			}
		}
	} catch {}

	// refresh session token with refresh token
	const sessionToken = cookies.get(SESSION_TOKEN_KEY);
	if (!sessionToken) {
		return undefined;
	}

	const session = await orm.query.session.findFirst({
		where: (t) => eq(t.token, sessionToken),
		columns: {
			token: true,
		},
		with: {
			user: {
				columns: {
					id: true,
				},
			},
		},
	});

	if (!session) {
		// session does not exist
		return undefined;
	}

	// update last active time on the session
	orm
		.update(schema.session)
		.set({
			activeAt: new Date(),
		})
		.where(eq(schema.session.token, sessionToken));

	const newJwtToken = jwt.sign({ id: session.user.id }, serverConfig.jwtSecret, {
		expiresIn: serverConfig.jwtTimeToLive,
	});

	cookies.set(JWT_TOKEN_KEY, newJwtToken, {
		path: "/",
		maxAge: ms(serverConfig.jwtTimeToLive) / 1000,
	});

	// refresh expiration of session token
	cookies.set(SESSION_TOKEN_KEY, session.token, {
		path: "/",
		maxAge: maxCookieAge,
	});

	return session.user.id;
};

export const grantSession = async (userID: string, cookies: Cookies) => {
	// create session
	const session = (
		await orm
			.insert(schema.session)
			.values({
				token: newSessionToken(),
				userID: userID,
			})
			.returning()
	)[0];

	// save session token as cookie on client
	cookies.set(SESSION_TOKEN_KEY, session.token, {
		path: "/",
		maxAge: maxCookieAge,
	});
};
