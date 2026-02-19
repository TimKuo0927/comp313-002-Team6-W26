import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router';
import HomePage from './components/HomePage';
import DemoPage from './components/DemoPage';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route  element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<DemoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
