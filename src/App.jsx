import { Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import ProductListingPage from './pages/ProductListingPage.jsx';
import styles from './App.module.css';

export function App() {
  return (
    <div className={styles.app}>
      <Navbar />
      <div className={styles.content}>
        {/* Catches render-time crashes so a bad product record can never leave
            the user staring at a blank white page. */}
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<ProductListingPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
