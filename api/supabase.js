/**
 * /api/supabase.js — Vercel Serverless Function
 *
 * PURPOSE:
 *   Serves Supabase credentials to the frontend securely from
 *   server-side environment variables. The frontend never stores
 *   or prompts for credentials — it just calls GET /api/supabase
 *   on every page load and receives { url, key }.
 *
 * WHY THIS MAKES THE CONNECTION PERMANENT:
 *   • Credentials live in Vercel env vars (set once, last forever).
 *   • The frontend always fetches them fresh — no localStorage needed.
 *   • Works for Admin, Driver, and Passenger roles identically.
 *   • No matter who opens the page or on which device, connection works.
 *
 * SETUP (do this once in Vercel dashboard):
 *   1. Open your Vercel project → Settings → Environment Variables
 *   2. Add:
 *        SUPABASE_URL  = https://xxxxxxxxxxxx.supabase.co
 *        SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *   3. Redeploy. Done — connection is permanent for all users forever.
 *
 * NOTE:  The anon key is intentionally safe to expose to browsers
 *        (it only grants public-table access controlled by RLS policies).
 *        Never put your service_role key here.
 */

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  // Validate that env vars are actually set
  if (!url || !key) {
    console.error(
      '[BusTrack] Missing env vars: SUPABASE_URL and/or SUPABASE_ANON_KEY. ' +
      'Set them in Vercel Dashboard → Settings → Environment Variables.'
    );
    return res.status(500).json({
      error: 'Server configuration error: Supabase credentials not set.',
      hint: 'Add SUPABASE_URL and SUPABASE_ANON_KEY to your Vercel environment variables.'
    });
  }

  // Basic sanity check on the URL shape
  if (!url.includes('.supabase.co') && !url.includes('.supabase.in')) {
    return res.status(500).json({
      error: 'SUPABASE_URL does not look like a valid Supabase project URL.'
    });
  }

  // Return credentials to the frontend
  // Cache-Control: no-store ensures fresh credentials on every request
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    url: url.trim().replace(/\/$/, ''),
    key: key.trim()
  });
}
