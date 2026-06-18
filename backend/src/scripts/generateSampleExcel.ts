import * as XLSX from 'xlsx';
import * as path from 'path';

const run = () => {
  const sampleProducts = [
    { "Product Name": "Havells Life Line FR 1.0 Sq mm Wire Red", "Product Code": "HW-10-RD", "Barcode": "8901786151035", "Category": "Wires & Cables", "Brand": "Havells", "Price": 1250 },
    { "Product Name": "Polycab Green FR 1.5 Sq mm Wire Black", "Product Code": "PW-15-BK", "Barcode": "8902891100352", "Category": "Wires & Cables", "Brand": "Polycab", "Price": 1650 },
    { "Product Name": "Anchor Roma 1 Way Switch 16A", "Product Code": "AR-SW1-16", "Barcode": "8901112001039", "Category": "Switches & Sockets", "Brand": "Anchor", "Price": 45 },
    { "Product Name": "Legrand Arteor 3 Pin Socket 6A", "Product Code": "LG-SK3-06", "Barcode": "8901234005028", "Category": "Switches & Sockets", "Brand": "Legrand", "Price": 110 },
    { "Product Name": "Philips LED Bulb 15W Cool Day Light", "Product Code": "PL-LED15-CD", "Barcode": "8901097312046", "Category": "LED & Lighting", "Brand": "Philips", "Price": 180 },
    { "Product Name": "Syska LED Panel Light 12W Neutral White", "Product Code": "SY-PL12-NW", "Barcode": "8904123518227", "Category": "LED & Lighting", "Brand": "Syska", "Price": 390 },
    { "Product Name": "Havells Single Pole MCB 10A C-Curve", "Product Code": "HM-1P10-MCB", "Barcode": "8901786301102", "Category": "Circuit Breakers (MCB)", "Brand": "Havells", "Price": 165 },
    { "Product Name": "L&T Double Pole ELCB/RCCB 63A 30mA", "Product Code": "LT-2P63-RCCB", "Barcode": "8902532102632", "Category": "Circuit Breakers (MCB)", "Brand": "L&T", "Price": 2450 },
    { "Product Name": "Precision PVC Conduit Pipe 25mm Light Duty 3m", "Product Code": "PP-CP25-LD", "Barcode": "8906001201034", "Category": "PVC Conduits", "Brand": "Precision", "Price": 72 },
    { "Product Name": "Taparia Nose Plier 6 inch", "Product Code": "TP-NP-6", "Barcode": "8901452102033", "Category": "Tools & Testers", "Brand": "Taparia", "Price": 190 }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleProducts);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  // Output path in the backend directory
  const outputPath = path.resolve(__dirname, '../../sample_products.xlsx');
  XLSX.writeFile(workbook, outputPath);
  console.log(`\nSuccessfully generated sample Excel file at:\n${outputPath}\n`);
};

run();
