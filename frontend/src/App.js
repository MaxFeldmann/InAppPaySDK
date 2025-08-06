import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './components/Landing/LandingPage.jsx';
import HomePage from './components/Home/HomePage.jsx';
import InAppSDKDoc from './components/InAppSDKDoc/InAppSDKDoc.jsx';
import JavaSDKFunctions from './components/InAppSDKDoc/JavaSDKFunctions.jsx';

const BottomNavigation = () => {
  return (
    <footer className="bottom-navigation">
      <div className="bottom-nav-container">
        <div className="bottom-nav-links">
          <a 
            href="/java-doc" 
            className="bottom-nav-link"
          >
            Java SDK Documentation
          </a>
          <a 
            href="/doc" 
            className="bottom-nav-link"
          >
            API Documentation
          </a>
        </div>
        <div className="bottom-nav-divider"></div>
        <p className="bottom-nav-text">
          Need help? Check out our comprehensive documentation
        </p>
      </div>
    </footer>
  );
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="app-layout">
      <main className="main-content">
        {children}
      </main>
      {!isLandingPage && <BottomNavigation />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/doc" element={<InAppSDKDoc />} />
          <Route path="/java-doc" element={<JavaSDKFunctions />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;