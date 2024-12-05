const UNITS = {
  length: ['miles', 'kilometers', 'meters', 'feet', 'inches', 'centimeters'],
  weight: ['pounds', 'kilograms', 'grams', 'ounces'],
  temperature: ['Fahrenheit', 'Celsius', 'Kelvin'],
  volume: ['gallons', 'liters', 'milliliters', 'fluid ounces'],
};

function createConversionRow(conversion = { from: '', to: '', enabled: true }) {
  const row = document.createElement('div');
  row.className = 'conversion-row';
  
  const enabledCheckbox = document.createElement('input');
  enabledCheckbox.type = 'checkbox';
  enabledCheckbox.checked = conversion.enabled;
  enabledCheckbox.className = 'enabled-checkbox';
  
  const fromSelect = document.createElement('select');
  const toSelect = document.createElement('select');
  
  const allUnits = Object.values(UNITS).flat();
  allUnits.forEach(unit => {
    const fromOption = document.createElement('option');
    fromOption.value = unit;
    fromOption.textContent = unit;
    fromOption.selected = unit === conversion.from;
    fromSelect.appendChild(fromOption.cloneNode(true));
    
    const toOption = document.createElement('option');
    toOption.value = unit;
    toOption.textContent = unit;
    toOption.selected = unit === conversion.to;
    toSelect.appendChild(toOption);
  });
  
  const removeButton = document.createElement('button');
  removeButton.textContent = '×';
  removeButton.className = 'remove-button';
  removeButton.onclick = () => row.remove();
  
  row.appendChild(enabledCheckbox);
  row.appendChild(fromSelect);
  row.appendChild(document.createTextNode(' to '));
  row.appendChild(toSelect);
  row.appendChild(removeButton);
  
  return row;
}

function saveConversions() {
  const conversions = [];
  document.querySelectorAll('.conversion-row').forEach(row => {
    conversions.push({
      enabled: row.querySelector('.enabled-checkbox').checked,
      from: row.querySelector('select:first-of-type').value,
      to: row.querySelector('select:last-of-type').value
    });
  });
  chrome.storage.local.set({ conversions }, () => {
    chrome.tabs.reload();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('conversions-container');
  
  chrome.storage.local.get(['conversions'], (result) => {
    const savedConversions = result.conversions || [
      { from: 'miles', to: 'kilometers', enabled: true },
      { from: 'pounds', to: 'kilograms', enabled: true },
      { from: 'Fahrenheit', to: 'Celsius', enabled: true }
    ];
    
    savedConversions.forEach(conversion => {
      container.appendChild(createConversionRow(conversion));
    });
  });
  
  document.getElementById('addConversion').onclick = () => {
    container.appendChild(createConversionRow());
  };
  
  container.addEventListener('change', saveConversions);
});