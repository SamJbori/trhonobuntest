import { Hono } from "hono";
import { x } from "@repo/constants";
import "bun";
const app = new Hono();

const welcomeStrings = [
  "Hello Hono!",
  "To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/backend/hono",
  x,
  Bun.env.MESSAGE,
];

app.get("/", (c) => {
  return c.text(welcomeStrings.join("\n\n"));
});

export default app;
