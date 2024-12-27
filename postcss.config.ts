import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import tailwind from 'tailwindcss';
import tailwindConfig from './tailwind.config';

export default postcss([tailwind(tailwindConfig), autoprefixer]);