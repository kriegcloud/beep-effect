/*
 * Test graphs.
 */
// N subjects, N objects, fully connected S->O, no self refs
exports.makeDataA = function makeDataA({subjects, objects}) {
  let n = 0;
  let nq = '';
  for(let subject = 0; subject < subjects; ++subject) {
    for(let object = 0; object < objects; ++object) {
      if(subject !== object) {
        n++;
        nq += `_:s_${subject} <ex:p> _:o_${object} .\n`;
      }
    }
  }
  return {n, data: nq};
};

// N subjects, fully connected, with self refs
exports.makeDataB = function makeDataB({subjects}) {
  let n = 0;
  let nq = '';
  for(let subject = 0; subject < subjects; ++subject) {
    for(let object = 0; object < subjects; ++object) {
      n++;
      nq += `_:s_${subject} <ex:p> _:s_${object} .\n`;
    }
  }
  return {n, data: nq};
};

// NN style, N levels of blank nodes, each level fully connected to next
exports.makeDataC = function makeDataC({counts}) {
  if(counts.length < 2) {
    throw new Error('Need more counts');
  }
  let n = 0;
  let nq = '';
  for(let level = 0; level < counts.length; ++level) {
    if((level + 1) < counts.length) {
      for(let cur = 0; cur < counts[level]; ++cur) {
        for(let next = 0; next < counts[level + 1]; ++next) {
          n++;
          nq += `_:s_${level}_${cur} <ex:p> _:s_${level + 1}_${next} .\n`;
        }
      }
    }
  }
  return {n, data: nq};
};
