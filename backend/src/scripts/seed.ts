import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Product from '../models/Product';

dotenv.config();

const mockProducts = [
  // Wires & Cables
  { productName: 'Havells Life Line FR 1.5 Sq mm Wire Red', productCode: 'HW-15-RD', barcode: '8901786151011', category: 'Wires & Cables', brand: 'Havells', price: 1540 },
  { productName: 'Havells Life Line FR 2.5 Sq mm Wire Black', productCode: 'HW-25-BK', barcode: '8901786151028', category: 'Wires & Cables', brand: 'Havells', price: 2450 },
  { productName: 'Polycab Green FR 1.0 Sq mm Wire Blue', productCode: 'PW-10-BL', barcode: '8902891100345', category: 'Wires & Cables', brand: 'Polycab', price: 1120 },
  { productName: 'Polycab Green FR 4.0 Sq mm Wire Green', productCode: 'PW-40-GR', barcode: '8902891400230', category: 'Wires & Cables', brand: 'Polycab', price: 3850 },
  { productName: 'Finolex 3 Core Flat Submersible Cable 2.5 mm 100m', productCode: 'FX-3C25-100', barcode: '8903567253210', category: 'Wires & Cables', brand: 'Finolex', price: 8900 },
  { productName: 'Finolex Flame Retardant 0.75 Sq mm Wire Yellow', productCode: 'FX-075-YL', barcode: '8903567075102', category: 'Wires & Cables', brand: 'Finolex', price: 850 },

  // Switches & Sockets
  { productName: 'Anchor Roma 1 Way Switch 10A', productCode: 'AR-SW1-10', barcode: '8901112001015', category: 'Switches & Sockets', brand: 'Anchor', price: 35 },
  { productName: 'Anchor Roma 2 Way Switch 10A', productCode: 'AR-SW2-10', barcode: '8901112001022', category: 'Switches & Sockets', brand: 'Anchor', price: 55 },
  { productName: 'Anchor Roma 3 Pin Socket 6/16A with Shutter', productCode: 'AR-SK3-16', barcode: '8901112002159', category: 'Switches & Sockets', brand: 'Anchor', price: 95 },
  { productName: 'Legrand Arteor 1 Way Switch 20A', productCode: 'LG-SW1-20', barcode: '8901234005011', category: 'Switches & Sockets', brand: 'Legrand', price: 180 },
  { productName: 'Legrand Arteor Universal Socket 13A', productCode: 'LG-SK-UNIV', barcode: '8901234006155', category: 'Switches & Sockets', brand: 'Legrand', price: 285 },
  { productName: 'Schneider Livia 1 Module Dummy Plate', productCode: 'SD-DP-1M', barcode: '8903241001230', category: 'Switches & Sockets', brand: 'Schneider', price: 18 },
  { productName: 'Schneider Livia Fan Regulator 2 Module', productCode: 'SD-FR-2M', barcode: '8903241002541', category: 'Switches & Sockets', brand: 'Schneider', price: 340 },

  // LED & Lighting
  { productName: 'Philips Stellar Bright LED Bulb 9W Cool Day Light', productCode: 'PL-LED9-CD', barcode: '8901097312015', category: 'LED & Lighting', brand: 'Philips', price: 110 },
  { productName: 'Philips Stellar Bright LED Bulb 12W Warm White', productCode: 'PL-LED12-WW', barcode: '8901097312039', category: 'LED & Lighting', brand: 'Philips', price: 145 },
  { productName: 'Havells Octane LED Batten 20W Cool White', productCode: 'HL-BT20-CW', barcode: '8901786520309', category: 'LED & Lighting', brand: 'Havells', price: 320 },
  { productName: 'Havells Cresta Slim LED Downlight 12W Round', productCode: 'HL-DL12-RD', barcode: '8901786521122', category: 'LED & Lighting', brand: 'Havells', price: 450 },
  { productName: 'Syska LED T5 Tube Light 18W Yellow', productCode: 'SY-T518-YL', barcode: '8904123518210', category: 'LED & Lighting', brand: 'Syska', price: 220 },

  // MCBs & Distribution
  { productName: 'Havells Euro II Single Pole MCB 16A C-Curve', productCode: 'HM-1P16-MCB', barcode: '8901786301164', category: 'Circuit Breakers (MCB)', brand: 'Havells', price: 185 },
  { productName: 'Havells Euro II Double Pole MCB 32A C-Curve', productCode: 'HM-2P32-MCB', barcode: '8901786302321', category: 'Circuit Breakers (MCB)', brand: 'Havells', price: 420 },
  { productName: 'L&T Tripper Single Pole MCB 6A B-Curve', productCode: 'LT-1P06-MCB', barcode: '8902532101062', category: 'Circuit Breakers (MCB)', brand: 'L&T', price: 140 },
  { productName: 'L&T Tripper Double Pole ELCB/RCCB 40A 30mA', productCode: 'LT-2P40-RCCB', barcode: '8902532102403', category: 'Circuit Breakers (MCB)', brand: 'L&T', price: 2150 },
  { productName: 'Schneider Easy9 8 Way Double Door DB', productCode: 'SD-DB-8W', barcode: '8903241308117', category: 'Circuit Breakers (MCB)', brand: 'Schneider', price: 1180 },

  // PVC Conduits & Accessories
  { productName: 'Precision PVC Conduit Pipe 20mm Light Duty 3m', productCode: 'PP-CP20-LD', barcode: '8906001201010', category: 'PVC Conduits', brand: 'Precision', price: 65 },
  { productName: 'Precision PVC Conduit Pipe 25mm Medium Duty 3m', productCode: 'PP-CP25-MD', barcode: '8906001201027', category: 'PVC Conduits', brand: 'Precision', price: 88 },
  { productName: 'Precision PVC Deep Junction Box 4 Way 20mm', productCode: 'PP-JB20-4W', barcode: '8906001202048', category: 'PVC Conduits', brand: 'Precision', price: 25 },
  { productName: 'Precision PVC Bend 20mm Light Duty', productCode: 'PP-BD20-LD', barcode: '8906001203014', category: 'PVC Conduits', brand: 'Precision', price: 12 },

  // Tools & Accessories
  { productName: 'Taparia Line Tester 500V', productCode: 'TP-LT-500', barcode: '8901452101111', category: 'Tools & Testers', brand: 'Taparia', price: 85 },
  { productName: 'Taparia Combination Plier 8 inch', productCode: 'TP-CP-8', barcode: '8901452102026', category: 'Tools & Testers', brand: 'Taparia', price: 260 },
  { productName: 'Steelgrip PVC Insulation Tape Black 1.8cm x 7m', productCode: 'SG-IT-BK', barcode: '8901243101018', category: 'Tools & Testers', brand: 'Steelgrip', price: 15 },
  { productName: 'Steelgrip PVC Insulation Tape Yellow 1.8cm x 7m', productCode: 'SG-IT-YL', barcode: '8901243101025', category: 'Tools & Testers', brand: 'Steelgrip', price: 15 }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartprice');
    console.log('Connected to MongoDB for seeding...');

    // Clear Users
    await User.deleteMany({});
    console.log('Cleared existing users.');

    // Create Owner
    const ownerPassword = 'Password123';
    const owner = new User({
      name: 'Store Owner',
      email: 'owner@smartprice.com',
      password: ownerPassword,
      role: 'owner'
    });
    await owner.save();
    console.log(`Created Owner account:`);
    console.log(`Email: owner@smartprice.com`);
    console.log(`Password: ${ownerPassword}`);

    // Clear Products
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    // Seed Products
    const createdProducts = await Product.insertMany(mockProducts);
    console.log(`Successfully seeded ${createdProducts.length} mock products.`);

    console.log('Seeding process completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
