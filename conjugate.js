'use strict';




var STATE = {
  ASKING: 0,
  EVALUATED: 1
};
var maxTime = 30;

// game state variables
var correctAnswers = '';
var currentMultiplier = 1;
var currentState = STATE.ASKING;
var currentTerm = '';
var currentTermType = '';
var score = 0;
var time = 0;
var termSets = null;

// non-interactable UI elements
var definitionField = $('#meaning');
var grammarTypeField = $('#grammarType');
var multiplierField = $('#mult');
var questionField = $('#question-word');
var renameMe = $('#well');
var scoreField = $('#score');
var timeBar = $('#time-bar');

// interactable UI elements
var answerTextBox = $('#answer');
var optionsButton = $('#options');
var playButton = $('#play');

$(document).ready(function() {
  // When the play button is clicked
  playButton.add("#options-play").click(function() {
    nextQuestion();
    $('body')
        .removeClass('start')
        .removeClass('options')
        .addClass('game');
  });

  optionsButton.click(function() {
    $('body')
        .removeClass('start')
        .removeClass('game')
        .addClass('options');
  });

  // Bind the game logic to keyup/keydown handlers on the answer text field.
  answerTextBox.bind('keyup', function(e) {
    if (currentState == STATE.ASKING) {
      checkAnswer();
      return true;
    }
  });
  answerTextBox.bind('keydown', function(e) {
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
  renameMe.on('click', '.debug', debugTerm);

  var ids = OPTION_IDS;
  generateOptions('adjective-options', [
    ['い adjectives', ids.I_ADJ],
    ['な adjectives', ids.NA_ADJ]
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
    ['To be (いる, ある)', ids.TO_BE],
    ['Ichidan (-いる,　-える)', ids.ICHIDAN],
    ['Irregular (する,　来る)', ids.IRREGULAR],
    ['Godan', ids.GODAN]
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
  time = 100 * maxTime;

  var wordSet = pickNextTermSet();
  currentTerm = getRandom(wordSet[1]);
  currentTermType = wordSet[0];

  var question = new Question(currentTerm);
  question.modify(currentTermType);
  correctAnswers = ([question.word, question.hiragana]).filter(filterFalse);

  questionField.html(currentTerm.render());
  definitionField.html(currentTerm.definition());
  grammarTypeField.text(wordSet[2]);
  $('#mods .mod').remove();
  answerTextBox.val('');
  renameMe.data('mods', question.modifiers.map(listCopy));

  setTimeout(function() { fadeInMods(question.modifiers); }, 400);
}

// Function for animating the mods falling in
function fadeInMods(modList) {
  var mod = $('<div class="mod"/>').text(modList.shift());
  $('#mods').append(mod);
  if (modList.length > 0) {
    setTimeout(function() {
      fadeInMods(modList);
    }, 300);
  }
}

// Check if the answer is correct every time a character is typed
function checkAnswer() {
  var answer = answerTextBox.val().replace(/\s/g, '');

  if (correctAnswers.indexOf(answer) > -1) {
    currentState = STATE.EVALUATED;

    $('#answer').addClass('flash');
    setTimeout(function() {
      $('#answer').removeClass('flash');
    }, 300);

    if (time > 0) {
      score += Math.ceil(time * currentMultiplier / maxTime);
      currentMultiplier += 1;
    } else {
      currentMultiplier = 1;
    }

    addWell(answer, correctAnswers, currentTerm, true);
    scoreField.text(score);
    multiplierField.text(currentMultiplier);
  }
}

// Skips a question and shows the correct answer
function skipQuestion() {
  currentState = STATE.EVALUATED;

  time = -1;
  currentMultiplier = 1;

  multiplierField.text(currentMultiplier);
  answerTextBox.addClass('flash-red');
  timeBar.css('background', '#e74c3c');
  addWell(answerTextBox.val() || '', correctAnswers, currentTerm, false);
  answerTextBox.val(correctAnswers[0]);
  setTimeout(function() {
    answerTextBox.removeClass('flash-red');
  }, 300);
}

// Sets time remaining bar to the percentage passed in
function setTimeBar(percent) {
  timeBar.css('background-image', 'linear-gradient(to right, #3498db ' + percent + '%, #ecf0f1 ' + percent + '%)');
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
  var ids = OPTION_IDS;
  if (isSelected(ids.ICHIDAN)) {
    termSets.push([ICHIDAN, verbs_ichidan, '[ichidan] v.']);
  }
  if (isSelected(ids.GODAN)) {
    termSets.push([GODAN, verbs_godan, '[godan] v.']);
  }
  if (isSelected(ids.NA_ADJ)) {
    termSets.push([NA_ADJECTIVE, adjective_na, '[na] adj.']);
  }
  if (isSelected(ids.I_ADJ)) {
    termSets.push([I_ADJECTIVE, adjective_i, '[i] adj.']);
  }
  if (isSelected(ids.IRREGULAR)) {
    termSets.push([IRREGULAR_SURU, irregular_suru, '[irregular] v.']);
    termSets.push([IRREGULAR_KURU, irregular_kuru, '[irregular] v.']);
  }
  if (isSelected(ids.TO_BE)) {
    termSets.push([TO_BE_IRU, to_be_iru, '[to be] v.']);
    termSets.push([TO_BE_ARU, to_be_aru, '[to be] v.']);
  }

  if (!termSets.length) {
    // TODO(andrea): if user has chosen no options, throw an error here
  }

  // remove config-disabled modifiers
  filterSets(termSets);
}

function isSelected(optionName) {
  return $('#opt-' + optionName + ':checked').length == 1;
}

function checkConfig(opts) {
  var i, id;
  for (i = 0; i < opts.length; i++) {
    if (opts[i] == 'base') {
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

// Timer function called 100 times per second
function interval() {
  if (currentState == STATE.EVALUATED || time == 0) {
    return;
  }

  time = Math.max(0, time - 1);
  setTimeBar(time / timeMax);
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

// l.filter(filterFalse)
function filterFalse(it) {
  return !!it;
}

// l.map(listCopy)
function listCopy(i) {
  return i;
}
