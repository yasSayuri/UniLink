import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import UniversitySupport from './pages/UniversitySupport';
import Profile from './pages/Profile';
import Communities from './pages/Communities';
import SavedPosts from './pages/SavedPosts';
import Events from './pages/Events';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        
        <Route path="/register" element={<Register />} />

        <Route path="/feed" element={<Feed />} />

        <Route path="/apoio-universitario" element={<UniversitySupport />} />

        <Route path="/comunidades" element={<Communities />} />

        <Route path="/salvos" element={<SavedPosts />} />

        <Route path="/eventos" element={<Events />} />

        <Route path="/perfil" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;