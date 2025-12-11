import type { Auth } from "@repo/api";
import { env } from "@libs/env";
import {
  anonymousClient,
  inferAdditionalFields,
  phoneNumberClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL,
  basePath: "/auth",
  plugins: [
    inferAdditionalFields<Auth>(),
    anonymousClient(),
    phoneNumberClient(),
  ],
});

export default authClient;

export const {
  phoneNumber: { sendOtp, verify: verifyOtp },
  signOut,
  // signOut,
} = authClient;
