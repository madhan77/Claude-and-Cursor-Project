import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface QualityInspectionAttributes {
  id: string;
  jobId: string;
  inspectionType: 'incoming' | 'in_process' | 'final' | 'audit';
  result: 'pass' | 'fail' | 'conditional_pass';
  inspectorId: string;
  inspectionDate: Date;
  measurements?: any;
  defects?: any;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface QualityInspectionCreationAttributes
  extends Optional<QualityInspectionAttributes, 'id' | 'measurements' | 'defects' | 'notes'> {}

class QualityInspection extends Model<QualityInspectionAttributes, QualityInspectionCreationAttributes>
  implements QualityInspectionAttributes {
  public id!: string;
  public jobId!: string;
  public inspectionType!: 'incoming' | 'in_process' | 'final' | 'audit';
  public result!: 'pass' | 'fail' | 'conditional_pass';
  public inspectorId!: string;
  public inspectionDate!: Date;
  public measurements!: any;
  public defects!: any;
  public notes!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

QualityInspection.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    jobId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'jobs',
        key: 'id',
      },
    },
    inspectionType: {
      type: DataTypes.ENUM('incoming', 'in_process', 'final', 'audit'),
      allowNull: false,
    },
    result: {
      type: DataTypes.ENUM('pass', 'fail', 'conditional_pass'),
      allowNull: false,
    },
    inspectorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    inspectionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    measurements: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    defects: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'quality_inspections',
  }
);

export default QualityInspection;
