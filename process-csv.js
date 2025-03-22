import fs from 'fs';

// Read the CSV file
const csvData = fs.readFileSync('./attached_assets/loblaws.csv', 'utf-8');

// Split the data into lines and parse the CSV
const lines = csvData.split('\n');
// Skip header
const products = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Find commas not inside quotes
  let inQuote = false;
  let commaIndexes = [];
  
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '"') {
      inQuote = !inQuote;
    } else if (line[j] === ',' && !inQuote) {
      commaIndexes.push(j);
    }
  }
  
  let name, price;
  
  if (commaIndexes.length > 0) {
    name = line.substring(0, commaIndexes[0]);
    price = line.substring(commaIndexes[0] + 1);
  } else {
    // Skip malformed lines
    continue;
  }
  
  // Remove quotes if present
  if (name.startsWith('"') && name.endsWith('"')) {
    name = name.substring(1, name.length - 1);
  }
  
  // Process price
  if (price.startsWith('$')) {
    price = price.substring(1);
  }
  
  // Convert to number
  const priceNum = parseFloat(price);
  
  if (!isNaN(priceNum) && name) {
    products.push({ name, price: priceNum });
  }
}

// Generate storage.ts code
let code = 'private initializeProducts(): void {\n';
code += '  const loblawsProducts: InsertProduct[] = [\n';

products.forEach((product, index) => {
  const barcode = (20001 + index).toString();
  code += `    { name: '${product.name.replace(/'/g, "\\'")}', price: ${product.price.toFixed(2)}, barcode: '${barcode}', imageUrl: '' },\n`;
});

code += '  ];\n\n';
code += '  loblawsProducts.forEach(product => {\n';
code += '    this.createProduct(product);\n';
code += '  });\n';
code += '}\n';

fs.writeFileSync('./loblaws-products.js', code);

console.log(`Processed ${products.length} products from the CSV file.`);