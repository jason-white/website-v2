export default {
  layout: "section.njk",
  name: "link",
  permalink: function ({title}) {
    return `/links/${this.slugify(title)}/`;
  }
};
