const altForEachImplReplacement = require('./common-replacements').altForEachImplReplacement
    , altForEachUseReplacement  = require('./common-replacements').altForEachUseReplacement
    , objectKeysDefine = require('./common-replacements').objectKeysDefine
    , objectKeysReplacement = require('./common-replacements').objectKeysReplacement

module.exports.all = [
    [
        /require\(['"]string_decoder['"]\)/g
      , 'require(\'../../\')'
    ]

  , [
      /Buffer\.((?:alloc)|(?:allocUnsafe)|(?:from))/g,
      'bufferShim.$1'
    ]

  , [
      /^('use strict';)$/m,
      '$1\nconst bufferShim = require(\'safe-buffer\').Buffer;'
    ]

]


module.exports['test-string-decoder.js'] = [
    // test removed because it is V8-version dependant.
    [
        /test\('utf-8', bufferShim\.from\('EDA0B5EDB08D'.*\n.*\n/
      , ''
    ],
  , [
        /test\('utf-8', bufferShim\.from\('F0B841', 'hex'.*\n/
      , ''
    ]
  , [
        /test\('utf-8', bufferShim\.from\('CCE2B8B8', 'hex'.*\n/
      , ''
    ]
  , [
        /test\('utf-8', bufferShim\.from\('E2B8CCB8', 'hex'.*\n/
      , ''
    ]
  , [
        /assert\.strictEqual\(decoder\.end(), '\ufffd'\);\n/
      , ''
    ]
]

module.exports['common.js'] = [
    objectKeysDefine
  , objectKeysReplacement
  , altForEachImplReplacement
  , altForEachUseReplacement

  , [
        /(exports.mustCall[\s\S]*)/m
      ,   '$1\n'
        + 'if (!util._errnoException) {\n'
        + '  var uv;\n'
        + '  util._errnoException = function(err, syscall) {\n'
        + '    if (util.isUndefined(uv)) try { uv = process.binding(\'uv\'); } catch (e) {}\n'
        + '    var errname = uv ? uv.errname(err) : \'\';\n'
        + '    var e = new Error(syscall + \' \' + errname);\n'
        + '    e.code = errname;\n'
        + '    e.errno = errname;\n'
        + '    e.syscall = syscall;\n'
        + '    return e;\n'
        + '  };\n'
        + '}\n'
    ]

    // for streams2 on node 0.11
    // and dtrace in 0.10
    // and coverage in all
  , [
        /^(  for \(var x in global\) \{|function leakedGlobals\(\) \{)$/m
      ,   '  /*<replacement>*/\n'
        + '  if (typeof constructor == \'function\')\n'
        + '    knownGlobals.push(constructor);\n'
        + '  if (typeof DTRACE_NET_SOCKET_READ == \'function\')\n'
        + '    knownGlobals.push(DTRACE_NET_SOCKET_READ);\n'
        + '  if (typeof DTRACE_NET_SOCKET_WRITE == \'function\')\n'
        + '    knownGlobals.push(DTRACE_NET_SOCKET_WRITE);\n'
        + '  if (global.__coverage__)\n'
        + '    knownGlobals.push(__coverage__);\n'
        + '\'core,__core-js_shared__,Promise,Map,Set,WeakMap,WeakSet,Reflect,System,asap,Observable,regeneratorRuntime,_babelPolyfill\'.split(\',\').filter(function (item) {  return typeof global[item] !== undefined}).forEach(function (item) {knownGlobals.push(global[item])})'
        + '  /*</replacement>*/\n\n$1'
    ]

    // for node 0.8
  , [
        /^/
      ,   '/*<replacement>*/'
        + '\nif (!global.setImmediate) {\n'
        + '  global.setImmediate = function setImmediate(fn) {\n'

        + '    return setTimeout(fn.bind.apply(fn, arguments), 4);\n'
        + '  };\n'
        + '}\n'
        + 'if (!global.clearImmediate) {\n'
        + '  global.clearImmediate = function clearImmediate(i) {\n'
        + '  return clearTimeout(i);\n'
        + '  };\n'
        + '}\n'
        + '/*</replacement>*/\n'
    ]
  , [
        /^if \(global\.ArrayBuffer\) \{([^\}]+)\}$/m
      ,   '/*<replacement>*/if (!process.browser) {'
        + '\nif \(global\.ArrayBuffer\) {$1}\n'
        + '}/*</replacement>*/\n'
    ]
    , [
          /^Object\.defineProperty\(([\w\W]+?)\}\)\;/mg
        ,   '/*<replacement>*/if (!process.browser) {'
          + '\nObject\.defineProperty($1});\n'
          + '}/*</replacement>*/\n'
      ]
    , [
      /if \(!process\.send\)/
      , 'if (!process.send && !process.browser)'
    ]
    , [
      /^/,
      `/*<replacement>*/
      require('babel-polyfill');
      var util = require('util');
      for (var i in util) exports[i] = util[i];
      /*</replacement>*/`
    ],
    [
      /var regexp = `\^\(\\\\w\+\)\\\\s\+\\\\s\$\{port\}\/\$\{protocol\}\\\\s`;/,
      `var regexp = '^(\\w+)\\s+\\s' + port + '/' + protocol + '\\s';`
    ],
    [
    /^var util = require\('util'\);/m
  ,   '\n/*<replacement>*/\nvar util = require(\'core-util-is\');\n'
    + 'util.inherits = require(\'inherits\');\n/*</replacement>*/\n'
  ],
  [
  /^const util = require\('util'\);/m
,   '\n/*<replacement>*/\nvar util = require(\'core-util-is\');\n'
  + 'util.inherits = require(\'inherits\');\n/*</replacement>*/\n'
]
, [
  /process\.binding\('timer_wrap'\)\.Timer;/,
  '{now: function (){}}'
],
[
  /(exports\.enoughTestCpu[^;]+;)/,
  '/*$1*/'
],
[
  /exports\.buildType/,
  '//exports.buildType'
],
[
  /require\('async_hooks'\)/,
  '/*require(\'async_hooks\')'
],
[
  /\}\).enable\(\);/,
  '}).enable();*/'
],
[
  /(?:var|const) async_wrap = process\.binding\('async_wrap'\);\n.*(?:var|const) (?:{ )?kCheck(?: })? = async_wrap\.constants(?:\.kCheck)?;/gm,
  '// const async_wrap = process.binding(\'async_wrap\');\n' +
  '  // const kCheck = async_wrap.constants.kCheck;'
],
[
  /async_wrap\.async_hook_fields\[kCheck\] \+= 1;/,
  '// async_wrap.async_hook_fields[kCheck] += 1;'
]
]
