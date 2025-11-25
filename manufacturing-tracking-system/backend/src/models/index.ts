import User from './User';
import Product from './Product';
import ProductionOrder from './ProductionOrder';
import Job from './Job';
import QualityInspection from './QualityInspection';
import Material from './Material';
import Equipment from './Equipment';

// Define associations
ProductionOrder.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
ProductionOrder.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Job.belongsTo(ProductionOrder, { foreignKey: 'productionOrderId', as: 'productionOrder' });

QualityInspection.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
QualityInspection.belongsTo(User, { foreignKey: 'inspectorId', as: 'inspector' });

export {
  User,
  Product,
  ProductionOrder,
  Job,
  QualityInspection,
  Material,
  Equipment,
};
