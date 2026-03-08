// Mock fetch to our local files
global.fetch = jest.fn().mockImplementation((url) => {
  let data;
  const filePath = url.replace('http://example.org/', __dirname + '/test/http/');
  let headers = { 'Content-Type': 'application/ld+json' };
  if (filePath.indexOf('nocontenttype') >= 0) {
    headers = {};
  }
  if (filePath.indexOf('charset') >= 0) {
    headers = { 'Content-Type': 'application/ld+json; charset=utf-8' };
  }
  try {
    data = JSON.parse(require('fs').readFileSync(filePath, 'utf8'));
  } catch (e) {
    // Add two alternate links to a specific HTML files for error validation
    if (filePath.endsWith('two-alts.html')) {
      headers['Content-Type'] = 'text/html';
      headers['Link'] = `<not-exists-1.jsonld>; rel="alternate"; type="application/ld+json", <not-exists-2.jsonld>; rel="alternate"; type="application/ld+json"`;
      return Promise.resolve({
        json: null,
        ok: true,
        headers: new Headers(headers),
        statusText: 'REDIRECT (setupJest.js)',
      });
    }

    // Add two alternate links to a specific HTML files for error validation
    if (filePath.endsWith('unknown-rel.html')) {
      headers['Content-Type'] = 'text/html';
      headers['Link'] = `<not-exists-1.jsonld>; rel="unknown"; type="application/ld+json"`;
      return Promise.resolve({
        json: null,
        ok: true,
        headers: new Headers(headers),
        statusText: 'REDIRECT (setupJest.js)',
      });
    }

    // Add alternate links to all HTML files to their corresponding JSON-LD counterpart
    if (filePath.endsWith('.html')) {
      headers['Content-Type'] = 'text/html';
      const lastSlashPos = filePath.lastIndexOf('/');
      headers['Link'] = `<${filePath.substr(lastSlashPos + 1, filePath.lastIndexOf('.') - lastSlashPos - 1)}.jsonld>; rel="alternate"; type="application/ld+json"`;
      return Promise.resolve({
        json: null,
        ok: true,
        headers: new Headers(headers),
        statusText: 'REDIRECT (setupJest.js)',
      });
    }

    // Reply with turtle
    if (filePath.endsWith('.ttl')) {
      headers['Content-Type'] = 'text/turtle';
      return Promise.resolve({
        json: null,
        ok: true,
        headers: new Headers(headers),
        statusText: 'TTL (setupJest.js)',
      });
    }

    // Fail with status code
    if (filePath.indexOf('statusCode') >= 0) {
      return Promise.resolve({
        json: null,
        ok: false,
        headers: new Headers(headers),
        status: 500,
      });
    }

    return Promise.resolve({
      json: null,
      ok: false,
      headers: new Headers(headers),
      statusText: 'FAIL (setupJest.js)',
    });
  }
  return Promise.resolve({
    json: () => data,
    ok: true,
    headers: new Headers(headers),
    statusText: 'All is fine (setupJest.js)',
  });
});
