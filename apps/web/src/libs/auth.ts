import type { Auth } from "@repo/api";
import {
  anonymousClient,
  inferAdditionalFields,
  phoneNumberClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "./env";

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
