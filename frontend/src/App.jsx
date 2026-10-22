// Root component. Keep it thin: global providers (auth, snackbar, etc.) go here later.
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return <AppRoutes />;
}
