/* music.js originally by Damian Walsh 🐰
 * https://github.com/damianwalsh/damianwalsh.github.io
 * https://damianwalsh.co.uk/
 */

import 'dotenv/config';
import Fetch from '@11ty/eleventy-fetch';
import {promises as fs} from 'fs';

Fetch.concurrency = 1;

const DISCOGS_TOKEN = process.env.DISCOGS_TOKEN;
const DISCOGS_USER_AGENT = process.env.USER_AGENT;

async function fetchWithRateLimit(url) {
  return Fetch(url, {
    duration: '1d',
    type: 'json',
    fetchOptions: {
      headers: {
        'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
        'User-Agent': DISCOGS_USER_AGENT
      }
    }
  });
}

async function fetchReleaseDetails(release) {
  if (!release.release_id) {
    console.error('No Discogs ID provided for release:', release.title);
    return release;
  }

  const releaseUrl = `https://api.discogs.com/releases/${release.release_id}`;

  try {
    const releaseDetails = await fetchWithRateLimit(releaseUrl);
    const uniqueFormats = new Set();
    return {
      ...release,
      label: releaseDetails.labels[0]?.name.replace(/\s*\(\d+\)\s*$/, '') || '',
      year: releaseDetails.year,
      notes: releaseDetails.notes,
      released: releaseDetails.released,
      genres: releaseDetails.genres || [],
      uri: releaseDetails.uri,
      videos:
        releaseDetails.videos?.map(video => ({
          url: video.uri,
          title: video.title,
          duration: video.duration
        })) || [],
      formats: (releaseDetails.formats || []).reduce((acc, format) => {
        if (!uniqueFormats.has(format.name)) {
          uniqueFormats.add(format.name);
          acc.push({
            name: format.name,
            descriptions: format.descriptions,
            text: format.text
          });
        }
        return acc;
      }, []),
      tracklist: (releaseDetails.tracklist || []).map(track => ({
        position: track.position,
        title: track.title,
        duration: track.duration
      }))
    };
  } catch (error) {
    console.error(`Error fetching details for ${release.title}:`, error);
    return release;
  }
}

export default async function () {
  try {
    const localData = await fs.readFile('src/_data/musicCollection.json', 'utf8');
    const myCollection = JSON.parse(localData);

    // Use reduce to process sequentially
    const releases = await myCollection.reduce(async (accPromise, release) => {
      const acc = await accPromise;
      const releaseDetails = await fetchReleaseDetails(release);
      return [...acc, releaseDetails];
    }, Promise.resolve([]));

    return {releases};
  } catch (error) {
    console.error('Error processing music collection:', error);
    return {releases: []};
  }
}
