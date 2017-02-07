// Adds an label to the options menu
function genLabel(desc) {
  var $label = $('<div/>', {class: 'option-label'});
  $label.text(desc);
  return $label;
}

// Adds an option to the options menu
function genOption(desc) {
  var $option = $('<div/>', {class: 'check-box'});
  var $input = $('<input/>', {type: 'checkbox', value: '0', id: desc, name: ''});
  $input.prop('checked', true);
  var $label = $('<label/>', {for: desc});
  $option.append($input);
  $option.append($label);
  return $option;
}

function genFullOption(target, label, opt) {
  target.append(genLabel(label));
  target.append(genOption(opt));
}
