require('dotenv').config();
const { prisma } = require('./data/store');

async function seedAmbulances() {
  const mockAmbulances = [
    {
      id: 'amb-001',
      unitNumber: 'Unit 7',
      driverName: 'Emily Carter',
      crew: ['Paramedic J. Hayes', 'EMT R. Patel'],
      vehiclePlate: 'KA-01-AMB-001',
      baseStation: 'Bengaluru Central Station',
      equipmentLevel: 'ALS',
      phone: '+91-80-4000-0101',
      latitude: 13.0358,
      longitude: 77.5970,
      isAvailable: true
    },
    {
      id: 'amb-002',
      unitNumber: 'Unit 12',
      driverName: 'Marcus Johnson',
      crew: ['Paramedic S. Lee'],
      vehiclePlate: 'KA-02-AMB-002',
      baseStation: 'Indiranagar Response Post',
      equipmentLevel: 'BLS',
      phone: '+91-80-4000-0102',
      latitude: 12.9856,
      longitude: 77.6052,
      isAvailable: true
    },
    {
      id: 'amb-003',
      unitNumber: 'Unit 3',
      driverName: 'Dr. Sarah Kim',
      crew: ['Paramedic A. Thompson', 'EMT K. Brooks'],
      vehiclePlate: 'KA-03-AMB-003',
      baseStation: 'Koramangala Medical Hub',
      equipmentLevel: 'CCU',
      phone: '+91-80-4000-0103',
      latitude: 12.9539,
      longitude: 77.6436,
      isAvailable: true
    },
    {
      id: 'amb-004',
      unitNumber: 'Unit 19',
      driverName: 'David Okafor',
      crew: ['EMT N. Martinez'],
      vehiclePlate: 'KA-04-AMB-004',
      baseStation: 'Yeshwanthpur Rapid Response',
      equipmentLevel: 'BLS',
      phone: '+91-80-4000-0104',
      latitude: 13.0285,
      longitude: 77.5531,
      isAvailable: true
    }
  ];

  for (const ambulance of mockAmbulances) {
    await prisma.ambulance.upsert({
      where: { id: ambulance.id },
      update: {
        unitNumber: ambulance.unitNumber,
        driverName: ambulance.driverName,
        crew: ambulance.crew,
        vehiclePlate: ambulance.vehiclePlate,
        baseStation: ambulance.baseStation,
        equipmentLevel: ambulance.equipmentLevel,
        phone: ambulance.phone,
        latitude: ambulance.latitude,
        longitude: ambulance.longitude
      },
      create: ambulance
    });
  }

  console.log(`Seeded or updated ${mockAmbulances.length} ambulances.`);
}

if (require.main === module) {
  seedAmbulances()
    .catch((error) => {
      console.error('Ambulance seed failed:', error.message);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}

module.exports = { seedAmbulances };
