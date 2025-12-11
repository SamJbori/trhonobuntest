import type { BetterAuthOptions, InferSession, InferUser } from "better-auth";
import type { Db } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { betterAuth } from "better-auth/minimal";
import { anonymous, captcha, phoneNumber } from "better-auth/plugins";

import { env } from "./env";

const authConfig = (db: Db) => {
  const config = {
    database: mongodbAdapter(db),
    basePath: "/auth",
    advanced: {
      cookiePrefix: "myrepo",
      useSecureCookies: true,
      crossSubDomainCookies: {
        enabled: true,
        domain: ".myrepo.com", // Domain with a leading period
      },
      defaultCookieAttributes: {
        secure: true,
        httpOnly: true,
        sameSite: "none", // Allows CORS-based cookie sharing across subdomains
        // partitioned: true, // New browser standards will mandate this for foreign cookies
      },
    },
    trustedOrigins: (request) => {
      // Return an array of trusted origins based on the request
      const origin = request.headers.get("origin");
      return [origin ?? ""];
    },
    user: {
      additionalFields: {
        phoneNumber: {
          type: "string",
          required: true,
          unique: true,
          // Add your own validator
          // validator: { input: ZPhoneNumber, output: ZPhoneNumber },
        },
        phoneNumberVerified: {
          type: "boolean",
          required: false,
          defaultValue: false,
        },
        isAnonymous: { type: "boolean", required: false },
        // Use your own logic For Privillaged Access
        isAdmin: { type: "boolean", required: false },
        role: {
          type: "string",
          required: false,
          // Add youe own validator
          // validator: ZENUM
        },
      },
    },
    plugins: [
      anonymous({
        onLinkAccount({ anonymousUser, newUser }) {
          console.log("AnonymousUser: ", anonymousUser.user.id);
          console.log("NewUser: ", newUser.user.id);
          // do something, like change cart ownership, or likes
        },
      }),
      phoneNumber({
        sendOTP: ({ phoneNumber, code }) => {
          //   const r = await options.sendCode(phoneNumber, code);
          //   if ([HTTPCodes.H200, HTTPCodes.H201].includes(r)) {
          //     return;
          //   } else {
          //     throw new Error("500");
          //   }
          console.log("Code: ", phoneNumber, code);
        },
        expiresIn: 600,
        otpLength: 6,
        phoneNumberValidator: (_phoneNumber) => {
          // return ZPhoneNumber.safeParse(phoneNumber).success;
          return true;
        },
        signUpOnVerification: {
          getTempEmail: (phoneNumber) => {
            return `${phoneNumber}@my.myrepo.com`;
          },
          //optionally, you can also pass `getTempName` function to generate a temporary name for the user
          getTempName: (phoneNumber) => {
            return phoneNumber; //by default, it will use the phone number as the name
          },
        },
      }),
      captcha({
        provider: "cloudflare-turnstile", // or google-recaptcha, hcaptcha
        secretKey: env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
        endpoints:
          env.NODE_ENV === "development"
            ? undefined
            : ["/phone-number/send-otp"],
      }),
    ],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  } satisfies BetterAuthOptions;
  return config;
};

export const initAuth = (db: Db) => betterAuth({ ...authConfig(db) });

export type Auth = ReturnType<typeof initAuth>;
export type Session = InferSession<Auth>;
export type User = InferUser<Auth>;
export type AuthData = {
  session: Session;
  user: User;
} | null;
