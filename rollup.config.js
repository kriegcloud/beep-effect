// rollup.config.mjs
import typescript from '@rollup/plugin-typescript'

export default [{
  input: 'src/index.ts',
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'jtpp'
  },
  plugins: [typescript({
    exclude: [
      './**/*.spec.ts'
    ]
  })]
}]
