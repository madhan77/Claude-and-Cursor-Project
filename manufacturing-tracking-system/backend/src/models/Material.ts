import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MaterialAttributes {
  id: string;
  materialCode: string;
  materialName: string;
  description?: string;
  category: string;
  uom: string;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MaterialCreationAttributes
  extends Optional<MaterialAttributes, 'id' | 'description' | 'currentStock' | 'reorderPoint' | 'reorderQuantity' | 'isActive'> {}

class Material extends Model<MaterialAttributes, MaterialCreationAttributes> implements MaterialAttributes {
  public id!: string;
  public materialCode!: string;
  public materialName!: string;
  public description!: string;
  public category!: string;
  public uom!: string;
  public currentStock!: number;
  public reorderPoint!: number;
  public reorderQuantity!: number;
  public unitCost!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Material.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    materialCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    materialName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    uom: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    currentStock: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    reorderPoint: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    reorderQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'materials',
  }
);

export default Material;
