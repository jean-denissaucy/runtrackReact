import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
    const navigate = useNavigate();

    // États pour les recettes et les filtres
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [areas, setAreas] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedArea, setSelectedArea] = useState('');
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);

    // Charger les favoris et mode sombre depuis localStorage
    useEffect(() => {
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }

        const storedDarkMode = localStorage.getItem('darkMode');
        if (storedDarkMode) {
            setDarkMode(JSON.parse(storedDarkMode));
        }

        const storedSearches = localStorage.getItem('recentSearches');
        if (storedSearches) {
            setRecentSearches(JSON.parse(storedSearches));
        }
    }, []);

    // Appliquer le mode sombre
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    // Charger les catégories et les zones
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [categoriesRes, areasRes] = await Promise.all([
                    fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list'),
                    fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list')
                ]);

                const categoriesData = await categoriesRes.json();
                const areasData = await areasRes.json();

                setCategories(categoriesData.meals || []);
                setAreas(areasData.meals || []);
            } catch (error) {
                console.error('Erreur lors du chargement des filtres:', error);
            }
        };

        fetchFilters();
    }, []);

    // Charger des recettes populaires au démarrage
    useEffect(() => {
        const fetchPopularRecipes = async () => {
            setLoading(true);
            try {
                // Récupérer plusieurs recettes aléatoires
                const promises = Array(12).fill(null).map(() =>
                    fetch('https://www.themealdb.com/api/json/v1/1/random.php')
                        .then(res => res.json())
                );

                const results = await Promise.all(promises);
                const meals = results.map(data => data.meals[0]).filter(Boolean);
                setRecipes(meals);
                setFilteredRecipes(meals);
            } catch (error) {
                console.error('Erreur lors du chargement des recettes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularRecipes();
    }, []);

    // Appliquer les filtres
    useEffect(() => {
        let filtered = [...recipes];

        if (selectedCategory) {
            filtered = filtered.filter(recipe => recipe.strCategory === selectedCategory);
        }

        if (selectedArea) {
            filtered = filtered.filter(recipe => recipe.strArea === selectedArea);
        }

        if (showOnlyFavorites) {
            filtered = filtered.filter(recipe => favorites.includes(recipe.idMeal));
        }

        setFilteredRecipes(filtered);
    }, [selectedCategory, selectedArea, showOnlyFavorites, recipes, favorites]);

    // Gérer les favoris
    const toggleFavorite = (mealId) => {
        let newFavorites;
        if (favorites.includes(mealId)) {
            newFavorites = favorites.filter(id => id !== mealId);
        } else {
            newFavorites = [...favorites, mealId];
        }
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    };

    // Naviguer vers une recette
    const handleRecipeClick = (mealId, mealName) => {
        // Ajouter aux recherches récentes
        const newSearches = [mealName, ...recentSearches.filter(s => s !== mealName)].slice(0, 5);
        setRecentSearches(newSearches);
        localStorage.setItem('recentSearches', JSON.stringify(newSearches));
        navigate(`/recipe/${mealId}`);
    };

    // Partager une recette
    const handleShare = async (recipe) => {
        const shareData = {
            title: recipe.strMeal,
            text: `Découvrez cette délicieuse recette: ${recipe.strMeal}`,
            url: window.location.origin + `/recipe/${recipe.idMeal}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.log('Partage annulé');
            }
        } else {
            // Fallback: copier le lien dans le presse-papier
            navigator.clipboard.writeText(shareData.url);
            alert('Lien copié dans le presse-papier!');
        }
    };
    // Fonction pour effacer les recherches récentes
    const handleClearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };
    return (
        <div className={`home-container ${darkMode ? 'dark-mode' : ''}`}>
            <div className="home-content">
                {/* Barre d'outils */}
                <div className="toolbar">
                    <button
                        className={`toolbar-btn ${darkMode ? 'active' : ''}`}
                        onClick={() => setDarkMode(!darkMode)}
                        title={darkMode ? 'Mode clair' : 'Mode sombre'}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>

                    <button
                        className={`toolbar-btn ${showOnlyFavorites ? 'active' : ''}`}
                        onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                        title="Afficher les favoris"
                    >
                        ❤️ Favoris {showOnlyFavorites && `(${favorites.length})`}
                    </button>
                </div>

                {/* Recherches récentes */}
                {recentSearches.length > 0 && (
                    <div className="recent-searches">
                        <div className="recent-searches-header">
                            <h3>Recherches récentes</h3>
                            <button
                                className="clear-recent-btn"
                                onClick={handleClearRecentSearches}
                                title="Effacer les recherches récentes"
                            >
                                🗑️ Effacer
                            </button>
                        </div>
                        <div className="recent-searches-list">
                            {recentSearches.map((search, index) => (
                                <span key={index} className="recent-search-tag">
                                    {search}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filtres */}
                <div className="filters-container">
                    <div className="filter-group">
                        <label htmlFor="category-filter">📂 Catégorie</label>
                        <select
                            id="category-filter"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Toutes les catégories</option>
                            {categories.map(cat => (
                                <option key={cat.strCategory} value={cat.strCategory}>
                                    {cat.strCategory}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="area-filter">🌍 Origine</label>
                        <select
                            id="area-filter"
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Toutes les origines</option>
                            {areas.map(area => (
                                <option key={area.strArea} value={area.strArea}>
                                    {area.strArea}
                                </option>
                            ))}
                        </select>
                    </div>

                    {(selectedCategory || selectedArea) && (
                        <button
                            className="clear-filters-btn"
                            onClick={() => {
                                setSelectedCategory('');
                                setSelectedArea('');
                            }}
                        >
                            ✖ Effacer les filtres
                        </button>
                    )}
                </div>

                {/* Liste des recettes */}
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Chargement des recettes...</p>
                    </div>
                ) : (
                    <>
                        <div className="recipes-header">
                            <h2>
                                {showOnlyFavorites ? 'Mes Favoris' : 'Recettes Populaires'}
                            </h2>
                            <span className="recipes-count">
                                {filteredRecipes.length} recette{filteredRecipes.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="recipes-grid">
                            {filteredRecipes.map(recipe => (
                                <div key={recipe.idMeal} className="recipe-card">
                                    <div className="recipe-card-image-container">
                                        <img
                                            src={recipe.strMealThumb}
                                            alt={recipe.strMeal}
                                            className="recipe-card-image"
                                            onClick={() => handleRecipeClick(recipe.idMeal, recipe.strMeal)}
                                        />
                                        <button
                                            className={`favorite-btn ${favorites.includes(recipe.idMeal) ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(recipe.idMeal);
                                            }}
                                            title={favorites.includes(recipe.idMeal) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                        >
                                            {favorites.includes(recipe.idMeal) ? '❤️' : '🤍'}
                                        </button>
                                    </div>

                                    <div className="recipe-card-content">
                                        <h3
                                            className="recipe-card-title"
                                            onClick={() => handleRecipeClick(recipe.idMeal, recipe.strMeal)}
                                        >
                                            {recipe.strMeal}
                                        </h3>
                                        <div className="recipe-card-meta">
                                            <span className="recipe-card-badge">{recipe.strCategory}</span>
                                            <span className="recipe-card-badge">{recipe.strArea}</span>
                                        </div>

                                        <div className="recipe-card-actions">
                                            <button
                                                className="action-btn"
                                                onClick={() => handleShare(recipe)}
                                                title="Partager"
                                            >
                                                🔗 Partager
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredRecipes.length === 0 && (
                            <div className="no-results">
                                <p>😔 Aucune recette trouvée</p>
                                {(selectedCategory || selectedArea) && (
                                    <button
                                        className="clear-filters-btn"
                                        onClick={() => {
                                            setSelectedCategory('');
                                            setSelectedArea('');
                                        }}
                                    >
                                        Effacer les filtres
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Home;
