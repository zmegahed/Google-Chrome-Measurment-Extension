const CONVERSION_FACTORS = {
  'miles-kilometers': (x) => x * 1.60934,
  'kilometers-miles': (x) => x * 0.621371,
  'feet-meters': (x) => x * 0.3048,
  'meters-feet': (x) => x * 3.28084,
  'inches-centimeters': (x) => x * 2.54,
  'centimeters-inches': (x) => x * 0.393701,
  
  'pounds-kilograms': (x) => x * 0.453592,
  'kilograms-pounds': (x) => x * 2.20462,
  'ounces-grams': (x) => x * 28.3495,
  'grams-ounces': (x) => x * 0.035274,
  
  'Fahrenheit-Celsius': (x) => ((x - 32) * 5) / 9,
  'Celsius-Fahrenheit': (x) => (x * 9/5) + 32,
  'Celsius-Kelvin': (x) => x + 273.15,
  'Kelvin-Celsius': (x) => x - 273.15,
  'Fahrenheit-Kelvin': (x) => ((x - 32) * 5/9) + 273.15,
  'Kelvin-Fahrenheit': (x) => ((x - 273.15) * 9/5) + 32,
  
  'gallons-liters': (x) => x * 3.78541,
  'liters-gallons': (x) => x * 0.264172,
  'fluid ounces-milliliters': (x) => x * 29.5735,
  'milliliters-fluid ounces': (x) => x * 0.033814
};

const UNIT_PATTERNS = {
  'miles': /(\d+(?:\.\d+)?)\s*(?:miles?|mi)/i,
  'kilometers': /(\d+(?:\.\d+)?)\s*(?:kilometers?|km)/i,
  'meters': /(\d+(?:\.\d+)?)\s*(?:meters?|m)/i,
  'feet': /(\d+(?:\.\d+)?)\s*(?:feet|foot|ft)/i,
  'inches': /(\d+(?:\.\d+)?)\s*(?:inches?|in)/i,
  'centimeters': /(\d+(?:\.\d+)?)\s*(?:centimeters?|cm)/i,
  'pounds': /(\d+(?:\.\d+)?)\s*(?:pounds?|lbs?)/i,
  'kilograms': /(\d+(?:\.\d+)?)\s*(?:kilograms?|kg)/i,
  'ounces': /(\d+(?:\.\d+)?)\s*(?:ounces?|oz)/i,
  'grams': /(\d+(?:\.\d+)?)\s*(?:grams?|g)/i,
  'Fahrenheit': /(\d+(?:\.\d+)?)\s*°?F/i,
  'Celsius': /(\d+(?:\.\d+)?)\s*°?C/i,
  'Kelvin': /(\d+(?:\.\d+)?)\s*K/i,
  'gallons': /(\d+(?:\.\d+)?)\s*(?:gallons?|gal)/i,
  'liters': /(\d+(?:\.\d+)?)\s*(?:liters?|L)/i,
  'milliliters': /(\d+(?:\.\d+)?)\s*(?:milliliters?|mL)/i,
  'fluid ounces': /(\d+(?:\.\d+)?)\s*(?:fluid ounces?|fl\.? oz)/i
};

function convertText(text, conversions) {
  conversions.forEach(conversion => {
    if (!conversion.enabled) return;
    
    const pattern = UNIT_PATTERNS[conversion.from];
    if (!pattern) return;
    
    const conversionKey = `${conversion.from}-${conversion.to}`;
    const convertValue = CONVERSION_FACTORS[conversionKey];
    if (!convertValue) return;
    
    text = text.replace(pattern, (match, number) => {
      const converted = convertValue(parseFloat(number)).toFixed(1);
      return `${match} (${converted} ${conversion.to})`;
    });
  });
  
  return text;
}

function processNode(node, conversions) {
  if (node.nodeType === Node.TEXT_NODE) {
    const originalText = node.textContent;
    const newText = convertText(originalText, conversions);
    if (originalText !== newText) {
      node.textContent = newText;
    }
  } else {
    for (const child of node.childNodes) {
      processNode(child, conversions);
    }
  }
}

chrome.storage.local.get(['conversions'], (result) => {
  const conversions = result.conversions || [];
  processNode(document.body, conversions);
});

const observer = new MutationObserver((mutations) => {
  chrome.storage.local.get(['conversions'], (result) => {
    const conversions = result.conversions || [];
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        processNode(node, conversions);
      }
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});