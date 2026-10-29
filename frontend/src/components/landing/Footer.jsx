// Simple footer. Add real links (privacy, contact) later.
import { Box, Container, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ py: 4, borderTop: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} CloudKitchen. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
