'use strict';

var score = 0;
var time = 0;
var mult = 1;
var _timeMax = 30;
var timeMax = _timeMax;
var correct = '';
var quiz_term = '';
var termType = '';
var skipped = false;
var scored = false;

$(document).ready(function() {
  // Stop the user from pressing enter in the text area
  $('textarea').bind('keypress', function(e) {
    if ((e.keyCode || e.which) == 13) {
      $(this).parents('form').submit();
      skipQuestion();
      return false;
    }
  });

  // When the play button is clicked
  $('#play').add("#optplay").click(function() {
    nextQuestion();
    $('#start-screen').animate({top: '-1000px'}, 800);
    $('#main').show();
    $('#option-menu').hide();
    $('#main').animate({'margin-top': '20px'}, 800);
    $('#title-text').animate({'width': '350px', 'font-size': '20pt', 'height': '40px', 'bottom': '5px', 'margin-bottom': '0px'}, 800);
    $('#title').animate({'height': '50px'}, 800);
    $('#ribbon img').animate({'height': '50px', 'width': '50px'}, 800);
  });

  $('#options').click(function() {
    $('#start-screen').animate({top: '-1000px'}, 800);
    $('#option-menu').show();
    $('#option-menu').animate({'margin-top': '20px'}, 800);
    $('#title-text').animate({'width': '350px', 'font-size': '20pt', 'height': '40px', 'bottom': '5px', 'margin-bottom': '0px'}, 800);
    $('#title').animate({'height': '50px'}, 800);
    $('#ribbon img').animate({'height': '50px', 'width': '50px'}, 800);
  });

  function debugTerm(e) {
    var wi = $(e.target).parents('.wellitem:first');
    if(wi.data('done'))
    {
      wi.data('done', false).find('.debug-out').remove();
      return;
    }

    var d = wi.data();
    var term = d.term;
    var typeMods = d.type;

    var w = $('<div/>')
    .addClass('debug-out');

    w.append("<hr />");
    typeMods.forEach(function(mod)
    {
      debugMod(term, mod, w);
    });

    wi.append(w).data('done', true);
  };

  function debugMod(term, mod, w, premods) {
    var q = Question({"word": term});
    if(premods)
    {
      premods.forEach(function(m)
      {
          q.modify([m]);
      });
    }
    else {
      premods = [];
    }

    var newmods = premods.filter(listCopy);
    newmods.push(mod);
    q.modify([mod], true);

    var desc = $.unique($.merge([], q.modifiers).filter(filterFalse));
    if(desc.length)
    {
      w.append(q.word + " - " + desc.join(', '))
      .append("<br />");
    }
  };

    $('#well').on('click', '.debug', debugTerm);

    var genOpts = function(id, opts) {
      opts.forEach(function(opt) {
        opt[1] = "opt-" + opt[1];
        opt.unshift($("#"+id));
        genFullOption.apply(this, opt)
      });
    };

    genOpts('adjective-options', [
      ['い adjectives', 'iadj'],
      ['な adjectives', 'naadj']
    ]);

    genOpts('conjugation-options', [
      ModTypes.FORMAL,
      ModTypes.INFORMAL,
      ModTypes.PAST,
      ModTypes.NEGATIVE,
      ModTypes.TE,
      ModTypes.IMPERATIVE,
      ModTypes.VOLITIONAL,
      ModTypes.WANTING,
      ModTypes.PROGRESSIVE,
      ModTypes.PASSIVE,
      ModTypes.POTENTIAL,
      ModTypes.CAUSATIVE,
      ModTypes.CONDITIONAL_BA,
      ModTypes.CONDITIONAL_TARA
    ]);

    genOpts('verb-options',[
      ['To be (いる, ある)', 'to_be'],
      ['Ichidan (-いる,　-える)', 'ichidan'],
      ['Irregular (する,　来る)', 'irregular'],
      ['Godan', 'godan']
    ]);

    genOpts('kanji-options',[
      ['Show and Accept Kanji', 'kanji'],
      ['Show Furigana', 'furigana'],
    ]);

    $("#option-menu input:checkbox")
    .change(function()
    {
      location.hash = configString();
    })
    .each(function(i)
    {
      $(this).data("cfg", Math.pow(2, i));
    });
    setConfig(location.hash.replace(/^\#/, ''));

});

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

// Skips a question and shows the correct answer
function skipQuestion() {
  if (skipped || scored) {
    nextQuestion();
  } else {
    skipped = true;
    scored = false;
    time = -1;
    mult = 1;
    $('#mult').text(mult);
    $('#answer').addClass('flash-red');
    $('#time-bar').css('background', '#e74c3c');
    addWell($('#answer').val() || '', correct, quiz_term, false);
    $('#answer').val(correct[0]);
    setTimeout(function() {
      $('#answer').removeClass('flash-red');
    }, 300);
  }
}

// Check if the answer is correct every time a character is typed
function checkAnswer() {
  if (skipped || scored) return;
  var ans = $('#answer').val().replace(/\s/g, '');
  if (correct.indexOf(ans) > -1 && !skipped) {
    $('#answer').addClass('flash');
    setTimeout(function(){
      $('#answer').removeClass('flash');
    }, 300);

    if (time > 0) {
      score += Math.ceil(time * mult / timeMax);
      mult += 1;
      timeMax *= 0.95;
    } else {
      mult = 1;
      timeMax = _timeMax;
    }

    addWell(ans, correct, quiz_term, true);
    $('#score').text(score);
    $('#mult').text(mult);
    scored = true;
  }
}

// Sets time remaining bar to the percentage passed in
function setTimeBar(percent) {
    $('#time-bar').css('background-image', 'linear-gradient(left, #3498db ' + percent + '%, #ecf0f1 ' + percent + '%)');
    $('#time-bar').css('background-image', '-o-linear-gradient(left, #3498db ' + percent + '%, #ecf0f1 ' + percent + '%)');
    $('#time-bar').css('background-image', '-moz-linear-gradient(left, #3498db ' + percent + '%, #ecf0f1 ' + percent + '%)');
    $('#time-bar').css('background-image', '-webkit-linear-gradient(left, #3498db ' + percent + '%, #ecf0f1 ' + percent + '%)');
    $('#time-bar').css('background-image', '-ms-linear-gradient(left, #3498db ' + percent + '%, #ecf0f1 ' + percent + '%)');
}

// Generate a new question
function nextQuestion() {
  console.clear();
  scored = false;
  skipped = false;
  setTimeBar(100);
  time = 100 * timeMax;

  var wordset = pickType(),
    type = wordset[0],
    terms = wordset[1],
    pos = wordset[2];

  var term = terms[Math.floor(Math.random() * terms.length)];
  termType = type;
  $('#part').text(pos);

  var question = new Question(term);
  question.modify(type);
  correct = ([question.word, question.hiragana]).filter(filterFalse);
  quiz_term = term.word;

  $('#question-word').html(term.render());
  $('#meaning').html(term.definition());
  $('#mods .mod').remove();
  $('#answer').val('');
  $('#well').data('mods', question.modifiers.map(listCopy));
  fadeInMods(question.modifiers);
}

// Function for animating the mods falling in
function fadeInMods(modList) {
  var $space = $('<div/>', {class: 'space'});
  $space.text('.');
  var $toAdd = $('<div/>', {class: 'mod', style: 'display:none'});
  $toAdd.text(modList.shift());
  $space.insertBefore('#mod-clear');
  $toAdd.insertBefore('#mod-clear');
  $('.space').animate({width: '0px'}, 300);
  $('.mod').fadeIn(300);
  if (modList.length > 0) {
    setTimeout(function() {
        $('.space').remove();
        fadeInMods(modList);
    }, 300);
  }
}

// Picks a type of word to make the next question about
// This function returns the object dictionary so it can be passed around easily
var sets = null
function pickType() {
    var sum = 0;
    if (sets == null) {
      sets = [];
      if ($("#opt-ichidan:checked").length) {
        sets.push([ICHIDAN, verbs_ichidan, '[ichidan] v.']);
      }
      if ($("#opt-godan:checked").length) {
        sets.push([GODAN, verbs_godan, '[godan] v.']);
      }

      // if($("#opt-irregular:checked").length)
      // {
      //   sets.push([IRREGULAR_SURU, irregular_suru, '[irregular] v.']);
      //   sets.push([IRREGULAR_KURU, irregular_kuru, '[irregular] v.']);
      // }
      //
      // if($("#opt-naadj:checked").length)
      //   sets.push([NA_ADJECTIVE, adjective_na, '[na] adj.']);
      //
      // if($("#opt-iadj:checked").length)
      //   sets.push([II_ADJECTIVE, adjective_i, '[i] adj.']);
      //
      // // keep last
      // if($("#opt-to_be:checked").length || !sets.length)
      // {
      //   sets.push([TO_BE_IRU, to_be_iru, '[to be] v.']);
      //   sets.push([TO_BE_ARU, to_be_aru, '[to be] v.']);
      // }

      // remove config-disabled modifiers
      filterSets(sets);
    }

    if (sets.length == 1)
      return sets[0];

    sets.forEach(function(s) {
      sum += s[1].length;
    });

    var rando = ~~(Math.random() * sum);
    var i = 0;
    do {
      if (rando < sets[i][1].length)
        return sets[i];
      rando -= sets[i][1].length;
      i++;
    } while (i < sets.length);
}

// Returns the word without the last kana
function trimLast(word) {
  return word.substring(0, word.length - 1);
}

function snipLast(word) {
  return word.substr(-1);
}

// Timer function called 100 times per second
function interval() {
  if (skipped || scored)
    return;

  time--;
  setTimeBar(time/timeMax);
}

var t = setInterval(interval, 10);

function addWell(actual, expected, rootword, isCorrect) {
  var mods = $('#well')
      .data('mods')
      .filter(filterFalse)
      .join(", ");

  var def = $("#meaning").text();
  if (!def) {
    return;
  }

  var w = $('<div/>')
      .addClass('wellitem')
      .data({
        type: termType,
        term: rootword
      });

  w.append(
      $("<span/>")
          .addClass("well-right")
          .addClass("mods")
          .append(def + " &mdash; ")
          .append(mods + " ")
          .append(
              $("<span/>")
                  .addClass('debug')
                  .text('≟')
                  .attr({
                    title: "Click to view conjugations."
                  })
          )
  );

  var expected_link = $("<a/>")
      .html($.unique(expected).join('<br />'))
      .addClass("answers")
      .attr({
        href: "http://jisho.org/search/" + encodeURIComponent(rootword),
        target: "jisho",
        title: "Jisho - " + rootword + " - click Show Inflections to review conjugations."
      });

  var wellLeft = $("<div />")
      .addClass("well-left")
      .append(expected_link);

  if (isCorrect) {
    w.addClass('correct').append(wellLeft);
  } else {
    if(actual.replace(/\s/g,'')) {
      wellLeft.prepend(
          $('<span/>')
              .addClass("response")
              .addClass('striken')
              .html(actual + "<br />")
      );
    }

    w.addClass('skipped')
        .append(wellLeft);
  }

  w.append(
      $('<div/>').addClass('clear')
  );

  $('#well').prepend(w);
}

function configString() {
  return $("#option-menu input:checkbox:checked")
    .map(function() {
      return $(this).data('cfg')
    })
    .toArray()
    .reduce(function(a,b) {
      return a + b;
    })
    .toString(36);
}

function setConfig(str) {
  str=""+str;
  if (!str.length) {
    return;
  }
  var bits = parseInt("" + str, 36, 10);
  $("#option-menu input:checkbox").each(
    function() {
      var bval = +$(this).data('cfg');
      $(this).prop("checked", !!(bits & bval));
    });
}

function checkConfig(opts) {
  var i, id;
  for (i = 0; i < opts.length; i++) {
    if(opts[i] == 'base') {
      continue;
    }
    id = '#opt-' + opts[i];
    if ($(id).filter(":checked").length == 0) {
      return false;
    }
  }
  return true;
}

function filterSets(sets) {
  var i = 0;
  for (i; i < sets.length; i++) {
    sets[i][0] = sets[i][0].filter(filterMod);
  }
  return sets;
}

function filterMod(mod) {
  var i, flags = mod.flag;
  return checkConfig(flags);
}

// l.filter(filterFalse)
function filterFalse(it) {
  return !!it;
}

// l.map(listCopy)
function listCopy(i) {
  return i;
}
