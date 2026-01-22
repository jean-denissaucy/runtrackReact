import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Header';
import Home from './Home';
import RecipeDetail from './RecipeDetail';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Header présent sur toutes les pages */}
        <Header />

        {/* Routes de l'application */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
