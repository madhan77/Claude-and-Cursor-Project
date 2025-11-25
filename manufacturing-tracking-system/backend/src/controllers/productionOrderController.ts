import { Response } from 'express';
import { ProductionOrder, Product, User } from '../models';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

export const createProductionOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity, priority, startDate, dueDate, notes } = req.body;

    // Validate product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const productionOrder = await ProductionOrder.create({
      productId,
      quantity,
      priority: priority || 'medium',
      startDate,
      dueDate,
      notes,
      createdBy: req.user!.id,
    });

    const orderWithDetails = await ProductionOrder.findByPk(productionOrder.id, {
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'creator', attributes: ['id', 'username', 'firstName', 'lastName'] },
      ],
    });

    res.status(201).json({
      message: 'Production order created successfully',
      productionOrder: orderWithDetails,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error creating production order', details: error.message });
  }
};

export const getAllProductionOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await ProductionOrder.findAndCountAll({
      where,
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'creator', attributes: ['id', 'username', 'firstName', 'lastName'] },
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      productionOrders: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching production orders', details: error.message });
  }
};

export const getProductionOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const productionOrder = await ProductionOrder.findByPk(id, {
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'creator', attributes: ['id', 'username', 'firstName', 'lastName'] },
      ],
    });

    if (!productionOrder) {
      res.status(404).json({ error: 'Production order not found' });
      return;
    }

    res.status(200).json({ productionOrder });
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching production order', details: error.message });
  }
};

export const updateProductionOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const productionOrder = await ProductionOrder.findByPk(id);

    if (!productionOrder) {
      res.status(404).json({ error: 'Production order not found' });
      return;
    }

    await productionOrder.update(updates);

    const updatedOrder = await ProductionOrder.findByPk(id, {
      include: [
        { model: Product, as: 'product' },
        { model: User, as: 'creator', attributes: ['id', 'username', 'firstName', 'lastName'] },
      ],
    });

    res.status(200).json({
      message: 'Production order updated successfully',
      productionOrder: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error updating production order', details: error.message });
  }
};

export const deleteProductionOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const productionOrder = await ProductionOrder.findByPk(id);

    if (!productionOrder) {
      res.status(404).json({ error: 'Production order not found' });
      return;
    }

    // Check if order can be deleted (not in progress or completed)
    if (productionOrder.status === 'in_progress' || productionOrder.status === 'completed') {
      res.status(400).json({
        error: 'Cannot delete production order that is in progress or completed',
      });
      return;
    }

    await productionOrder.destroy();

    res.status(200).json({ message: 'Production order deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error deleting production order', details: error.message });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalOrders = await ProductionOrder.count();
    const inProgress = await ProductionOrder.count({ where: { status: 'in_progress' } });
    const completed = await ProductionOrder.count({ where: { status: 'completed' } });
    const pending = await ProductionOrder.count({ where: { status: 'released' } });

    const overdueOrders = await ProductionOrder.count({
      where: {
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.not]: 'completed' },
      },
    });

    res.status(200).json({
      stats: {
        totalOrders,
        inProgress,
        completed,
        pending,
        overdueOrders,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error fetching dashboard stats', details: error.message });
  }
};
