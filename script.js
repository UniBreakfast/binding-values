const mainDialog = document.getElementById('main-menu');
const mainMenuForm = mainDialog.firstElementChild;

const bindingsDialog = document.getElementById('bindings');
const bindingsForm = bindingsDialog.firstElementChild;
const bindingsList = bindingsForm.querySelector('ul');
const bindingTemplate = bindingsList.firstElementChild.content.firstElementChild;

const newBindingDialog = document.getElementById('new-binding');
const newBindingForm = newBindingDialog.firstElementChild;
const newBindingValueTemplate = newBindingForm.querySelector('template');

const bindingDialog = document.getElementById('binding');
const bindingForm = bindingDialog.firstElementChild;

const valuesDialog = document.getElementById('values');
const valuesForm = valuesDialog.firstElementChild;
const valuesList = valuesForm.querySelector('ul');
const valueTemplate = valuesList.firstElementChild.content.firstElementChild;

const newValueDialog = document.getElementById('new-value');
const newValueForm = newValueDialog.firstElementChild;

const valueDialog = document.getElementById('value');
const valueForm = valueDialog.firstElementChild;

const bindings = [
  { id: -1, kind: 'constant', name: 'binding1', valueId: -1 },
  { id: -2, kind: 'constant', name: 'binding2', valueId: -2 },
  { id: -3, kind: 'variable', name: 'binding3', valueId: -3 },
]

const values = [
  { id: -1, type: 'undefined', datum: undefined },
  { id: -2, type: 'number', datum: 42 },
  { id: -3, type: 'string', datum: 'hello world' },
  { id: -4, type: 'boolean', datum: false },
  { id: -5, type: 'symbol', datum: Symbol('abc') },
  { id: -6, type: 'object', datum: {} },
]

let lastId = 0;

showMainMenu();
// showBindings();

window.onclick = handleClickOut;
window.onchange = handleTypeChange;
mainMenuForm.onsubmit = handleMenu;
bindingsForm.onsubmit = handleBindings;
newBindingForm.onsubmit = handleNewBinding;
valuesForm.onsubmit = handleValues;
newValueForm.onsubmit = handleNewValue;

function handleClickOut(e) {
  if (!e.target.matches('dialog:not(#main-menu)')) return;
  
  const dialog = e.target;
  
  if (dialog) {
    dialog.close();

    const openDialog = document.querySelector('dialog[open]');
    
    if (!openDialog) showMainMenu();
  }
}

function handleTypeChange(e) {
  if (!e.target.matches('select[name="type"]')) return;

  filterLabelsByType(e.target.form);
}

function handleMenu(e) {
  const btn = e.submitter;

  if (btn.value == 'bindings') showBindings();
  if (btn.value == 'values') showValues();
}

function handleBindings(e) {
  const btn = e.submitter;
  const li = btn.closest('li');
  const id = li?.dataset.id;

  if (btn.value == 'values') showValues();
  if (btn.value == 'create') e.preventDefault(), showNewBindingForm();

  if (li) e.preventDefault(), showBinding(id);
}

function handleNewBinding(e) {
  const btn = e.submitter;

  if (btn.value == 'create') {
    const kind = newBindingForm.kind.value;
    const name = newBindingForm.name.value.trim();
    const valueId = newBindingForm.val.value;

    if (name) {
      createBinding(kind, name, valueId);
      showBindings();
    } else {
      newBindingForm.reset();
      newBindingForm.name.focus();
      e.preventDefault();
    }
  }
}

function handleValues(e) {
  const btn = e.submitter;
  const li = btn.closest('li');
  const id = li?.dataset.id;

  if (btn.value == 'bindings') showBindings();
  if (btn.value == 'create') e.preventDefault(), showNewValueForm();

  if (li) e.preventDefault(), showValue(id);
}

function handleNewValue(e) {
  const btn = e.submitter;

  if (btn.value == 'create') {
    const type = newValueForm.type.value;
    const datum = newValueForm[type].value;

    createValue(type, datum);
    showValues();
  }
}

function showMainMenu() {
  mainDialog.showModal();
}

function showBindings() {
  bindingsDialog.showModal();

  const bindingItems = bindings.map(makeBindingItem);

  bindingsList.replaceChildren(...bindingItems);
}

function showNewBindingForm() {
  newBindingDialog.showModal();

  const options = values.map(makeValueOption);
  
  newBindingForm.val.replaceChildren(...options);
}

function showBinding(id) {
  bindingDialog.showModal();

  const binding = bindings.find(b => b.id == id);
  const { kind, name, valueId } = binding;
  const value = values.find(v => v.id == valueId);
  const { type, datum } = value || {};
  const readableValue = stringifyAsExpected(type, datum);

  bindingForm.id.value = id;
  bindingForm.kind.value = kind;
  bindingForm.name.value = name;
  bindingForm.val.value = readableValue;  
}

function showValues() {
  valuesDialog.showModal();

  const valueItems = values.map(makeValueItem);

  valuesList.replaceChildren(...valueItems);
}

function showNewValueForm() {
  newValueDialog.showModal();

  filterLabelsByType(newValueForm);
}

function showValue(id) {
  valueDialog.showModal();

  const value = values.find(v => v.id == id);
  const { type, datum } = value;

  valueForm.id.value = id;
  valueForm.type.value = type;
  valueForm.datum.value = stringifyAsStored(type, datum);
}

function filterLabelsByType(form) {
  const selectedType = form.type.value;
  const labels = form.querySelectorAll('label:not(:has([name="type"]))');
  
  for (const label of labels) {
    const el = label.querySelector('[name]');
    const type = el.name;
    const matches = type == selectedType;
    
    label.hidden = !matches;
  }
}

function makeBindingItem(binding) {
  const { id, kind, name, valueId } = binding;
  const value = values.find(v => v.id == valueId);
  const {type, datum} = value || {};
  const readableValue = stringifyAsExpected(type, datum);
  const item = bindingTemplate.cloneNode(true);
  const btn = item.firstElementChild;
  const label = kind == 'constant' ? `<u>${name}</u>` : `<i>${name}</i>`;

  item.dataset.id = id;
  btn.innerHTML = `${label} = ${readableValue}`;

  return item;
}

function makeValueItem(value) {
  const { id, type, datum } = value;
  const item = valueTemplate.cloneNode(true);
  const btn = item.firstElementChild;

  item.dataset.id = id;

  btn.innerText = stringifyAsExpected(type, datum);

  return item;
}

function makeValueOption(value) {
  const { id, type, datum } = value;
  
  return new Option(stringifyAsExpected(type, datum), id);
}

function createBinding(kind, name, valueId) {
  const id = ++lastId;
  const binding = { id, kind, name, valueId };

  bindings.unshift(binding);
}

function createValue(type, datum) {
  const id = ++lastId;

  if (type == 'number') datum = Number(datum);
  if (type == 'boolean') datum = datum == 'true';
  if (type == 'undefined') datum = undefined;
  if (type == 'null') datum = null;
  if (type == 'bigint') datum = BigInt(datum);
  if (type == 'symbol') datum = Symbol(datum);
  if (type == 'object') datum = {};
  
  const value = { id, type, datum };

  values.unshift(value);
}

function stringifyAsExpected(type, datum) {
  if (type == 'string') return `'${datum}'`;

  if (type == 'bigint') return String(datum) + 'n';

  if (type == 'object') {
    if (!Object.values(datum).length) return '{  }';

    // TODO: stringify object properties
  } 

  return String(datum);
}

function stringifyAsStored(type, datum) {
  if (type == 'symbol') return datum.description;

  if (type == 'object') {
    if (!Object.values(datum).length) return 'empty, no properties';

    // TODO: stringify object properties
  } 

  return String(datum);
}
