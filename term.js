/**
 * An object containing all the fields needed for conjugating and rendering a term.
 *
 * @param hiragana An array containing the hiragana representation of this term. Each element of the array represents a
 *     logical "unit" of the term. If there is a kanji character for that element, it will be provided at the same index
 *     in the kanji array.
 * @param kanji An array containing all the kanji in this term, if any. The elements of this array must line up with the
 *     elements in the hiragana array.
 * @param definition The English definition of this term.
 * @constructor
 */
function Term(hiragana, kanji, definition) {
  this.hiragana_ = hiragana;
  this.kanji_ = kanji;
  this.definition_ = definition;
}

Term.prototype.definition = function() {
  return this.definition_;
};

/**
 * @returns {string} This term as a simple string containing the hiragana representation.
 */
Term.prototype.hiraganaRepresentation = function() {
  return this.hiragana_.join('');
};

/**
 * @returns {string} This term as a simple string that uses kanji where appropriate.
 */
Term.prototype.kanjiRepresentation = function() {
  var result = [];
  var hiragana = this.hiragana_;
  this.kanji_.forEach(function(element, index) {
    if (element == '') {
      result.push(hiragana[index]);
    } else {
      result.push(element);
    }
  });
  return result.join('');
};

/**
 * @returns {string} This term as an HTML fragment containing tags denoting the furigana elements, to be used in the
 *     rendering of this term.
 */
Term.prototype.furiganaRepresentation = function() {
  var result = [];
  var hiragana = this.hiragana_;
  this.kanji_.forEach(function(element, index) {
    if (element == '') {
      result.push(hiragana[index]);
    } else {
      result.push('<ruby>' + element + '<rp>(</rp><rt>' + hiragana[index] + '</rt><rp>)</rp></ruby>');
    }
  });
  return result.join('');
};

Term.prototype.render = function() {
  if ($("#opt-kanji:checked").length == 0) {
    return this.hiraganaRepresentation();
  }
  if ($("#opt-furigana:checked").length == 1 && this.kanji_) {
    return this.furiganaRepresentation();
  }
  return this.kanjiRepresentation();
};
