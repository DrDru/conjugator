'use strict';

var time = 0;
// TOOD(andrea): why are there two of these?
var _timeMax = 30;
var timeMax = _timeMax;

var STATE = {
  ASKING: 0,
  EVALUATED: 1
};

var correctAnswers = '';
var currentMultiplier = 1;
var currentState = STATE.ASKING;
var currentTerm = '';
var currentTermType = '';
var score = 0;
var termSets = null;

$(document).ready(function() {
  // When the play button is clicked
  $('#play').add("#options-play").click(function() {
    nextQuestion();
    $('body')
        .removeClass('start')
        .removeClass('options')
        .addClass('game');
  });

  $('#options').click(function() {
    $('body')
        .removeClass('start')
        .removeClass('game')
        .addClass('options');
  });

  // Bind the game logic to keyup/keydown handlers on the answer text field.
  $('#answer').bind('keyup', function(e) {
    if (currentState == STATE.ASKING) {
      checkAnswer();
      return true;
    }
  });
  $('#answer').bind('keydown', function(e) {
    if ((e.keyCode || e.which) == 13) {
      if (currentState == STATE.ASKING) {
        skipQuestion();
      } else if (currentState == STATE.EVALUATED) {
        nextQuestion();
      }
      // swallow the keypress
      return false;
    }
  });

  // TODO(andrea): rename from well, possibly also rename "debugTerm"
  $('#well').on('click', '.debug', debugTerm);

  generateOptions('adjective-options', [
    ['い adjectives', 'iadj'],
    ['な adjectives', 'naadj']
  ]);

  generateOptions('conjugation-options', [
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

  generateOptions('verb-options',[
    ['To be (いる, ある)', 'to_be'],
    ['Ichidan (-いる,　-える)', 'ichidan'],
    ['Irregular (する,　来る)', 'irregular'],
    ['Godan', 'godan']
  ]);

  generateOptions('kanji-options',[
    ['Show and Accept Kanji', 'kanji'],
    ['Show Furigana', 'furigana'],
  ]);

  $("#option-menu input:checkbox").change(function() {
    location.hash = configString();
  }).each(function(i) {
    $(this).data("cfg", Math.pow(2, i));
  });
  setConfig(location.hash.replace(/^\#/, ''));
});

// Generate a new question
function nextQuestion() {
  console.clear();

  currentState = STATE.ASKING;

  setTimeBar(100);
  time = 100 * timeMax;

  var wordSet = pickNextTermSet();
  currentTerm = getRandom(wordSet[1]);
  currentTermType = wordSet[0];

  var question = new Question(currentTerm);
  question.modify(currentTermType);
  correctAnswers = ([question.word, question.hiragana]).filter(filterFalse);

  $('#question-word').html(currentTerm.render());
  $('#meaning').html(currentTerm.definition());
  $('#grammarType').text(wordSet[2]);
  $('#mods .mod').remove();
  $('#answer').val('');
  $('#well').data('mods', question.modifiers.map(listCopy));

  setTimeout(function() { fadeInMods(question.modifiers); }, 1000);
}

// Check if the answer is correct every time a character is typed
function checkAnswer() {
  var answer = $('#answer').val().replace(/\s/g, '');

  if (correctAnswers.indexOf(answer) > -1) {
    currentState = STATE.EVALUATED;

    $('#answer').addClass('flash');
    setTimeout(function(){
      $('#answer').removeClass('flash');
    }, 300);

    if (time > 0) {
      score += Math.ceil(time * currentMultiplier / timeMax);
      currentMultiplier += 1;
      timeMax *= 0.95;
    } else {
      currentMultiplier = 1;
      timeMax = _timeMax;
    }

    addWell(answer, correctAnswers, currentTerm, true);
    $('#score').text(score);
    $('#mult').text(currentMultiplier);
  }
}

// Skips a question and shows the correct answer
function skipQuestion() {
  currentState = STATE.EVALUATED;

  time = -1;
  currentMultiplier = 1;

  $('#mult').text(currentMultiplier);
  $('#answer').addClass('flash-red');
  $('#time-bar').css('background', '#e74c3c');
  addWell($('#answer').val() || '', correctAnswers, currentTerm, false);
  $('#answer').val(correctAnswers[0]);
  setTimeout(function() {
    $('#answer').removeClass('flash-red');
  }, 300);
}

// Sets time remaining bar to the percentage passed in
function setTimeBar(percent) {
  $('#time-bar').css('background-image', 'linear-gradient(to right, #3498db ' + percent + '%, #ecf0f1 ' + percent + '%)');
}

// Function for animating the mods falling in
function fadeInMods(modList) {
  var mod = $('<div class="mod"/>').text(modList.shift());
  $('#mods').append(mod);
  if (modList.length > 0) {
    setTimeout(function() {
      fadeInMods(modList);
    }, 250);
  }
}

// Picks a set of terms to choose the new question term from.
// This function returns the object dictionary so it can be passed around easily
function pickNextTermSet() {
  if (termSets == null) {
    initializeTermSets();
  }

  if (termSets.length == 1) {
    return termSets[0];
  }

  var totalNumberOfTerms = 0;
  termSets.forEach(function(set) {
    totalNumberOfTerms += set[1].length;
  });

  var randomNumber = Math.floor(Math.random() * totalNumberOfTerms);
  var chosenIndex = 0;
  for (var i = 0; i < termSets.length; i++) {
    var set = termSets[i];
    if (randomNumber < set[1].length) {
      break;
    }
    randomNumber -= set[1].length;
    chosenIndex++;
  }
  return termSets[chosenIndex];
}

function initializeTermSets() {
  termSets = [];
  if ($("#opt-ichidan:checked").length) {
    termSets.push([ICHIDAN, verbs_ichidan, '[ichidan] v.']);
  }
  if ($("#opt-godan:checked").length) {
    termSets.push([GODAN, verbs_godan, '[godan] v.']);
  }

  // TODO(andrea): add all this shit back when ready
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
  filterSets(termSets);
}

// Timer function called 100 times per second
function interval() {
  if (currentState == STATE.EVALUATED || time == 0) {
    return;
  }

  time = Math.max(0, time - 1);
  setTimeBar(time/timeMax);
}
var t = setInterval(interval, 10);

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
