/*
  jison Equivalent of accompanying bnf, developed in
  http://www.w3.org/2005/01/yacker/uploads/ShEx2

  Process:
    Started with yacker perl output.
    Made """{PNAME_LN} return 'PNAME_LN';""" lexer actions for refereneced terminals.
    Folded X_Opt back in to calling productions to eliminate conflicts.
      (X? didn't seem to accept null input during testing.)
    Stole as much as possible from sparql.jison
      https://github.com/RubenVerborgh/SPARQL.js
    including functions in the header. Some can be directly mapped to javascript
    functions:
      appendTo(A, B) === A.concat([B])
      unionAll(A, B) === A.concat(B)

  TODO:
    See if this will work as BNF ('*'s and '+'s...)
*/

%{
  /*
    ShEx parser in the Jison parser generator format.
  */

  const UNBOUNDED = -1;

  const ShExUtil = require("@shexjs/util");

  // Common namespaces and entities
  const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      RDF_TYPE  = RDF + 'type',
      RDF_FIRST = RDF + 'first',
      RDF_REST  = RDF + 'rest',
      RDF_NIL   = RDF + 'nil',
      XSD = 'http://www.w3.org/2001/XMLSchema#',
      XSD_INTEGER  = XSD + 'integer',
      XSD_DECIMAL  = XSD + 'decimal',
      XSD_FLOAT   = XSD + 'float',
      XSD_DOUBLE   = XSD + 'double',
      XSD_BOOLEAN  = XSD + 'boolean',
      XSD_TRUE =  '"true"^^'  + XSD_BOOLEAN,
      XSD_FALSE = '"false"^^' + XSD_BOOLEAN,
      XSD_PATTERN        = XSD + 'pattern',
      XSD_MININCLUSIVE   = XSD + 'minInclusive',
      XSD_MINEXCLUSIVE   = XSD + 'minExclusive',
      XSD_MAXINCLUSIVE   = XSD + 'maxInclusive',
      XSD_MAXEXCLUSIVE   = XSD + 'maxExclusive',
      XSD_LENGTH         = XSD + 'length',
      XSD_MINLENGTH      = XSD + 'minLength',
      XSD_MAXLENGTH      = XSD + 'maxLength',
      XSD_TOTALDIGITS    = XSD + 'totalDigits',
      XSD_FRACTIONDIGITS = XSD + 'fractionDigits';

  const numericDatatypes = [
      XSD + "integer",
      XSD + "decimal",
      XSD + "float",
      XSD + "double",
      XSD + "string",
      XSD + "boolean",
      XSD + "dateTime",
      XSD + "nonPositiveInteger",
      XSD + "negativeInteger",
      XSD + "long",
      XSD + "int",
      XSD + "short",
      XSD + "byte",
      XSD + "nonNegativeInteger",
      XSD + "unsignedLong",
      XSD + "unsignedInt",
      XSD + "unsignedShort",
      XSD + "unsignedByte",
      XSD + "positiveInteger"
  ];

  const absoluteIRI = /^[a-z][a-z0-9+.-]*:/i;

  const numericFacets = ["mininclusive", "minexclusive",
                       "maxinclusive", "maxexclusive"];

  // Returns a lowercase version of the given string
  function lowercase(string) {
    return string.toLowerCase();
  }

  // Appends the item to the array and returns the array
  function appendTo(array, item) {
    return array.push(item), array;
  }

  // Extends a base object with properties of other objects
  function extend(base) {
    if (!base) base = {};
    for (let i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
      for (let name in arg)
        base[name] = arg[name];
    return base;
  }

  // Creates an array that contains all items of the given arrays
  function unionAll() {
    let union = [];
    for (let i = 0, l = arguments.length; i < l; i++)
      union = union.concat.apply(union, arguments[i]);
    return union;
  }

  // Creates an expression with the given type and attributes
  function expression(expr, attr) {
    const expression = { expression: expr };
    if (attr)
      for (let a in attr)
        expression[a] = attr[a];
    return expression;
  }

  // Creates a path with the given type and items
  function path(type, items) {
    return { type: 'path', pathType: type, items: items };
  }

  // Creates a literal with the given value and type
  function createLiteral(value, type) {
    return { value: value, type: type };
  }

  // Regular expression and replacement strings to escape strings
  const stringEscapeReplacements = { '\\': '\\', "'": "'", '"': '"',
                                   't': '\t', 'b': '\b', 'n': '\n', 'r': '\r', 'f': '\f' },
      semactEscapeReplacements = { '\\': '\\', '%': '%' },
      pnameEscapeReplacements = {
        '\\': '\\', "'": "'", '"': '"',
        'n': '\n', 'r': '\r', 't': '\t', 'f': '\f', 'b': '\b',
        '_': '_', '~': '~', '.': '.', '-': '-', '!': '!', '$': '$', '&': '&',
        '(': '(', ')': ')', '*': '*', '+': '+', ',': ',', ';': ';', '=': '=',
        '/': '/', '?': '?', '#': '#', '@': '@', '%': '%',
      };


  // Translates string escape codes in the string into their textual equivalent
  function unescapeString(string, trimLength) {
    string = string.substring(trimLength, string.length - trimLength);
    return { value: ShExUtil.unescapeText(string, stringEscapeReplacements) };
  }

  function unescapeLangString(string, trimLength) {
    const at = string.lastIndexOf("@");
    const lang = string.substr(at);
    string = string.substr(0, at);
    const u = unescapeString(string, trimLength);
    return extend(u, { language: lowercase(lang.substr(1)) });
  }

  // Translates regular expression escape codes in the string into their textual equivalent
  function unescapeRegexp (regexp) {
    const end = regexp.lastIndexOf("/");
    let s = regexp.substr(1, end-1);
    const regexpEscapeReplacements = {
      '.': "\\.", '\\': "\\\\", '?': "\\?", '*': "\\*", '+': "\\+",
      '{': "\\{", '}': "\\}", '(': "\\(", ')': "\\)", '|': "\\|",
      '^': "\\^", '$': "\\$", '[': "\\[", ']': "\\]", '/': "\\/",
      't': '\\t', 'n': '\\n', 'r': '\\r', '-': "\\-", '/': '/'
    };
    s = ShExUtil.unescapeText(s, regexpEscapeReplacements)
    const ret = {
      pattern: s
    };
    if (regexp.length > end+1)
      ret.flags = regexp.substr(end+1);
    return ret;
  }

  // Convenience function to return object with p1 key, value p2
  function keyValObject(key, val) {
    const ret = {};
    ret[key] = val;
    return ret;
  }

  // Return object with p1 key, p2 string value
  function unescapeSemanticAction(key, string) {
    string = string.substring(1, string.length - 2);
    return {
      type: "SemAct",
      name: key,
      code: ShExUtil.unescapeText(string, semactEscapeReplacements)
    };
  }

  // shapeJunction judiciously takes a shapeAtom and an optional list of con/disjuncts.
  // No created Shape{And,Or,Not} will have a `nested` shapeExpr.
  // Don't nonest arguments to shapeJunction.
  // shapeAtom emits `nested` so nonest every argument that can be a shapeAtom, i.e.
  //   shapeAtom, inlineShapeAtom, shapeAtomNoRef
  //   {,inline}shape{And,Or,Not}
  //   this does NOT include shapeOrRef or nodeConstraint.
  function shapeJunction (type, shapeAtom, juncts) {
    if (juncts.length === 0) {
      return nonest(shapeAtom);
    } else if (shapeAtom.type === type && !shapeAtom.nested) {
      nonest(shapeAtom).shapeExprs = nonest(shapeAtom).shapeExprs.concat(juncts);
      return shapeAtom;
    } else {
      return { type: type, shapeExprs: [nonest(shapeAtom)].concat(juncts.map(nonest)) };
    }
  }

  // strip out .nested attribute
  function nonest (shapeAtom) {
    delete shapeAtom.nested;
    return shapeAtom;
  }
%}

/* lexical grammar */
%lex

IT_BASE                 [Bb][Aa][Ss][Ee]
IT_PREFIX               [Pp][Rr][Ee][Ff][Ii][Xx]
IT_IMPORT               [iI][mM][pP][oO][rR][tT]
IT_START                [sS][tT][aA][rR][tT]
IT_EXTERNAL             [eE][xX][tT][eE][rR][nN][aA][lL]
IT_ABSTRACT             [Aa][Bb][Ss][Tt][Rr][Aa][Cc][Tt]
IT_RESTRICTS		[Rr][Ee][Ss][Tt][Rr][Ii][Cc][Tt][Ss]
IT_EXTENDS		[Ee][Xx][Tt][Ee][Nn][Dd][Ss]
IT_CLOSED               [Cc][Ll][Oo][Ss][Ee][Dd]
IT_EXTRA                [Ee][Xx][Tt][Rr][Aa]
IT_LITERAL              [Ll][Ii][Tt][Ee][Rr][Aa][Ll]
IT_BNODE                [Bb][Nn][Oo][Dd][Ee]
IT_IRI                  [Ii][Rr][Ii]
IT_NONLITERAL           [Nn][Oo][Nn][Ll][Ii][Tt][Ee][Rr][Aa][Ll]
IT_AND                  [Aa][Nn][Dd]
IT_OR                   [Oo][Rr]
IT_NOT                  [No][Oo][Tt]
IT_MININCLUSIVE         [Mm][Ii][Nn][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]
IT_MINEXCLUSIVE         [Mm][Ii][Nn][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]
IT_MAXINCLUSIVE         [Mm][Aa][Xx][Ii][Nn][Cc][Ll][Uu][Ss][Ii][Vv][Ee]
IT_MAXEXCLUSIVE         [Mm][Aa][Xx][Ee][Xx][Cc][Ll][Uu][Ss][Ii][Vv][Ee]
IT_LENGTH               [Ll][Ee][Nn][Gg][Tt][Hh]
IT_MINLENGTH            [Mm][Ii][Nn][Ll][Ee][Nn][Gg][Tt][Hh]
IT_MAXLENGTH            [Mm][Aa][Xx][Ll][Ee][Nn][Gg][Tt][Hh]
IT_TOTALDIGITS          [Tt][Oo][Tt][Aa][Ll][Dd][Ii][Gg][Ii][Tt][Ss]
IT_FRACTIONDIGITS       [Ff][Rr][Aa][Cc][Tt][Ii][Oo][Nn][Dd][Ii][Gg][Ii][Tt][Ss]
LANGTAG                 "@"([A-Za-z])+(("-"([0-9A-Za-z])+))*
INTEGER                 ([+-])?([0-9])+
REPEAT_RANGE            "{"({INTEGER})((","(({INTEGER})|'*')?))?"}"
DECIMAL                 ([+-])?([0-9])*"."([0-9])+
EXPONENT                [Ee]([+-])?([0-9])+
DOUBLE                  ([+-])?((([0-9])+"."([0-9])*({EXPONENT}))|((".")?([0-9])+({EXPONENT})))
ECHAR                   "\\"[\"\'\\bfnrt]
WS                      (" ")|(("\t")|(("\r")|("\n")))
//ANON                  "\["(({WS}))*"\]"
PN_CHARS_BASE           [A-Z] | [a-z] | [\u00c0-\u00d6] | [\u00d8-\u00f6] | [\u00f8-\u02ff] | [\u0370-\u037d] | [\u037f-\u1fff] | [\u200c-\u200d] | [\u2070-\u218f] | [\u2c00-\u2fef] | [\u3001-\ud7ff] | [\uf900-\ufdcf] | [\ufdf0-\ufffd] | [\uD800-\uDB7F][\uDC00-\uDFFF] // UTF-16 surrogates for [\U00010000-\U000effff]
PN_CHARS_U              {PN_CHARS_BASE} | '_' | '_' /* !!! raise jison bug */
PN_CHARS                {PN_CHARS_U} | '-' | [0-9] | [\u00b7] | [\u0300-\u036f] | [\u203f-\u2040]
REGEXP                  '/' ([^\u002f\u005C\u000A\u000D] | '\\' [nrt\\|.?*+(){}$\u002D\u005B\u005D\u005E/] | {UCHAR})+ '/' [smix]*
BLANK_NODE_LABEL        '_:' ({PN_CHARS_U} | [0-9]) (({PN_CHARS} | '.')* {PN_CHARS})?
//ATBLANK_NODE_LABEL        '@_:' ({PN_CHARS_U} | [0-9]) (({PN_CHARS} | '.')* {PN_CHARS})?
PN_PREFIX               {PN_CHARS_BASE} (({PN_CHARS} | '.')* {PN_CHARS})?
PNAME_NS                {PN_PREFIX}? ':'
ATPNAME_NS              '@' {PNAME_NS}
HEX                     [0-9] | [A-F] | [a-f]
PERCENT                 '%' {HEX} {HEX}
UCHAR                   '\\u' {HEX} {HEX} {HEX} {HEX} | '\\U' {HEX} {HEX} {HEX} {HEX} {HEX} {HEX} {HEX} {HEX}
CODE                    "{" ([^%\\] | "\\"[%\\] | {UCHAR})* "%}"

STRING_LITERAL1         "'" ([^\u0027\u005c\u000a\u000d] | {ECHAR} | {UCHAR})* "'" /* #x27=' #x5C=\ #xA=new line #xD=carriage return */
STRING_LITERAL2         '"' ([^\u0022\u005c\u000a\u000d] | {ECHAR} | {UCHAR})* '"' /* #x22=" #x5C=\ #xA=new line #xD=carriage return */
STRING_LITERAL_LONG1    "'''" (("'" | "''")? ([^\'\\] | {ECHAR} | {UCHAR}))* "'''"
//NON_TERMINATED_STRING_LITERAL_LONG1    "'''"
STRING_LITERAL_LONG2    '"""' (('"' | '""')? ([^\"\\] | {ECHAR} | {UCHAR}))* '"""'
//NON_TERMINATED_STRING_LITERAL_LONG2    '"""'

LANG_STRING_LITERAL1         "'" ([^\u0027\u005c\u000a\u000d] | {ECHAR} | {UCHAR})* "'" {LANGTAG}
LANG_STRING_LITERAL2         '"' ([^\u0022\u005c\u000a\u000d] | {ECHAR} | {UCHAR})* '"' {LANGTAG}
LANG_STRING_LITERAL_LONG1    "'''" (("'" | "''")? ([^\'\\] | {ECHAR} | {UCHAR}))* "'''" {LANGTAG}
LANG_STRING_LITERAL_LONG2    '"""' (('"' | '""')? ([^\"\\] | {ECHAR} | {UCHAR}))* '"""' {LANGTAG}

IRIREF                  '<' ([^\u0000-\u0020<>\"{}|^`\\] | {UCHAR})* '>' /* #x00=NULL #01-#x1F=control codes #x20=space */
//ATIRIREF              '@<' ([^\u0000-\u0020<>\"{}|^`\\] | {UCHAR})* '>' /* #x00=NULL #01-#x1F=control codes #x20=space */
PN_LOCAL_ESC            '\\' ('_' | '~' | '.' | '-' | '!' | '$' | '&' | "'" | '(' | ')' | '*' | '+' | ',' | ';' | '=' | '/' | '?' | '#' | '@' | '%')
PLX                     {PERCENT} | {PN_LOCAL_ESC}
PN_LOCAL                ({PN_CHARS_U} | ':' | [0-9] | {PLX}) ( ({PN_CHARS} | '.' | ':' | {PLX})* ({PN_CHARS} | ':' | {PLX}) )?
PNAME_LN                {PNAME_NS} {PN_LOCAL}
ATPNAME_LN              '@' {PNAME_LN}
COMMENT                 '#' [^\u000a\u000d]* | "/*" ([^*] | '*' ([^/] | '\\/'))* "*/"

%no-break-if          (.*[^a-z] | '') 'return' ([^a-z].* | '') // elide trailing 'break;'

%%

\s+|{COMMENT}           {
  // space eaten by whitespace and comments
  if (yy.skipped.last_line === yylloc.first_line &&
      yy.skipped.last_column === yylloc.first_column) {
    // immediately follows a skipped span
    yy.skipped.last_line = yylloc.last_line;
    yy.skipped.last_column = yylloc.last_column;
  } else {
    // follows something else
    yy.skipped = yylloc
  };
}
{ATPNAME_LN}            return 'ATPNAME_LN';
// {ATIRIREF}           return 'ATIRIREF';
{ATPNAME_NS}            return 'ATPNAME_NS';
// {ATBLANK_NODE_LABEL} return 'ATBLANK_NODE_LABEL';
{LANGTAG}               { yytext = yytext.substr(1); return 'LANGTAG'; }
"@"                     return '@';
{PNAME_LN}              return 'PNAME_LN';
{REPEAT_RANGE}          return 'REPEAT_RANGE';
{DOUBLE}                return 'DOUBLE';
{DECIMAL}               return 'DECIMAL';
//{EXPONENT}            return 'EXPONENT';
{INTEGER}               return 'INTEGER';
//{ECHAR}               return 'ECHAR';
//{WS}                  return 'WS';
//{ANON}                  return 'ANON';
{IRIREF}                return 'IRIREF';
{PNAME_NS}              return 'PNAME_NS';
"a"                     return 'a';
//{PN_CHARS_BASE}       return 'PN_CHARS_BASE';
//{PN_CHARS_U}          return 'PN_CHARS_U';
//{PN_CHARS}            return 'PN_CHARS';
{REGEXP}                return 'REGEXP';
{BLANK_NODE_LABEL}      return 'BLANK_NODE_LABEL';
//{PN_PREFIX}           return 'PN_PREFIX';
//{HEX}                 return 'HEX';
//{PERCENT}             return 'PERCENT';
//{UCHAR}               return 'UCHAR';
{CODE}                  return 'CODE';

{LANG_STRING_LITERAL_LONG1}  return 'LANG_STRING_LITERAL_LONG1';
{LANG_STRING_LITERAL_LONG2}  return 'LANG_STRING_LITERAL_LONG2';
{LANG_STRING_LITERAL1}       return 'LANG_STRING_LITERAL1';
{LANG_STRING_LITERAL2}       return 'LANG_STRING_LITERAL2';

{STRING_LITERAL_LONG1}  return 'STRING_LITERAL_LONG1';
//{NON_TERMINATED_STRING_LITERAL_LONG1}   return 'NON_TERMINATED_STRING_LITERAL_LONG2';
{STRING_LITERAL_LONG2}  return 'STRING_LITERAL_LONG2';
//{NON_TERMINATED_STRING_LITERAL_LONG2}   return 'NON_TERMINATED_STRING_LITERAL_LONG2';
{STRING_LITERAL1}       return 'STRING_LITERAL1';
{STRING_LITERAL2}       return 'STRING_LITERAL2';

//{PN_LOCAL_ESC}        return 'PN_LOCAL_ESC';
//{PLX}                 return 'PLX';
//{PN_LOCAL}            return 'PN_LOCAL';
{IT_BASE}               return 'IT_BASE';
{IT_PREFIX}             return 'IT_PREFIX';
{IT_IMPORT}             return 'IT_IMPORT';
{IT_START}              return 'IT_start';
{IT_EXTERNAL}           return 'IT_EXTERNAL';
{IT_ABSTRACT}           return 'IT_ABSTRACT';
{IT_RESTRICTS}		return 'IT_RESTRICTS';
{IT_EXTENDS}		return 'IT_EXTENDS';
{IT_CLOSED}             return 'IT_CLOSED';
{IT_EXTRA}              return 'IT_EXTRA';
{IT_LITERAL}            return 'IT_LITERAL';
{IT_BNODE}              return 'IT_BNODE';
{IT_IRI}                return 'IT_IRI';
{IT_NONLITERAL}         return 'IT_NONLITERAL';
{IT_AND}                return 'IT_AND';
{IT_OR}                 return 'IT_OR';
{IT_NOT}                return 'IT_NOT';
{IT_MININCLUSIVE}       return 'IT_MININCLUSIVE';
{IT_MINEXCLUSIVE}       return 'IT_MINEXCLUSIVE';
{IT_MAXINCLUSIVE}       return 'IT_MAXINCLUSIVE';
{IT_MAXEXCLUSIVE}       return 'IT_MAXEXCLUSIVE';
{IT_LENGTH}             return 'IT_LENGTH';
{IT_MINLENGTH}          return 'IT_MINLENGTH';
{IT_MAXLENGTH}          return 'IT_MAXLENGTH';
{IT_TOTALDIGITS}        return 'IT_TOTALDIGITS';
{IT_FRACTIONDIGITS}     return 'IT_FRACTIONDIGITS';
"="                     return '=';
"//"                    return '//';
"{"                     return '{';
"}"                     return '}';
"&"                     return '&';
"||"                    return '||';
"|"                     return '|';
","                     return ',';
"("                     return '(';
")"                     return ')';
"["                     return '[';
"]"                     return ']';
"$"                     return '$';
"!"                     return '!';
"^^"                    return '^^';
"^"                     return '^';
"."                     return '.';
"~"                     return '~';
";"                     return ';';
"*"                     return '*';
"+"                     return '+';
"?"                     return '?';
"-"                     return '-';
"%"                     return '%';
"true"                  return 'IT_true';
"false"                 return 'IT_false';
<<EOF>>                 return 'EOF';
[a-zA-Z0-9_-]+          return 'unexpected word "'+yytext+'"';
.                       return 'invalid character '+yytext;

/lex

/* operator associations and precedence */

%start shexDoc

%% /* language grammar */

shexDoc:
      _initParser _Qdirective_E_Star _Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt EOF	{
        let imports = Object.keys(yy._imports).length ? { imports: yy._imports } : {}
        const startObj = yy.start ? { start: yy.start } : {};
        const startActs = yy.startActs ? { startActs: yy.startActs } : {};
        let shapes = yy.shapes ? { shapes: Object.values(yy.shapes) } : {};
        const shexj = Object.assign(
          { type: "Schema" }, imports, startActs, startObj, shapes
        )
        if (yy.options.index) {
          if (yy._base !== null)
            shexj._base = yy._base;
          shexj._prefixes = yy._prefixes;
          shexj._index = {
            shapeExprs: yy.shapes || {},
            tripleExprs: yy.productions || {}
          };
          shexj._sourceMap = yy._sourceMap;
          shexj._locations = yy.locations;
        }
        return shexj;
      }
    ;

_initParser: // I don't know how else to get ahold of the lexer.
      	{ yy.parser.yy = { lexer: yy.lexer} ; } // parser.yy is user API space.
    ;

_Qdirective_E_Star:
      	
    | _Qdirective_E_Star directive	
    ;

_O_QnotStartAction_E_Or_QstartActions_E_C:
      notStartAction	
    | startActions	
    ;

_Qstatement_E_Star:
      	
    | _Qstatement_E_Star statement	
    ;

_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C:
      _O_QnotStartAction_E_Or_QstartActions_E_C _Qstatement_E_Star	// t: 1dot
    ;

_Q_O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C_E_Opt:
      	// t: !!
    | _O_QnotStartAction_E_Or_QstartActions_E_S_Qstatement_E_Star_C	// t: 1dot
    ;

directive:
      baseDecl	// t: 1dot-base
    | prefixDecl	// t: 1dotLNex
    | importDecl	// t: 1dotIMPORT1dot
    ;

baseDecl:
      IT_BASE IRIREF	{ // t: 1dot-base
        yy._setBase(yy._base === null ||
                    absoluteIRI.test($2.slice(1, -1)) ? $2.slice(1, -1) : yy._resolveIRI($2.slice(1, -1)));
      }
    ;

prefixDecl:
      IT_PREFIX PNAME_NS iri	{ // t: ShExParser-test.js/with pre-defined prefixes
        yy._prefixes[$2.slice(0, -1)] = $3;
      }
    ;

importDecl:
      IT_IMPORT iri	{ // t: 1dotIMPORT1dot
        yy._imports.push($2);
      }
    ;

notStartAction:
      start	// t: startCode1startRef
    | shapeExprDecl	// t: 1iriRef1 1val1vsMinusiri3??
    ;

start:
      IT_start '=' shapeAnd _Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star	{
        if (yy.start)
          yy.error(new Error("Parse error: start already defined"));
        yy.start = shapeJunction("ShapeOr", $3, $4); // t: startInline
      }
    ;

startActions:
      _QcodeDecl_E_Plus	{
        yy.startActs = $1; // t: startCode1
      }
    ;

_QcodeDecl_E_Plus:
      codeDecl	-> [$1] // t: startCode1
    | _QcodeDecl_E_Plus codeDecl	-> appendTo($1, $2) // t: startCode3
    ;

statement:
      directive	// t: open1dotclose
    | notStartAction	// t: 1dotRef1
    ;

shapeExprDecl:
      mark _QIT_ABSTRACT_E_Opt shapeExprLabel _Qrestriction_E_Star _O_QshapeExpression_E_Or_QshapeRef_E_Or_QIT_EXTERNAL_E_C mark	{ // t: 1dot 1val1vsMinusiri3??
        yy.addShape($3, Object.assign(
          {type: "ShapeDecl"}, $2,
          $4.length > 0 ? { restricts: $4 } : { },
          {shapeExpr: $5} ), $1, $6)	// t: 0.json
      }
    ;

mark:
        { $$ = yy.lexer.yylloc; /* yy.lexer.showPosition(); */ }
    ;

_QIT_ABSTRACT_E_Opt:
      	-> {  }
    | IT_ABSTRACT	-> { abstract: true }
    ;

_Qrestriction_E_Star:
      	-> [] // t: 1dot, 1dotAnnot3
    | _Qrestriction_E_Star restriction	-> appendTo($1, $2) // t: 1dotAnnot3
    ;

_O_QshapeExpression_E_Or_QshapeRef_E_Or_QIT_EXTERNAL_E_C:
      // _QstringFacet_E_Star shapeExpression	{
      //   if (Object.keys($1).length === 0) { $$ = $2; }
      //   // else if ($2.type === "NodeConstraint") { $$ = extend($2, $2); } // delme
      //   else { $$ = { type: "ShapeAnd",
      //                 shapeExprs: [
      //                   extend({ type: "NodeConstraint" }, $1),
      //                   $2 ]
      //               };
      //        }
      // }
      shapeExpression	{
        $$ = nonest($1);
      }
    | shapeRef	
    | IT_EXTERNAL	-> { type: "ShapeExternal" }
    ;

shapeExpression:
      _QIT_NOT_E_Opt shapeAtomNoRef _QshapeOr_E_Opt	{
        if ($1)
          $2 = { type: "ShapeNot", "shapeExpr": nonest($2) };	// t: 1NOTNOTIRI
        if ($3) { // If there were disjuncts or conjuncts,
          //           shapeOr will have $3.set needsAtom.
          //           Prepend $3.needsAtom with $2.
          //           Note that $3 may be a ShapeOr or a ShapeAnd.
          if ($2.type === 'ShapeAnd' && $3.type === 'ShapeAnd' && !$2.nested && !$3.nested) {
            // $3.annotations = $3.shapeExprs[0].annotations;
            // delete $3.shapeExprs[0].annotations;
            // $2.semActs = $2.shapeExprs[0].semActs;
            // delete $3.shapeExprs[0].semActs;
            $3.shapeExprs.splice(0, 0, ...$2.shapeExprs)
          } else {
            $3.needsAtom.unshift(nonest($2)); // t: focusbnode0ORfocusPattern0
          }
          delete $3.needsAtom;
          $$ = $3;	// t: 1NOT_literalANDvs_
        } else {
          $$ = $2;	// t: 0
        }
      }
    | IT_NOT shapeRef _QshapeOr_E_Opt	{
        $2 = { type: "ShapeNot", "shapeExpr": nonest($2) }	// t: focusNOTRefOR1dot !!! opt
        if ($3) { // If there were disjuncts,
          //           shapeOr will have $3.set needsAtom.
          //           Prepend $3.needsAtom with $2.
          //           Note that $3 may be a ShapeOr or a ShapeAnd.
          $3.needsAtom.unshift(nonest($2));
          delete $3.needsAtom;
          $$ = $3;	// t: focusNOTRefOR1dot
        } else {
          $$ = $2;	// t: TwoNegation
        }
      }
    | shapeRef shapeOr	{
        $2.needsAtom.unshift(nonest($1));
        delete $2.needsAtom;
        $$ = $2; // { type: "ShapeOr", "shapeExprs": [$1].concat($2) };
      }	// t: 1val1vExprRefAND3
    ;

_QshapeOr_E_Opt:
      	-> null	// t: 0
    | shapeOr	-> $1	// t: 1NOT_literalANDvs_
    ;

inlineShapeExpression:
      inlineShapeOr	
    ;

shapeOr: // Sets .needsAtom to tell shapeExpression where to place leading shapeAtom.
      _Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus	{ // returns a ShapeOr
        const shapeExprs = $1.map(nonest);
        $$ = { type: "ShapeOr", shapeExprs: shapeExprs, needsAtom: shapeExprs }; // t: 1val1vExprRefOR3
      }
    | _Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus _Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star	{ // returns a ShapeAnd
        // $1 could have implicit conjuncts and explicit nested ANDs (will have .nested: true)
        $1.filter(c => c.type === "ShapeAnd").length === $1.length
        const and = {
          type: "ShapeAnd",
          shapeExprs: $1.reduce(
            (acc, elt) =>
              acc.concat(elt.type === 'ShapeAnd' && !elt.nested ? elt.shapeExprs : nonest(elt)), [] // t: 1dotANDopen1dotAND1dotclose : @@
          )
        };
        $$ = $2.length > 0 ? { type: "ShapeOr", shapeExprs: [and].concat($2.map(nonest)) } : and; // t: focusbnode0ORfocusPattern0 : 1val1vExprRefAND3
        $$.needsAtom = and.shapeExprs;
      }
    ;

_O_QIT_OR_E_S_QshapeAnd_E_C:
      IT_OR shapeAnd	-> $2
    ;

_Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus:
      _O_QIT_OR_E_S_QshapeAnd_E_C	-> [$1] // t: 1val1vExprRefOR3
    | _Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Plus _O_QIT_OR_E_S_QshapeAnd_E_C	-> $1.concat($2) // t: 1val1vExprRefOR3
    ;

_O_QIT_AND_E_S_QshapeNot_E_C:
      IT_AND shapeNot	-> $2
    ;

_Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus:
      _O_QIT_AND_E_S_QshapeNot_E_C	-> [$1] // t: 1val1vExprRefAND3
    | _Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Plus _O_QIT_AND_E_S_QshapeNot_E_C	-> $1.concat($2) // t: 1val1vExprRefAND3
    ;

_Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star:
      	-> [] // t: 1val1vExprRefAND3
    | _Q_O_QIT_OR_E_S_QshapeAnd_E_C_E_Star _O_QIT_OR_E_S_QshapeAnd_E_C	-> $1.concat($2) // t: focusbnode0ORfocusPattern0
    ;

inlineShapeOr:
      inlineShapeAnd _Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star	-> shapeJunction("ShapeOr", $1, $2) // t: 1dot
    ;

_O_QIT_OR_E_S_QinlineShapeAnd_E_C:
      IT_OR inlineShapeAnd	-> $2 // t: 1dotRefOR3
    ;

_Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star:
      	-> [] // t: 1dot
    | _Q_O_QIT_OR_E_S_QinlineShapeAnd_E_C_E_Star _O_QIT_OR_E_S_QinlineShapeAnd_E_C	-> $1.concat($2) // t: 1dotRefOR3
    ;

shapeAnd:
      shapeNot _Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star	-> shapeJunction("ShapeAnd", $1, $2)	// t: focusbnode0ORfocusPattern0
    ;

_Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star:
      	-> [] // t: 1val1vExprRefOR3
    | _Q_O_QIT_AND_E_S_QshapeNot_E_C_E_Star _O_QIT_AND_E_S_QshapeNot_E_C	-> $1.concat($2) // t: focusbnode0ORfocusPattern0
    ;

inlineShapeAnd:
      inlineShapeNot _Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star	-> shapeJunction("ShapeAnd", $1, $2)	// t: 1iriRef1
    ;

_O_QIT_AND_E_S_QinlineShapeNot_E_C:
      IT_AND inlineShapeNot	-> $2 // t: 1iriRef1
    ;

_Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star:
      	-> [] // t: 1dot
    | _Q_O_QIT_AND_E_S_QinlineShapeNot_E_C_E_Star _O_QIT_AND_E_S_QinlineShapeNot_E_C	-> $1.concat($2) // t: 1iriRef1
    ;

shapeNot:
      _QIT_NOT_E_Opt shapeAtom	-> $1 ? { type: "ShapeNot", "shapeExpr": nonest($2) } : $2 // t: 1val1vExprRefAND3 : OneNegation
    ;

_QIT_NOT_E_Opt:
      	-> false // t: 0
    | IT_NOT	-> true // t: 1NOTIRI
    ;

inlineShapeNot:
      _QIT_NOT_E_Opt inlineShapeAtom	-> $1 ? { type: "ShapeNot", "shapeExpr": nonest($2) } /* t: 1NOTNOTdot, 1NOTNOTIRI, 1NOTNOTvs */ : $2 // t: 1NOTIRI : 1dot
    ;

shapeAtom:
      nonLitNodeConstraint _QshapeOrRef_E_Opt	
        -> $2 ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $1), $2 ] } : $1 // t: focusbnode0ORfocusPattern0 : focusvsANDIRI
    | litNodeConstraint	// t: 1NOT_literalANDvs_
    | shapeOrRef _QnonLitNodeConstraint_E_Opt	
        -> $2 ? shapeJunction("ShapeAnd", $1, [$2]) /* t: 1dotRef1 */ : $1 // t: @@ : 1val1vExprRefAND3
    | '(' shapeExpression ')'	-> Object.assign($2, {nested: true}) // t: NOT1dotOR2dotX3
    | '.'	-> yy.EmptyShape // t: @@
    ;

_QshapeOrRef_E_Opt:
      	
    | shapeOrRef	
    ;

_QnonLitNodeConstraint_E_Opt:
      	
    | nonLitNodeConstraint	
    ;

shapeAtomNoRef:
      nonLitNodeConstraint _QshapeOrRef_E_Opt	
        -> $2 ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $1), $2 ] } : $1 // t: 0focusIRI : 1NOTNOTIRI
    | litNodeConstraint	// t: 1val1refvsMinusiri3
    | shapeDefinition _QnonLitNodeConstraint_E_Opt	
	-> $2 ? shapeJunction("ShapeAnd", $1, [$2]) : $1	 // t: @@ : 0 // 1dotRef1 -- use _QnonLitNodeConstraint_E_Opt like below?
    | '(' shapeExpression ')'	-> Object.assign($2, {nested: true}) // t: NOT1dotOR2dotX3
    | '.'	-> yy.EmptyShape // t: 1NOTNOTdot
    ;

inlineShapeAtom:
      nonLitInlineNodeConstraint _QinlineShapeOrRef_E_Opt	
        -> $2 ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $1), $2 ] } : $1 // t: 1iriRef1 : 1iri
    | litInlineNodeConstraint	// t: 1literal
    | inlineShapeOrRef _QnonLitInlineNodeConstraint_E_Opt	
        -> $2 ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $1), $2 ] } : $1 // t: @@ : 1dotRef1
    | '(' shapeExpression ')'	-> Object.assign($2, {nested: true}) // t: 1NOTNOTIRI
    | '.'	-> yy.EmptyShape // t: 1dot
    ;

_QinlineShapeOrRef_E_Opt:
      	
    | inlineShapeOrRef	
    ;

_QnonLitInlineNodeConstraint_E_Opt:
      	
    | nonLitInlineNodeConstraint	
    ;

shapeOrRef:
      shapeDefinition	// t: 1val1vShapeANDRef3
    | shapeRef	// t: 1val1vExprRefAND3
    ;

inlineShapeOrRef:
      inlineShapeDefinition	// t: 1dotInline1
    | shapeRef	// t: 1dotRef1
    ;

shapeRef:
      ATPNAME_LN	{ // t: 1dotRefLNex1
        $1 = $1.substr(1, $1.length-1);
        const namePos = $1.indexOf(':');
        $$ = yy.addSourceMap(yy.expandPrefix($1.substr(0, namePos), yy) + $1.substr(namePos + 1)); // ShapeRef
      }
    | ATPNAME_NS	{ // t: 1dotRefNS1
        $1 = $1.substr(1, $1.length-1);
        $$ = yy.addSourceMap(yy.expandPrefix($1.substr(0, $1.length - 1), yy)); // ShapeRef
      }
    | '@' shapeExprLabel	-> yy.addSourceMap($2) // ShapeRef // t: 1dotRef1, 1dotRefSpaceLNex, 1dotRefSpaceNS1
    ;

litNodeConstraint:
      litInlineNodeConstraint _Qannotation_E_Star semanticActions	{
        $$ = $1
        if ($2.length) { $$.annotations = $2; } // t: @@ : 1val1refvsMinusiri3
        if ($3) { $$.semActs = $3.semActs; } // t: @@ : 1val1refvsMinusiri3
      }
    ;

_Qannotation_E_Star:
      	-> [] // t: 0, 1dot, 1dotAnnot3
    | _Qannotation_E_Star annotation	-> appendTo($1, $2) // t: 1dotAnnotIRIREF, 1dotAnnot3
    ;

nonLitNodeConstraint:
      nonLitInlineNodeConstraint _Qannotation_E_Star semanticActions	{
        $$ = $1
        if ($2.length) { $$.annotations = $2; } // t: @@ : 1NOTNOTIRI
        if ($3) { $$.semActs = $3.semActs; } // t: @@ : 1NOTNOTIRI
      }
    ;

litInlineNodeConstraint:
      IT_LITERAL _QxsFacet_E_Star	-> extend({ type: "NodeConstraint", nodeKind: "literal" }, $2) // t: 1literal
    | datatype _QxsFacet_E_Star	{
        if (numericDatatypes.indexOf($1) === -1)
          numericFacets.forEach(function (facet) {
            if (facet in $2) // 1unknowndatatypeMaxInclusive
              yy.error(new Error("Parse error: facet " + facet + " not allowed for unknown datatype " + $1));
          });
        $$ = extend({ type: "NodeConstraint", datatype: $1 }, $2) // t: 1datatype
      }
    | valueSet _QxsFacet_E_Star	-> { type: "NodeConstraint", values: $1 } // t: 1val1IRIREF
    | _QnumericFacet_E_Plus	-> extend({ type: "NodeConstraint"}, $1) // @@
    ;

_QxsFacet_E_Star:
      	-> {} // t: 1literal
    | _QxsFacet_E_Star xsFacet	{
        if (Object.keys($1).indexOf(Object.keys($2)[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($2)[0]+" defined multiple times"));
        }
        $$ = extend($1, $2) // t: 1datatypeLength
      }
    ;

_QnumericFacet_E_Plus:
      numericFacet	// t: !! look to 1literalPattern
    | _QnumericFacet_E_Plus numericFacet	{
        if (Object.keys($1).indexOf(Object.keys($2)[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($2)[0]+" defined multiple times"));
        }
        $$ = extend($1, $2) // t: !! look to 1literalLength
      }
    ;

nonLitInlineNodeConstraint:
      nonLiteralKind _QstringFacet_E_Star	
        -> extend({ type: "NodeConstraint" }, $1, $2 ? $2 : {}) // t: 1iriPattern
    | _QstringFacet_E_Plus	-> extend({ type: "NodeConstraint" }, $1) // t: 1Length
    ;

_QstringFacet_E_Star:
      	-> {} // 1iri
    | _QstringFacet_E_Star stringFacet	{
        if (Object.keys($1).indexOf(Object.keys($2)[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($2)[0]+" defined multiple times"));
        }
        $$ = extend($1, $2)
      } // 1iriLength
    ;

_QstringFacet_E_Plus:
      stringFacet	// t: 1Length
    | _QstringFacet_E_Plus stringFacet	{
        if (Object.keys($1).indexOf(Object.keys($2)[0]) !== -1) {
          yy.error(new Error("Parse error: facet "+Object.keys($2)[0]+" defined multiple times"));
        }
        $$ = extend($1, $2)
      } // t: @@ _all
    ;

nonLiteralKind:
      IT_IRI	-> { nodeKind: "iri" } // t: 1iriPattern
    | IT_BNODE	-> { nodeKind: "bnode" } // t: 1bnodeLength
    | IT_NONLITERAL	-> { nodeKind: "nonliteral" } // t: 1nonliteralLength
    ;

xsFacet:
      stringFacet	// t: 1literalLength
    | numericFacet	// t: 1literalTotaldigits
    ;

stringFacet:
      stringLength INTEGER	-> keyValObject($1, parseInt($2, 10)) // t: 1literalLength
    | REGEXP	-> unescapeRegexp($1) // t: 1literalPattern
    ;

stringLength:
      IT_LENGTH	-> "length" // t: 1literalLength
    | IT_MINLENGTH	-> "minlength" // t: 1literalMinlength
    | IT_MAXLENGTH	-> "maxlength" // t: 1literalMaxlength
    ;

numericFacet:
      numericRange _rawNumeric	-> keyValObject($1, $2) // t: 1literalMininclusive
    | numericLength INTEGER	-> keyValObject($1, parseInt($2, 10)) // t: 1literalTotaldigits
    ;

_rawNumeric: // like numericLiteral but doesn't parse as RDF literal
      INTEGER	-> parseInt($1, 10) // t: 1floatMininclusiveINTEGER
    | DECIMAL	-> parseFloat($1) // t: 1integerMininclusiveDECIMAL
    | DOUBLE	-> parseFloat($1) // t: 1integerMininclusiveDOUBLE
    | string '^^' datatype	{ // ## deprecated
        if ($3 === XSD_DECIMAL || $3 === XSD_FLOAT || $3 === XSD_DOUBLE) // t: @@
          $$ = parseFloat($1.value);
      else if (numericDatatypes.indexOf($3) !== -1) // t: @@
          $$ = parseInt($1.value)
        else // t: negativeSyntax/1decimalMininclusiveroman-numeral
          yy.error(new Error("Parse error: numeric range facet expected numeric datatype instead of " + $3));
      }
    ;

numericRange:
      IT_MININCLUSIVE	-> "mininclusive" // t: 1literalMininclusive
    | IT_MINEXCLUSIVE	-> "minexclusive" // t: 1literalMinexclusive
    | IT_MAXINCLUSIVE	-> "maxinclusive" // t: 1literalMaxinclusive
    | IT_MAXEXCLUSIVE	-> "maxexclusive" // t: 1literalMaxexclusive
    ;

numericLength:
      IT_TOTALDIGITS	-> "totaldigits" // t: 1literalTotaldigits
    | IT_FRACTIONDIGITS	-> "fractiondigits" // t: 1literalFractiondigits
    ;

shapeDefinition:
      inlineShapeDefinition _Qannotation_E_Star semanticActions	{ // t: 1dotExtend3
        $$ = $1 === yy.EmptyShape ? { type: "Shape" } : $1; // t: @@ : 1dot
        if ($2.length) { $$.annotations = $2; } // t: 1dotShapeAnnotIRIREF : 0
        if ($3) { $$.semActs = $3.semActs; } // t: 1dotShapeCode1 : 0
      }
    ;

inlineShapeDefinition:
      _Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star '{' _QtripleExpression_E_Opt '}'	{ // t: 1dotExtend3
        const exprObj = $3 ? { expression: $3 } : yy.EmptyObject; // t: 1dot : 1focusMissingRefdot
        $$ = (exprObj === yy.EmptyObject && $1 === yy.EmptyObject)
	  ? yy.EmptyShape
	  : extend({ type: "Shape" }, exprObj, $1); // t: @@ : 1dot
      }
    ;

_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C:
      extension	-> [ "extends", [$1] ] // t: 1dotExtend1
    | extraPropertySet	-> [ "extra", $1 ] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3
    | IT_CLOSED	-> [ "closed", true ] // t: 1dotClosed
    ;

_Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star:
      	-> yy.EmptyObject
    | _Q_O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C_E_Star _O_Qextension_E_Or_QextraPropertySet_E_Or_QIT_CLOSED_E_C	{
        if ($1 === yy.EmptyObject)
          $1 = {};
        if ($2[0] === "closed")
          $1["closed"] = true; // t: 1dotClosed
        else if ($2[0] in $1)
          $1[$2[0]] = unionAll($1[$2[0]], $2[1]); // t: 1dotExtend3, 3groupdot3Extra, 3groupdotExtra3
        else
          $1[$2[0]] = $2[1]; // t: 1dotExtend1
        $$ = $1;
      }
    ;

_QtripleExpression_E_Opt:
      	// t: 0
    | tripleExpression	// t: 1dot
    ;

extraPropertySet:
      IT_EXTRA _Qpredicate_E_Plus	-> $2 // t: 1dotExtra1, 3groupdot3Extra
    ;

_Qpredicate_E_Plus:
      predicate	-> [$1] // t: 1dotExtra1, 3groupdot3Extra, 3groupdotExtra3
    | _Qpredicate_E_Plus predicate	-> appendTo($1, $2) // t: 3groupdotExtra3
    ;

tripleExpression:
      oneOfTripleExpr	
    ;

oneOfTripleExpr:
      groupTripleExpr	
    | multiElementOneOf	
    ;

multiElementOneOf:
      groupTripleExpr _Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus	-> { type: "OneOf", expressions: unionAll([$1], $2) } // t: 2oneOfdot
    ;

_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C:
      '|' groupTripleExpr	-> $2 // t: 2oneOfdot
    ;

_Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus:
      _O_QGT_PIPE_E_S_QgroupTripleExpr_E_C	-> [$1] // t: 2oneOfdot
    | _Q_O_QGT_PIPE_E_S_QgroupTripleExpr_E_C_E_Plus _O_QGT_PIPE_E_S_QgroupTripleExpr_E_C	-> appendTo($1, $2) // t: 2oneOfdot
    ;

groupTripleExpr:
      singleElementGroup	// t: 1dot
    | multiElementGroup	// t: 2dot
    ;

singleElementGroup:
      unaryTripleExpr _QGT_SEMI_E_Opt	-> $1 // t: 1dot
    ;

_QGT_SEMI_E_Opt:
      	// t: 1dot
    | ','	// @Deprecated
    | ';'	// t: 1dotComma
    ;

multiElementGroup:
      unaryTripleExpr _Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus _QGT_SEMI_E_Opt	-> { type: "EachOf", expressions: unionAll([$1], $2) } // t: 2groupOfdot
    ;

_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C:
      ',' unaryTripleExpr	-> $2 // @Deprecated
    | ';' unaryTripleExpr	-> $2 // t: 2groupOfdot
    ;

_Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus:
      _O_QGT_SEMI_E_S_QunaryTripleExpr_E_C	-> [$1] // t: 2groupOfdot
    | _Q_O_QGT_SEMI_E_S_QunaryTripleExpr_E_C_E_Plus _O_QGT_SEMI_E_S_QunaryTripleExpr_E_C	-> appendTo($1, $2) // t: 3Eachdot
    ;

unaryTripleExpr:
      _Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt _O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C	{
        if ($1) { // t: 2EachInclude1
          $$ = extend({ id: $1 }, $2);
          yy.addProduction($1,  $$);
        } else { // t: 1dot
          $$ = $2
        }
      }
    | include	
    ;

_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C:
      '$' tripleExprLabel	-> yy.addSourceMap($2) // t: 2EachInclude1
    ;

_Q_O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C_E_Opt:
      	// t: 1dot
    | _O_QGT_DOLLAR_E_S_QtripleExprLabel_E_C	// t: 2EachInclude1
    ;

_O_QtripleConstraint_E_Or_QbracketedTripleExpr_E_C:
      tripleConstraint	// t: 1dot
    | bracketedTripleExpr	// t: 1dot
    ;

bracketedTripleExpr:
      '(' tripleExpression ')' _Qcardinality_E_Opt _Qannotation_E_Star semanticActions	{
        // t: open1dotOr1dot, !openopen1dotcloseCode1closeCode2
        $$ = $2;
        // Copy all of the new attributes into the encapsulated shape.
        if ("min" in $4) { $$.min = $4.min; } // t: 1cardOpt : @@
        if ("max" in $4) { $$.max = $4.max; } // t: 1cardOpt : @@
        if ($5.length) { $$.annotations = $5; } // t: open3EachdotcloseAnnot3 : 1dot
        if ($6) {
          $$.semActs = "semActs" in $2
            ? $2.semActs.concat($6.semActs) // t: 1dotCode3
            : $6.semActs; // t: 1dotCode1
        } // t: 1dotCode1 : @@
      }
    ;

_Qcardinality_E_Opt:
      	-> {} // t: 1dot
    | cardinality	// t: 1cardOpt
    ;

tripleConstraint:
      _QsenseFlags_E_Opt predicate inlineShapeExpression _Qcardinality_E_Opt _Qannotation_E_Star semanticActions	{
        // $6: t: 1dotCode1
	// if ($3 !== yy.EmptyShape && false) {
	//   const t = yy.blank();
	//   yy.addShape(t, $3);
	//   $3 = t; // ShapeRef
	// }
        // %7: t: 1inversedotCode1
        $$ = Object.assign(
          { type: "TripleConstraint" },
          $1,
          { predicate: $2 },
          ($3 === yy.EmptyShape ? {} : { valueExpr: $3 }), // 1dot : 1iri
          $4,
          $6
        ); // t: 1dot, 1inversedot
        if ($5.length)
          $$["annotations"] = $5; // t: 1dotAnnot3, 1inversedotAnnot3 : 1dot
      }
    ;

_QsenseFlags_E_Opt:
      	
    | senseFlags
    ;

cardinality:
      '*'	-> { min:0, max:UNBOUNDED } // t: 1cardStar
    | '+'	-> { min:1, max:UNBOUNDED } // t: 1cardPlus
    | '?'	-> { min:0, max:1 } // t: 1cardOpt
    | REPEAT_RANGE	{
        $1 = $1.substr(1, $1.length-2);
        const nums = $1.match(/(\d+)/g);
        $$ = { min: parseInt(nums[0], 10) }; // t: 1card2blank, 1card2Star
        if (nums.length === 2)
            $$["max"] = parseInt(nums[1], 10); // t: 1card23
        else if ($1.indexOf(',') === -1) // t: 1card2
            $$["max"] = parseInt(nums[0], 10);
        else
            $$["max"] = UNBOUNDED;
      }
    ;

senseFlags:
      '^'	-> { inverse: true } // t: 1inversedot
    ;

valueSet:
      '[' _QvalueSetValue_E_Star ']'	-> $2 // t: 1val1IRIREF
    ;

_QvalueSetValue_E_Star:
      	-> [] // t: 1val1IRIREF
    | _QvalueSetValue_E_Star valueSetValue	-> appendTo($1, $2) // t: 1val1IRIREF
    ;

valueSetValue:
      iriRange	// t: 1val1IRIREF
    | literalRange	// t: 1val1literal
    | languageRange	// t: 1val1language
    | '.' _O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C	-> $2
    ;

_QiriExclusion_E_Plus:
      iriExclusion	-> [$1] // t:1val1dotMinusiri3, 1val1dotMinusiriStem3
    | _QiriExclusion_E_Plus iriExclusion	-> appendTo($1, $2) // t:1val1dotMinusiri3, 1val1dotMinusiriStem3
    ;

_QliteralExclusion_E_Plus:
      literalExclusion	-> [$1] // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3
    | _QliteralExclusion_E_Plus literalExclusion	-> appendTo($1, $2) // t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3
    ;

_QlanguageExclusion_E_Plus:
      languageExclusion	-> [$1] // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3
    | _QlanguageExclusion_E_Plus languageExclusion	-> appendTo($1, $2) // t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3
    ;

_O_QiriExclusion_E_Plus_Or_QliteralExclusion_E_Plus_Or_QlanguageExclusion_E_Plus_C:
      _QiriExclusion_E_Plus	// t:1val1dotMinusiri3, 1val1dotMinusiriStem3
        -> { type: "IriStemRange", stem: { type: "Wildcard" }, exclusions: $1 }
    | _QliteralExclusion_E_Plus	// t:1val1dotMinusliteral3, 1val1dotMinusliteralStem3
        -> { type: "LiteralStemRange", stem: { type: "Wildcard" }, exclusions: $1 }
    | _QlanguageExclusion_E_Plus	// t:1val1dotMinuslanguage3, 1val1dotMinuslanguageStem3
        -> { type: "LanguageStemRange", stem: { type: "Wildcard" }, exclusions: $1 }
    ;

iriRange:
      iri _Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt	{
        if ($2) {
          $$ = {  // t: 1val1iriStem, 1val1iriStemMinusiri3
            type: $2.length ? "IriStemRange" : "IriStem",
            stem: $1
          };
          if ($2.length)
            $$["exclusions"] = $2; // t: 1val1iriStemMinusiri3
        } else {
          $$ = $1; // t: 1val1IRIREF, 1AvalA
        }
      }
    ;

_QiriExclusion_E_Star:
      	-> [] // t: 1val1iriStem, 1val1iriStemMinusiri3
    | _QiriExclusion_E_Star iriExclusion	-> appendTo($1, $2) // t: 1val1iriStemMinusiri3
    ;

_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C:
      '~' _QiriExclusion_E_Star	-> $2 // t: 1val1iriStemMinusiri3
    ;

_Q_O_QGT_TILDE_E_S_QiriExclusion_E_Star_C_E_Opt:
      	// t: 1val1IRIREF
    | _O_QGT_TILDE_E_S_QiriExclusion_E_Star_C	// t: 1val1iriStemMinusiri3
    ;

iriExclusion:
      '-' iri _QGT_TILDE_E_Opt	-> $3 ? { type: "IriStem", stem: $2 } /* t: 1val1iriStemMinusiriStem3 */ : $2 // t: 1val1iriStemMinusiri3
    ;

_QGT_TILDE_E_Opt:
      	
    | '~'	
    ;

literalRange:
      literal _Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt	{
        if ($2) {
          $$ = {  // t: 1val1literalStemMinusliteralStem3, 1val1literalStem
            type: $2.length ? "LiteralStemRange" : "LiteralStem",
            stem: $1.value
          };
          if ($2.length)
            $$["exclusions"] = $2; // t: 1val1literalStemMinusliteral3
        } else {
          $$ = $1; // t: 1val1LITERAL
        }
      }
    ;

_QliteralExclusion_E_Star:
      	-> [] // t: 1val1literalStem, 1val1literalStemMinusliteral3
    | _QliteralExclusion_E_Star literalExclusion	-> appendTo($1, $2) // t: 1val1literalStemMinusliteral3
    ;

_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C:
      '~' _QliteralExclusion_E_Star	-> $2 // t: 1val1literalStemMinusliteral3
    ;

_Q_O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C_E_Opt:
      	// t: 1val1LITERAL
    | _O_QGT_TILDE_E_S_QliteralExclusion_E_Star_C	// t: 1val1LITERAL
    ;

literalExclusion:
      '-' literal _QGT_TILDE_E_Opt	-> $3 ? { type: "LiteralStem", stem: $2.value } /* t: 1val1literalStemMinusliteral3 */ : $2.value // t: 1val1literalStemMinusliteralStem3
    ;

languageRange:
      LANGTAG _Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt	{
        if ($2) {
          $$ = {  // t: 1val1languageStemMinuslanguage3 1val1languageStemMinuslanguageStem3 : 1val1languageStem
            type: $2.length ? "LanguageStemRange" : "LanguageStem",
            stem: $1
          };
          if ($2.length)
            $$["exclusions"] = $2; // t: 1val1languageStemMinuslanguage3, 1val1languageStemMinuslanguageStem3
        } else {
          $$ = { type: "Language", languageTag: $1 }; // t: 1val1language
        }
      }
    | '@' _O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C	{
        $$ = {  // t: @@
          type: $2.length ? "LanguageStemRange" : "LanguageStem",
          stem: ""
        };
        if ($2.length)
          $$["exclusions"] = $2; // t: @@
      }
    ;

_QlanguageExclusion_E_Star:
      	-> [] // t: 1val1languageStem, 1val1languageStemMinuslanguage3
    | _QlanguageExclusion_E_Star languageExclusion	-> appendTo($1, $2) // t: 1val1languageStemMinuslanguage3
    ;

_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C:
      '~' _QlanguageExclusion_E_Star	-> $2 // t: 1val1languageStemMinuslanguage3
    ;

_Q_O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C_E_Opt:
      	// t: 1val1LANGUAGE
    | _O_QGT_TILDE_E_S_QlanguageExclusion_E_Star_C	// t: 1val1languageStemMinuslanguage3
    ;

languageExclusion:
      '-' LANGTAG _QGT_TILDE_E_Opt	-> $3 ? { type: "LanguageStem", stem: $2 } /* t: 1val1languageStemMinuslanguageStem3 */ : $2 // t: 1val1languageStemMinuslanguage3
    ;

include:
      '&' tripleExprLabel	-> yy.addSourceMap($2) // Inclusion // t: 2groupInclude1
    ;

annotation:
      "//" predicate _O_Qiri_E_Or_Qliteral_E_C	-> { type: "Annotation", predicate: $2, object: $3 } // t: 1dotAnnotIRIREF
    ;

_O_Qiri_E_Or_Qliteral_E_C:
      iri	// t: 1dotAnnotIRIREF
    | literal	// t: 1dotAnnotSTRING_LITERAL1
    ;

semanticActions:
      _QcodeDecl_E_Star	-> $1.length ? { semActs: $1 } : null // t: 1dotCode1/2oneOfDot
    ;

_QcodeDecl_E_Star:
      	-> [] // t: 1dot, 1dotCode1
    | _QcodeDecl_E_Star codeDecl	-> appendTo($1, $2) // t: 1dotCode1
    ;

codeDecl:
     // XXX '%' CODE	-> unescapeSemanticAction("", $2) // t: 1dotUnlabeledCode1
      '%' iri _O_QCODE_E_Or_QGT_MODULO_E_C	
        -> $3 ? unescapeSemanticAction($2, $3) /* t: 1dotCode1 */ : { type: "SemAct", name: $2 } // t: 1dotNoCode1
    ;

_O_QCODE_E_Or_QGT_MODULO_E_C:
      CODE	
    | '%'	-> null
    ;

literal:
      rdfLiteral	
    | numericLiteral	
    | booleanLiteral	
    ;

predicate:
      iri	// t: 1dot
    | 'a'	-> RDF_TYPE // t: 1AvalA
    ;

datatype:
      iri	
    ;

shapeExprLabel:
      iri	// t: 1dot
    | blankNode	// t: 1dotInline1
    ;

tripleExprLabel:
      iri	// t: 1val1vcrefIRIREF
    | blankNode	// t: 1val1vcrefbnode
    ;

numericLiteral:
      INTEGER	-> createLiteral($1, XSD_INTEGER) // t: 1val1INTEGER
    | DECIMAL	-> createLiteral($1, XSD_DECIMAL) // t: 1val1DECIMAL
    | DOUBLE	-> createLiteral($1, XSD_DOUBLE) // t: 1val1DOUBLE
    ;

rdfLiteral:
      langString	// t: 1val1STRING_LITERAL1
    | string _Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt	-> $2 ? extend($1, { type: $2 }) : $1 // t: 1val1Datatype
    ;

_O_QGT_DTYPE_E_S_Qdatatype_E_C:
      "^^" datatype	-> $2
    ;

_Q_O_QGT_DTYPE_E_S_Qdatatype_E_C_E_Opt:
      	-> null
    | _O_QGT_DTYPE_E_S_Qdatatype_E_C	
    ;

booleanLiteral:
      IT_true	-> { value: "true", type: XSD_BOOLEAN } // t: 1val1true
    | IT_false	-> { value: "false", type: XSD_BOOLEAN } // t: 1val1false
    ;

string:
      STRING_LITERAL1	-> unescapeString($1, 1)	// t: 1val1STRING_LITERAL2
    | STRING_LITERAL_LONG1	-> unescapeString($1, 3)	// t: 1val1STRING_LITERAL1
    | STRING_LITERAL2	-> unescapeString($1, 1)	// t: 1val1STRING_LITERAL_LONG2
    | STRING_LITERAL_LONG2	-> unescapeString($1, 3)	// t: 1val1STRING_LITERAL_LONG1
    ;

langString:
      LANG_STRING_LITERAL1	-> unescapeLangString($1, 1)	// t: @@
    | LANG_STRING_LITERAL_LONG1	-> unescapeLangString($1, 3)	// t: @@
    | LANG_STRING_LITERAL2	-> unescapeLangString($1, 1)	// t: 1val1LANGTAG
    | LANG_STRING_LITERAL_LONG2	-> unescapeLangString($1, 3)	// t: 1val1STRING_LITERAL_LONG2_with_LANGTAG
    ;

iri:
      IRIREF	{ // t: 1dot
        const unesc = ShExUtil.unescapeText($1.slice(1,-1), {});
        $$ = yy._base === null || absoluteIRI.test(unesc) ? unesc : yy._resolveIRI(unesc)
      }
    | prefixedName	
    ;

prefixedName:
      PNAME_LN	{ // t:1dotPNex, 1dotPNdefault, ShExParser-test.js/with pre-defined prefixes
        const namePos1 = $1.indexOf(':');
        $$ = yy.expandPrefix($1.substr(0, namePos1), yy) + ShExUtil.unescapeText($1.substr(namePos1 + 1), pnameEscapeReplacements);
      }
    | PNAME_NS	{ // t: 1dotNS2, 1dotNSdefault, ShExParser-test.js/PNAME_NS with pre-defined prefixes
        $$ = yy.expandPrefix($1.substr(0, $1.length - 1), yy);
      }
    ;

blankNode:
      BLANK_NODE_LABEL	// t: 1dotInline1
    ;

extension:
      _O_QIT_EXTENDS_E_Or_QGT_AMP_E_C extendsShapeExpression	-> $2 // t: 0Extends1, 1dotExtends1, 1dot3ExtendsLN
    ;

extendsShapeExpression:
      extendsShapeOr	
    ;

extendsShapeOr:
      extendsShapeAnd _Q_O_QIT_OR_E_S_QextendsShapeAnd_E_C_E_Star	-> shapeJunction("ShapeOr", $1, $2)
    ;

_O_QIT_OR_E_S_QextendsShapeAnd_E_C: // IT_OR extendsShapeAnd
      IT_OR extendsShapeAnd	-> $2
    ;

_Q_O_QIT_OR_E_S_QextendsShapeAnd_E_C_E_Star: // (IT_OR extendsShapeAnd)*
      	-> []
    | _Q_O_QIT_OR_E_S_QextendsShapeAnd_E_C_E_Star _O_QIT_OR_E_S_QextendsShapeAnd_E_C	-> $1.concat($2)
    ;

extendsShapeAnd:
      extendsShapeNot _Q_O_QIT_AND_E_S_QextendsShapeNot_E_C_E_Star	-> shapeJunction("ShapeAnd", $1, $2)
    ;

_O_QIT_AND_E_S_QextendsShapeNot_E_C: // IT_AND extendsShapeNot
      IT_AND extendsShapeNot	-> $2
    ;

_Q_O_QIT_AND_E_S_QextendsShapeNot_E_C_E_Star: // (IT_AND extendsShapeNot)*
      	-> []
    | _Q_O_QIT_AND_E_S_QextendsShapeNot_E_C_E_Star _O_QIT_AND_E_S_QextendsShapeNot_E_C	-> $1.concat($2)
    ;

extendsShapeNot: // IT_NOT? extendsShapeAtom
      _QIT_NOT_E_Opt extendsShapeAtom	-> $1 ? { type: "ShapeNot", "shapeExpr": nonest($2) } : $2
    ;

extendsShapeAtom:
      nonLitInlineNodeConstraint inlineShapeOrRef	// _QinlineShapeOrRef_E_Opt	
        -> $2 ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $1), $2 ] } : $1
    | litInlineNodeConstraint	
    | inlineShapeOrRef _QnonLitInlineNodeConstraint_E_Opt	
        -> $2 ? { type: "ShapeAnd", shapeExprs: [ extend({ type: "NodeConstraint" }, $1), $2 ] } : $1
    | '(' shapeExpression ')'	-> Object.assign($2, {nested: true})
    | '.'	-> yy.EmptyShape
    ;

_O_QIT_EXTENDS_E_Or_QGT_AMP_E_C:
      IT_EXTENDS	
    | '&'	
    ;

restriction:
      _O_QIT_RESTRICTS_E_Or_QGT_MINUS_E_C shapeOrRef	-> $2 // t: @@1dotSpecialize1, @@1dot3Specialize, @@1dotSpecialize3
    ;

_O_QIT_RESTRICTS_E_Or_QGT_MINUS_E_C:
      IT_RESTRICTS	
    | '-'	
    ;

