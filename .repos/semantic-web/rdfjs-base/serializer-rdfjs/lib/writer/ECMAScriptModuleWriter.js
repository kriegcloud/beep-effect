import CommonjsWriter from './CommonJsWriter.js'

class ECMAScriptModuleWriter extends CommonjsWriter {
  leadingLines (stats) {
    return ['export default ({ factory }) => {']
  }
}

export default ECMAScriptModuleWriter
