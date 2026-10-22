// Top navigation: logo, in-page anchors, and Sign in button (-> /signin).
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { Link as RouterLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <AppBar position="sticky" color="inherit" elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <RestaurantIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h3" sx={{ flexGrow: 1 }}>CloudKitchen</Typography>

          {/* Anchor links hidden on small screens */}
          <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 2 }}>
            <Button href="#features" color="inherit">Features</Button>
            <Button href="#how-it-works" color="inherit">How it works</Button>
          </Box>

          <Button component={RouterLink} to="/signin" variant="contained">Sign in</Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
