// Utility functions for Cloudflare D1 (or compatible) database access in Hono handlers
// These functions expect a D1Database instance (c.env.DB) to be passed in

/**
 * Update the wallet value for an agent by token.
 * @param db The D1 database instance (c.env.DB)
 * @param token The agent's token
 * @param amount The amount to add (positive) or subtract (negative)
 * @returns Promise<boolean> true if update was successful
 */
export async function updateAgentWallet(
  db: any,
  token: string,
  amount: number
): Promise<boolean> {
  const result = await db
    .prepare(`UPDATE agents SET wallet = wallet + ? WHERE token = ?`)
    .bind(amount, token)
    .run();
  return result.success && result.changes > 0;
}

/**
 * Update the wallet value for a publisher by token.
 * @param db The D1 database instance (c.env.DB)
 * @param token The publisher's token
 * @param amount The amount to add (positive) or subtract (negative)
 * @returns Promise<boolean> true if update was successful
 */
export async function updatePublisherWallet(
  db: any,
  token: string,
  amount: number
): Promise<boolean> {
  const result = await db
    .prepare(`UPDATE publishers SET wallet = wallet + ? WHERE token = ?`)
    .bind(amount, token)
    .run();
  return result.success && result.changes > 0;
}
