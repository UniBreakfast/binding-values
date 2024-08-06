const mainDialog = document.getElementById('main-menu');
const mainMenuForm = mainDialog.firstElementChild;

const bindingsDialog = document.getElementById('bindings');
const bindingsForm = bindingsDialog.firstElementChild;
const bindingsList = bindingsForm.querySelector('ul');
const bindingTemplate = bindingsList.firstElementChild.content.firstElementChild;

const bindings = [
  { id: -1, name: 'binding1' },
  { id: -2, name: 'binding2' },
  { id: -3, name: 'binding3' },
]

// showMainMenu();
showBindings();

mainMenuForm.onsubmit = handleMenu;

function handleMenu(e) {
  const btn = e.submitter;
  
  if (btn.value == 'bindings') showBindings();
  if (btn.value == 'values') showValues();
}

function showMainMenu() {
  mainDialog.showModal();
}

function showBindings() {
  bindingsDialog.showModal();

  const bindingItems = bindings.map(makeBindingItem);
  
  bindingsList.replaceChildren(...bindingItems);
}

function makeBindingItem(binding) {
  const { id, name } = binding;
  const item = bindingTemplate.cloneNode(true);
  const btn = item.firstElementChild;
  
  item.dataset.id = id;
  btn.innerText = name;

  return item;
}
