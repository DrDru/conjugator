function debugTerm(clickEvent) {
  var item = $(clickEvent.target).parents('.wellitem:first');
  if (item.data('done')) {
    item.data('done', false).find('.debug-out').remove();
    return;
  }

  var data = item.data();
  var term = data.term;
  var typeMods = data.type;

  var w = $('<div/>').addClass('debug-out');

  w.append("<hr />");
  typeMods.forEach(function(mod) {
    debugMod(term, mod, w);
  });

  item.append(w).data('done', true);
}

function debugMod(term, mod, w, premods) {
  var q = Question(term);
  if (premods) {
    premods.forEach(function(m) {
      q.modify([m]);
    });
  } else {
    premods = [];
  }
  var newmods = premods.filter(listCopy);
  newmods.push(mod);
  q.modify([mod], true);

  var desc = $.unique($.merge([], q.modifiers).filter(filterFalse));
  if(desc.length) {
    w.append(q.word + " - " + desc.join(', '))
        .append("<br />");
  }
}

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
        type: currentTermType,
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
