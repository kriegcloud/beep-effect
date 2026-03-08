
const EvalExt = "http://shex.io/extensions/Eval/"

function register (validator, api) {
  if (api === undefined || !('ShExTerm' in api))
    throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)')

  validator.semActHandler.results[EvalExt] = []
  return validator.semActHandler.register(
    EvalExt,
    {
      /**
       * Callback for extension invocation.
       *
       * @param {string} code - text of the semantic action.
       * @param {object} ctx - matched triple or results subset.
       * @param {object} extensionStorage - place where the extension writes into the result structure.
       * @return {bool | [{type: SemActViolation, msg: "..."}]} false if the extension failed or did not accept the ctx object.
       */
      dispatch: function (code, ctx, extensionStorage) {
        // return eval(code) // to enable implicit return
        // '"use strict";' + code to disable writing implicit globals
        return Function('api', 'extensionStorage', code).call(ctx, api, extensionStorage)
      }
    }
  )
}

function done (validator) {
  if (validator.semActHandler.results[EvalExt].length === 0)
    delete validator.semActHandler.results[EvalExt]
}

module.exports = {
  name: "Eval",
  description: `Simple javascript eval.
Each SemAct should return either:
  bool - false if the extension failed or did not accept the ctx object.
  [{type: "SemActViolation", msg: "..."}] - (ideally empty) list of structured errors

url: ${EvalExt}`,
  name: "Eval",
  register: register,
  done: done,
  url: EvalExt
}

// http://localhost/tmp/checkouts/shexSpec/shex.js/packages/shex-webapp/doc/shex-simple.html?schema=PREFIX%20schema%3A%20%3Chttp%3A%2F%2Fschema.org%2F%3E%0APREFIX%20js%3A%20%3Chttp%3A%2F%2Fshex.io%2Fextensions%2FEval%2F%3E%0ABASE%20%3Chttp%3A%2F%2Fschema.org%2Fshex%3E%0A%0A%3C%23Recipe%3E%20EXTRA%20a%20%7B%0A%20%20%20%20a%20%5Bschema%3ARecipe%5D%3B%0A%20%20%20%20%20%20%20%20schema%3AdatePublished%20.%20%20%25js%3A%7B%0A%20%20%20%20%20%20%20%20%20%20debugger%3B%0A%20%20%20%20%20%20%20%20%20%20const%20val%20%3D%20api.ShExTerm.getLiteralValue(ctx.object)%3B%0A%20%20%20%20%20%20%20%20%20%20isNaN(Date.parse(val))%0A%20%20%20%20%20%20%20%20%20%20%20%20%3F%20%5B%7Btype%3A%20%22SemActViolation%22%2C%20message%3A%20%60%22%24%7Bval%7D%20is%20not%20a%20date%60%7D%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20%3A%20%5B%5D%0A%20%20%20%20%20%20%20%20%25%7D%20%3B%0A%7D%0A&data=PREFIX%20schema%3A%20%3Chttp%3A%2F%2Fschema.org%2F%3E%0A%0A%3Chttp%3A%2F%2Fexample.org%2Frecipe%3E%0A%20%20a%20schema%3ARecipe%20%3B%0A%20%20schema%3AdatePublished%20%222020-02-02xx%22.%0A&manifestURL=http%3A%2F%2Flocalhost%2Ftmp%2Fcheckouts%2FshexSpec%2Fshex.js%2Fpackages%2Fshex-webapp%2Fexamples%2Finheritance%2Fmanifest.json&extensionURL=https%3A%2F%2Flocalhost%2Ftmp%2Fcheckouts%2FshexSpec%2Fshex.js%2Fpackages%2Fextension-eval%2Fshex-extension-eval.js&shape-map=%3Chttp%3A%2F%2Fexample.org%2Frecipe%3E%40%3C%23Recipe%3E&interface=human&success=proof&regexpEngine=eval-threaded-nerr
