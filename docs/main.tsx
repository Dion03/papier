import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/styles/fonts.css';
import './docs.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
