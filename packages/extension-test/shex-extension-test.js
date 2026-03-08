const TestExt = "http://shex.io/extensions/Test/";
function register (validator, api) {
  if (api === undefined || !('ShExTerm' in api))
    throw Error('SemAct extensions must be called with register(validator, {ShExTerm, ...)')

  const term = `(?:("(?:[^\\\\"]|\\\\\\\\|\\\\")*"|'(?:[^\\\\']|\\\\\\\\|\\\\')*')|([spo]))`;
  const pattern = new RegExp(`^ *(fail|print) *\\((( *${term} *,)* *${term}) *\\) *$`);

  validator.semActHandler.results[TestExt] = [];
  validator.semActHandler.register(
    TestExt,
    {
      /**
       * Callback for extension invocation.
       *
       * @param {string} code - text of the semantic action.
       * @param {object} ctx - matched triple or results subset.
       * @param {object} extensionStorage - place where the extension writes into the result structure.
       * @return {bool} false if the extension failed or did not accept the ctx object.
       */
      dispatch: function (code, ctx, extensionStorage) {
        const langMatch = code.match(pattern);
        if (!langMatch) {
          throw Error("Invocation error: " + TestExt + " code \"" + code + "\" didn't match " + pattern);
        }
        const terms = langMatch[2];
        const args = [];
        const termMatcher = new RegExp(` *${term} *,?`, 'g'); // commas already enforced above
        let termMatch = null;
        while ((termMatch = termMatcher.exec(terms)) !== null) {
          const arg = termMatch[1]
                ? parseStr(termMatch[1])
                : parsePos(termMatch[2])
          args.push(arg);
        }
        const line = args.join('');
        validator.semActHandler.results[TestExt].push(line);
        return langMatch[1] === "fail" ? [{type: "SemActFailure", errors: [`fail(${line})`]}] : [];

        function parseStr (wrapped) {
          return wrapped.substring(1, wrapped.length -1);
        }
        function parsePos (pos) {
          const t = ctx.triples[0];
          return pos === "s" ? t.subject.value :
            pos === "p" ? t.predicate.value :
            pos === "o" ? t.object.value :
            "???";
        }
      }
    }
  );
  return validator.semActHandler.results[TestExt];
}

function done (validator) {
  if (validator.semActHandler.results[TestExt].length === 0)
    delete validator.semActHandler.results[TestExt];
}

module.exports = {
  name: "Test",
  description: `Simple test extension used in the shexTest test suite
url: ${TestExt}`,
  register: register,
  done: done,
  url: TestExt
};
