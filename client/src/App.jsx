import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Equipment from './pages/Equipment';
import Teams from './pages/Teams';
import Kanban from './pages/Kanban';
import Calendar from './pages/Calendar';
import Requests from './pages/Requests';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: '24px' }}>
        <Routes>
          <Route path="/" element={<Equipment />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/requests" element={<Requests />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}