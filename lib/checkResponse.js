async function checkResponse (url, options, res) {
  const action = options.method === 'PUT' ? 'write' : 'read'
  const direction = action === 'read' ? 'from' : 'to'

  if (!res.ok) {
    throw new Error(`can't ${action} data ${direction} <${url.toString()}>[${res.status}]: ${await res.text()}`)
  }
}

export default checkResponse
