export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/js");
  eleventyConfig.addPassthroughCopy("./src/functions");

  return {
    dir: {
      input: "src",
    },
  };
}
