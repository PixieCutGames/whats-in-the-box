import fetch from "node-fetch";

export async function getGoogleTokens(code: string) {
  const url = "https://oauth2.googleapis.com/token";

  const params = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    grant_type: "authorization_code",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Google tokens");
  }

  return await res.json(); // access_token, id_token, refresh_token, etc.
}
