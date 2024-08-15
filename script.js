const mainDialog = document.getElementById('main-menu');
const mainMenuForm = mainDialog.firstElementChild;

const bindingsDialog = document.getElementById('bindings');
const bindingsForm = bindingsDialog.firstElementChild;
const bindingsList = bindingsForm.querySelector('ul');
const bindingTemplate = bindingsList.firstElementChild.content.firstElementChild;

const newBindingDialog = document.getElementById('new-binding');
const newBindingForm = newBindingDialog.firstElementChild;
const newBindingObjectLabel = newBindingForm.querySelector('.object');
const noObjectsSpan = newBindingObjectLabel.nextElementSibling;
const newBindingValueLabel = newBindingForm.querySelector('.value');
const noValuesSpan = newBindingValueLabel.nextElementSibling;

const bindingDialog = document.getElementById('binding');
const bindingForm = bindingDialog.firstElementChild;
const reassignBtn = bindingForm.querySelector('[value="reassign"]');

const selectValueDialog = document.getElementById('select-value');
const selectValueForm = selectValueDialog.firstElementChild;
const selectValueList = selectValueForm.querySelector('ul');
const selectValueTemplate = selectValueList.firstElementChild.content.firstElementChild;

const valuesDialog = document.getElementById('values');
const valuesForm = valuesDialog.firstElementChild;
const valuesList = valuesForm.querySelector('ul');
const valueTemplate = valuesList.firstElementChild.content.firstElementChild;

const newValueDialog = document.getElementById('new-value');
const newValueForm = newValueDialog.firstElementChild;

const duplicateDialog = document.getElementById('duplicate');
const duplicateForm = duplicateDialog.firstElementChild;

const valueDialog = document.getElementById('value');
const valueForm = valueDialog.firstElementChild;
const valueDatumLabel = valueForm.querySelector('.datum');
const valuePropsLabel = valueDatumLabel.nextElementSibling;
const valuePropsList = valuePropsLabel.querySelector('ul');
const valuePropsTemplate = valuePropsList.firstElementChild.content.firstElementChild;
const valueBoundLabel = valueForm.querySelector('.bound');
const valueBindingList = valueBoundLabel.querySelector('ul');
const valueBindingTemplate = valueBindingList.firstElementChild.content.firstElementChild;

const bindings = [
  { id: -1, kind: 'constant', name: 'binding1', valueId: -1 },
  { id: -2, kind: 'constant', name: 'binding2', valueId: -2 },
  { id: -3, kind: 'variable', name: 'binding3', valueId: -3 },
  { id: -4, kind: 'constant', name: 'obj', valueId: -6 },
  { id: -5, kind: 'property', name: 'a', valueId: -2, objectId: -6 },
  { id: -6, kind: 'property', name: 'b', valueId: -3, objectId: -6 },
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

window.onpointerdown = handleClickOut;
window.onchange = handleTypeChange;
mainMenuForm.onsubmit = handleMenu;
bindingsForm.onsubmit = handleBindings;
bindingForm.onsubmit = handleBinding;
selectValueForm.onsubmit = handleSelectValue;
newBindingForm.kind.onchange = showNewBindingForm;
newBindingForm.onsubmit = handleNewBinding;
valuesForm.onsubmit = handleValues;
newValueForm.onsubmit = handleNewValue;
valueForm.onsubmit = handleValue;

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
  if (btn.value == 'close') showMainMenu();
  
  if (li) e.preventDefault(), showBinding(id);
}

function handleKindChange() {
  const kind = newBindingForm.kind.value;

  newBindingObjectDiv.hidden = kind != 'property'; 
}
  
function handleNewBinding(e) {
  const btn = e.submitter;

  if (btn.value == 'create') {
    const kind = newBindingForm.kind.value;
    const objectId = +newBindingForm.object.value;
    const name = newBindingForm.name.value.trim();
    const valueId = +newBindingForm.val.value;

    if (!name) {
      newBindingForm.name.value = '';
      newBindingForm.name.focus();
      e.preventDefault();
    } else {
      createBinding(kind, name, valueId, objectId);
      showBindings();
      newBindingForm.name.value = '';
    }
  }
}

function handleBinding(e) {
  const btn = e.submitter;
  const id = bindingForm.id.value;
  const valueId = getValue(id).id;

  if (btn.value == 'value') e.preventDefault(), showValue(valueId)
  
  if (btn.value == 'reassign') e.preventDefault(), showSelectValue(id);
}

function handleSelectValue(e) {
  const btn = e.submitter;
  const id = selectValueForm.id.value;
  const li = btn.closest('li');
  const valueId = li?.dataset.id;
  
  if (valueId) {
    reassignBinding(id, valueId);
    
    if (bindingsDialog.open) showBindings();
    if (valuesDialog.open) showValues();
    if (valueDialog.open) showValue(valueForm.id.value);
    
    showBinding(id);
  }
}

function handleValues(e) {
  const btn = e.submitter;
  const li = btn.closest('li');
  const id = li?.dataset.id;

  if (btn.value == 'bindings') showBindings();
  if (btn.value == 'create') e.preventDefault(), showNewValueForm();
  if (btn.value == 'close') showMainMenu();
  if (btn.value == 'garbage') e.preventDefault(), collectGarbage(), showValues();

  if (li) e.preventDefault(), showValue(id);
}

function handleNewValue(e) {
  const btn = e.submitter;

  if (btn.value == 'create') {
    const type = newValueForm.type.value;
    const datum = newValueForm[type].value;

    newValueForm.reset();
    createValue(type, datum);
    showValues();
  }
}

function handleValue(e) {
  const btn = e.submitter;
  const li = btn.closest('li');
  const id = li?.dataset.id;

  if (id) e.preventDefault(), showBinding(id);
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

  const objectValues = values.filter(v => v.type == 'object');
  const objectOptions = objectValues.map(makeObjectOption);
  const valueOptions = values.map(makeValueOption);
  const noObjects = !objectValues.length;
  const noValues = !valueOptions.length;
  const propSelected = newBindingForm.kind.value == 'property';
  
  newBindingForm.object.replaceChildren(...objectOptions);
  newBindingForm.val.replaceChildren(...valueOptions);
  newBindingObjectLabel.hidden = !propSelected || noObjects;
  noObjectsSpan.hidden = !propSelected || !noObjects;
  newBindingValueLabel.hidden = noValues;
  noValuesSpan.hidden = !noValues;
  newBindingForm.create.disabled = propSelected && noObjects || noValues;
}

function showBinding(id) {
  bindingDialog.close();
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
  bindingForm.reassign.disabled = kind == 'constant';
  bindingForm.reassign.title = kind == 'constant' ? 'Cannot reassign constant' : '';
}

function showSelectValue(id) {
  const binding = bindings.find(b => b.id == id);
  const { kind, name, valueId } = binding;
  
  selectValueDialog.showModal();
  selectValueForm.id.value = id;
  selectValueForm.label.value = `${kind} ${name}`;

  const selectValueItems = values.map(makeValueItem);
  const currentValueItem = selectValueItems.find(item => item.dataset.id == valueId);
  const currentValueButton = currentValueItem.firstElementChild;

  selectValueList.replaceChildren(...selectValueItems);
  currentValueButton.disabled = true;
  currentValueButton.title = 'Current value';
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

function showDuplicateDialog(id) {
  duplicateDialog.showModal();

  const value = values.find(v => v.id == id);
  const { type, datum } = value;

  duplicateForm.type.value = type;
  duplicateForm.datum.value = stringifyAsStored(type, datum);
}

function showValue(id) {
  valueDialog.close();
  valueDialog.showModal();

  const value = values.find(v => v.id == id);
  const { type, datum } = value;
  const bindings = getBindings(id);
  const properties = getProperties(id);
  const noProperties = !properties.length;
  const propertyItems = properties.map(makePropertyItem);
  const bindingItems = bindings.map(makeBindingNameItem);
  
  valueForm.id.value = id;
  valueForm.type.value = type;
  valueForm.datum.value = stringifyAsStored(type, datum);
  valueDatumLabel.hidden = !noProperties;
  valuePropsLabel.hidden = noProperties;
  valueBoundLabel.hidden = !bindings.length;

  valuePropsList.replaceChildren(...propertyItems);
  valueBindingList.replaceChildren(...bindingItems);
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
  const label = kind == 'constant' ? `<u>${name}</u> =` : 
    kind == 'variable' ? `<i>${name}</i> =` : `${name}:`;

  item.dataset.id = id;
  btn.innerHTML = `${label} ${readableValue}`;
  btn.title = kind;

  return item;
}

function makeBindingNameItem(binding) {
  const { id, kind, name } = binding;

  const item = valueBindingTemplate.cloneNode(true);
  const button = item.firstElementChild;
  const label = kind == 'constant' ? `<u>${name}</u>` : 
    kind == 'variable' ? `<i>${name}</i>` : `.${name}`

  item.dataset.id = id;
  button.innerHTML = label;
  button.title = kind;
  return item;
}

function makePropertyItem(binding) {
  const { id, name, valueId } = binding;
  const value = values.find(v => v.id == valueId);
  const {type, datum} = value || {};
  const readableValue = stringifyAsExpected(type, datum);
  const item = valuePropsTemplate.cloneNode(true);
  const btn = item.firstElementChild;

  item.dataset.id = id;
  btn.innerHTML = `${name}: ${readableValue}`;

  return item;
}

function makeValueItem(value) {
  const { id, type, datum } = value;
  const item = valueTemplate.cloneNode(true);
  const btn = item.firstElementChild;

  item.dataset.id = id;

  btn.innerText = stringifyAsExpected(type, datum);

  if (getBindings(id).length) btn.classList.remove('unbound');

  return item;
}

function makeValueOption(value) {
  const { id, type, datum } = value;
  
  return new Option(stringifyAsExpected(type, datum), id);
}

function makeObjectOption(value) {
  const { id, type, datum } = value;
  const names = getBindings(id).map(b => b.name); 
  const label = names.length ? 
    `${stringifyAsExpected(type, datum)} bound to ${names.join(', ')}` :
    `unbound ${stringifyAsExpected(type, datum)}`;
  
  return new Option(label, id);
}

function createBinding(kind, name, valueId, objectId) {
  const id = ++lastId;
  const binding = { id, kind, name, valueId };

  if (kind == 'property') binding.objectId = objectId;

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
  
  const dupId = checkForDuplicateValue(datum);

  if (dupId) return showDuplicateDialog(dupId);
  
  const value = { id, type, datum };

  values.unshift(value);
}

function checkForDuplicateValue(datum) {
  const value = values.find(v => v.datum === datum);

  return value?.id;
}

function collectGarbage() {
  const boundIds = new Set(bindings.map(b => b.valueId));
  const boundValues = values.filter(v => boundIds.has(v.id));

  values.length = 0;
  values.push(...boundValues);
}

function getBindings(valueId) {
  return bindings.filter(b => b.valueId == valueId);
}

function getProperties(objectId) {
  return bindings.filter(b => b.objectId == objectId);
}

function getValue(bindingId) {
  const binding = bindings.find(b => b.id == bindingId);

  return values.find(v => v.id == binding.valueId);
}

function reassignBinding(id, valueId) {
  const binding = bindings.find(b => b.id == id);

  binding.valueId = valueId;
}

function stringifyAsExpected(type, datum) {
  if (type == 'string') return `'${datum}'`;

  if (type == 'bigint') return String(datum) + 'n';

  if (type == 'object') {
    const {id} = values.find(v => v.datum === datum);
    const {length} = bindings.filter(b => b.objectId == id);
    
    return `{${'.'.repeat(length) || ' '}}`;
  } 

  return String(datum);
}

function stringifyAsStored(type, datum) {
  if (type == 'symbol') return datum.description;

  if (type == 'object' && !Object.values(datum).length) {
    return 'empty, no properties';
  } 

  return String(datum);
}
