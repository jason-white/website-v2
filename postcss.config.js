import postcssImportExtGlob from 'postcss-import-ext-glob';
import postcssImport from 'postcss-import';
import tailwindcss from 'tailwindcss';
import cssnano from 'cssnano';

export default {
  plugins: [
    postcssImportExtGlob,
    postcssImport,
    tailwindcss,
    ...(process.env.NODE_ENV === 'production' ? [cssnano] : [])
  ]
};
