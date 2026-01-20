// Importation des hooks React et du fichier CSS
import React, { useState, useEffect } from 'react';
import './Weather.css';

// Composant qui affiche les données météo d'une ville
const Weather = ({ city, addToFavorites, isFavorite }) => {

    // State pour stocker les données météo récupérées de l'API
    const [weatherData, setWeatherData] = useState(null);

    // State pour gérer l'état de chargement
    const [loading, setLoading] = useState(false);

    // State pour stocker les messages d'erreur
    const [error, setError] = useState('');

    // Hook useEffect pour récupérer les données météo à chaque changement de ville
    useEffect(() => {

        // Si aucune ville n'est sélectionnée, réinitialise les données
        if (!city) {
            setWeatherData(null);
            setError('');
            return;
        }

        // Fonction asynchrone pour récupérer les données de l'API météo
        const fetchWeatherData = async () => {
            try {

                setLoading(true); // Active l'état de chargement
                setError(''); // Réinitialise les erreurs précédentes
                const apiKey = process.env.REACT_APP_WEATHER_API_KEY;

                // Construction de l'URL avec la ville, la clé API, unités métriques et langue française
                const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`;

                const response = await fetch(url);
                const data = await response.json();

                // Si la requête réussit
                if (response.ok) {
                    setWeatherData(data); // Stocke les données météo
                    setError('');
                } else {
                    setWeatherData(null);

                    // Gestion spécifique de l'erreur 404 (ville non trouvée)
                    if (response.status === 404) {
                        setError(`La ville "${city}" n'a pas été trouvée. Veuillez vérifier l'orthographe.`);
                    } else {
                        setError('Une erreur est survenue lors de la récupération des données météo.');
                    }
                }
            } catch (error) {

                // Gestion des erreurs de connexion
                console.error('Erreur:', error);
                setWeatherData(null);
                setError('Impossible de se connecter au service météo. Veuillez réessayer plus tard.');
            } finally {
                setLoading(false); // Désactive l'état de chargement
            }
        };

        fetchWeatherData();
    }, [city]); // Se déclenche à chaque changement de la variable 'city' // [] vide : exécuté une seule fois au montage

    // Affichage du message de chargement
    if (loading) {
        return <div className="weather-container">Chargement des données météo...</div>;
    }

    // Affichage du message d'erreur si une erreur existe
    if (error) {
        return <div className="weather-container error-message">{error}</div>;
    }

    // Ne rien afficher si aucune donnée n'est disponible
    if (!weatherData) {
        return null;
    }

    // Fonction pour ajouter la ville actuelle aux favoris
    const handleAddToFavorites = () => {
        if (weatherData && weatherData.name) {
            addToFavorites(weatherData.name);
        }
    };

    return (
        <div className="weather-container">
            <div className="weather-header">
                <h2>{weatherData.name}</h2>
                {!isFavorite && (
                    <button
                        onClick={handleAddToFavorites}
                        className="add-favorite-btn"
                        title="Ajouter aux favoris"
                    >
                        Ajouter aux favoris
                    </button>
                )}
                {isFavorite && (
                    <span className="is-favorite-badge" title="Ville favorite">
                        Favori
                    </span>
                )}
            </div>

            <div className="weather-icon">
                <img
                    src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                    alt={weatherData.weather[0].description}
                />
            </div>

            <div className="weather-info">
                <div className="temperature">
                    <h1>{Math.round(weatherData.main.temp)}°C</h1>
                    <p>{weatherData.weather[0].description}</p>
                </div>

                <div className="weather-details">
                    <div className="detail">
                        <span className="label">Humidité:</span>
                        <span className="value">{weatherData.main.humidity}%</span>
                    </div>
                    <div className="detail">
                        <span className="label">Vitesse du vent:</span>
                        <span className="value">{weatherData.wind.speed} m/s</span>
                    </div>
                    <div className="detail">
                        <span className="label">Ressenti:</span>
                        <span className="value">{Math.round(weatherData.main.feels_like)}°C</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Weather;
