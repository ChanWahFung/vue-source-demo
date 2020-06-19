import babel from 'rollup-plugin-babel';
import {uglify} from 'rollup-plugin-uglify';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

export default {
  input: 'src/index.js',
  output: {
    format: 'umd', // amd cmd
    file: 'dist/vue.js',
    name: 'Vue',  // 默认挂载到window的变量
    sourcemap: true
  },
  plugins: [
    babel({
      exclude: "node_modules/**"
    }),
    uglify(),
    livereload(),
    serve({
      port: 8000,
      openPage: '/public/index.html',
      contentBase: ''
    })
  ]
}