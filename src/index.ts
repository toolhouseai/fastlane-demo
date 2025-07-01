import { Hono, Next } from "hono";
import { Context } from "hono";
import { indexHtml } from "./pages/index.js";
import { publishersHtml } from "./pages/publishers.js";
import { publishersHtml as pubAlt } from "./pages/publishersAlt.js";
import { agentsHtml } from "./pages/agents.js";
import { htmltomd } from "./html2md";
import { secretContentHtml } from "./pages/secretContent.js";

interface CloudflareBindings {}

// Define the bindings, including the Turnstile secret
interface Bindings extends CloudflareBindings {
  TURNSTILE_SECRET_KEY: string;
  DB: any;
}

const app = new Hono<{ Bindings: Bindings }>();

/**
 * Middleware to validate a Cloudflare Turnstile token.
 * This should be applied to any routes you want to protect.
 */
const turnstileMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header("cf-turnstile-response");
  const ip = c.req.header("CF-Connecting-IP") ?? "";

  if (!token) {
    return c.json({ error: "Turnstile token missing" }, 403);
  }

  if (!c.env.TURNSTILE_SECRET_KEY) {
    console.error("TURNSTILE_SECRET_KEY is not set in environment variables!");
    return c.json(
      { error: "Server misconfiguration: TURNSTILE_SECRET_KEY is missing." },
      500
    );
  }

  let formData = new FormData();
  formData.append("secret", c.env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  formData.append("remoteip", ip);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    }
  );

  const result: { success: boolean } = await response.json();

  if (result.success) {
    await next();
  } else {
    console.error("Turnstile verification failed:", result);
    return c.json({ error: "Invalid Turnstile token", details: result }, 403);
  }
};

/**
 * Middleware to check for the X-TOOLHOUSE-FASTLANE header.
 * This runs on all API routes for GET, PUT, and POST requests.
 */
const fastlaneHeaderMiddleware = async (c: Context, next: Next) => {
  const header = c.req.header("X-TOOLHOUSE-FASTLANE");
  if (!header) {
    console.log(
      `DEBUG: X-TOOLHOUSE-FASTLANE header is missing on ${c.req.method} ${c.req.url} ${c.req.path}`
    );
  } else {
    const token = header;
    if (token) {
      // Something should validate the token here
      // validateToken(token);
      if (c.req.path.startsWith("/agents")) {
        // Decrease agent wallet
        const { updateAgentWallet } = await import("./utils.js");
        await updateAgentWallet(c.env.DB, "agent_token_1", -Math.abs(1));
        const { updatePublisherWallet } = await import("./utils.js");
        await updatePublisherWallet(c.env.DB, "publisher_token_1", Math.abs(1));
        const md = htmltomd(secretContentHtml);
        c.set("md", md);
      }
      // else if (c.req.path.startsWith("/publishers")) {
      //   // increase publisher wallet
      //   const { updatePublisherWallet } = await import("./utils.js");
      //   await updatePublisherWallet(c.env.DB, token, Math.abs(1));
      // }
    }
    if (c.req.path.startsWith("/publishers")) {
      const md = htmltomd(agentsHtml);
      c.set("md", md);
    }
    return;
  }

  await next();
};

// Apply middleware to ALL routes that aren't APIs
app.use(async (c, next) => {
  if (!c.req.path.startsWith("/api/")) {
    await fastlaneHeaderMiddleware(c, next);
    // Ensure a response is always returned
    if (!c.finalized) {
      await next();
    }
    return;
  }
  await next();
});

// -- site

// --- API Routes ---

app.get("/api/agents", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM agents").all();
  return c.json(results);
});

app.get("/api/publishers", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM publishers").all();
  return c.json(results);
});

app.get("/api/agents/:id", async (c) => {
  const id = c.req.param("id");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM agents WHERE id = ?"
  )
    .bind(id)
    .all();
  return c.json(results);
});

app.get("*", async (c) => {
  if (c.req.path.startsWith("/agents")) {
    // @ts-ignore
    if (c.get("md")) {
      console.log("Returning markdown for agents");
      // @ts-ignore
      return c.text(c.get("md"), 200, {
        "Content-Type": "text/markdown",
      });
    }
    return c.html(agentsHtml);
  }
  if (c.req.path.startsWith("/publishers")) {
    // @ts-ignore
    if (c.get("md")) {
      // @ts-ignore
      return c.text(c.get("md"), 200, {
        "Content-Type": "text/markdown",
      });
    }
    return c.html(publishersHtml);
  }
  // Default to index.html for all other paths
  if (c.req.path === "/") {
    return c.html(indexHtml);
  }
  // If no specific route matches, return a 404
  return c.notFound();
});

// --- Secure protected content endpoint ---
app.post("/api/get-protected-content", async (c) => {
  const token = c.req.header("cf-turnstile-response");
  const ip = c.req.header("CF-Connecting-IP") ?? "";
  if (!token) {
    return c.json({ error: "Turnstile token missing" }, 403);
  }
  if (!c.env.TURNSTILE_SECRET_KEY) {
    return c.json(
      { error: "Server misconfiguration: TURNSTILE_SECRET_KEY is missing." },
      500
    );
  }
  const formData = new FormData();
  formData.append("secret", c.env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  formData.append("remoteip", ip);
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    }
  );
  const result: any = await response.json();
  if (!result.success) {
    return c.json({ error: "Invalid Turnstile token", details: result }, 403);
  }
  // Optionally: set a session/cookie here for future requests
  // Serve the protected HTML content (not present in initial HTML)
  return c.html(secretContentHtml);
});

export default app;
