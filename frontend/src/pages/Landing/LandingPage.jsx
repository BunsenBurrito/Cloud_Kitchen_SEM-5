// Landing page (public, shown before sign in). Composed of section components
// from components/landing so each section can be edited independently.
import { Box } from '@mui/material';
import Navbar from '../../components/landing/Navbar';
import Hero from '../../components/landing/Hero';
import Features from '../../components/landing/Features';
import HowItWorks from '../../components/landing/HowItWorks';
import Footer from '../../components/landing/Footer';

export default function LandingPage() {
  return (
    <Box>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </Box>
  );
}
