// PLACEHOLDER: the sign-in page will be built in the next step.
// It exists so the "Sign in" buttons on the landing page have a valid target.
import { Container, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function SignInPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>Sign in</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Coming soon.</Typography>
      <Button component={RouterLink} to="/" variant="outlined">Back to home</Button>
    </Container>
  );
}
