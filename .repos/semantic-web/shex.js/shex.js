var ShEx = {
  // Parser:       require('@shexjs/parser'),
  // ShapeMapParser: require('shape-map').Parser,
  // ShapeMap:     require('shape-map'),
  // Util:         require('@shexjs/util'),
  // Validator:    require('@shexjs/validator'),
  // Node:       require('@shexjs/node'),
  // Writer:       require('@/shexjs/writer'),
  // 'eval-simple-1err':     require('@shexjs/eval-simple-1err'),
  // 'eval-threaded-nerr': require('@shexjs/eval-threaded-nerr'),
  N3:           require('n3'),
};

if (typeof require !== 'undefined' && typeof exports !== 'undefined')
  module.exports = ShEx;

