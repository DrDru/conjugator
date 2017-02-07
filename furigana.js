var furiganize = function(word, furigana) {
  var result = [];
  furigana.forEach(function(element, index) {
    console.log('Element: ' + element + ', index: ' + index);
    if (element == '') {
      result.push(word[index])
    } else {
      result.push('<ruby>' + word[index] + '<rp>(</rp><rt>' + element + '</rt><rp>)</rp></ruby>');
    }
  });
  return result.join('');
};
