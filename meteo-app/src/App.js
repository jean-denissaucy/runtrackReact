// Importation des dépendances React et des composants
import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import Weather from './components/Weather';
import Favorites from './components/Favorites';

// Composant principal de l'application météo
function App() {

  // State pour stocker le nom de la ville recherchée
  // Récupère la dernière ville depuis localStorage au chargement
  const [city, setCity] = useState(() => {
    return localStorage.getItem('lastCity') || '';
  });

  // State pour stocker l'historique des villes recherchées
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // State pour stocker les villes favorites
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Sauvegarde automatique de la ville dans localStorage
  useEffect(() => {
    if (city) {
      localStorage.setItem('lastCity', city);
    }
  }, [city]);

  // Sauvegarde automatique de l'historique dans localStorage
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // Sauvegarde automatique des favoris dans localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fonction appelée lors de la recherche d'une ville
  // Met à jour le state avec la nouvelle ville et l'historique
  const handleSearch = (searchCity) => {
    setCity(searchCity);

    // Ajoute la ville à l'historique (si elle n'existe pas déjà)
    setSearchHistory((prevHistory) => {

      // Retire la ville si elle existe déjà
      const filtered = prevHistory.filter(c => c.toLowerCase() !== searchCity.toLowerCase());

      // Ajoute la ville au début et limite à 5 villes
      return [searchCity, ...filtered].slice(0, 5);
    });
  };

  // Fonction pour effacer l'historique
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // Fonction pour ajouter une ville aux favoris
  const addToFavorites = (city) => {

    // Vérifie que la ville n'est pas déjà dans les favoris
    const cityExists = favorites.some(fav => fav.toLowerCase() === city.toLowerCase());

    if (!cityExists && city.trim()) {
      const updatedFavorites = [...favorites, city];
      setFavorites(updatedFavorites);
      // localStorage est automatiquement mis à jour via useEffect
    }
  };

  // Fonction pour supprimer une ville des favoris
  const removeFromFavorites = (city) => {
    const updatedFavorites = favorites.filter(
      fav => fav.toLowerCase() !== city.toLowerCase()
    );
    setFavorites(updatedFavorites);
    // localStorage est automatiquement mis à jour via useEffect
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Application Météo</h1>
        <SearchBar onSearch={handleSearch} searchHistory={searchHistory} />
        {searchHistory.length > 0 && (
          <button onClick={clearHistory} className="clear-history-btn">
            Effacer l'historique
          </button>
        )}
        <Favorites
          onSelectCity={handleSearch}
          addToFavorites={addToFavorites}
          removeFromFavorites={removeFromFavorites}
        />
        <Weather
          city={city}
          onSearch={handleSearch}
          addToFavorites={addToFavorites}
          isFavorite={favorites.some(fav => fav.toLowerCase() === city.toLowerCase())}
        />
      </header>
    </div>
  );
}

export default App;
