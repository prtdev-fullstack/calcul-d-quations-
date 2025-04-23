import  { useState } from 'react';
import { Calculator, BarChart as ChartBar, Database } from 'lucide-react';
import EquationSolver from './components/EquationSolver';
import DataAnalysis from './components/DataAnalysis';


type Tab = 'equations' | 'analysis' | 'visualization';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('equations');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Analyse Mathématique Avancée</h1>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('equations')}
              className={`flex items-center px-4 py-3 text-sm font-medium ${
                activeTab === 'equations'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calculator className="w-5 h-5 mr-2" />
              Équations
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex items-center px-4 py-3 text-sm font-medium ${
                activeTab === 'analysis'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Database className="w-5 h-5 mr-2" />
              Analyse de Données
            </button>
            
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'equations' && <EquationSolver />}
          {activeTab === 'analysis' && <DataAnalysis />}
          
        </div>
      </main>
    </div>
  );
}

export default App;