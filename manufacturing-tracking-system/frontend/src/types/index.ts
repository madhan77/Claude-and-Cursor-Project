export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'supervisor' | 'operator' | 'quality_inspector' | 'inventory_manager' | 'maintenance';
  isActive: boolean;
  lastLogin?: string;
}

export interface Product {
  id: string;
  productCode: string;
  productName: string;
  description?: string;
  category: string;
  uom: string;
  standardCost?: number;
  isActive: boolean;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  productId: string;
  product?: Product;
  quantity: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'released' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  startDate: string;
  dueDate: string;
  completedDate?: string;
  completedQuantity: number;
  rejectedQuantity: number;
  notes?: string;
  createdBy: string;
  creator?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  productionOrderId: string;
  batchNumber: string;
  quantity: number;
  currentOperation: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'rejected';
  startedAt?: string;
  completedAt?: string;
}

export interface QualityInspection {
  id: string;
  jobId: string;
  inspectionType: 'incoming' | 'in_process' | 'final' | 'audit';
  result: 'pass' | 'fail' | 'conditional_pass';
  inspectorId: string;
  inspectionDate: string;
  measurements?: any;
  defects?: any;
  notes?: string;
}

export interface Material {
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
}

export interface Equipment {
  id: string;
  equipmentCode: string;
  equipmentName: string;
  type: string;
  status: 'operational' | 'down' | 'maintenance' | 'idle';
  workCenter: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
}

export interface DashboardStats {
  totalOrders: number;
  inProgress: number;
  completed: number;
  pending: number;
  overdueOrders: number;
}
