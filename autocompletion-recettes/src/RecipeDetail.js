import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RecipeDetail.css';

function RecipeDetail() {
    // Récupération de l'ID de la recette depuis l'URL
    const { id } = useParams();
    const navigate = useNavigate();

    // États pour gérer les données de la recette, le chargement et les erreurs
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

    // Effet pour récupérer les détails de la recette depuis l'API
    useEffect(() => {
        const fetchRecipeDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
                );
                const data = await response.json();

                // Si l'API ne retourne pas de recette, on considère que c'est une erreur 404
                if (!data.meals || data.meals.length === 0) {
                    setError('Recette non trouvée');
                    setRecipe(null);
                } else {
                    setRecipe(data.meals[0]);
                }
            } catch (err) {
                console.error('Erreur lors de la récupération de la recette:', err);
                setError('Une erreur est survenue lors du chargement de la recette.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipeDetails();
    }, [id]);

    // Vérifier si la recette est dans les favoris
    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(id));
    }, [id]);

    // Gérer les favoris
    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        let newFavorites;

        if (isFavorite) {
            newFavorites = favorites.filter(favId => favId !== id);
        } else {
            newFavorites = [...favorites, id];
        }

        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        setIsFavorite(!isFavorite);
    };

    // Partager la recette
    const handleShare = async () => {
        if (!recipe) return;

        const shareData = {
            title: recipe.strMeal,
            text: `Découvrez cette délicieuse recette: ${recipe.strMeal}`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.log('Partage annulé');
            }
        } else {
            // Fallback: copier le lien dans le presse-papier
            navigator.clipboard.writeText(window.location.href);
            alert('Lien copié dans le presse-papier!');
        }
    };

    // Imprimer la recette
    const handlePrint = () => {
        window.print();
    };

    // Fonction pour extraire les ingrédients et leurs mesures
    const getIngredients = () => {
        if (!recipe) return [];

        const ingredients = [];
        // L'API TheMealDB stocke les ingrédients de strIngredient1 à strIngredient20
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];

            // On ajoute l'ingrédient seulement s'il existe et n'est pas vide
            if (ingredient && ingredient.trim() !== '') {
                ingredients.push({
                    name: ingredient,
                    measure: measure ? measure.trim() : ''
                });
            }
        }

        return ingredients;
    };

    // Fonction pour retourner à la page précédente
    const handleGoBack = () => {
        navigate(-1);
    };

    // Affichage du loader pendant le chargement
    if (loading) {
        return (
            <div className="recipe-detail-container">
                <div className="loader">
                    <div className="spinner"></div>
                    <p>Chargement de la recette...</p>
                </div>
            </div>
        );
    }

    // Affichage si la recette n'existe pas (404)
    if (error || !recipe) {
        return (
            <div className="recipe-detail-container">
                <div className="error-container">
                    <h2>Oups !</h2>
                    <p>{error || 'Recette non trouvée'}</p>
                    <button onClick={handleGoBack} className="back-button">
                        ← Retour
                    </button>
                </div>
            </div>
        );
    }

    // Récupération des ingrédients
    const ingredients = getIngredients();

    // Affichage des détails de la recette
    return (
        <div className="recipe-detail-container">
            {/* Bouton retour */}
            <button onClick={handleGoBack} className="back-button top-back">
                ← Retour aux résultats
            </button>

            {/* Barre d'actions */}
            <div className="recipe-actions-bar">
                <button
                    onClick={toggleFavorite}
                    className={`action-button ${isFavorite ? 'favorite-active' : ''}`}
                    title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                    {isFavorite ? '❤️ Retirer des favoris' : '🤍 Ajouter aux favoris'}
                </button>
                <button
                    onClick={handleShare}
                    className="action-button"
                    title="Partager cette recette"
                >
                    🔗 Partager
                </button>
                <button
                    onClick={handlePrint}
                    className="action-button"
                    title="Imprimer cette recette"
                >
                    🖨️ Imprimer
                </button>
            </div>

            {/* En-tête avec image et informations principales */}
            <div className="recipe-header">
                <div className="recipe-image-large">
                    <img src={recipe.strMealThumb} alt={recipe.strMeal} />
                </div>

                <div className="recipe-header-info">
                    <h1 className="recipe-title">{recipe.strMeal}</h1>

                    <div className="recipe-badges">
                        {recipe.strCategory && (
                            <span className="badge category-badge">
                                {recipe.strCategory}
                            </span>
                        )}
                        {recipe.strArea && (
                            <span className="badge area-badge">
                                {recipe.strArea}
                            </span>
                        )}
                        {recipe.strTags && (
                            <div className="tags">
                                {recipe.strTags.split(',').map((tag, index) => (
                                    <span key={index} className="tag">
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Lien vidéo YouTube si disponible */}
                    {recipe.strYoutube && (
                        <a
                            href={recipe.strYoutube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="youtube-link"
                        >
                            📺 Voir la vidéo
                        </a>
                    )}
                </div>
            </div>

            {/* Section des ingrédients */}
            <div className="recipe-content">
                <div className="ingredients-section">
                    <h2> Ingrédients</h2>
                    <ul className="ingredients-list">
                        {ingredients.map((ingredient, index) => (
                            <li key={index} className="ingredient-item">
                                <span className="ingredient-measure">
                                    {ingredient.measure}
                                </span>
                                <span className="ingredient-name">
                                    {ingredient.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Section des instructions */}
                <div className="instructions-section">
                    <h2> Instructions</h2>
                    <div className="instructions-text">
                        {recipe.strInstructions.split('\n').map((paragraph, index) => (
                            paragraph.trim() && (
                                <p key={index}>{paragraph}</p>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipeDetail;
