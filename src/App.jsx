import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router';
import HomePage from './components/HomePage';
import DemoPage from './components/DemoPage';
import ExercisePage from './components/ExercisePage';
import Layout from './components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route  element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/exercise" element={<ExercisePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
