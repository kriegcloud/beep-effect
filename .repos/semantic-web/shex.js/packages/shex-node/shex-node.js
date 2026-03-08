/** @shexjs/node - extend @shexjs/loader with file: access
 * GET: add access to:
 *   `file:` read from flle system relative to cwd
 *   `-` read from stdin
 * parseJSONLD: add access to:
 *   `file:` read from flle system relative to cwd
 * loadExtensions: added function to dynamically load ShEx Validator extensions
 */

const ShExNodeCjsModule = function (config = {}) {

  class ResourceError extends Error {
    constructor (resource, error) {
      super(ResourceError.tweakMessage(resource, error));
      this.origError = error; // for stack
    }
    static tweakMessage (resource, error) {
      return error.message + '\n  resource: ' + resource;
    }
  }

  const Fs = require('fs')
  const Glob = require("glob").glob
  const ShExLoader = require("@shexjs/loader")
  const FileColonUrlRe = "^file://[^/]*(/.*)$";
  const myLoaderOpts = {
    loadExtensions: LoadExtensions,
  }


  const NodeDocLoader = config?.jsonld?.documentLoaders?.node()
  if (NodeDocLoader) {
    myLoaderOpts.jsonLdOptions = { documentLoader }

    async function documentLoader (url, options) {
      const m = url.match(FileColonUrlRe);
      if (m) {
        return Fs.promises.access(m[1], Fs.constants.F_OK)
          .then(async () => {
            return {
              contextUrl: null,
              document: await Fs.promises.readFile(m[1], "utf8"),
              documentUrl: url
            }
          })
          .catch(error => Error(`Unable to read ${m[1]}`))
        // console.log("HERE", m)
      } else {
        const ret = await NodeDocLoader(url)
        return ret
      }
    }
  }
  const newLoader = ShExLoader(Object.assign(myLoaderOpts, config))

  const oldGet = newLoader.GET
  newLoader.GET = async function (url, mediaType) {
    const FS = require("fs")
    const Path = require("path")

    return url === "-"
      ? new Promise(function (fulfill, reject) {
        const inputChunks = [];

        //process.stdin.resume(); is old mode needed?
        process.stdin.setEncoding("utf8");

        process.stdin.on("data", function (chunk) {
          inputChunks.push(chunk);
        });

        process.stdin.on("end", function () {
          fulfill({text: inputChunks.join(""), url: url});
        });

        process.stdin.on("error", function (e) {
          reject(e);
        });
      })
      : url.match("^(blob:)?[a-z]+://.") && !url.match(FileColonUrlRe)
      ? oldGet(url, mediaType)
      : new Promise(function (fulfill, reject) {
        let filename = url;
        const fileURLmatch = filename.match(FileColonUrlRe);
        if (fileURLmatch)
          filename = fileURLmatch[1];
        if ("cwd" in config)
          filename = Path.join(config.cwd, filename)
        FS.readFile(filename, "utf8", function (error, text) {
          if (error) {
            reject(new ResourceError(url, error));
          } else {
            fulfill({text: text, url: fileURLmatch ? url : "file://" + Path.resolve(process.cwd(), url)});
          }
        })
      })
  }

  return newLoader

  function LoadExtensions (globs) {
    return globs.reduce(
      (list, glob) =>
        list.concat(Glob.sync(glob))
      , []).
      reduce(function (ret, path) {
        try {
	  const t = require(path)
	  ret[t.url] = t
	  return ret
        } catch (e) {
	  console.warn("ShEx extension \"" + moduleDir + "\" not loadable: " + e)
	  return ret
        }
      }, {})
  }
}

// return { load: LoadPromise, loadExtensions: LoadExtensions, GET: GET, loadShExImports_NotUsed: loadShExImports_NotUsed };

if (typeof require !== "undefined" && typeof exports !== "undefined")
  module.exports = ShExNodeCjsModule;
