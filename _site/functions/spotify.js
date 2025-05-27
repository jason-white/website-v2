/*
 * Thanks, Henry!
 * https://henry.codes/writing/spotify-now-playing/
 */

import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export async function handler(event, context) {
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = `${process.env.URL}/.netlify/functions/callback`;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const playerRes = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const playerData = await playerRes.json();
    const track = playerData.items[0].track;

    const artists = track.artists.map((artist) => ({
      name: artist.name,
      href: artist.href,
    }));

    const result = {
      artists,
      name: track.name,
      url: track.external_urls.spotify,
      artworkUrl: track.album.images[1]?.url || track.album.images[0]?.url,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error("Spotify function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
}
