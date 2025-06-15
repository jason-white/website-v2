export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/js");
  eleventyConfig.addPassthroughCopy("./src/functions");

  eleventyConfig.addLayoutAlias("base", "base.njk");

  return {
    markdownTemplateEngine: "njk",

    dir: {
      output: "dist",
      input: "src",
      includes: "_includes",
      layouts: "_layouts",
    },
  };
}
