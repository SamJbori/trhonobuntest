import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { createTRPCRouter } from "../libs/trpc.js";
import { postRouter } from "./posts.js";
