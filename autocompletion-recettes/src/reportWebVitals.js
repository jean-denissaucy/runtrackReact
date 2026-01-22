// Fonction pour mesurer et rapporter les performances de l'application
// Utilise les métriques Web Vitals de Google
const reportWebVitals = onPerfEntry => {
  // Vérifie que onPerfEntry est une fonction valide
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Import dynamique de la bibliothèque web-vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);  // Cumulative Layout Shift (stabilité visuelle)
      getFID(onPerfEntry);  // First Input Delay (temps de réponse à la première interaction)
      getFCP(onPerfEntry);  // First Contentful Paint (premier affichage de contenu)
      getLCP(onPerfEntry);  // Largest Contentful Paint (temps de chargement du contenu principal)
      getTTFB(onPerfEntry); // Time to First Byte (temps de réponse du serveur)
    });
  }
};

export default reportWebVitals;
