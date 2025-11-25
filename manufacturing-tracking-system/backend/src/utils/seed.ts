import { User, Product, ProductionOrder, Material, Equipment } from '../models';
import sequelize from '../config/database';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database (create tables)
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created');

    // Create Users
    console.log('Creating users...');
    const users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@manufacturing.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      },
      {
        username: 'manager',
        email: 'manager@manufacturing.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Manager',
        role: 'manager',
      },
      {
        username: 'supervisor',
        email: 'supervisor@manufacturing.com',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Supervisor',
        role: 'supervisor',
      },
      {
        username: 'operator1',
        email: 'operator1@manufacturing.com',
        password: 'password123',
        firstName: 'Mike',
        lastName: 'Operator',
        role: 'operator',
      },
      {
        username: 'quality1',
        email: 'quality@manufacturing.com',
        password: 'password123',
        firstName: 'Lisa',
        lastName: 'Inspector',
        role: 'quality_inspector',
      },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create Products
    console.log('Creating products...');
    const products = await Product.bulkCreate([
      {
        productCode: 'CAR-SEDAN-2024',
        productName: '2024 Executive Sedan',
        description: 'Premium 4-door sedan with advanced features',
        category: 'Automotive',
        uom: 'EA',
        standardCost: 25000,
      },
      {
        productCode: 'CAR-SUV-2024',
        productName: '2024 Luxury SUV',
        description: '7-seater luxury SUV',
        category: 'Automotive',
        uom: 'EA',
        standardCost: 35000,
      },
      {
        productCode: 'PHONE-PRO-X',
        productName: 'ProPhone X',
        description: 'Flagship smartphone with AI camera',
        category: 'Electronics',
        uom: 'EA',
        standardCost: 800,
      },
      {
        productCode: 'LAPTOP-ULTRA',
        productName: 'UltraBook Pro',
        description: '15-inch professional laptop',
        category: 'Electronics',
        uom: 'EA',
        standardCost: 1200,
      },
      {
        productCode: 'ENGINE-V6',
        productName: 'V6 Turbo Engine',
        description: '3.5L V6 turbocharged engine',
        category: 'Automotive Parts',
        uom: 'EA',
        standardCost: 8000,
      },
    ]);
    console.log(`✅ Created ${products.length} products`);

    // Create Materials
    console.log('Creating materials...');
    const materials = await Material.bulkCreate([
      {
        materialCode: 'STEEL-SHEET-1MM',
        materialName: 'Steel Sheet 1mm',
        description: 'Cold-rolled steel sheet',
        category: 'Raw Material',
        uom: 'KG',
        currentStock: 5000,
        reorderPoint: 1000,
        reorderQuantity: 2000,
        unitCost: 2.5,
      },
      {
        materialCode: 'PAINT-BLUE-METALLIC',
        materialName: 'Metallic Blue Paint',
        description: 'Automotive grade metallic paint',
        category: 'Paint',
        uom: 'L',
        currentStock: 500,
        reorderPoint: 100,
        reorderQuantity: 200,
        unitCost: 45,
      },
      {
        materialCode: 'TIRE-205-55-R16',
        materialName: 'Tire 205/55 R16',
        description: 'All-season radial tire',
        category: 'Components',
        uom: 'EA',
        currentStock: 200,
        reorderPoint: 50,
        reorderQuantity: 100,
        unitCost: 85,
      },
      {
        materialCode: 'PCB-MAIN-V2',
        materialName: 'Main Circuit Board V2',
        description: 'Smartphone main PCB',
        category: 'Electronics',
        uom: 'EA',
        currentStock: 1000,
        reorderPoint: 200,
        reorderQuantity: 500,
        unitCost: 45,
      },
      {
        materialCode: 'BATTERY-LION-5000',
        materialName: 'Li-Ion Battery 5000mAh',
        description: 'Lithium-ion rechargeable battery',
        category: 'Electronics',
        uom: 'EA',
        currentStock: 800,
        reorderPoint: 150,
        reorderQuantity: 400,
        unitCost: 12,
      },
    ]);
    console.log(`✅ Created ${materials.length} materials`);

    // Create Equipment
    console.log('Creating equipment...');
    const equipment = await Equipment.bulkCreate([
      {
        equipmentCode: 'PRESS-001',
        equipmentName: 'Hydraulic Press #1',
        type: 'Press Machine',
        status: 'operational',
        workCenter: 'Stamping',
        manufacturer: 'HydroTech',
        model: 'HP-5000',
        serialNumber: 'HT-2023-001',
        installDate: new Date('2023-01-15'),
      },
      {
        equipmentCode: 'WELD-ROB-01',
        equipmentName: 'Robotic Welder #1',
        type: 'Welding Robot',
        status: 'operational',
        workCenter: 'Body Shop',
        manufacturer: 'RoboWeld Inc',
        model: 'RW-X500',
        serialNumber: 'RW-2022-045',
        installDate: new Date('2022-06-20'),
      },
      {
        equipmentCode: 'PAINT-BOOTH-A',
        equipmentName: 'Paint Booth A',
        type: 'Paint Booth',
        status: 'operational',
        workCenter: 'Paint Shop',
        manufacturer: 'PaintPro',
        model: 'PB-2000',
        serialNumber: 'PP-2023-012',
        installDate: new Date('2023-03-10'),
      },
      {
        equipmentCode: 'SMT-LINE-01',
        equipmentName: 'SMT Assembly Line #1',
        type: 'SMT Machine',
        status: 'operational',
        workCenter: 'PCB Assembly',
        manufacturer: 'TechAssembly',
        model: 'TA-SMT-8000',
        serialNumber: 'TA-2023-089',
        installDate: new Date('2023-02-01'),
      },
      {
        equipmentCode: 'TEST-BENCH-03',
        equipmentName: 'Testing Bench #3',
        type: 'Test Equipment',
        status: 'operational',
        workCenter: 'Quality Testing',
        manufacturer: 'TestMaster',
        model: 'TM-AUTO-500',
        serialNumber: 'TM-2022-156',
        installDate: new Date('2022-11-15'),
      },
    ]);
    console.log(`✅ Created ${equipment.length} equipment records`);

    // Create Production Orders
    console.log('Creating production orders...');
    const adminUser = users[0];

    const productionOrders = await ProductionOrder.bulkCreate([
      {
        productId: products[0].id,
        quantity: 50,
        priority: 'high',
        status: 'in_progress',
        startDate: new Date('2024-11-01'),
        dueDate: new Date('2024-11-30'),
        completedQuantity: 25,
        rejectedQuantity: 1,
        notes: 'Urgent order for Q4 delivery',
        createdBy: adminUser.id,
      },
      {
        productId: products[1].id,
        quantity: 30,
        priority: 'medium',
        status: 'released',
        startDate: new Date('2024-11-10'),
        dueDate: new Date('2024-12-15'),
        completedQuantity: 0,
        rejectedQuantity: 0,
        notes: 'Standard production run',
        createdBy: adminUser.id,
      },
      {
        productId: products[2].id,
        quantity: 1000,
        priority: 'urgent',
        status: 'in_progress',
        startDate: new Date('2024-11-15'),
        dueDate: new Date('2024-11-25'),
        completedQuantity: 650,
        rejectedQuantity: 15,
        notes: 'Holiday season rush order',
        createdBy: adminUser.id,
      },
      {
        productId: products[3].id,
        quantity: 500,
        priority: 'medium',
        status: 'released',
        startDate: new Date('2024-11-20'),
        dueDate: new Date('2024-12-20'),
        completedQuantity: 0,
        rejectedQuantity: 0,
        createdBy: adminUser.id,
      },
      {
        productId: products[0].id,
        quantity: 100,
        priority: 'low',
        status: 'draft',
        startDate: new Date('2024-12-01'),
        dueDate: new Date('2025-01-15'),
        completedQuantity: 0,
        rejectedQuantity: 0,
        notes: 'Q1 2025 production planning',
        createdBy: adminUser.id,
      },
      {
        productId: products[4].id,
        quantity: 200,
        priority: 'high',
        status: 'completed',
        startDate: new Date('2024-10-01'),
        dueDate: new Date('2024-10-31'),
        completedDate: new Date('2024-10-28'),
        completedQuantity: 200,
        rejectedQuantity: 5,
        notes: 'Completed ahead of schedule',
        createdBy: adminUser.id,
      },
    ]);
    console.log(`✅ Created ${productionOrders.length} production orders`);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📝 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: password123\n');
    console.log('   Other users: manager, supervisor, operator1, quality1');
    console.log('   All passwords: password123\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seed completed, exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}
