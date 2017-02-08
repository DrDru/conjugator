'use strict';

var KANA_FAMILY = {
    V: ['わ','い','う','え','お'],

    K: ['か','き','く','け','こ'],
    G: ['が','ぎ','ぐ','げ','ご'],

    H: ['は','ひ','ふ','へ','ほ'],
    B: ['ば','び','ぶ','べ','ぼ'],
    P: ['ぱ','ぴ','ぷ','ぺ','ぽ'],

    S: ['さ','し','す','せ','そ'],
    Z: ['ざ','じ','ず','ぜ','ぞ'],

    T: ['た','ち','つ','て','と'],
    D: ['だ','ぢ','づ','で','ど'],

    N: ['な','に','ぬ','ね','の'],
    M: ['ま','み','む','め','も'],
    R: ['ら','り','る','れ','ろ'],
    Y: ['や', null, 'ゆ', null, 'よ']
};

// Returns the word without the last kana
function trimLast(word) {
  return word.substring(0, word.length - 1);
}

function snipLast(word) {
  return word.substr(-1);
}

function Modifier(flags, modFunc) {
  if (this instanceof Modifier == false) {
    return new Modifier(flags, modFunc);
  }
  try {
    this.flag = flags.map(function(f) { return f[1]; });
    this.description = flags.map(function(f) { return f[0]; });
    this.toApply = modFunc;
  } catch (e) {
    console.error(flags, modFunc);
  }
}

var Mogrify = {
  _mog: function(kana, index) {
    var base;
    for (base in KANA_FAMILY) {
      if (KANA_FAMILY[base].indexOf(kana) != -1) {
        return KANA_FAMILY[base][index];
      }
    }
    console.error("No mogrification for kana: " + kana);
  },
  A: function(kana) {
    return Mogrify._mog(kana, 0);
  },
  I: function(kana) {
    return Mogrify._mog(kana, 1);
  },
  U: function(kana) {
    return Mogrify._mog(kana, 2);
  },
  E: function(kana) {
    return Mogrify._mog(kana, 3);
  },
  O: function(kana) {
    return Mogrify._mog(kana, 4);
  },
};

var godan_te = function(w) {
  var e, l = snipLast(w);
  switch (l) {
    case 'す':
      e = 'して';
      break;
    case 'く':
      e = 'いて';
      break;
    case 'ぐ':
      e = 'いで';
      break;
    case 'ぬ':
    case 'ぶ':
    case 'む':
      e = 'んで';
      break;
    case 'る':
    case 'つ':
    case 'う':
      e = 'って';
      break;
    default:
      console.error('No te conj for: ' + l);
  }
  return trimLast(w) + e;
};

var ModTypes = {
  BASE:             ['', 'base'],
  FORMAL:           ['Formal', 'formal'],
  INFORMAL:         ['Informal', 'informal'],
  PAST:             ['Past', 'past'],
  NEGATIVE:         ['Negative' ,'negative'],
  TE:               ['て-form', 'verbte'],
  WANTING:          ['Wanting', 'wanting'],
  VOLITIONAL:       ['Volitional', 'volitional'],
  POTENTIAL:        ['Potential', 'potential'],
  CAUSATIVE:        ['Causative', 'causative'],
  PASSIVE:          ['Passive', 'passive'],
  PROGRESSIVE:      ['Progressive', 'progressive'],
  IMPERATIVE:       ['Imperative', 'imperative'],
  // PROBABLE: ['Probable', 'probable'],
  CONDITIONAL_BA:   ['Conditional (-ば)', 'conditional_ba'],
  CONDITIONAL_TARA: ['Conditional (-たら)', 'conditional_tara']
};

var ICHIDAN = [
  // informal indicative
  Modifier([ModTypes.INFORMAL], function(w) {
    return w;
  }),
  // informal progressive
  Modifier([ModTypes.INFORMAL, ModTypes.PROGRESSIVE], function(w) {
    return trimLast(w) + 'ている';
  }),
  // informal volitional
  Modifier([ModTypes.INFORMAL, ModTypes.VOLITIONAL], function(w) {
    return trimLast(w) + 'よう';
  }),
  // informal imperative
  Modifier([ModTypes.INFORMAL, ModTypes.IMPERATIVE], function(w) {
    return trimLast(w) + 'ろ';
  }),
  // informal potential
  Modifier([ModTypes.INFORMAL, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + 'られる';
  }),
  // informal conditional (reba)
  Modifier([ModTypes.INFORMAL, ModTypes.CONDITIONAL_BA], function(w) {
    return trimLast(w) + 'れば';
  }),
  // informal conditional (tara)
  Modifier([ModTypes.INFORMAL, ModTypes.CONDITIONAL_TARA], function(w) {
    return trimLast(w) + 'たら';
  }),
  // informal passive
  Modifier([ModTypes.INFORMAL, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + 'られる';
  }),
  // informal causative
  Modifier([ModTypes.INFORMAL, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + 'させる';
  }),
  // informal negative indicative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE], function(w) {
    return trimLast(w) + 'ない';
  }),
  // informal negative progressive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PROGRESSIVE], function(w) {
    return trimLast(w) + 'ていない';
  }),
  // informal negative imperative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.IMPERATIVE], function(w) {
    return trimLast(w) + 'るな';
  }),
  // informal negative volitional
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.VOLITIONAL], function(w) {
    return trimLast(w) + 'まい';
  }),
  // informal negative potential
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + 'られない';
  }),
  // informal negative conditional (reba)
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CONDITIONAL_BA], function(w) {
    return trimLast(w) + 'なければ';
  }),
  // informal negative conditional (tara)
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CONDITIONAL_TARA], function(w) {
    return trimLast(w) + 'なかったら';
  }),
  // informal negative passive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + 'られない';
  }),
  // informal negative causative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + 'させない';
  }),
  // informal past indicative
  Modifier([ModTypes.INFORMAL, ModTypes.PAST], function(w) {
    return trimLast(w) + 'た';
  }),
  // informal past progressive
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return trimLast(w) + 'ていた';
  }),
  // informal past potential
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + 'られた';
  }),
  // informal past passive
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + 'られた';
  }),
  // informal past causative
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + 'させた';
  }),
  // informal negative past indicative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
    return trimLast(w) + 'なかった';
  }),
  // informal negative past progressive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return trimLast(w) + 'ていなかった';
  }),
  // informal negative past potential
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + 'られなかった';
  }),
  // informal negative past passive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + 'られなかった';
  }),
  // informal negative past causative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + 'させなかった';
  }),
  // polite indicative
  Modifier([ModTypes.FORMAL], function(w) {
    return trimLast(w) + 'ます';
  }),
  // polite progressive
  Modifier([ModTypes.FORMAL, ModTypes.PROGRESSIVE], function(w) {
    return trimLast(w) + 'ています';
  }),
  // polite volitional
  Modifier([ModTypes.FORMAL, ModTypes.VOLITIONAL], function(w) {
    return trimLast(w) + 'ましょう';
  }),
  // polite imperative
  Modifier([ModTypes.FORMAL, ModTypes.IMPERATIVE], function(w) {
    return trimLast(w) + 'てください';
  }),
  // polite potential
  Modifier([ModTypes.FORMAL, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + 'られます';
  }),
  // polite passive
  Modifier([ModTypes.FORMAL, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + 'られます';
  }),
  // polite causative
  Modifier([ModTypes.FORMAL, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + 'させます';
  }),
  // polite past indicative
  Modifier([ModTypes.FORMAL, ModTypes.PAST], function(w) {
    return trimLast(w) + 'ました';
  }),
  // polite past progressive
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return trimLast(w) + 'ていました';
  }),
  // polite past potential
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + 'られました';
  }),
  // polite past passive
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + 'られました';
  }),
  // polite past causative
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + 'させました';
  }),
  // polite negative indicative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE], function(w) {
    return trimLast(w) + 'ません';
  }),
  // polite negative progressive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PROGRESSIVE], function(w) {
    return trimLast(w) + 'ていません';
  }),
  // polite negative potential
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + 'られません';
  }),
  // polite negative imperative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.IMPERATIVE], function(w) {
    return trimLast(w) + 'ないでください';
  }),
  // polite negative volitional
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.VOLITIONAL], function(w) {
    return trimLast(w) + 'ますまい';
  }),
  // polite negative passive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + 'られません';
  }),
  // polite negative causative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + 'させません';
  }),
  // polite negative past indicative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
    return trimLast(w) + 'ませんでした';
  }),
  // polite negative past progressive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return trimLast(w) + 'ていませんでした';
  }),
  // polite negative past potential
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + 'られませんでした';
  }),
  // polite negative past passive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + 'られませんでした';
  }),
  // polite negative past causative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + 'させませんでした';
  }),
  // te
  Modifier([ModTypes.TE], function(w) {
    return trimLast(w) + 'て';
  }),
  // wanting
  Modifier([ModTypes.WANTING], function(w) {
    return trimLast(w) + 'たい';
  }),
  // past wanting
  Modifier([ModTypes.WANTING, ModTypes.PAST], function(w) {
    return trimLast(w) + 'たかった';
  }),
  // negative wanting
  Modifier([ModTypes.WANTING, ModTypes.NEGATIVE], function(w) {
    return trimLast(w) + 'たくない';
  }),
  // negative past wanting
  Modifier([ModTypes.WANTING, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
    return trimLast(w) + 'たくなかった';
  })
];

var GODAN = [
  // informal indicative
  Modifier([ModTypes.INFORMAL], function(w) {
    return w;
  }),
  // informal progressive
  Modifier([ModTypes.INFORMAL, ModTypes.PROGRESSIVE], function(w) {
    return godan_te(w) + 'いる';
  }),
  // informal volitional
  Modifier([ModTypes.INFORMAL, ModTypes.VOLITIONAL], function(w) {
    return trimLast(w) + Mogrify.O(snipLast(w)) + 'う';
  }),
  // informal imperative
  Modifier([ModTypes.INFORMAL, ModTypes.IMPERATIVE], function(w) {
    return trimLast(w) + Mogrify.E(snipLast(w));
  }),
  // informal potential
  Modifier([ModTypes.INFORMAL, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + Mogrify.E(snipLast(w)) + 'る';
  }),
  // informal conditional (reba)
  Modifier([ModTypes.INFORMAL, ModTypes.CONDITIONAL_BA], function(w) {
    return trimLast(w) + Mogrify.E(snipLast(w)) + 'ば';
  }),
  // informal conditional (tara)
  Modifier([ModTypes.INFORMAL, ModTypes.CONDITIONAL_TARA], function(w) {
    w = godan_te(w)
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'ら';
  }),
  // informal passive
  Modifier([ModTypes.INFORMAL, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'れる';
  }),
  // informal causative
  Modifier([ModTypes.INFORMAL, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'せる';
  }),
  // informal negative indicative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'ない';
  }),
  // informal negative progressive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PROGRESSIVE], function(w) {
    return godan_te(w) + 'いない';
  }),
  // informal negative imperative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.IMPERATIVE], function(w) {
    return w + 'な';
  }),
  // informal negative volitional
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.VOLITIONAL], function(w) {
    return w + 'まい';
  }),
  // informal negative potential
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + Mogrify.E(snipLast(w)) + 'ない';
  }),
  // informal negative conditional (reba)
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CONDITIONAL_BA], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'なければ';
  }),
  // informal negative conditional (tara)
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CONDITIONAL_TARA], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'なかったら';
  }),
  // informal negative passive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'れない';
  }),
  // informal negative causative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'せない';
  }),
  // informal past indicative
  Modifier([ModTypes.INFORMAL, ModTypes.PAST], function(w) {
    w = godan_te(w)
    return trimLast(w) + Mogrify.A(snipLast(w));
  }),
  // informal past progressive
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return godan_te(w) + 'いた';
  }),
  // informal past potential
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + Mogrify.E(snipLast(w)) + 'た';
  }),
  // informal past passive
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'れた';
  }),
  // informal past causative
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'せた';
  }),
  // informal negative past indicative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'なかった';
  }),
  // informal negative past progressive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return godan_te(w) + 'いなかった';
  }),
  // informal negative past potential
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + Mogrify.E(snipLast(w)) + 'なかった';
  }),
  // informal negative past passive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'れなかった';
  }),
  // informal negative past causative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'せなかった';
  }),
  // polite indicative
  Modifier([ModTypes.FORMAL], function(w) {
    return trimLast(w) + Mogrify.I(snipLast(w)) + 'ます';
  }),
  // polite progressive
  Modifier([ModTypes.FORMAL, ModTypes.PROGRESSIVE], function(w) {
    return godan_te(w) + 'います';
  }),
  // polite volitional
  Modifier([ModTypes.FORMAL, ModTypes.VOLITIONAL], function(w) {
    return trimLast(w) + Mogrify.I(snipLast(w)) + 'ましょう';
  }),
  // polite imperative
  Modifier([ModTypes.FORMAL, ModTypes.IMPERATIVE], function(w) {
    return godan_te(w) + 'ください';
  }),
  // polite potential
  Modifier([ModTypes.FORMAL, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + Mogrify.E(snipLast(w)) + 'ます';
  }),
  // polite passive
  Modifier([ModTypes.FORMAL, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'れます';
  }),
  // polite causative
  Modifier([ModTypes.FORMAL, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'せます';
  }),
  // polite past indicative
  Modifier([ModTypes.FORMAL, ModTypes.PAST], function(w) {
    return trimLast(w) + Mogrify.I(snipLast(w)) + 'ました';
  }),
  // polite past progressive
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return godan_te(w) + 'いました';
  }),
  // polite past potential
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + Mogrify.E(snipLast(w)) + 'ました';
  }),
  // polite past passive
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'れました';
  }),
  // polite past causative
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'せました';
  }),
  // polite negative indicative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE], function(w) {
    return trimLast(w) + Mogrify.I(snipLast(w)) + 'ません';
  }),
  // polite negative progressive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PROGRESSIVE], function(w) {
    return godan_te(w) + 'いません';
  }),
  // polite negative potential
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + Mogrify.E(snipLast(w)) + 'ません';
  }),
  // polite negative imperative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.IMPERATIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'ないでください';
  }),
  // polite negative volitional
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.VOLITIONAL], function(w) {
    return trimLast(w) + Mogrify.I(snipLast(w)) + 'ますまい';
  }),
  // polite negative passive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'れません';
  }),
  // polite negative causative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'せません';
  }),
  // polite negative past indicative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
    return trimLast(w) + Mogrify.I(snipLast(w)) + 'ませんでした';
  }),
  // polite negative past progressive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return godan_te(w) + 'いませんでした';
  }),
  // polite negative past potential
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return trimLast(w) + Mogrify.E(snipLast(w)) + 'ませんでした';
  }),
  // polite negative past passive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'れませんでした';
  }),
  // polite negative past causative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return trimLast(w) + Mogrify.A(snipLast(w)) + 'せませんでした';
  }),
  // te
  Modifier([ModTypes.TE], function(w) {
    return godan_te(w);
  }),
  // wanting
  Modifier([ModTypes.WANTING], function(w) {
    return trimLast(w) + Mogrify.I(snipLast(w)) + 'たい';
  }),
  // negative wanting
  Modifier([ModTypes.WANTING, ModTypes.PAST], function(w) {
    return trimLast(w) + Mogrify.I(snipLast(w)) + 'たかった';
  }),
  // past wanting
  Modifier([ModTypes.WANTING, ModTypes.NEGATIVE], function(w) {
    return trimLast(w) + Mogrify.I(snipLast(w)) + 'たくない';
  }),
  // negative past wanting
  Modifier([ModTypes.WANTING, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
    return trimLast(w) + Mogrify.I(snipLast(w)) + 'たくなかった';
  })
];

var I_ADJECTIVE = [
  Modifier([ModTypes.FORMAL], function(w){
    return w + 'です';
  }),
  Modifier([ModTypes.PAST], function(w){
    return trimLast(w) + 'かった';
  }),
  Modifier([ModTypes.FORMAL, ModTypes.PAST], function(w){
    return trimLast(w) + 'かったです';
  }),
  Modifier([ModTypes.NEGATIVE], function(w){
    return trimLast(w) + 'くない';
  }),
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE], function(w){
    return trimLast(w) + 'くありません';
  }),
  Modifier([ModTypes.NEGATIVE, ModTypes.PAST], function(w){
    return trimLast(w) + 'くなかった';
  }),
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST], function(w){
    return trimLast(w) + 'くありませんでした';
  }),
  Modifier(ModTypes.TE, function(w){
    return trimLast(w) + 'くて';
  }),
  Modifier([ModTypes.NEGATIVE, ModTypes.TE], function(w){
    return trimLast(w) + 'くなくて';
  })
];

var NA_ADJECTIVE = [
  Modifier([ModTypes.TE], function(w){
    return w + 'で';
  }),
  Modifier([ModTypes.FORMAL], function(w){
    return w + 'です';
  }),
  Modifier([ModTypes.NEGATIVE], function(w){
    return w + 'ではない';
  }),
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE], function(w){
    return w + 'ではありません';
  }),
  Modifier([ModTypes.PAST], function(w){
    return w + 'だった';
  }),
  Modifier([ModTypes.FORMAL, ModTypes.PAST], function(w){
    return w + 'でした';
  }),
  Modifier([ModTypes.NEGATIVE, ModTypes.PAST], function(w){
    return w + 'ではなかった';
  }),
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST], function(w){
    return w + 'ではありませんでした';
  }),
  Modifier([ModTypes.TE], function(w){
    return w + 'で';
  })
];

var IRREGULAR_SURU = [
  // informal indicative
  Modifier([ModTypes.INFORMAL], function(w) {
    return 'する';
  }),
  // informal progressive
  Modifier([ModTypes.INFORMAL, ModTypes.PROGRESSIVE], function(w) {
    return 'している';
  }),
  // informal volitional
  Modifier([ModTypes.INFORMAL, ModTypes.VOLITIONAL], function(w) {
    return 'しよう';
  }),
  // informal imperative
  Modifier([ModTypes.INFORMAL, ModTypes.IMPERATIVE], function(w) {
    return 'しる';
  }),
  // informal potential
  Modifier([ModTypes.INFORMAL, ModTypes.POTENTIAL], function(w) {
    return 'できる';
  }),
  // informal conditional (reba)
  Modifier([ModTypes.INFORMAL, ModTypes.CONDITIONAL_BA], function(w) {
    return 'すれば';
  }),
  // informal conditional (tara)
  Modifier([ModTypes.INFORMAL, ModTypes.CONDITIONAL_TARA], function(w) {
    return 'したら';
  }),
  // informal passive
  Modifier([ModTypes.INFORMAL, ModTypes.PASSIVE], function(w) {
    return 'される';
  }),
  // informal causative
  Modifier([ModTypes.INFORMAL, ModTypes.CAUSATIVE], function(w) {
    return 'させる';
  }),
  // informal negative indicative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE], function(w) {
    return 'しない';
  }),
  // informal negative progressive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PROGRESSIVE], function(w) {
    return 'していない';
  }),
  // informal negative imperative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.IMPERATIVE], function(w) {
    return 'するな';
  }),
  // informal negative volitional
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.VOLITIONAL], function(w) {
    return 'するまい';
  }),
  // informal negative potential
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.POTENTIAL], function(w) {
    return 'できない';
  }),
  // informal negative conditional (reba)
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CONDITIONAL_BA], function(w) {
    return 'しないければ';
  }),
  // informal negative conditional (tara)
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CONDITIONAL_TARA], function(w) {
    return 'しないかったら';
  }),
  // informal negative passive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PASSIVE], function(w) {
    return 'されない';
  }),
  // informal negative causative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CAUSATIVE], function(w) {
    return 'させない';
  }),
  // informal past indicative
  Modifier([ModTypes.INFORMAL, ModTypes.PAST], function(w) {
    return 'した';
  }),
  // informal past progressive
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return 'していた';
  }),
  // informal past potential
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return 'できた';
  }),
  // informal past passive
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return 'された';
  }),
  // informal past causative
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return 'させた';
  }),
  // informal negative past indicative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
    return 'しなかった';
  }),
  // informal negative past progressive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return 'していなかった';
  }),
  // informal negative past potential
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return 'できなかった';
  }),
  // informal negative past passive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return 'されなかった';
  }),
  // informal negative past causative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return 'させなかった';
  }),
  // polite indicative
  Modifier([ModTypes.FORMAL], function(w) {
    return 'します';
  }),
  // polite progressive
  Modifier([ModTypes.FORMAL, ModTypes.PROGRESSIVE], function(w) {
    return 'しています';
  }),
  // polite volitional
  Modifier([ModTypes.FORMAL, ModTypes.VOLITIONAL], function(w) {
    return 'しましょう';
  }),
  // polite imperative
  Modifier([ModTypes.FORMAL, ModTypes.IMPERATIVE], function(w) {
    return 'しています';
  }),
  // polite potential
  Modifier([ModTypes.FORMAL, ModTypes.POTENTIAL], function(w) {
    return 'できます';
  }),
  // polite passive
  Modifier([ModTypes.FORMAL, ModTypes.PASSIVE], function(w) {
    return 'されます';
  }),
  // polite causative
  Modifier([ModTypes.FORMAL, ModTypes.CAUSATIVE], function(w) {
    return 'させます';
  }),
  // polite past indicative
  Modifier([ModTypes.FORMAL, ModTypes.PAST], function(w) {
    return 'しました';
  }),
  // polite past progressive
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return 'していました';
  }),
  // polite past potential
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return 'できました';
  }),
  // polite past passive
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return 'されました';
  }),
  // polite past causative
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return 'させました';
  }),
  // polite negative indicative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE], function(w) {
    return 'しません';
  }),
  // polite negative progressive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PROGRESSIVE], function(w) {
    return 'していません';
  }),
  // polite negative potential
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.POTENTIAL], function(w) {
    return 'できません';
  }),
  // polite negative imperative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.IMPERATIVE], function(w) {
    return 'しないでください';
  }),
  // polite negative volitional
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.VOLITIONAL], function(w) {
    return 'しますまい';
  }),
  // polite negative passive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PASSIVE], function(w) {
    return 'されません';
  }),
  // polite negative causative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.CAUSATIVE], function(w) {
    return 'させません';
  }),
  // polite negative past indicative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
    return 'しませんでした';
  }),
  // polite negative past progressive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return 'していませんでした';
  }),
  // polite negative past potential
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return 'できませんでした';
  }),
  // polite negative past passive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return 'されませんでした';
  }),
  // polite negative past causative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return 'させませんでした';
  }),
  // te
  Modifier([ModTypes.TE], function(w) {
    return 'して';
  }),
  // wanting
  Modifier([ModTypes.WANTING], function(w) {
    return 'したい';
  }),
  // negative wanting
  Modifier([ModTypes.WANTING, ModTypes.PAST], function(w) {
    return 'したかった';
  }),
  // past wanting
  Modifier([ModTypes.WANTING, ModTypes.NEGATIVE], function(w) {
    return 'したくない';
  }),
  // negative past wanting
  Modifier([ModTypes.WANTING, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
    return 'したくなかった';
  })
];

var IRREGULAR_KURU = [
  // informal indicative
  Modifier([ModTypes.INFORMAL], function(w) {
    return 'くる';
  }),
  // informal progressive
  Modifier([ModTypes.INFORMAL, ModTypes.PROGRESSIVE], function(w) {
    return 'きている';
  }),
  // informal volitional
  Modifier([ModTypes.INFORMAL, ModTypes.VOLITIONAL], function(w) {
    return 'こよう';
  }),
  // informal imperative
  Modifier([ModTypes.INFORMAL, ModTypes.IMPERATIVE], function(w) {
    return 'こい';
  }),
  // informal potential
  Modifier([ModTypes.INFORMAL, ModTypes.POTENTIAL], function(w) {
    return 'こられる';
  }),
  // informal conditional (reba)
  Modifier([ModTypes.INFORMAL, ModTypes.CONDITIONAL_BA], function(w) {
    return 'くれば';
  }),
  // informal conditional (tara)
  Modifier([ModTypes.INFORMAL, ModTypes.CONDITIONAL_TARA], function(w) {
    return 'きたら';
  }),
  // informal passive
  Modifier([ModTypes.INFORMAL, ModTypes.PASSIVE], function(w) {
    return 'こられる';
  }),
  // informal causative
  Modifier([ModTypes.INFORMAL, ModTypes.CAUSATIVE], function(w) {
    return 'こさせる';
  }),
  // informal negative indicative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE], function(w) {
    return 'こない';
  }),
  // informal negative progressive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PROGRESSIVE], function(w) {
    return 'きていない';
  }),
  // informal negative imperative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.IMPERATIVE], function(w) {
    return 'くるな';
  }),
  // informal negative volitional
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.VOLITIONAL], function(w) {
    return 'くるまい';
  }),
  // informal negative potential
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.POTENTIAL], function(w) {
    return 'こられない';
  }),
  // informal negative conditional (reba)
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CONDITIONAL_BA], function(w) {
    return 'こなければ';
  }),
  // informal negative conditional (tara)
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CONDITIONAL_TARA], function(w) {
    return 'こなかったら';
  }),
  // informal negative passive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PASSIVE], function(w) {
    return 'こられない';
  }),
  // informal negative causative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CAUSATIVE], function(w) {
    return 'こさせない';
  }),
  // informal past indicative
  Modifier([ModTypes.INFORMAL, ModTypes.PAST], function(w) {
    return 'きた';
  }),
  // informal past progressive
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
      return 'きていた';
  }),
  // informal past potential
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return 'こられた';
  }),
  // informal past passive
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return 'こられた';
  }),
  // informal past causative
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return 'こさせた';
  }),
  // informal negative past indicative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
    return 'こなかった';
  }),
  // informal negative past progressive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return 'きていなかった';
  }),
  // informal negative past potential
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return 'こられなかった';
  }),
  // informal negative past passive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return 'こられなかった';
  }),
  // informal negative past causative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return 'こさせなかった';
  }),
  // polite indicative
  Modifier([ModTypes.FORMAL], function(w) {
    return 'きます';
  }),
  // polite progressive
  Modifier([ModTypes.FORMAL, ModTypes.PROGRESSIVE], function(w) {
    return 'きています';
  }),
  // polite volitional
  Modifier([ModTypes.FORMAL, ModTypes.VOLITIONAL], function(w) {
    return 'きましょう';
  }),
  // polite imperative
  Modifier([ModTypes.FORMAL, ModTypes.IMPERATIVE], function(w) {
    return 'きてください';
  }),
  // polite potential
  Modifier([ModTypes.FORMAL, ModTypes.POTENTIAL], function(w) {
    return 'こられます';
  }),
  // polite passive
  Modifier([ModTypes.FORMAL, ModTypes.PASSIVE], function(w) {
    return 'こられます';
  }),
  // polite causative
  Modifier([ModTypes.FORMAL, ModTypes.CAUSATIVE], function(w) {
    return 'こさせます';
  }),
  // polite past indicative
  Modifier([ModTypes.FORMAL, ModTypes.PAST], function(w) {
    return 'きました';
  }),
  // polite past progressive
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return 'きていました';
  }),
  // polite past potential
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return 'こられました';
  }),
  // polite past passive
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return 'こられました';
  }),
  // polite past causative
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return 'こさせました';
  }),
  // polite negative indicative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE], function(w) {
    return 'きません';
  }),
  // polite negative progressive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PROGRESSIVE], function(w) {
    return 'きていません';
  }),
  // polite negative potential
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.POTENTIAL], function(w) {
    return 'こられません';
  }),
  // polite negative imperative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.IMPERATIVE], function(w) {
    return 'こないでください';
  }),
  // polite negative volitional
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.VOLITIONAL], function(w) {
    return 'きますまい';
  }),
  // polite negative passive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PASSIVE], function(w) {
    return 'こられません';
  }),
  // polite negative causative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.CAUSATIVE], function(w) {
    return 'こさせません';
  }),
  // polite negative past indicative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
    return 'きませんでした';
  }),
  // polite negative past progressive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return 'きていませんでした';
  }),
  // polite negative past potential
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return 'こられませんでした';
  }),
  // polite negative past passive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return 'こられませんでした';
  }),
  // polite negative past causative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return 'こさせませんでした';
  }),
  // te
  Modifier([ModTypes.TE], function(w) {
    return 'きて';
  }),
  // wanting
  Modifier([ModTypes.WANTING], function(w) {
    return 'きたい';
  }),
  // negative wanting
  Modifier([ModTypes.WANTING, ModTypes.PAST], function(w) {
    return 'きたかった';
  }),
  // past wanting
  Modifier([ModTypes.WANTING, ModTypes.NEGATIVE], function(w) {
    return 'きたくない';
  }),
  // negative past wanting
  Modifier([ModTypes.WANTING, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
    return 'きたくなかった';
  })
];

var TO_BE_IRU = [
    // informal indicative
    Modifier([ModTypes.INFORMAL], function(w) {
        return 'いる';
    }),
    // informal progressive
    Modifier([ModTypes.INFORMAL, ModTypes.PROGRESSIVE], function(w) {
        return 'いている';
    }),
    // informal volitional
    Modifier([ModTypes.INFORMAL, ModTypes.VOLITIONAL], function(w) {
        return 'いよう';
    }),
    // informal imperative
    Modifier([ModTypes.INFORMAL, ModTypes.IMPERATIVE], function(w) {
        return 'いろ';
    }),
    // informal potential
    Modifier([ModTypes.INFORMAL, ModTypes.POTENTIAL], function(w) {
        return 'いられる';
    }),
    // informal conditional (reba)
    Modifier([ModTypes.INFORMAL, ModTypes.CONDITIONAL_BA], function(w) {
        return 'いれば';
    }),
    // informal conditional (tara)
    Modifier([ModTypes.INFORMAL, ModTypes.CONDITIONAL_TARA], function(w) {
        return 'いたら';
    }),
    // informal passive
    Modifier([ModTypes.INFORMAL, ModTypes.PASSIVE], function(w) {
        return 'いられる';
    }),
    // informal causative
    Modifier([ModTypes.INFORMAL, ModTypes.CAUSATIVE], function(w) {
        return 'いさせる';
    }),
    // informal negative indicative
    Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE], function(w) {
        return 'いない';
    }),
    // informal negative progressive
    Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PROGRESSIVE], function(w) {
        return 'いていない';
    }),
    // informal negative imperative
    Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.IMPERATIVE], function(w) {
        return 'いるな';
    }),
    // informal negative volitional
    Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.VOLITIONAL], function(w) {
        return 'いまい';
    }),
    // informal negative potential
    Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.POTENTIAL], function(w) {
        return 'いられない';
    }),
    // informal negative conditional (reba)
    Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CONDITIONAL_BA], function(w) {
        return 'いなせれば';
    }),
    // informal negative conditional (tara)
    Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CONDITIONAL_TARA], function(w) {
        return 'いなかったら';
    }),
    // informal negative passive
    Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PASSIVE], function(w) {
        return 'いられない';
    }),
    // informal negative causative
    Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CAUSATIVE], function(w) {
        return 'いさせない';
    }),
    // informal past indicative
    Modifier([ModTypes.INFORMAL, ModTypes.PAST], function(w) {
        return 'いた';
    }),
    // informal past progressive
    Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
        return 'いていた';
    }),
    // informal past potential
    Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
        return 'いられた';
    }),
    // informal past passive
    Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
        return 'いられた';
    }),
    // informal past causative
    Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
        return 'いさせた';
    }),
    // informal negative past indicative
    Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
        return 'いなかった';
    }),
    // informal negative past progressive
    Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
        return 'いていなかった';
    }),
    // informal negative past potential
    Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
        return 'いられなかった';
    }),
    // informal negative past passive
    Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
        return 'いられなかった';
    }),
    // informal negative past causative
    Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
        return 'いさせなかった';
    }),
    // polite indicative
    Modifier([ModTypes.FORMAL], function(w) {
        return 'います';
    }),
    // polite progressive
    Modifier([ModTypes.FORMAL, ModTypes.PROGRESSIVE], function(w) {
        return 'いています';
    }),
    // polite volitional
    Modifier([ModTypes.FORMAL, ModTypes.VOLITIONAL], function(w) {
        return 'いましょう';
    }),
    // polite imperative
    Modifier([ModTypes.FORMAL, ModTypes.IMPERATIVE], function(w) {
        return 'いてください';
    }),
    // polite potential
    Modifier([ModTypes.FORMAL, ModTypes.POTENTIAL], function(w) {
        return 'いられます';
    }),
    // polite passive
    Modifier([ModTypes.FORMAL, ModTypes.PASSIVE], function(w) {
        return 'いられます';
    }),
    // polite causative
    Modifier([ModTypes.FORMAL, ModTypes.CAUSATIVE], function(w) {
        return 'いらせます';
    }),
    // polite past indicative
    Modifier([ModTypes.FORMAL, ModTypes.PAST], function(w) {
        return 'いました';
    }),
    // polite past progressive
    Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
        return 'いていました';
    }),
    // polite past potential
    Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
        return 'いられました';
    }),
    // polite past passive
    Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
        return 'いられました';
    }),
    // polite past causative
    Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
        return 'いさせました';
    }),
    // polite negative indicative
    Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE], function(w) {
        return 'いません';
    }),
    // polite negative progressive
    Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PROGRESSIVE], function(w) {
        return 'いていません';
    }),
    // polite negative potential
    Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.POTENTIAL], function(w) {
        return 'いられません';
    }),
    // polite negative imperative
    Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.IMPERATIVE], function(w) {
        return 'いないでください';
    }),
    // polite negative volitional
    Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.VOLITIONAL], function(w) {
        return 'いますまい';
    }),
    // polite negative passive
    Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PASSIVE], function(w) {
        return 'いられません';
    }),
    // polite negative causative
    Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.CAUSATIVE], function(w) {
        return 'いさせません';
    }),
    // polite negative past indicative
    Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
        return 'いませんでした';
    }),
    // polite negative past progressive
    Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
        return 'いていませんでした';
    }),
    // polite negative past potential
    Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
        return 'いられませんでした';
    }),
    // polite negative past passive
    Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
        return 'いられませんでした';
    }),
    // polite negative past causative
    Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
        return 'いさせませんでした';
    }),
    // te
    Modifier([ModTypes.TE], function(w) {
        return 'いて';
    })
];

var TO_BE_ARU = [
  // informal indicative
  Modifier([ModTypes.INFORMAL], function(w) {
    return 'ある';
  }),
  // informal progressive
  Modifier([ModTypes.INFORMAL, ModTypes.PROGRESSIVE], function(w) {
    return 'あっている';
  }),
  // informal volitional
  Modifier([ModTypes.INFORMAL, ModTypes.VOLITIONAL], function(w) {
    return 'あろう';
  }),
  // informal imperative
  Modifier([ModTypes.INFORMAL, ModTypes.IMPERATIVE], function(w) {
    return 'あれ';
  }),
  // informal potential
  Modifier([ModTypes.INFORMAL, ModTypes.POTENTIAL], function(w) {
    return 'ありうる';
  }),
  // informal conditional (reba)
  Modifier([ModTypes.INFORMAL, ModTypes.CONDITIONAL_BA], function(w) {
    return 'あれば';
  }),
  // informal conditional (tara)
  Modifier([ModTypes.INFORMAL, ModTypes.CONDITIONAL_TARA], function(w) {
    return 'あったら';
  }),
  // informal passive
  Modifier([ModTypes.INFORMAL, ModTypes.PASSIVE], function(w) {
    return 'あられる';
  }),
  // informal causative
  Modifier([ModTypes.INFORMAL, ModTypes.CAUSATIVE], function(w) {
    return 'あらせる';
  }),
  // informal negative indicative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE], function(w) {
    return 'ない';
  }),
  // informal negative progressive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PROGRESSIVE], function(w) {
    return 'あっていない';
  }),
  // informal negative imperative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.IMPERATIVE], function(w) {
    return 'あるな';
  }),
  // informal negative volitional
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.VOLITIONAL], function(w) {
    return 'あるまい';
  }),
  // informal negative potential
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.POTENTIAL], function(w) {
    return 'ありうない';
  }),
  // informal negative conditional (reba)
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CONDITIONAL_BA], function(w) {
    return 'なければ';
  }),
  // informal negative conditional (tara)
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CONDITIONAL_TARA], function(w) {
    return 'なかったら';
  }),
  // informal negative passive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PASSIVE], function(w) {
    return 'あられない';
  }),
  // informal negative causative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.CAUSATIVE], function(w) {
    return 'あらせない';
  }),
  // informal past indicative
  Modifier([ModTypes.INFORMAL, ModTypes.PAST], function(w) {
    return 'あった';
  }),
  // informal past progressive
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return 'あっていた';
  }),
  // informal past potential
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return 'ありうた';
  }),
  // informal past passive
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return 'あられた';
  }),
  // informal past causative
  Modifier([ModTypes.INFORMAL, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return 'あらせた';
  }),
  // informal negative past indicative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
    return 'なかった';
  }),
  // informal negative past progressive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return 'あっていなかった';
  }),
  // informal negative past potential
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return 'ありうなかった';
  }),
  // informal negative past passive
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return 'あられなかった';
  }),
  // informal negative past causative
  Modifier([ModTypes.INFORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return 'あらせなかった';
  }),
  // polite indicative
  Modifier([ModTypes.FORMAL], function(w) {
    return 'あります';
  }),
  // polite progressive
  Modifier([ModTypes.FORMAL, ModTypes.PROGRESSIVE], function(w) {
    return 'あっています';
  }),
  // polite volitional
  Modifier([ModTypes.FORMAL, ModTypes.VOLITIONAL], function(w) {
    return 'ありましょう';
  }),
  // polite imperative
  Modifier([ModTypes.FORMAL, ModTypes.IMPERATIVE], function(w) {
    return 'あってください';
  }),
  // polite potential
  Modifier([ModTypes.FORMAL, ModTypes.POTENTIAL], function(w) {
    return 'ありうます';
  }),
  // polite passive
  Modifier([ModTypes.FORMAL, ModTypes.PASSIVE], function(w) {
    return 'あられます';
  }),
  // polite causative
  Modifier([ModTypes.FORMAL, ModTypes.CAUSATIVE], function(w) {
    return 'あらせます';
  }),
  // polite past indicative
  Modifier([ModTypes.FORMAL, ModTypes.PAST], function(w) {
    return 'ありました';
  }),
  // polite past progressive
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return 'あっていました';
  }),
  // polite past potential
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return 'ありうました';
  }),
  // polite past passive
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return 'あられました';
  }),
  // polite past causative
  Modifier([ModTypes.FORMAL, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return 'あらせました';
  }),
  // polite negative indicative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE], function(w) {
    return 'ありません';
  }),
  // polite negative progressive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PROGRESSIVE], function(w) {
    return 'あっていません';
  }),
  // polite negative potential
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.POTENTIAL], function(w) {
    return 'ありうません';
  }),
  // polite negative imperative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.IMPERATIVE], function(w) {
    return 'ないでください';
  }),
  // polite negative volitional
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.VOLITIONAL], function(w) {
    return 'ありますまい';
  }),
  // polite negative passive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PASSIVE], function(w) {
    return 'ありうません';
  }),
  // polite negative causative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.CAUSATIVE], function(w) {
    return 'あらせません';
  }),
  // polite negative past indicative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST], function(w) {
    return 'ありませんでした';
  }),
  // polite negative past progressive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PROGRESSIVE], function(w) {
    return 'あっていませんでした';
  }),
  // polite negative past potential
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.POTENTIAL], function(w) {
    return 'ありうませんでした';
  }),
  // polite negative past passive
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.PASSIVE], function(w) {
    return 'あられませんでした';
  }),
  // polite negative past causative
  Modifier([ModTypes.FORMAL, ModTypes.NEGATIVE, ModTypes.PAST, ModTypes.CAUSATIVE], function(w) {
    return 'あらせませんでした';
  }),
  // te
  Modifier([ModTypes.TE], function(w) {
    return 'あって';
  })
];
