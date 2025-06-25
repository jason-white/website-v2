import pluginFilters from "./src/_config/filters.js";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

export default async function (eleventyConfig) {
  eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg}");

  eleventyConfig.addPassthroughCopy("./src/js");
  eleventyConfig.addPassthroughCopy("./src/functions");

  eleventyConfig.addPassthroughCopy({
    "content/music-collection/img": "img",
  });

  eleventyConfig.addCollection("releases", function (collectionApi) {
    const musicData = collectionApi.getAll()[0]?.data?.music;
    if (!musicData || !musicData.releases) {
      console.warn("Music data not found or invalid");
      return [];
    }
    return musicData.releases;
  });

  eleventyConfig.addCollection("artists", function (collectionApi) {
    const musicData = collectionApi.getAll()[0]?.data?.music;
    if (!musicData || !musicData.releases) {
      console.warn("Music data not found or invalid for artists collection");
      return [];
    }
    const releases = musicData.releases;
    const artists = [...new Set(releases.map((release) => release.artist))];
    const result = artists.map((artist) => ({
      artist,
      releases: releases.filter((r) => r.artist === artist),
    }));
    return result;
  });

  eleventyConfig.addCollection("genres", function (collectionApi) {
    const musicData = collectionApi.getAll()[0]?.data?.music;
    if (!musicData || !musicData.releases) {
      console.warn("Music data not found or invalid for genres collection");
      return [];
    }
    const releases = musicData.releases;
    const genres = [
      ...new Set(releases.flatMap((release) => release.genres || [])),
    ];
    return genres.map((genre) => ({
      genre,
      releases: releases.filter((r) => r.genres && r.genres.includes(genre)),
    }));
  });

  eleventyConfig.addCollection("formats", function (collectionApi) {
    const musicData = collectionApi.getAll()[0]?.data?.music;
    if (!musicData || !musicData.releases) {
      console.warn("Music data not found or invalid for formats collection");
      return [];
    }
    const releases = musicData.releases;
    const formats = [
      ...new Set(
        releases.flatMap(
          (release) => release.formats?.map((f) => f.name) || [],
        ),
      ),
    ];
    return formats.map((format) => ({
      format,
      releases: releases.filter(
        (r) =>
          r.formats &&
          r.formats.some((f) => f.name.toLowerCase() === format.toLowerCase()),
      ),
    }));
  });

  eleventyConfig.addCollection("releasesWithRelated", function (collectionApi) {
    const musicData = collectionApi.getAll()[0]?.data?.music;
    if (!musicData || !musicData.releases) {
      console.warn("Music data not found or invalid");
      return [];
    }

    return musicData.releases.map((release) => ({
      ...release,
      relatedReleases: musicData.releases.filter(
        (r) => r.artist === release.artist && r.title !== release.title,
      ),
    }));
  });

  const parseDate = (dateStr) => {
    if (!dateStr) return null;

    const parts = dateStr.split("-");
    // If only year is provided
    if (parts.length === 1) {
      return new Date(parts[0], 0, 1);
    }
    // If year and month are provided
    if (parts.length === 2) {
      return new Date(parts[0], parts[1] - 1, 1);
    }
    // If complete date is provided
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  eleventyConfig.addCollection("releaseYears", function (collectionApi) {
    const musicData = collectionApi.getAll()[0]?.data?.music;
    if (!musicData || !musicData.releases) {
      console.warn("Music data not found or invalid");
      return [];
    }

    const years = [
      ...new Set(
        musicData.releases
          .map((release) => {
            // Prefer first_released if available, otherwise use released
            const date =
              parseDate(release.first_released) || parseDate(release.released);
            return date ? date.getFullYear() : null;
          })
          .filter((year) => year !== null),
      ),
    ].sort((a, b) => a - b);

    return years.map((year) => ({
      year,
      releases: musicData.releases.filter((r) => {
        // Prefer first_released if available, otherwise use released
        const date = parseDate(r.first_released) || parseDate(r.released);
        return date && date.getFullYear() === year;
      }),
    }));
  });

  eleventyConfig.addPlugin(pluginFilters);

  // Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // File extensions to process in _site folder
    extensions: "html",

    // Output formats for each image.
    formats: ["avif", "webp", "auto"],

    widths: [160, 320, 480, 640, 960, 1280],

    defaultAttributes: {
      // e.g. <img loading decoding> assigned on the HTML tag will override these values.
      loading: "lazy",
      decoding: "async",
      sizes: "100vw",
    },
    urlPath: "/img/cache/",
    outputDir: "./dist/img/cache/",
  });

  eleventyConfig.addLayoutAlias("base", "base.njk");

  return {
    markdownTemplateEngine: "njk",

    dir: {
      output: "dist",
      input: "src",
      includes: "_includes",
      data: "_data",
      layouts: "_layouts",
    },
  };
}
