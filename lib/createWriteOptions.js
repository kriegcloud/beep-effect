import mediaTypes from '../mediaTypes.js'

function createWriteOptions (url, body) {
  const headers = new Headers()

  const ext = url.toString().match(/\.([a-z]+)$/)
  const contentType = mediaTypes.get(ext && ext[1])

  if (contentType) {
    headers.set('content-type', contentType)
  }

  return {
    method: 'PUT',
    headers,
    body
  }
}

export default createWriteOptions
