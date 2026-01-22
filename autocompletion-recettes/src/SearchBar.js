import { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

function SearchBar({ onSelectRecipe }) {
    // États pour gérer la recherche et l'affichage
    const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche saisi par l'utilisateur
    const [suggestions, setSuggestions] = useState([]); // Liste des suggestions de recettes
    const [loading, setLoading] = useState(false); // Indicateur de chargement
    const [activeIndex, setActiveIndex] = useState(-1); // Index de la suggestion active pour la navigation clavier
    const searchContainerRef = useRef(null); // Référence au conteneur pour détecter les clics en dehors

    // Déclenche la recherche après que l'utilisateur arrête de taper (debounce de 300ms)
    useEffect(() => {
        // Cacher les suggestions quand l'input est vide
        if (searchTerm.length === 0) {
            setSuggestions([]);
            return;
        }

        // Attendre au moins 2 caractères avant de chercher
        if (searchTerm.length < 2) {
            return;
        }

        const timer = setTimeout(() => {
            fetchRecipes(searchTerm);
        }, 300); // Debounce de 300ms

        // Nettoyage du timer si l'utilisateur tape à nouveau avant les 300ms
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Récupère les recettes depuis l'API TheMealDB
    const fetchRecipes = async (query) => {
        setLoading(true); // Active l'indicateur de chargement
        try {
            // Appel à l'API de recherche
            const response = await fetch(
                `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
            );
            const data = await response.json(); // Conversion de la réponse en JSON

            if (data.meals) {
                // Normaliser la requête en minuscules pour la comparaison
                const queryLower = query.toLowerCase();

                // Partie 1 : Recettes qui commencent par la recherche
                const startsWith = data.meals.filter(meal =>
                    meal.strMeal.toLowerCase().startsWith(queryLower)
                );

                // Partie 2 : Recettes qui contiennent la recherche mais ne commencent pas par
                const contains = data.meals.filter(meal => {
                    const mealLower = meal.strMeal.toLowerCase();
                    return mealLower.includes(queryLower) && !mealLower.startsWith(queryLower);
                });

                // Combiner les deux catégories : d'abord celles qui commencent, puis celles qui contiennent
                const sortedSuggestions = [...startsWith, ...contains].slice(0, 10);
                setSuggestions(sortedSuggestions);
                setActiveIndex(-1); // Réinitialiser l'index actif
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            // Gestion des erreurs réseau ou de parsing
            console.error('Erreur lors de la récupération des recettes:', error);
            setSuggestions([]);
        } finally {
            setLoading(false); // Désactive le chargement dans tous les cas
        }
    };

    // Au clic sur une suggestion, remplir l'input et lancer la recherche
    const handleSelectSuggestion = (meal) => {
        setSearchTerm(meal.strMeal); // Remplir l'input avec le nom de la recette
        setSuggestions([]); // Fermer la liste des suggestions
        setActiveIndex(-1); // Réinitialiser l'index actif
        onSelectRecipe(meal.idMeal); // Lancer la recherche de la recette complète
    };

    // Gestion de la navigation au clavier
    const handleKeyDown = (e) => {
        // Si pas de suggestions, ne rien faire
        if (suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < suggestions.length) {
                    handleSelectSuggestion(suggestions[activeIndex]);
                }
                break;
            case 'Escape':
                setSuggestions([]);
                setActiveIndex(-1);
                break;
            default:
                break;
        }
    };

    // Fermeture des suggestions au clic en dehors
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setSuggestions([]);
                setActiveIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="search-container" ref={searchContainerRef}>
            {/* Champ de saisie pour la recherche */}
            <input
                type="text"
                className="search-input"
                placeholder="Rechercher une recette..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            {/* Affichage du loader pendant le chargement */}
            {loading && <div className="loader">Chargement...</div>}

            {/* Liste des suggestions de recettes - cachée si l'input est vide */}
            {suggestions.length > 0 && searchTerm.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map((meal, index) => (
                        <li
                            key={meal.idMeal}
                            className={`suggestion-item ${index === activeIndex ? 'active' : ''}`}
                            onClick={() => handleSelectSuggestion(meal)}
                        >
                            <img
                                src={meal.strMealThumb}
                                alt={meal.strMeal}
                                className="suggestion-thumb"
                            />
                            <div className="suggestion-info">
                                <strong>{meal.strMeal}</strong>
                                <span className="suggestion-category">
                                    {meal.strCategory} - {meal.strArea}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SearchBar;
