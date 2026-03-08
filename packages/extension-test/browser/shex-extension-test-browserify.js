(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.testExtension = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var TestExt = "http://shex.io/extensions/Test/";
function register (validator) {
  var pattern = /^ *(fail|print) *\( *(?:(\"(?:[^\\"]|\\\\|\\")*\")|([spo])) *\) *$/;

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
        var m = code.match(pattern);
        if (!m) {
          throw Error("Invocation error: " + TestExt + " code \"" + code + "\" didn't match " + pattern);
        }
        var arg = m[2] ? m[2] :
          m[3] === "s" ? ctx.subject :
          m[3] === "p" ? ctx.predicate :
          m[3] === "o" ? ctx.object :
          "???";
        validator.semActHandler.results[TestExt].push(arg);
        return m[1] !== "fail"; // "fail" => false, "print" => true
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

},{}]},{},[1])(1)
});
