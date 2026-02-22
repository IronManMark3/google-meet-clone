import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Meeting from './pages/Meeting';

function App() {
  return (
    <Router>
      <Routes>
        {/* The Landing Page */}
        <Route path="/" element={<Home />} />
        
        {/* The Actual Video Chat Room */}
        <Route path="/room/:roomId" element={<Meeting />} />
      </Routes>
    </Router>
  );
}

export default App;