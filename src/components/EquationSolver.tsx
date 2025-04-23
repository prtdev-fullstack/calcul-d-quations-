import { useState } from 'react';
import { History, RefreshCw, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface EquationHistory {
  equation: string;
  result: string;
  steps: string[];
  timestamp: Date;
}

function EquationSolver() {
  const [equation, setEquation] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<EquationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const resetForm = () => {
    setEquation('');
    setResult(null);
    setError(null);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const solveWithSteps = (equation: string) => {
    const steps: string[] = [];
    const cleanEquation = equation.replace(/\s+/g, '');
    steps.push(`Équation initiale : ${equation}`);

    // Validation
    if (!cleanEquation.includes('=')) {
      throw new Error('L\'équation doit contenir un signe "="');
    }

    if (!cleanEquation.includes('x')) {
      throw new Error('La variable "x" est requise');
    }

    const [left, right] = cleanEquation.split('=');
    steps.push(`Séparation des membres : Gauche = ${left}, Droit = ${right}`);

    // Extraction des coefficients
    const parseSide = (side: string, sideName: string) => {
      const xTerm = side.match(/([+-]?\d*\.?\d*)x/);
      const constantTerm = side.replace(/([+-]?\d*\.?\d*)x/, '').match(/([+-]?\d+\.?\d*)/);

      const a = xTerm ? 
        (xTerm[1] === '+' || xTerm[1] === '' ? 1 : 
         xTerm[1] === '-' ? -1 : parseFloat(xTerm[1])) : 0;
      
      const b = constantTerm ? parseFloat(constantTerm[1]) : 0;

      steps.push(`Coefficients ${sideName} : ${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}`);
      return { a, b };
    };

    const leftCoef = parseSide(left, 'gauche');
    const rightCoef = parseSide(right, 'droit');

    // Réorganisation
    const totalA = leftCoef.a - rightCoef.a;
    const totalB = rightCoef.b - leftCoef.b;
    steps.push(`Simplification : ${totalA}x = ${totalB}`);

    // Résolution
    if (totalA === 0) {
      if (totalB === 0) {
        steps.push('0 = 0 → L\'équation a une infinité de solutions');
        return {
          result: '∞ (infinité de solutions)',
          steps
        };
      } else {
        steps.push(`${totalB} ≠ 0 → Aucune solution possible`);
        return {
          result: '∅ (aucune solution)',
          steps
        };
      }
    }

    const solution = totalB / totalA;
    steps.push(`Solution : x = ${totalB} / ${totalA} = ${solution}`);
    
    return {
      result: `x = ${solution}`,
      steps
    };
  };

  const solveEquation = () => {
    try {
      setError(null);
      const { result, steps } = solveWithSteps(equation);
      
      setResult(result);
      setHistory(prev => [{
        equation,
        result,
        steps,
        timestamp: new Date()
      }, ...prev]); // Nouvelle équation en premier

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Format invalide. Ex: 2x+3=5 ou x-1=2x+3');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Résolveur d'Équations Linéaires</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="equation" className="block text-sm font-medium text-gray-700 mb-1">
              Entrez votre équation
            </label>
            <input
              type="text"
              id="equation"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder="Ex: 2x + 3 = 5 ou x - 1 = 2x + 3"
              onKeyPress={(e) => e.key === 'Enter' && solveEquation()}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => setEquation('2x + 3 = 5')}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Exemple simple
              </button>
              <button
                onClick={() => setEquation('3x - 2 = x + 4')}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Exemple complexe
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={solveEquation}
              disabled={!equation.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Résoudre
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <RefreshCw className="inline mr-2 w-4 h-4" />
              Réinitialiser
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <History className="inline mr-2 w-4 h-4" />
              {showHistory ? 'Masquer' : 'Afficher'} l'historique
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex items-center text-red-700">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Solution trouvée :</h3>
                <div className="mt-1 text-xl font-bold text-green-900">{result}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showHistory && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <History className="w-5 h-5 mr-2 text-gray-600" />
            Historique des Résolutions
          </h3>
          
          {history.length === 0 ? (
            <p className="text-gray-500 italic">Aucune équation résolue encore</p>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900">{item.equation}</span>
                      <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {item.result}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => copyToClipboard(`${item.equation}\n${item.result}\n${item.steps.join('\n')}`, index)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                        title="Copier"
                      >
                        {copiedIndex === index ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setExpandedSteps(expandedSteps === index ? null : index)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                      >
                        {expandedSteps === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {expandedSteps === index && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Détail des étapes de résolution
                      </h4>
                      <ul className="space-y-2 pl-5">
                        {item.steps.map((step, i) => (
                          <li key={i} className="text-sm text-gray-600 relative pl-5">
                            <span className="absolute left-0 text-gray-400">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EquationSolver;