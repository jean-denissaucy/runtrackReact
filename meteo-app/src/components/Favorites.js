// Importation des dépendances React
import React, { useState, useEffect } from 'react';
import './Favorites.css';

// Composant pour gérer et afficher les villes favorites
const Favorites = ({ onSelectCity, addToFavorites, removeFromFavorites }) => {

    // State pour stocker la liste des villes favorites
    const [favorites, setFavorites] = useState([]);

    // Au montage du composant, récupère les favoris depuis localStorage
    useEffect(() => {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);

    // Met à jour le state local quand les favoris changent via les props
    useEffect(() => {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, [addToFavorites, removeFromFavorites]);

    // Fonction pour charger la météo d'une ville favorite
    const handleCityClick = (city) => {
        onSelectCity(city);
    };

    // Fonction pour supprimer une ville des favoris
    const handleRemove = (e, city) => {
        e.stopPropagation(); // Empêche le clic de remonter au bouton parent
        removeFromFavorites(city);

        // Mise à jour immédiate du state local
        setFavorites(prevFavorites =>
            prevFavorites.filter(fav => fav.toLowerCase() !== city.toLowerCase())
        );
    };

    // N'affiche rien si aucun favori
    if (favorites.length === 0) {
        return null;
    }

    return (
        <div className="favorites-container">
            <h3> Villes Favorites</h3>
            <div className="favorites-list">
                {favorites.map((city, index) => (
                    <div key={index} className="favorite-item">
                        <button
                            onClick={() => handleCityClick(city)}
                            className="favorite-button"
                        >
                            {city}
                        </button>
                        <button
                            onClick={(e) => handleRemove(e, city)}
                            className="remove-favorite-btn"
                            title="Retirer des favoris"
                        >

                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Favorites;
