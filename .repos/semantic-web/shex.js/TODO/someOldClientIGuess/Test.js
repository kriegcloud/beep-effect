/** @license MIT - Test.js 0.0.1 (browser build) - © ericP */
(function (test) {
(function () {

var element = null;
var classes = { };
var count = 0;

// function extend(base) {
//   if (!base) base = {};
//   for (var i = 1, l = arguments.length, arg; i < l && (arg = arguments[i] || {}); i++)
//     for (var name in arg)
//       base[name] = arg[name];
//   return base;
// }

function TestInterface(elementParm, classParm) {
  if (!(this instanceof TestInterface))
    return new TestInterface(elementParm, classParm);

  element = elementParm;
  if (classParm)
    classes = classParm;
}

/** render: run test and add to element
  @files: a FileList
*/
function render (files) {

  function processFile (f) {
    var fr = new FileReader();
    fr.onload = function (evt) {
      var append = [];
      function open (name, clss, id) {
        var elem = "<"+name;
        if (clss) elem += " class=\""+clss+"\"";
        if (id) elem += " id=\""+id+"\"";
        elem += ">";
        append.push(elem);
      }
      function close (name) {
        append.push("</"+name+">");
      }

      function escape (s) {
        return s.replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }
      function spaces () {
        var ret = [];
        for (var i = 0; i < arguments.length; ++i)
          if (arguments[i])
            ret.push(arguments[i]);
        return ret.join(" ");
      }
      function renderResult (id, className, f) {
        var text;
        var ret;
        try {
          text = f();
          ret = true;
        } catch (e) {
          className = spaces(className, classes.errorClass);
          try {
            text = e.stack;
          } catch (x) {
            text = ""+e;
          }
          ret = false;
        }
        open("pre", className, id); append.push(escape(text)); close("pre");
        return ret;
      }

      var src = evt.target.result;

      open("div", classes.itemClass, f.name); {
        open("span", classes.titleClass); append.push(encodeURIComponent(f.name)); close("span");
        open("div"); {

          var w;
          renderResult('source_'+f.name, classes.sourceClass, function () {
            return src;
          }) &&
            renderResult('writer_'+f.name, classes.writerClass, function () {
              ShExWriter().writeSchema(JSON.parse(src), function (error, text, prefixes) {
                if (error) throw error;
                else w = text;
              });
              return w;
            }) &&
            renderResult('genr8d_'+f.name, classes.genr8dClass, function () {
              return JSON.stringify(ShExParser().parse(w), null, "  ");
            });

          open("div", classes.clearClass); append.push(''); close("div");
        } close("div");
      } close("div");
      element.innerHTML += append.join('');
      ++count;
    }
    fr.readAsText(f);
  }

  for (var i = 0; i < files.length; i++)
    processFile(files[i]);
}

TestInterface.prototype = {
  // ## Public properties

  // ### `size` how many segments are pending.
  get size() {
    // Return the triple count if if was cached.
    return count;
  },

  // ## Private methods

  // ### `_addToIndex` adds a triple to a three-layered index.
  play999: function () {
    var writer = ShExWriter();
    writer.addShape({
      "type": "shape",
      "expression": {
        "type": "tripleConstraint",
        "predicate": "http://a.example/p1",
        "value": { "type": "valueClass" }
      },
      "semAct": { "http://a.example/semAct1": " code1 " }
    });
    writer.end(function (error, text, prefixes) {
      if (text)
	console.log(text, '.');
      else
	try {
	  console.dir(error);
	} catch (e) {
	  console.log("error: " + error, prefixes);
	}
    });
  },
  handleFileSelect: function(evt) {
    render(evt.target.files);
  },
  handleDragSelect: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    render(evt.dataTransfer.files);
  },
  handleDragOver: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
  },
  clearFileSelect: function(evt) {
    element.innerHTML = "";
    count = 0;
  },
};

// ## Exports

// Export the `TestInterface` class as a whole.

Test.Interface = TestInterface;

})();
})(typeof exports !== "undefined" ? exports : this.Test = {});

