// How it works: a real sequence, so numbered steps are appropriate here.
import { Box, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2'; // MUI v6 grid that supports the `size` prop

const steps = [
  { title: 'Customer orders', text: 'Picks dishes and places an order.' },
  { title: 'Kitchen cooks', text: 'A chef prepares it and stock updates.' },
  { title: 'Partner delivers', text: 'Delivery staff bring it to the door.' },
  { title: 'Bill is paid', text: 'Payment is recorded against the order.' },
];

export default function HowItWorks() {
  return (
    <Box id="how-it-works" sx={{ py: { xs: 8, md: 10 }, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ mb: 5 }}>How it works</Typography>
        <Grid container spacing={4}>
          {steps.map((s, i) => (
            <Grid key={s.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="h3" color="primary">{i + 1}</Typography>
              <Typography fontWeight={600} sx={{ mt: 1, mb: 0.5 }}>{s.title}</Typography>
              <Typography variant="body2" color="text.secondary">{s.text}</Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
