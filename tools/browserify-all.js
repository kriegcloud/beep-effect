#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')
const browserify = require("browserify")
const uglify = require("terser")

const packageGlobs = JSON.parse(
  fs.readFileSync(__dirname + '/lerna.json', 'utf-8')
).packages.filter(
  glob => glob !== "."
)
const directories = packageGlobs.reduce(
  (list, path) => list.concat(glob.glob.sync(path)), []
).filter(dir => dir.indexOf('cli') === -1)

// https://github.com/browserify/browserify-handbook#using-the-api-directly
const res = directories.map(dir => {
  const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json')))
  const baseName = pkg.main.replace(/\.js$/, '')
  const mainPath = path.join(dir, baseName)
  const browser = path.join(dir, 'browser')
  if (!fs.existsSync(browser)){
    fs.mkdirSync(browser);
  }
  const outPath = path.join(browser, baseName + '-browserify.js')
  const outMinPath = path.join(browser, baseName + '-browserify.min.js')
  console.log(mainPath, "->", outPath)

  let outStream = fs.createWriteStream(outPath)
  let b = browserify(mainPath, {standalone: path.basename(baseName)}).bundle()
  b.on('error', console.error)
  // b.pipe(outStream)
  const chunks = [];
  b.on("data", function (chunk) {
    chunks.push(chunk.toString());
    outStream.write(chunk);
  });
  b.on("end", function () {
    outStream.end();
    let min = uglify.minify(chunks.join(''), {
      "keep_classnames": true
    });
    let outMinStream = fs.createWriteStream(outMinPath);
    outMinStream.write(min.code);
    outMinStream.end();
  });
})
