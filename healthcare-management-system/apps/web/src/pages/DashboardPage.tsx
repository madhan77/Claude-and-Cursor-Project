import { Grid, Paper, Typography, Box } from '@mui/material';
import { People, CalendarMonth, Assessment, TrendingUp } from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }: any) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Typography color="textSecondary" variant="h6">
        {title}
      </Typography>
      <Box sx={{ color, display: 'flex', alignItems: 'center' }}>
        {icon}
      </Box>
    </Box>
    <Typography component="p" variant="h4">
      {value}
    </Typography>
  </Paper>
);

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value="1,245"
            icon={<People fontSize="large" />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Appointments Today"
            value="32"
            icon={<CalendarMonth fontSize="large" />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value="45"
            icon={<Assessment fontSize="large" />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Growth"
            value="+12%"
            icon={<TrendingUp fontSize="large" />}
            color="success.main"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Welcome to Healthcare Management System
            </Typography>
            <Typography variant="body1" paragraph>
              This is the MVP version of the Healthcare Management System. You can manage
              patients, schedule appointments, and view user information.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Navigate using the sidebar to access different features.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
