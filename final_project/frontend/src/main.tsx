/**
 * HQE frontend entry point.
 *
 * The authentication gate controls access to the main
 * React application. No hospital content is rendered
 * until an existing session is verified or a user logs in.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import AuthGate from './components/auth/AuthGate';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate />
  </StrictMode>
);
