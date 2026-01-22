import { render, screen } from '@testing-library/react';
import App from './App';

// Test de base pour vérifier que l'application se rend correctement
test('renders learn react link', () => {
  // Rendu du composant App
  render(<App />);
  // Recherche d'un élément contenant le texte "learn react"
  const linkElement = screen.getByText(/learn react/i);
  // Vérifie que l'élément est présent dans le document
  expect(linkElement).toBeInTheDocument();
});
