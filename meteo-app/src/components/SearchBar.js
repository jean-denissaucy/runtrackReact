// Importation des dépendances React
import React, { useState } from 'react';
import './SearchBar.css';

// Composant de barre de recherche pour saisir le nom d'une ville
const SearchBar = ({ onSearch, searchHistory = [] }) => {

    // State local pour stocker la valeur de l'input
    const [query, setQuery] = useState('');

    // Fonction appelée lors de la soumission du formulaire
    const handleSubmit = (e) => {
        e.preventDefault(); // Empêche le rechargement de la page

        // Vérifie que le champ n'est pas vide avant d'appeler onSearch
        if (query.trim()) {
            onSearch(query);
            setQuery(''); // Efface le champ après la recherche
        }
    };

    // Fonction pour sélectionner une ville depuis l'historique
    const handleHistoryClick = (city) => {
        onSearch(city);
    };

    return (
        <div className="search-bar">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher une ville..."
                    className="search-input"
                />
                <button type="submit" className="search-button">
                    Rechercher
                </button>
            </form>

            {/* Affichage de l'historique des recherches */}
            {searchHistory.length > 0 && (
                <div className="search-history">
                    <h3>Recherches récentes :</h3>
                    <div className="history-items">
                        {searchHistory.map((city, index) => (
                            <button
                                key={index}
                                onClick={() => handleHistoryClick(city)}
                                className="history-item"
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
