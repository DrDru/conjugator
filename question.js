function Question(term) {
  if (!(this instanceof Question)) {
    return new Question(term);
  }
  this.word = term.kanjiRepresentation();
  this.hiragana = term.hiraganaRepresentation();
  this.modifiers = [];
}

Question.prototype.modify = function(modSet) {
  if (!modSet.length) return;
  // pick and apply a random mod
  var modifier = getRandom(modSet);

  this.word = modifier.toApply(this.word);
  if (this.hiragana) {
    this.hiragana = modifier.toApply(this.hiragana);
  }
  this.modifiers.push.apply(this.modifiers, modifier.description);
};

// Fetches a random element of an array
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
