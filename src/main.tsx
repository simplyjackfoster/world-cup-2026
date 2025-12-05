import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { TournamentProvider } from './context/TournamentContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <TournamentProvider>
        <App />
      </TournamentProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
