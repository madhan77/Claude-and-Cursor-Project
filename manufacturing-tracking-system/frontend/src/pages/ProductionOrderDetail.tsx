import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { productionOrderAPI } from '../services/api';
import { ProductionOrder } from '../types';
import { format } from 'date-fns';

export default function ProductionOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['productionOrder', id],
    queryFn: async () => {
      const response = await productionOrderAPI.getById(id!);
      return response.data.productionOrder as ProductionOrder;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Container>
        <Typography>Production order not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/production-orders')}
        sx={{ mb: 2 }}
      >
        Back to Orders
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
          <div>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {data.orderNumber}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Production Order Details
            </Typography>
          </div>
          <Chip
            label={data.status.replace('_', ' ').toUpperCase()}
            color={data.status === 'completed' ? 'success' : 'primary'}
            size="medium"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Product Information
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" fontWeight="medium">
                {data.product?.productName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Code: {data.product?.productCode}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Category: {data.product?.category}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Order Details
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Quantity:</strong> {data.quantity} {data.product?.uom}
              </Typography>
              <Typography variant="body2">
                <strong>Priority:</strong> {data.priority.toUpperCase()}
              </Typography>
              <Typography variant="body2">
                <strong>Completed:</strong> {data.completedQuantity} / {data.quantity}
              </Typography>
              <Typography variant="body2">
                <strong>Rejected:</strong> {data.rejectedQuantity}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Timeline
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Start Date:</strong> {format(new Date(data.startDate), 'MMM dd, yyyy')}
              </Typography>
              <Typography variant="body2">
                <strong>Due Date:</strong> {format(new Date(data.dueDate), 'MMM dd, yyyy')}
              </Typography>
              {data.completedDate && (
                <Typography variant="body2">
                  <strong>Completed:</strong> {format(new Date(data.completedDate), 'MMM dd, yyyy')}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Created By
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                {data.creator?.firstName} {data.creator?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(new Date(data.createdAt), 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Box>
          </Grid>

          {data.notes && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Notes
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                <Typography variant="body2">{data.notes}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}
