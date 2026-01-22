import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Création du point de montage React dans le DOM
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendu de l'application dans le mode strict de React
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Si vous voulez mesurer les performances de votre application, passez une fonction
// pour enregistrer les résultats (par exemple: reportWebVitals(console.log))
// ou envoyez-les vers un point de terminaison d'analyse. En savoir plus: https://bit.ly/CRA-vitals
reportWebVitals();
