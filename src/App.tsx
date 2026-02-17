import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Randomizer from './pages/Randomizer';
import Trading from './pages/Trading';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="randomizer" element={<Randomizer />} />
        </Route>
        <Route path="trading" element={<Trading />} />
      </Routes>
    </BrowserRouter >
  );
}

export default App;
