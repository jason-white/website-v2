export default {
  layout: "link.njk",
  name: "link",
  permalink: function ({title}) {
    return `/links/${this.slugify(title)}/`;
  }
};
