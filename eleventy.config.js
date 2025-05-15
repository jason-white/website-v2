export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/js");
  return {
    dir: {
      input: "src",
    },
  };
}
