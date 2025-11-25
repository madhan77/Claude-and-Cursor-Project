import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface EquipmentAttributes {
  id: string;
  equipmentCode: string;
  equipmentName: string;
  type: string;
  status: 'operational' | 'down' | 'maintenance' | 'idle';
  workCenter: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installDate?: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EquipmentCreationAttributes
  extends Optional<
    EquipmentAttributes,
    'id' | 'manufacturer' | 'model' | 'serialNumber' | 'installDate' | 'lastMaintenanceDate' | 'nextMaintenanceDate' | 'isActive' | 'status'
  > {}

class Equipment extends Model<EquipmentAttributes, EquipmentCreationAttributes> implements EquipmentAttributes {
  public id!: string;
  public equipmentCode!: string;
  public equipmentName!: string;
  public type!: string;
  public status!: 'operational' | 'down' | 'maintenance' | 'idle';
  public workCenter!: string;
  public manufacturer!: string;
  public model!: string;
  public serialNumber!: string;
  public installDate!: Date;
  public lastMaintenanceDate!: Date;
  public nextMaintenanceDate!: Date;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Equipment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    equipmentCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    equipmentName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('operational', 'down', 'maintenance', 'idle'),
      allowNull: false,
      defaultValue: 'operational',
    },
    workCenter: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    manufacturer: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    serialNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    installDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'equipment',
  }
);

export default Equipment;
