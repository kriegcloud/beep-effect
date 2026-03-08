import { finished } from 'readable-stream'

function waitFor (stream) {
  return new Promise((resolve, reject) => {
    finished(stream, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export default waitFor
