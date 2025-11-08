import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import Search from './pages/Search';
import Document from './pages/Document';
import About from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/document/:id" element={<Document />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-200 py-6 mt-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>© 2024 AI-Powered Thesis Repository. Built with React & LLAMA 3.2</p>
          </div>
        </footer>
        
        {/* Global ChatBot - Available on all pages */}
        <ChatBot />
      </div>
    </Router>
  );
}

export default App;

