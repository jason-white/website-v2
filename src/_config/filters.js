import {DateTime} from 'luxon';

export default function (eleventyConfig) {
  // Custom slugify to handle accented letters from artist
  // and album names
  eleventyConfig.addFilter('accentSlug', function (str) {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-äöüáéíóúàèìòùâêîôûñç]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  });

  eleventyConfig.addFilter('getFormatDescription', function (formats, targetFormat) {
    const format = formats.find(f => f.name === targetFormat);
    return format
      ? Array.isArray(format.descriptions)
        ? format.descriptions.join('-')
        : format.descriptions
      : '';
  });

  /* Filters for the Music Collection are all originally
   * by Damian Walsh. 🐰
   * https://github.com/damianwalsh/damianwalsh.github.io
   * https://damianwalsh.co.uk/
   */
  eleventyConfig.addFilter('findVideoByTrack', function (videos, trackTitle) {
    return videos?.find(video => video.title.includes(trackTitle));
  });

  eleventyConfig.addFilter('extractYear', dateString => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    return parts[0];
  });

  eleventyConfig.addFilter('groupItems', function (items, keyAttribute) {
    if (!Array.isArray(items)) return [];

    const groups = {};

    items.forEach(item => {
      if (!item || typeof item !== 'object' || !item[keyAttribute]) return;

      const firstChar = String(item[keyAttribute]).charAt(0).toUpperCase();
      const groupChar = /[A-Z]/.test(firstChar) ? firstChar : '#';

      if (!groups[groupChar]) {
        groups[groupChar] = [];
      }
      groups[groupChar].push(item);
    });

    return Object.entries(groups).sort(([a], [b]) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });
  });

  eleventyConfig.addFilter('filterTagList', function filterTagList(tags) {
    return (tags || []).filter(tag => ['posts'].indexOf(tag) === -1);
  });

  eleventyConfig.addFilter('slice', function (array, start, end) {
    return array.slice(start, end);
  });

  eleventyConfig.addFilter('readableDate', (dateInput, format, zone) => {
    const defaultFormat = 'dd LLL yyyy';
    if (!dateInput) return '';

    try {
      // If dateInput is already a Date object (like blog post dates)
      if (dateInput instanceof Date) {
        return DateTime.fromJSDate(dateInput, {zone: zone || 'utc'}).toFormat(format || defaultFormat);
      }

      // Otherwise proceed with string parsing
      const dateStr = dateInput.toString();

      // Handle plain year format (YYYY)
      if (/^\d{4}$/.test(dateStr)) {
        return dateStr;
      }

      // Handle YYYY-MM format
      if (/^\d{4}-\d{2}$/.test(dateStr)) {
        return DateTime.fromFormat(dateStr, 'yyyy-MM', {
          zone: zone || 'utc'
        }).toFormat('LLL yyyy');
      }

      // Handle YYYY-00-00 format (year only)
      if (/^\d{4}-00-00$/.test(dateStr)) {
        return dateStr.slice(0, 4);
      }

      // Handle YYYY-MM-00 format (year and month)
      if (/^\d{4}-\d{2}-00$/.test(dateStr)) {
        return DateTime.fromFormat(dateStr.slice(0, 7), 'yyyy-MM', {
          zone: zone || 'utc'
        }).toFormat('LLL yyyy');
      }

      // Handle complete dates (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return DateTime.fromFormat(dateStr, 'yyyy-MM-dd', {
          zone: zone || 'utc'
        }).toFormat(format || defaultFormat);
      }

      // Try parsing as "Month DD, YYYY"
      const fullDate = DateTime.fromFormat(dateStr, 'LLLL d, yyyy', {
        zone: zone || 'utc'
      });
      if (fullDate.isValid) {
        return fullDate.toFormat(format || defaultFormat);
      }

      // Try parsing as "Month YYYY"
      const monthYearDate = DateTime.fromFormat(dateStr, 'LLLL yyyy', {
        zone: zone || 'utc'
      });
      if (monthYearDate.isValid) {
        return monthYearDate.toFormat(format || 'LLL yyyy');
      }

      return dateStr; // Return original string if no parsing succeeds
    } catch (e) {
      return dateStr; // Return original string on error
    }
  });

  eleventyConfig.addFilter(
    'otherItemsByCreator',
    function (items, currentItem, creatorKey, titleKey, releaseIdKey) {
      return items
        .filter(item => {
          return (
            item[creatorKey] === currentItem[creatorKey] && item[releaseIdKey] !== currentItem[releaseIdKey]
          );
        })
        .sort((a, b) => {
          const titleA = String(a[titleKey] || '');
          const titleB = String(b[titleKey] || '');
          return titleA.localeCompare(titleB);
        });
    }
  );

  eleventyConfig.addFilter('extractYear', dateString => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    return parts[0];
  });

  eleventyConfig.addFilter('sortReleasesByArtist', function (releases) {
    return releases.sort((a, b) => {
      return a.artist.localeCompare(b.artist);
    });
  });

  eleventyConfig.addFilter('setAttribute', function (obj, key, value) {
    obj[key] = value;
    return obj;
  });
  /* End Music Collection filters */
}
