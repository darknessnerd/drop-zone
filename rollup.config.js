import commonjs from '@rollup/plugin-commonjs'; // Convert CommonJS modules to ES6
import scss from 'rollup-plugin-scss';
import vuePlugin from 'rollup-plugin-vue';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace'; // Replace strings in files while bundling them.
import alias from '@rollup/plugin-alias';
import path from 'path';
import pkg from './package.json';

const projectRoot = path.resolve(__dirname, '.');

const banner = `/**
 * ${pkg.name} ${pkg.version}
 * (c) ${new Date().getFullYear()}
 * @license MIT
 */`;

export default {
  // this is the file containing all our exported components/functions
  input: 'src/index.js',
  // this is an array of outputed formats
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      banner,
      exports: 'default',
    },
    {
      file: pkg.unpkg,
      format: 'umd',
      name: 'drop-zone',
      sourcemap: true,
      exports: 'default',
      globals: {
        vue: 'Vue',
      },
      banner,
    },
  ],
  // this is an array of the plugins that we are including
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
    }),
    alias({
      entries: [
        {
          find: '@',
          replacement: `${path.resolve(projectRoot, 'src')}`,
        },
      ],
      customResolver: nodeResolve({
        extensions: ['.js', '.jsx', '.vue'],
      }),
    }),
    scss(),
    vuePlugin({
      target: 'browser',
      template: {
        optimizeSSR: true,
      },
    }),
    babel({
      exclude: ['node_modules/**', 'core-js/*'],
      extensions: ['.js', '.jsx', '.vue'],
      babelHelpers: 'runtime',
      presets: [
        '@babel/preset-env',
      ],
    }),
    commonjs(), // Convert CommonJS modules to ES6, so they can be included in a Rollup bundle
    nodeResolve(),
    terser({
      output: {
        ecma: 5,
      },
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    }),
  ],
  // ask rollup to not bundle Vue in the library
  external: [
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.dependencies || {}),
  ],
};
