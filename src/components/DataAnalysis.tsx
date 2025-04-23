import React, { useState } from 'react';
import Papa from 'papaparse';
import * as math from 'mathjs';

interface DataStats {
  mean: number;
  median: number;
  standardDeviation: number;
  min: number;
  max: number;
  variance: number;
  range: number;
  sum: number;
}

interface StatExplanation {
  title: string;
  value: string;
  formula: string;
  description: string;
  interpretation: string;
}

const convertMathResult = (result: math.MathType): number => {
  if (typeof result === 'number') return result;
  if (math.isMatrix(result)) {
    try {
      return convertMathResult(result.get([0]));
    } catch {
      return 0;
    }
  }
  if (Array.isArray(result)) {
    const firstValue = result.flat(Infinity)[0];
    return firstValue !== undefined ? convertMathResult(firstValue) : 0;
  }
  if (math.isComplex(result)) return result.re;
  if (math.isFraction(result) || math.isBigNumber(result)) {
    try {
      return Number(result);
    } catch {
      return 0;
    }
  }
  try {
    const num = Number(result);
    return isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
};

function DataAnalysis() {
  const [data, setData] = useState<number[]>([]);
  const [stats, setStats] = useState<DataStats | null>(null);
  const [explanations, setExplanations] = useState<StatExplanation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    Papa.parse(file, {
      complete: (results) => {
        try {
          const parsedData = results.data.flat();
          const numbers = parsedData
            .map(item => {
              const num = typeof item === 'string' ? parseFloat(item) : Number(item);
              return isNaN(num) ? null : num;
            })
            .filter((n): n is number => n !== null);
          
          if (numbers.length === 0) {
            setError('Aucune donnée numérique valide trouvée');
            return;
          }

          setData(numbers);
          calculateStats(numbers);
        } catch (err) {
          setError('Erreur lors du traitement des données');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      },
      error: (error) => {
        setError(`Erreur de lecture du fichier: ${error.message}`);
        setIsLoading(false);
      },
    });
  };

  const calculateStats = (numbers: number[]): void => {
    try {
      const stats: DataStats = {
        mean: convertMathResult(math.mean(numbers)),
        median: convertMathResult(math.median(numbers)),
        standardDeviation: convertMathResult(math.std(numbers)),
        min: convertMathResult(math.min(numbers)),
        max: convertMathResult(math.max(numbers)),
        variance: convertMathResult(math.variance(numbers)),
        range: convertMathResult(math.max(numbers)) - convertMathResult(math.min(numbers)),
        sum: convertMathResult(math.sum(numbers))
      };
      setStats(stats);

      setExplanations([
        {
          title: "Moyenne",
          value: stats.mean.toFixed(2),
          formula: "Σ(xi) / n",
          description: "La moyenne arithmétique de toutes les valeurs",
          interpretation: `La valeur moyenne de votre dataset est ${stats.mean.toFixed(2)}. Cela représente le centre de gravité de votre distribution.`
        },
        {
          title: "Médiane",
          value: stats.median.toFixed(2),
          formula: "Valeur centrale quand les données sont ordonnées",
          description: "La valeur qui sépare le dataset en deux parties égales",
          interpretation: `50% de vos valeurs sont inférieures à ${stats.median.toFixed(2)} et 50% sont supérieures.`
        },
        {
          title: "Écart-type",
          value: stats.standardDeviation.toFixed(2),
          formula: "√( Σ(xi - μ)² / n )",
          description: "Mesure la dispersion des données autour de la moyenne",
          interpretation: `Environ 68% des valeurs se trouvent entre ${(stats.mean - stats.standardDeviation).toFixed(2)} et ${(stats.mean + stats.standardDeviation).toFixed(2)}.`
        },
        {
          title: "Variance",
          value: stats.variance.toFixed(2),
          formula: "Σ(xi - μ)² / n",
          description: "Carré de l'écart-type, mesure la dispersion",
          interpretation: `Une variance de ${stats.variance.toFixed(2)} indique que les données sont ${stats.variance > stats.mean ? 'très dispersées' : 'relativement groupées'}.`
        },
        {
          title: "Minimum",
          value: stats.min.toFixed(2),
          formula: "min(xi)",
          description: "La plus petite valeur du dataset",
          interpretation: `Votre valeur la plus basse est ${stats.min.toFixed(2)}.`
        },
        {
          title: "Maximum",
          value: stats.max.toFixed(2),
          formula: "max(xi)",
          description: "La plus grande valeur du dataset",
          interpretation: `Votre valeur la plus élevée est ${stats.max.toFixed(2)}.`
        },
        {
          title: "Étendue",
          value: stats.range.toFixed(2),
          formula: "max(xi) - min(xi)",
          description: "Différence entre les valeurs extrêmes",
          interpretation: `Vos données couvrent un intervalle de ${stats.range.toFixed(2)} unités.`
        },
        {
          title: "Somme",
          value: stats.sum.toFixed(2),
          formula: "Σ(xi)",
          description: "Total de toutes les valeurs",
          interpretation: `La somme totale de toutes vos valeurs est ${stats.sum.toFixed(2)}.`
        }
      ]);
    } catch (err) {
      setError('Erreur dans les calculs statistiques');
      console.error(err);
    }
  };

  const toggleDetail = (title: string) => {
    setShowDetails(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Analyse de Données Statistiques</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importer un fichier CSV
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isLoading}
              />
              {isLoading && (
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Le fichier doit contenir une colonne de valeurs numériques
            </p>
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
        </div>
      </div>

      {stats && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Analyse Statistique Détailée
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({data.length} observations)
            </span>
          </h3>

          <div className="space-y-4">
            {explanations.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                  onClick={() => toggleDetail(item.title)}
                >
                  <div>
                    <h4 className="font-medium text-gray-700">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-blue-600 mr-3">{item.value}</span>
                    <svg 
                      className={`w-5 h-5 text-gray-500 transform transition-transform ${showDetails[item.title] ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {showDetails[item.title] && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-gray-500">FORMULE</span>
                      <div className="mt-1 p-2 bg-gray-100 rounded font-mono text-sm">
                        {item.formula}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500">INTERPRÉTATION</span>
                      <p className="mt-1 text-sm text-gray-700">{item.interpretation}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">Résumé Statistique</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-2">Tendance Centrale</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Moyenne</span>
                    <span className="text-sm font-medium">{stats.mean.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Médiane</span>
                    <span className="text-sm font-medium">{stats.median.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Somme</span>
                    <span className="text-sm font-medium">{stats.sum.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-2">Dispersion</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Écart-type</span>
                    <span className="text-sm font-medium">{stats.standardDeviation.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Variance</span>
                    <span className="text-sm font-medium">{stats.variance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Étendue</span>
                    <span className="text-sm font-medium">{stats.range.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-2">Extrêmes</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Minimum</span>
                    <span className="text-sm font-medium">{stats.min.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Maximum</span>
                    <span className="text-sm font-medium">{stats.max.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-2">Distribution</h5>
                <div className="text-sm text-gray-500">
                  <p>Histogramme à venir...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataAnalysis;