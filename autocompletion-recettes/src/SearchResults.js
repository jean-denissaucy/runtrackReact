import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SearchResults.css';

function SearchResults() {
    // Récupération des paramètres de l'URL
    const [searchParams] = useSearchParams();
    // États pour gérer les résultats, le chargement et les erreurs
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Hook pour la navigation
    const navigate = useNavigate();

    // Extraction du paramètre de recherche 'q' de l'URL
    const query = searchParams.get('q');

    // Effet pour récupérer les résultats de recherche depuis l'API
    useEffect(() => {
        // Si pas de requête, on vide les résultats
        if (!query) {
            setResults([]);
            return;
        }

        // Fonction asynchrone pour appeler l'API TheMealDB
        const fetchResults = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
                );
                const data = await response.json();
                setResults(data.meals || []);
            } catch (err) {
                console.error('Erreur lors de la récupération des résultats:', err);
                setError('Une erreur est survenue lors de la recherche.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]); // Se déclenche à chaque changement de la requête

    // Gère le clic sur une carte de recette pour naviguer vers sa page détail
    const handleRecipeClick = (id) => {
        navigate(`/recipe/${id}`);
    };

    // Affichage du loader pendant le chargement
    if (loading) {
        return (
            <div className="search-results-container">
                <div className="loader">
                    <div className="spinner"></div>
                    <p>Chargement des résultats...</p>
                </div>
            </div>
        );
    }

    // Affichage du message d'erreur si une erreur est survenue
    if (error) {
        return (
            <div className="search-results-container">
                <div className="error-message">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Affichage si aucune requête n'a été saisie
    if (!query) {
        return (
            <div className="search-results-container">
                <p className="no-query">Veuillez effectuer une recherche.</p>
            </div>
        );
    }

    // Affichage si aucun résultat n'a été trouvé
    if (results.length === 0) {
        return (
            <div className="search-results-container">
                <div className="no-results">
                    <h2>Aucun résultat trouvé</h2>
                    <p>Aucune recette ne correspond à "{query}".</p>
                    <p>Essayez avec d'autres mots-clés.</p>
                </div>
            </div>
        );
    }

    // Affichage de la grille de résultats
    return (
        <div className="search-results-container">
            <h1 className="results-title">
                Résultats pour "{query}" ({results.length} recette{results.length > 1 ? 's' : ''})
            </h1>

            {/* Grille de cartes de recettes */}
            <div className="recipes-grid">
                {results.map((recipe) => (
                    <div
                        key={recipe.idMeal}
                        className="recipe-card"
                        onClick={() => handleRecipeClick(recipe.idMeal)}
                    >
                        <div className="recipe-image-container">
                            <img
                                src={recipe.strMealThumb}
                                alt={recipe.strMeal}
                                className="recipe-image"
                            />
                        </div>

                        <div className="recipe-info">
                            <h3 className="recipe-name">{recipe.strMeal}</h3>
                            <div className="recipe-meta">
                                <span className="recipe-category">
                                    {recipe.strCategory}
                                </span>
                                {recipe.strArea && (
                                    <span className="recipe-area">
                                        {recipe.strArea}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SearchResults;
