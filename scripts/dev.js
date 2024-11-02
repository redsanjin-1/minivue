import minimist from 'minimist'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import esbuild from 'esbuild'

const args = minimist(process.argv.slice(2))
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)
const target = args._[0] || 'reactivity' // 打包哪个项目
const format = args.f || 'iife' // 打包格式

console.log(target, format)

const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)
const pkg = require(`../packages/${target}/package.json`)

esbuild
  .context({
    entryPoints: [entry],
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`),
    bundle: true,
    platform: 'browser',
    sourcemap: true,
    format, // cjs esm iife
    globalName: pkg.buildOption?.name,
  })
  .then((ctx) => {
    console.log('start dev')

    return ctx.watch()
  })
