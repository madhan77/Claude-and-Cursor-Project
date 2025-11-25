import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProductionOrderAttributes {
  id: string;
  orderNumber: string;
  productId: string;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'released' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  completedQuantity: number;
  rejectedQuantity: number;
  notes?: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductionOrderCreationAttributes
  extends Optional<ProductionOrderAttributes, 'id' | 'orderNumber' | 'completedDate' | 'completedQuantity' | 'rejectedQuantity' | 'notes' | 'status'> {}

class ProductionOrder extends Model<ProductionOrderAttributes, ProductionOrderCreationAttributes>
  implements ProductionOrderAttributes {
  public id!: string;
  public orderNumber!: string;
  public productId!: string;
  public quantity!: number;
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public status!: 'draft' | 'released' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  public startDate!: Date;
  public dueDate!: Date;
  public completedDate!: Date;
  public completedQuantity!: number;
  public rejectedQuantity!: number;
  public notes!: string;
  public createdBy!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductionOrder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
    },
    status: {
      type: DataTypes.ENUM('draft', 'released', 'in_progress', 'completed', 'cancelled', 'on_hold'),
      allowNull: false,
      defaultValue: 'draft',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rejectedQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'production_orders',
    hooks: {
      beforeCreate: async (order: ProductionOrder) => {
        if (!order.orderNumber) {
          // Generate order number: PO-YYYYMMDD-XXXX
          const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
          order.orderNumber = `PO-${date}-${random}`;
        }
      },
    },
  }
);

export default ProductionOrder;
