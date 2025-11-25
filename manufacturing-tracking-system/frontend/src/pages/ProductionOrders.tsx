import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Add, Visibility, Edit } from '@mui/icons-material';
import { productionOrderAPI } from '../services/api';
import { ProductionOrder } from '../types';
import { format } from 'date-fns';

const statusColors: Record<string, any> = {
  draft: 'default',
  released: 'info',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'error',
  on_hold: 'warning',
};

const priorityColors: Record<string, any> = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'error',
};

export default function ProductionOrders() {
  const navigate = useNavigate();
  const [page] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['productionOrders', page],
    queryFn: async () => {
      const response = await productionOrderAPI.getAll({ page, limit: 20 });
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Production Orders
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track all production orders
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/production-orders/new')}
        >
          New Order
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.productionOrders?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No production orders found. Create your first order to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.productionOrders?.map((order: ProductionOrder) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {order.orderNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.product?.productName || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.product?.productCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.quantity} {order.product?.uom}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.priority.toUpperCase()}
                      color={priorityColors[order.priority]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status.replace('_', ' ').toUpperCase()}
                      color={statusColors[order.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{format(new Date(order.startDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(order.dueDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    {order.completedQuantity} / {order.quantity}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/production-orders/${order.id}`)}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
