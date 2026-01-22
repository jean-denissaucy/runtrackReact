import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    // États pour gérer la recherche et l'affichage
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const searchContainerRef = useRef(null);

    // Réinitialiser la recherche quand on change de page
    useEffect(() => {
        setSearchTerm('');
        setSuggestions([]);
        setActiveIndex(-1);
    }, [location.pathname]);

    // Déclenche la recherche après que l'utilisateur arrête de taper (debounce de 300ms)
    useEffect(() => {
        if (searchTerm.length === 0) {
            setSuggestions([]);
            return;
        }

        if (searchTerm.length < 2) {
            return;
        }

        const timer = setTimeout(() => {
            fetchRecipes(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Récupère les recettes depuis l'API TheMealDB
    const fetchRecipes = async (query) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
            );
            const data = await response.json();

            if (data.meals) {
                const queryLower = query.toLowerCase();

                const startsWith = data.meals.filter(meal =>
                    meal.strMeal.toLowerCase().startsWith(queryLower)
                );

                const contains = data.meals.filter(meal => {
                    const mealLower = meal.strMeal.toLowerCase();
                    return mealLower.includes(queryLower) && !mealLower.startsWith(queryLower);
                });

                const sortedSuggestions = [...startsWith, ...contains].slice(0, 10);
                setSuggestions(sortedSuggestions);
                setActiveIndex(-1);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des recettes:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // Au clic sur une suggestion, naviguer vers la recette
    const handleSelectSuggestion = (meal) => {
        setSearchTerm(meal.strMeal);
        setSuggestions([]);
        setActiveIndex(-1);
        navigate(`/recipe/${meal.idMeal}`);
    };

    // Gestion de la navigation au clavier
    const handleKeyDown = (e) => {
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

    // Navigation vers l'accueil
    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <header className="app-header">
            <div className="header-content">
                <div className="header-logo" onClick={handleGoHome}>
                    <span className="logo-icon">🍳</span>
                    <h1 className="logo-text">Recettes Gourmandes</h1>
                </div>

                <div className="header-search" ref={searchContainerRef}>
                    <input
                        type="text"
                        className="header-search-input"
                        placeholder="Rechercher une recette..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />

                    {loading && <div className="header-loader">Chargement...</div>}

                    {suggestions.length > 0 && searchTerm.length > 0 && (
                        <ul className="header-suggestions-list">
                            {suggestions.map((meal, index) => (
                                <li
                                    key={meal.idMeal}
                                    className={`header-suggestion-item ${index === activeIndex ? 'active' : ''}`}
                                    onClick={() => handleSelectSuggestion(meal)}
                                >
                                    <img
                                        src={meal.strMealThumb}
                                        alt={meal.strMeal}
                                        className="header-suggestion-thumb"
                                    />
                                    <div className="header-suggestion-info">
                                        <strong>{meal.strMeal}</strong>
                                        <span className="header-suggestion-category">
                                            {meal.strCategory} - {meal.strArea}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
