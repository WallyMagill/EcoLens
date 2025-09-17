import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PortfolioDetail } from './pages/PortfolioDetail';
import { PortfolioList } from './pages/PortfolioList';
import { ScenarioAnalysis } from './pages/ScenarioAnalysis';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/portfolios" element={<PortfolioList />} />
        <Route path="/portfolios/:id" element={<PortfolioDetail />} />
        <Route path="/analysis" element={<ScenarioAnalysis />} />
      </Routes>
    </Layout>
  );
}

export default App;
