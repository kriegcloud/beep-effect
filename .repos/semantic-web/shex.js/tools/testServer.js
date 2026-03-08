/**
 *
 const Server = require('../../../tools/testServer').startServer('http://localhost:9999/shex.js/', Path.join(__dirname + '../../..'))
 fetch(Server.urlFor('getSomethingOrDoneWillCrash')).then(() => {Server.done()})
 */
const Fs = require('fs')
const Path = require('path')
const Nock = require('nock');

// Uncomment logs to watch HTTP traffic.
function log200 (url, filePath, length) {
  // console.log(200, url, filePath, length)
}
function log404 (url) {
  // console.warn(404, url)
}
function parseUrl (url) {
  const asUrl = new URL(url);
  const path = asUrl.pathname;
  const server = new URL("/", asUrl).href.replace(/\/$/, '');
  return {server, path};
}

function startServer (paths, files = []) {
  const pathScopes = paths.map(f => {
    const {server, path: webroot} = parseUrl(f.url);
    return {
      scope: Nock(server)
        .get(RegExp(webroot))
        .reply(function(reqP, requestBody) {
          return readFromFilesystem(reqP, f.fromDir, webroot);
        })
        .persist(),
      urlFor: page => server + webroot + page
    }
  })

  const fileScopes = files.map(f => {
    const {server, path} = parseUrl(f.url);
    return {
      scope: Nock(server)
        .get(path)
        .replyWithFile(200, f.file)
        .persist()
    }
  } )

  return [pathScopes, fileScopes]

  /*
    or could use mock-http-server:
  const srvr = new (require("mock-http-server"))({ host: HOST, port: PORT });
  srvr.start(() => {}); // srvr.stop(done);
  srvr.on({ method: 'GET', path: '*', reply: {
    status:  200,
    // headers: { "content-type": "application/json" },
    body: (req) => readFromFilesystem(req.originalUrl),
  } } );

    or http:
  const http = require('http')
  const requestHandler = (request, response) => response.end(readFromFilesystem(request.url))
  const srvr = http.createsrvr(requestHandler)
  srvr.listen(PORT, (err) => { if (err) throw Error(`server.listen got ${err}`) })
  */

  // blindly tries file extensions. should look at request headers.
  function readFromFilesystem (reqPath, fromDir, webroot) {
    let filePath = Path.join(fromDir, getRelPath(reqPath, webroot));
    let last
    const extensions = ['', '.shex', '.ttl']
    const ret = extensions.find(
      ext => Fs.existsSync(last = filePath + ext)
    )
    if (ret !== undefined) {
      const ret = Fs.readFileSync(last, 'utf8')
      log200(reqPath, last, ret.length)
      return [200, ret, {}]
    } else {
      log404(reqPath)
      return [404, `${last} not found`, {}]
    }
  }

  function getRelPath (url, webroot) {
    return url.substr(webroot.length).replace(/\?.*$/, '')
  }
}

module.exports = {startServer}
