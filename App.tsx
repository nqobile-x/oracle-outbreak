
import React, { useState, useEffect, useCallback } from 'react';
import { analyzeOutbreakRisk } from './services/geminiService';
import { OutbreakAnalysis } from './types';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';

// Mock data aggregation for demonstration
const getMockAggregatedData = () => {
  const regions = [
    "Southeast Asia", "West Africa", "South America", "Europe", "North America"
  ];
  const symptoms = [
    "unusual fever and rash", "severe respiratory distress", "hemorrhagic symptoms",
    "neurological issues", "rapid onset flu-like symptoms"
  ];
  const randomRegion = regions[Math.floor(Math.random() * regions.length)];
  const randomSymptom = symptoms[Math.floor(Math.random() * symptoms.length)];

  return `Analyze the following data for disease outbreak signals:

SOCIAL MEDIA DATA:
Multiple posts from ${randomRegion} on Twitter and local forums mentioning "${randomSymptom}" spreading in several villages. Posts mention overwhelmed local clinics.

NEWS HEADLINES:
Local news outlet in ${randomRegion} reports "Mystery Illness Claims 5 Lives". International health organizations are investigating.

GOOGLE TRENDS:
A 1200% spike in search for "${randomSymptom} treatment" and "local pandemic" in the last 48 hours in ${randomRegion}.

WEATHER CONDITIONS:
Recent heavy flooding in the area, followed by a spike in mosquito populations. Temperatures are high, favoring vector-borne diseases.

TRAVEL DATA:
Data shows three international flights departed from the main airport in ${randomRegion} in the last 24 hours to major global hubs.

Task: Identify any unusual patterns, clusters, or anomalies that could indicate an emerging disease outbreak. Cross-reference with historical data. Provide a full risk assessment and recommended actions in the specified JSON format.`;
};

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<OutbreakAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const runAnalysis = useCallback(async () => {
    console.log('Running new analysis...');
    setError(null);
    if (!analysis) { // only show main loader on first load
        setLoading(true);
    }
    try {
      const mockData = getMockAggregatedData();
      const result = await analyzeOutbreakRisk(mockData);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to fetch and analyze outbreak data. Please check the console for details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [analysis]);

  useEffect(() => {
    runAnalysis(); // Initial analysis
    const interval = setInterval(() => {
      runAnalysis();
    }, 300000); // Run analysis every 5 minutes

    return () => clearInterval(interval); // Cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      {loading && !analysis && (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <svg className="animate-spin h-10 w-10 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-2xl font-semibold text-white">Initializing Surveillance System...</h2>
            <p className="text-gray-400 mt-2">Outbreak Oracle is analyzing global data streams. This may take a moment.</p>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center min-h-screen text-center p-4">
            <div className="bg-red-900/50 border border-red-500 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-red-400">An Error Occurred</h2>
                <p className="text-red-200 mt-2">{error}</p>
            </div>
        </div>
      )}
      {analysis && (
         <>
            <Dashboard analysis={analysis} onOpenChat={() => setIsChatOpen(true)} />
            <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} analysis={analysis} />
         </>
      )}
    </div>
  );
};

export default App;
