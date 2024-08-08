const mainDialog = document.getElementById('main-menu');
const mainMenuForm = mainDialog.firstElementChild;

const bindingsDialog = document.getElementById('bindings');
const bindingsForm = bindingsDialog.firstElementChild;
const bindingsList = bindingsForm.querySelector('ul');
const bindingTemplate = bindingsList.firstElementChild.content.firstElementChild;

const newBindingDialog = document.getElementById('new-binding');
const newBindingForm = newBindingDialog.firstElementChild;

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
  { id: -1, name: 'binding1' },
  { id: -2, name: 'binding2' },
  { id: -3, name: 'binding3' },
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
    const name = newBindingForm.name.value.trim();

    if (name) {
      createBinding(name);
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
}

function showBinding(id) {
  bindingDialog.showModal();

  const binding = bindings.find(b => b.id == id);
  const { name } = binding;

  bindingForm.name.value = name;
  bindingForm.id.value = id;
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
  const { id, name } = binding;
  const item = bindingTemplate.cloneNode(true);
  const btn = item.firstElementChild;

  item.dataset.id = id;
  btn.innerText = name;

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

function createBinding(name) {
  const id = ++lastId;
  const binding = { id, name };

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
