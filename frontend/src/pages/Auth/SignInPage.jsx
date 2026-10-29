// Admin sign in. Only the admin account can sign in; there is no public sign-up.
import { useState } from 'react';
import { Box, Button, Container, Paper, TextField, Typography, Link, Alert } from '@mui/material';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SignInPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user)
    return <Navigate to="/dashboard" replace />;

  const handleSignIn = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', px: 2 }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h2" sx={{ mb: 1 }}>Admin sign in</Typography>
            <Typography variant="body2" color="text.secondary">Sign in to manage your cloud kitchen</Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSignIn}>
            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" required autoFocus />
            <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" required />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={busy} sx={{ mt: 3, mb: 2 }}>{busy ? 'Signing in...' : 'Sign in'}</Button>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/" underline="hover" color="primary">Back to Home</Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
