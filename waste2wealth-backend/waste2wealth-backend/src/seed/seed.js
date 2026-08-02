/**
 * Seed script - populates the database with sample data for demos/testing.
 * Usage:
 *   npm run seed            -> inserts sample data
 *   npm run seed:destroy    -> wipes seeded collections
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const WasteListing = require('../models/WasteListing');
const BuyerRequest = require('../models/BuyerRequest');
const Transaction = require('../models/Transaction');
const CarbonSaving = require('../models/CarbonSaving');
const Notification = require('../models/Notification');

const users = [
  {
    companyName: 'Admin HQ',
    email: 'admin@waste2wealth.ai',
    password: 'Admin@12345',
    industryType: 'Platform Administration',
    role: 'admin',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    isEmailVerified: true,
    location: { type: 'Point', coordinates: [76.9558, 11.0168] },
  },
  {
    companyName: 'Tiruppur Textile Mills',
    email: 'generator1@waste2wealth.ai',
    password: 'Password@123',
    industryType: 'Textile Manufacturing',
    role: 'generator',
    gstNumber: '33AAAAA0000A1Z5',
    city: 'Tiruppur',
    state: 'Tamil Nadu',
    isEmailVerified: true,
    location: { type: 'Point', coordinates: [77.3411, 11.1085] },
  },
  {
    companyName: 'Coimbatore Metal Works',
    email: 'generator2@waste2wealth.ai',
    password: 'Password@123',
    industryType: 'Metal Fabrication',
    role: 'generator',
    gstNumber: '33BBBBB0000B1Z6',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    isEmailVerified: true,
    location: { type: 'Point', coordinates: [76.9558, 11.0168] },
  },
  {
    companyName: 'GreenCycle Plastics Pvt Ltd',
    email: 'buyer1@waste2wealth.ai',
    password: 'Password@123',
    industryType: 'Plastic Recycling',
    role: 'buyer',
    gstNumber: '33CCCCC0000C1Z7',
    city: 'Erode',
    state: 'Tamil Nadu',
    isEmailVerified: true,
    location: { type: 'Point', coordinates: [77.7274, 11.3410] },
  },
  {
    companyName: 'EcoTex Recyclers',
    email: 'buyer2@waste2wealth.ai',
    password: 'Password@123',
    industryType: 'Textile Recycling',
    role: 'buyer',
    gstNumber: '33DDDDD0000D1Z8',
    city: 'Salem',
    state: 'Tamil Nadu',
    isEmailVerified: true,
    location: { type: 'Point', coordinates: [78.1460, 11.6643] },
  },
];

const destroy = async () => {
  await Promise.all([
    User.deleteMany(),
    WasteListing.deleteMany(),
    BuyerRequest.deleteMany(),
    Transaction.deleteMany(),
    CarbonSaving.deleteMany(),
    Notification.deleteMany(),
  ]);
  console.log('🗑️  All seeded collections cleared.');
  process.exit(0);
};

const seed = async () => {
  await Promise.all([
    User.deleteMany(),
    WasteListing.deleteMany(),
    BuyerRequest.deleteMany(),
    Transaction.deleteMany(),
    CarbonSaving.deleteMany(),
    Notification.deleteMany(),
  ]);

  // Create sequentially so pre-save password hashing hook runs correctly for each
  const createdUsers = [];
  for (const u of users) {
    createdUsers.push(await User.create(u));
  }

  const [admin, textileGen, metalGen, plasticBuyer, textileBuyer] = createdUsers;

  const listings = await WasteListing.create([
    {
      user: textileGen._id,
      wasteName: 'Cotton Fabric Cutting Waste',
      category: 'Textile',
      materialType: 'Cotton scrap',
      description: 'Clean cotton fabric cutting waste from garment production, sorted by color.',
      quantity: 500,
      unit: 'kg',
      qualityGrade: 'A',
      moisturePercentage: 2,
      hazardous: false,
      price: 25,
      pickupLocation: {
        address: 'SIDCO Industrial Estate, Tiruppur',
        city: 'Tiruppur',
        state: 'Tamil Nadu',
        location: { type: 'Point', coordinates: [77.3411, 11.1085] },
      },
      status: 'active',
      carbonImpact: { co2SavedKg: 600, treesEquivalent: 28.6, landfillReductionKg: 500, energySavedKwh: 300 },
    },
    {
      user: metalGen._id,
      wasteName: 'Mild Steel Turnings',
      category: 'Metal',
      materialType: 'MS turnings/scrap',
      description: 'Mild steel turnings generated from CNC machining, no oil contamination.',
      quantity: 2,
      unit: 'ton',
      qualityGrade: 'B',
      moisturePercentage: 0,
      hazardous: false,
      price: 18000,
      pickupLocation: {
        address: 'Kurichi Industrial Area, Coimbatore',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        location: { type: 'Point', coordinates: [76.9558, 11.0168] },
      },
      status: 'active',
      carbonImpact: { co2SavedKg: 3600, treesEquivalent: 171.4, landfillReductionKg: 2000, energySavedKwh: 1200 },
    },
  ]);

  await BuyerRequest.create([
    {
      buyer: textileBuyer._id,
      materialType: 'Cotton scrap',
      category: 'Textile',
      quantityNeeded: 300,
      unit: 'kg',
      maxBudget: 30,
      preferredQualityGrade: 'A',
      notes: 'Looking for consistent monthly supply of clean cotton scrap.',
      status: 'open',
    },
    {
      buyer: plasticBuyer._id,
      materialType: 'PET/HDPE scrap',
      category: 'Plastic',
      quantityNeeded: 1000,
      unit: 'kg',
      maxBudget: 20,
      preferredQualityGrade: 'Any',
      status: 'open',
    },
  ]);

  console.log('✅ Seed data inserted successfully:');
  console.log(`   Users: ${createdUsers.length}`);
  console.log(`   Waste Listings: ${listings.length}`);
  console.log('\nSample login credentials (all use the password shown):');
  users.forEach((u) => console.log(`   ${u.role.padEnd(10)} -> ${u.email} / ${u.password}`));

  process.exit(0);
};

(async () => {
  await connectDB();
  if (process.argv.includes('--destroy')) {
    await destroy();
  } else {
    await seed();
  }
})();
