import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { seedData } from './seed.ts';

// Seed sample data if needed
seedData().then(() => console.log('Seed check completed')).catch(err => console.error('Seed check failed:', err));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
