// app/sessions.ts
import { createCookieSessionStorage } from "@remix-run/cloudflare";

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      cookie: {
        name: "__crn_session",
      },
    }
  );

export { getSession, commitSession, destroySession };
