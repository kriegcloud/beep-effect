// Convert ShEx to FHIR Logical Tables

// Global configuration and control variables.
var TOGGLE_TIME = 50 // time in μsec to toggle collapsed lists.
var RENDER_DELAY = 10 // time to pause for display (horrible heuristics). Could try: .css('opacity', .99)
var BUILD_PRODUCTS = true // can disable if OWL and ShEx construction crashes.
var SUPPRESS_DUPLICATE_CLASSES = true // Don't list subclasses in parent's package.
var UPPER_UNLIMITED = '*'

const UPCLASS = 'extends up'
const KEYWORD = 'keyword'
const SHEXMI = 'http://www.w3.org/ns/shex-xmi#'
const COMMONMARK = 'https://github.com/commonmark/commonmark.js'
const CLASS_comment = 'comment'
const CLASS_pname = 'pname'
const CLASS_prefix = 'prefix'
const CLASS_localname = 'localname'
const CLASS_native = 'native'
const CLASS_literal = 'literal'
const CLASS_shapeExpr = 'shapeExpr'
const ARROW_up = '⇧'
const ARROW_down = '⇩'
const MARKED_OPTS = {
  "baseUrl": null,
  "breaks": false,
  "gfm": true,
  "headerIds": true,
  "headerPrefix": "",
  "highlight": null,
  "langPrefix": "lang-",
  "mangle": true,
  "pedantic": false,
  "renderer": Object.assign({}, window.marked.Renderer.prototype, {
    // "options": null
    heading: function(text, level, raw) {
      if (this.options.headerIds) {
        return '<h'
          + (parseInt(level) + 3) // start at h4
          + ' id="'
          + this.options.headerPrefix
          + raw.toLowerCase().replace(/[^\w]+/g, '-')
          + '">'
          + text
          + '</h'
          + (parseInt(level) + 3)
          + '>\n';
      }
      // ignore IDs
      return '<h' + level + '>' + text + '</h' + level + '>\n';
    }
  }),
  "sanitize": false,
  "sanitizer": null,
  "silent": false,
  "smartLists": false,
  "smartypants": false,
  "tables": true,
  "xhtml": false
}

var Getables = [
];

function prepareControls () {
  $("#menu-button").on("click", toggleControls);
  // $("#interface").on("change", setInterface);
  // $("#regexpEngine").on("change", toggleControls);
  // $("#validate").on("click", disableResultsAndValidate);
  // $("#clear").on("click", clearAll);
  // $("#download-results-button").on("click", downloadResults);

  $("#loadForm").dialog({
    autoOpen: false,
    modal: true,
    buttons: {
      "GET": function (evt, ui) {
        results.clear();
        var target = Getables.find(g => g.queryStringParm === $("#loadForm span").text());
        var url = $("#loadInput").val();
        var tips = $(".validateTips");
        function updateTips (t) {
          tips
            .text( t )
            .addClass( "ui-state-highlight" );
          setTimeout(function() {
            tips.removeClass( "ui-state-highlight", 1500 );
          }, 500 );
        }
        if (url.length < 5) {
          $("#loadInput").addClass("ui-state-error");
          updateTips("URL \"" + url + "\" is way too short.");
          return;
        }
        tips.removeClass("ui-state-highlight").text();
        target.cache.asyncGet(url).catch(function (e) {
          updateTips(e.message);
        });
      },
      Cancel: function() {
        $("#loadInput").removeClass("ui-state-error");
        $("#loadForm").dialog("close");
        toggleControls();
      }
    },
    close: function() {
      $("#loadInput").removeClass("ui-state-error");
      $("#loadForm").dialog("close");
      toggleControls();
    }
  });
  Getables.forEach(target => {
    var type = target.queryStringParm
    $("#load-"+type+"-button").click(evt => {
      var prefillURL = target.url ? target.url :
          target.cache.meta.base && target.cache.meta.base !== DefaultBase ? target.cache.meta.base :
          "";
      $("#loadInput").val(prefillURL);
      $("#loadForm").attr("class", type).find("span").text(type);
      $("#loadForm").dialog("open");
    });
  });

  $("#about").dialog({
    autoOpen: false,
    modal: true,
    width: "50%",
    buttons: {
      "Dismiss": dismissModal
    },
    close: dismissModal
  });

  $("#about-button").click(evt => {
    $("#about").dialog("open");
  });

  function dismissModal (evt) {
    // $.unblockUI();
    $("#about").dialog("close");
    toggleControls();
    return true;
  }

  // Prepare file uploads
  $("input.inputfile").each((idx, elt) => {
    $(elt).on("change", function (evt) {
      var reader = new FileReader();

      reader.onload = function(evt) {
        if(evt.target.readyState != 2) return;
        if(evt.target.error) {
          alert("Error while reading file");
          return;
        }
        $($(elt).attr("data-target")).val(evt.target.result);
      };

      reader.readAsText(evt.target.files[0]);
    });
  });
}

function toggleControls (evt) {
  var revealing = evt && $("#controls").css("display") !== "flex";
  $("#controls").css("display", revealing ? "flex" : "none");
  toggleControlsArrow(revealing ? "up" : "down");
  if (revealing) {
    var target = evt.target;
    while (target.tagName !== "BUTTON")
      target = target.parentElement;
    if ($("#menuForm").css("position") === "absolute") {
      $("#controls").
        css("top", 0).
        css("left", $("#menu-button").css("margin-left"));
    } else {
      var bottonBBox = target.getBoundingClientRect();
      var controlsBBox = $("#menuForm").get(0).getBoundingClientRect();
      var left = bottonBBox.right - bottonBBox.width; // - controlsBBox.width;
      $("#controls").css("top", bottonBBox.bottom).css("left", left);
    }
    $("#permalink a").attr("href", getPermalink());
  }
  return false;
}

function toggleControlsArrow (which) {
  // jQuery can't find() a prefixed attribute (xlink:href); fall back to DOM:
  if (document.getElementById("menu-button") === null)
    return;
  var down = $(document.getElementById("menu-button").
               querySelectorAll('use[*|href="#down-arrow"]'));
  var up = $(document.getElementById("menu-button").
             querySelectorAll('use[*|href="#up-arrow"]'));

  switch (which) {
  case "down":
    down.show();
    up.hide();
    break;
  case "up":
    down.hide();
    up.show();
    break;
  default:
    throw Error("toggleControlsArrow expected [up|down], got \"" + which + "\"");
  }
}

function main () {
  let $ = window.jQuery

  $('#load-file').on('change', function (evt) {
    if (!window.FileReader) {
      return // not supported
    }
    for (let i = 0; i < evt.target.files.length; ++i) {
      (function (file) {
        // Give user some interface feedback before reading.
        let div = $('<div/>', {'id': file.name}).appendTo('#loaded')
        $('<li/>').append($('<a/>', {href: '#' + file.name}).text(file.name)).appendTo('#toc')
        let status = $('<span/>').addClass('status').text('loading...')
        $('<h2/>').append(file.name, status).appendTo(div)
        window.setTimeout(() => {
          let loader = new window.FileReader()
          loader.onload = function (loadEvent) {
            if (loadEvent.target.readyState !== 2) {
              return
            }
            if (loadEvent.target.error) {
              window.alert('Error while reading file ' + file.name + ': ' + loadEvent.target.error)
              return
            }
            // This may take a long time to render.
            $('<textarea/>', {cols: 60, rows: 10}).val(loadEvent.target.result).appendTo(div)
            div.append($('<button/>').text('reparse').on('click', doIt))
            doIt()
            function doIt () {
              renderSchema(loadEvent.target.result, 'uploaded ' + file.name + ' ' + new Date().toISOString(), status, $('#namespace').val())
            }
          }
          loader.readAsText(file)
        }, RENDER_DELAY)
      })(evt.target.files[i])
    }
  })

  $('#load-url').on('change', function (evt) {
    let source = $(this).val()
    // Give user some interface feedback before reading.
    let div = $('<div/>', {'id': source}).appendTo('#loaded')
    $('<li/>').append($('<a/>', {href: '#' + source}).text(source)).appendTo('#toc')
    let status = $('<span/>').addClass('status').text('fetching...')
    $('<h2/>').append(source, status).appendTo(div)
    window.fetch(source).then(function (response) {
      if (!response.ok) {
        throw Error('got ' + response.status + ' ' + response.statusText)
      }
      return response.text()
    }).then(function (text) {
      window.setTimeout(() => {
        $('<textarea/>', {cols: 60, rows: 10}).val(text).appendTo(div)
        div.append($('<button/>').text('reparse').on('click', doIt))
        doIt()
        function doIt () {
          renderSchema(text, 'fetched ' + source + ' ' + new Date().toISOString(), status, $('#namespace').val())
        }
      }, RENDER_DELAY)
    }).catch(function (error) {
      div.append($('<pre/>').text(error)).addClass('error')
    })
    return true
  })
  prepareControls()

  function renderSchema (schemaText, source, status, namespace) {
    let shexParser = ShEx.Parser.construct($('#namespace').val())
    let schema = shexParser.parse(schemaText)
    console.dir(schema)
    let schemaBox = $('<div/>')
    $('.render').append(schemaBox)
    let packageRef = [null]
    let packageDiv = null
    schemaBox.append(
      $('<dl/>', { class: 'prolog' }).append(
        $('<dt/>').text('base'),
        $('<dd/>').text(schema.base),
        $('<dt/>').text('prefixes'),
        $('<dd/>').append(
          $('<dl/>', { class: 'prolog' }).append(
            Object.keys(schema.prefixes).reduce(
              (acc, prefix) => acc.concat(
                $('<dt/>').text(prefix),
                $('<dd/>').text(schema.prefixes[prefix])
              ), [])
          )
        )
      )
    )
    Object.keys(schema.shapes).forEach(
      (shapeLabel, idx) => {
        let last = idx === Object.keys(schema.shapes).length - 1
        let oldPackage = packageRef[0]
        let add = renderDecl(shapeLabel, packageRef)
        if (oldPackage !== packageRef[0]) {
          packageDiv = $('<section>')
          packageDiv.append($('<h2/>').text(trimStr(packageRef[0])))
          schemaBox.append(packageDiv)
          oldPackage = packageRef[0]
        }
        (packageDiv || schemaBox).append(add)
      }
    )

    function renderDecl (shapeLabel, packageRef) {
      let shapeDecl = schema.shapes[shapeLabel]
      let abstract = false
      if (shapeDecl.type === 'ShapeDecl') {
        abstract = shapeDecl.abstract
        shapeDecl = shapeDecl.shapeExpr
      }
      let declRow = $('<tr/>').append(
        $('<td/>').append(trim(shapeLabel)),
        $('<td/>'),
        $('<td/>')
      )
      let div = $('<section/>')
      div.append($('<h3/>', {id: trimStr(shapeLabel)}).append(trim(shapeLabel)))
      let shexmiAnnots = (shapeDecl.annotations || []).filter(
        a => a.predicate.startsWith(SHEXMI)
      )
      shexmiAnnots.forEach(
        a => {
          switch (a.predicate.substr(SHEXMI.length)) {
            case 'package':
              packageRef[0] = a.object.value
              break
            case 'comment':
              switch (a.object.type) {
                case COMMONMARK:
                  div.append(
                    $('<div/>', { class: CLASS_comment }).append(window.marked(
                      a.object.value, MARKED_OPTS
                    ))
                  )
                  break
                default:
                  div.append(
                    $('<pre/>', { class: CLASS_comment }).text(a.object.value)
                  )
              }
              break
            default:
              throw Error('unknown shexmi annotation: ' + a.predicate.substr(SHEXMI.length))
          }
        }
      )

      // @@ does a NodeConstraint render differently if it's in a nested vs. called from renderDecl?
      div.append($('<table/>', {class: CLASS_shapeExpr}).append(renderShapeExpr(shapeDecl, '', declRow, abstract, [])))
      return div
    }

    function renderShapeExpr (expr, lead, declRow, abstract, parents) {
      let top = declRow ? [declRow] : []
      switch (expr.type) {
      case 'Shape':
        if ('extends' in expr) {
          let exts = expr.extends.slice()

          if (declRow) {
            // Update the declRow with the first extends.
            declRow.find('td:nth-child(2)').append(ref(exts.shift()))
          }

          // Each additional extends gets its own row.
          top = top.concat(exts.map(
            ext => $('<tr/>').append(
              $('<td/>').text(lead + '│' + '   '),
              $('<td/>').append(ref(ext)),
              $('<td/>')
            )
          ))

          function ref (ext) {
            let arrow = $('<span/>', {class: UPCLASS}).text(ARROW_down)
            arrow.on('click', (evt) => inject(arrow, evt, ext, parents))
            return [arrow, $('<a/>', {href: '#' + trim(ext), class: UPCLASS}).append(trim(ext))]
          }

          function inject (arrow, evt, ext, parents) {
            let tr = $(evt.target).parent().parent()
            // let add = renderTripleExpr(schema.shapes[ext].expression, lead, false)
            let shapeDecl = schema.shapes[ext]
            if (shapeDecl.type === 'ShapeDecl') {
              shapeDecl = shapeDecl.shapeExpr
            }
            let allMyElts = []
            let add = renderShapeExpr(shapeDecl, lead, null, false, allMyElts)
            Array.prototype.splice.apply(allMyElts, [0, 0].concat(add))
            Array.prototype.splice.apply(parents, [0, 0].concat(allMyElts))
            add.forEach(elt => elt.hide())
            tr.after(add)
            add.forEach(elt => elt.show('slow'))
            arrow.off()
            arrow.text(ARROW_up)
            arrow.on('click', (evt) => remove(arrow, evt, ext, allMyElts))
            return false
          }
          function remove (arrow, evt, ext, doomed) {
            arrow.off()
            doomed.forEach(elt => elt.hide('slow', function() { elt.remove();}))
            arrow.text(ARROW_down)
            arrow.on('click', (evt) => inject(arrow, evt, ext, []))
          }
        }
        return expr.expression ? top.concat(renderTripleExpr(expr.expression, lead, true)) : top
      case 'NodeConstraint':
        if ('values' in expr) {
          return top.concat(expr.values.map(
            val => $('<tr><td></td><td style="display: list-item;">' + trimStr(val) + '</td><td></td></tr>')
          ))
        } else {
          return top.concat([$('<tr><td>...</td><td>' + JSON.stringify(expr) + '</td><td></td></tr>')])
        }
      default:
        throw Error('renderShapeExpr has no handler for ' + JSON.stringify(expr, null, 2))
      }
    }

    function renderTripleExpr(expr, lead, last) {
      switch (expr.type) {
      case 'EachOf':
        return expr.expressions.reduce(
          (acc, nested, i) => acc.concat(renderTripleExpr(nested, lead, i === expr.expressions.length - 1)), []
        )
      case 'TripleConstraint':
        let inline = renderInlineShape(expr.valueExpr)
        let predicate = trim(expr.predicate)
        let comments = (expr.annotations || []).filter(
          a => a.predicate === SHEXMI + 'comment'
        ).map(
          a => a.object.value
        )
        if (comments.length > 0) {
          predicate.attr('title', comments[0])
          console.log(predicate)
        }
        let declRow = $('<tr/>').append(
          $('<td/>').append(
            lead,
            last ? '└' :  '├',
            $('<span/>', {class: 'arrows'}).text(expr.valueExpr === undefined ? '◯' : expr.valueExpr.type === 'NodeConstraint' ? '▭' : '▻'),
            predicate
          ),
          $('<td/>').append(inline),
          $('<td/>').text(renderCardinality(expr))
        )
        let commentRows = comments.map(
          comment => $('<tr/>', {class: 'annotation'}).append(
            $('<td/>', {class: 'lines'}).text(lead + '│' + '   '),
            $('<td/>', {class: 'comment'}).text(comment)
          )
        )

        return commentRows.concat(inline === '' ? renderNestedShape(expr.valueExpr, lead + (last ? '   ' : '│') + '   ', declRow) : [declRow])
      default:
        throw Error('renderTripleExpr has no handler for ' + expr.type)
      }
    }

    function renderInlineShape (valueExpr) {
      return valueExpr === undefined
        ? '.'
        : valueExpr.type === 'Shape'
        ? ''
        : valueExpr.type === 'ShapeRef'
        ? trim(valueExpr.reference)
        : valueExpr.type === 'NodeConstraint'
        ? renderInlineNodeConstraint(valueExpr)
        : valueExpr.type === 'ShapeOr'
        ? valueExpr.shapeExprs.map(renderInlineShape).reduce(
          (acc, elt, idx) => {
            if (idx !== 0) {
              acc = acc.concat(' ', $("<span/>", { class: 'keyword'}).text("OR"), ' ')
            }
            return acc.concat(elt)
          }, []
        )
        : (() => { throw Error('renderInlineShape doesn\'t handle ' + JSON.stringify(valueExpr, null, 2)) })()
    }

    function renderInlineNodeConstraint (expr) {
      let ret = [];
      let keys = Object.keys(expr)
      let append = appender(ret)
      let take = (key) => take1(keys, key)

      take('type')
      if (take('datatype')) { append(trim(expr.datatype)) }
      if (take('values')) { append('[', expr.values.reduce(
        (acc, v, idx) => acc.concat(idx === 0 ? null : ' ', trimStr(v)), []
      ), ']') }
      if (take('nodeKind')) { append($('<span/>', { class: 'keyword'}).text(expr.nodeKind)) }
      if (keys.length) {
        throw Error('renderInlineNodeConstraint didn\'t match ' + keys.join(',') + ' in ' + JSON.stringify(expr, null, 2))
      }
      return ret

    }

    function take1 (keys, key) {
      let idx = keys.indexOf(key)
      if (idx === -1) {
        return false
      } else {
        keys.splice(idx, 1)
        return true
      }
    }

    function append1 () {
      for (let i = 1; i < arguments.length; ++i) {
        let elts = arguments[i].constructor === Array
              ? arguments[i]
              : [arguments[i]]
        elts.forEach(elt => { arguments[0].push(elt) })
      }
    }
    function appender (target) {
      return function () {
        return append1.apply(null, [target].concat([].slice.call(arguments)))
      }
    }

    function renderNestedShape (valueExpr, lead, declRow) {
      if (valueExpr.type !== 'Shape') {
        return declRow
      }
      return renderShapeExpr(valueExpr, lead, declRow, false, [])
    }

    function renderCardinality (expr) {
      let min = 'min' in expr ? expr.min : 1
      let max = 'max' in expr ? expr.max : 1
      return min === 0 && max === 1
        ? '?'
        : min === 0 && max === -1
        ? '*'
        : min === 1 && max === 1
        ? ''
        : min === 1 && max === -1
        ? '+'
        : '{' + min + ',' + max + '}'
    }

    function trim (term) {
      if (typeof term === 'object') {
        if ('value' in term)
          return $('<span/>', {class: CLASS_literal}).text('"' + term.value + '"')
        throw Error('trim ' + JSON.stringify(term))
      }
      if (term === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
        return $('<span/>', {class: KEYWORD}).text('a')
      if (term.startsWith(namespace))
        return $('<a/>', {class: CLASS_native, href: '#' + term.substr(namespace.length)}).text(term.substr(namespace.length))
      for (var prefix in schema.prefixes) {
        if (term.startsWith(schema.prefixes[prefix])) {
          return $('<span/>', {class: CLASS_pname}).append(
            $('<span/>', {class: CLASS_prefix}).text(prefix + ':'),
            $('<span/>', {class: CLASS_localname}).text(term.substr(schema.prefixes[prefix].length))
          )
          let pre = $('<span/>', {class: CLASS_prefix}).text(prefix + ':')
          let loc = $('<span/>', {class: CLASS_localname}).text(term.substr(schema.prefixes[prefix].length))
          let ret = $('<span/>', {class: CLASS_pname})
          ret.prepend(pre)
          pre.after(loc)
          return ret
          return $(`<span class="${CLASS_pname}"><span class="${CLASS_prefix}">${prefix}:</span><span class="${CLASS_localname}">${term.substr(schema.prefixes[prefix].length)}</span></span>`)
        }
      }
      return term
    }

    function trimStr (term) {
      if (typeof term === 'object') {
        if ('value' in term)
          return '"' + term.value + '"'
        if (term.type === 'IriStem') {
          return '&lt;' + term.stem + '&gt;~'
        }
        throw Error('trim ' + JSON.stringify(term))
      }
      if (term === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
        return 'a'
      if (term.startsWith(namespace))
        return term.substr(namespace.length)
      for (var prefix in schema.prefixes) {
        if (term.startsWith(schema.prefixes[prefix])) {
          return prefix + ':' + term.substr(schema.prefixes[prefix].length)
        }
      }
      return term
    }
  }
}

window.onload = main
