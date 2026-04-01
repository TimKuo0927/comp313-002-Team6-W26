import './App.css'
import { HashRouter, Routes, Route } from 'react-router';
import HomePage from './components/HomePage';
import DemoPage from './components/DemoPage';
import ExercisePage from './components/ExercisePage';
import Layout from './components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"  element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/exercise" element={<ExercisePage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
