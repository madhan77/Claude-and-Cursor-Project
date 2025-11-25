import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface JobAttributes {
  id: string;
  jobNumber: string;
  productionOrderId: string;
  batchNumber: string;
  quantity: number;
  currentOperation: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'rejected';
  startedAt?: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface JobCreationAttributes extends Optional<JobAttributes, 'id' | 'jobNumber' | 'currentOperation' | 'status' | 'startedAt' | 'completedAt'> {}

class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  public id!: string;
  public jobNumber!: string;
  public productionOrderId!: string;
  public batchNumber!: string;
  public quantity!: number;
  public currentOperation!: number;
  public status!: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'rejected';
  public startedAt!: Date;
  public completedAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Job.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    jobNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    productionOrderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'production_orders',
        key: 'id',
      },
    },
    batchNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currentOperation: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'on_hold', 'rejected'),
      allowNull: false,
      defaultValue: 'not_started',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'jobs',
    hooks: {
      beforeCreate: async (job: Job) => {
        if (!job.jobNumber) {
          const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
          job.jobNumber = `JOB-${date}-${random}`;
        }
      },
    },
  }
);

export default Job;
