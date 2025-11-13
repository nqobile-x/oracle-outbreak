
import React, { useState } from 'react';
import { OutbreakAnalysis, AlertLevel } from '../types';
import { GlobeIcon, AlertIcon, ChartIcon, MapIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ChatBubbleOvalLeftEllipsisIcon } from './icons';
import WorldMap from './WorldMap';
import { generateSpeech } from '../services/geminiService';
import { playAudio } from '../utils/audio';

const alertStyles: { [key in AlertLevel]: { base: string; text: string; icon: string } } = {
  [AlertLevel.CRITICAL]: { base: 'bg-red-900/50 border-brand-critical', text: 'text-brand-critical', icon: 'text-brand-critical' },
  [AlertLevel.HIGH]: { base: 'bg-orange-900/50 border-brand-high', text: 'text-brand-high', icon: 'text-brand-high' },
  [AlertLevel.MODERATE]: { base: 'bg-yellow-900/50 border-brand-moderate', text: 'text-brand-moderate', icon: 'text-brand-moderate' },
  [AlertLevel.LOW]: { base: 'bg-green-900/50 border-brand-low', text: 'text-brand-low', icon: 'text-brand-low' },
  [AlertLevel.MINIMAL]: { base: 'bg-gray-700/50 border-brand-minimal', text: 'text-brand-minimal', icon: 'text-brand-minimal' },
};

interface DashboardProps {
  analysis: OutbreakAnalysis | null;
  onOpenChat: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ analysis, onOpenChat }) => {
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  if (!analysis) {
    return null;
  }
  
  const handleSpeak = async (text: string, textIdentifier: string) => {
    if (speakingText) return;
    try {
        setSpeakingText(textIdentifier);
        const audioData = await generateSpeech(text);
        await playAudio(audioData);
    } catch(error) {
        console.error("Speech generation failed", error);
    } finally {
        setSpeakingText(null);
    }
  }

  const currentAlertStyle = alertStyles[analysis.alertLevel];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header className="flex items-center space-x-4">
        <GlobeIcon className="w-10 h-10 text-cyan-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">OUTBREAK ORACLE</h1>
          <p className="text-gray-400">Global Disease Surveillance Dashboard</p>
        </div>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><MapIcon className="w-6 h-6 text-cyan-400"/> World Heat Map</h2>
           <div className="bg-gray-900 rounded-lg flex items-center justify-center h-64 overflow-hidden">
                <WorldMap region={analysis.location.region} alertLevel={analysis.alertLevel} />
           </div>
           <div className="flex justify-center items-center space-x-4 mt-4 text-xs">
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-brand-critical"></div>Critical</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-brand-high"></div>High</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-brand-moderate"></div>Moderate</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-brand-low"></div>Low</span>
           </div>
        </div>

        <div className={`lg:col-span-1 bg-gray-800/50 p-6 rounded-xl border-l-4 shadow-lg ${currentAlertStyle.base}`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><AlertIcon className="w-6 h-6 text-cyan-400"/> Active Alerts</h2>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${currentAlertStyle.base}`}>
              <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-lg ${currentAlertStyle.text}`}>{analysis.alertLevel}</p>
                      <button onClick={() => handleSpeak(analysis.alertLevel, 'alertLevel')} disabled={!!speakingText} className="text-gray-400 hover:text-white transition-colors">
                        { speakingText === 'alertLevel' ? <SpeakerXMarkIcon className="w-5 h-5 animate-pulse" /> : <SpeakerWaveIcon className="w-5 h-5"/>}
                      </button>
                    </div>
                    <p className="text-white font-semibold text-xl">{analysis.location.region}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-gray-400">{analysis.diseaseName}</p>
                         <button onClick={() => handleSpeak(analysis.diseaseName, 'diseaseName')} disabled={!!speakingText} className="text-gray-400 hover:text-white transition-colors">
                            { speakingText === 'diseaseName' ? <SpeakerXMarkIcon className="w-5 h-5 animate-pulse" /> : <SpeakerWaveIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Risk Score</p>
                    <p className={`text-3xl font-bold ${currentAlertStyle.text}`}>{analysis.riskScore}</p>
                  </div>
              </div>
              <div className="mt-4 text-sm text-gray-300">
                <p><strong className="font-semibold text-gray-200">R0:</strong> {analysis.analysis.transmissionRate}</p>
                <p><strong className="font-semibold text-gray-200">Velocity:</strong> {analysis.analysis.spreadVelocity}</p>
              </div>
            </div>
             <div>
                <h3 className="font-semibold text-gray-200 mb-2">Key Signals</h3>
                <ul className="space-y-2 text-sm">
                    {analysis.signals.slice(0, 3).map((signal, i) => (
                        <li key={i} className="bg-gray-900/50 p-2 rounded-md">
                           <span className="font-bold text-cyan-400">{signal.source}: </span> 
                           <span className="text-gray-300">{signal.description}</span>
                        </li>
                    ))}
                </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><ChartIcon className="w-6 h-6 text-cyan-400"/> Predictive Analytics & Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-gray-200 mb-2">Projections</h3>
                    <div className="space-y-2 text-sm">
                        <div className="bg-gray-900/50 p-3 rounded-md">
                            <p className="font-bold text-gray-400">7-Day Projection</p>
                            <p className="text-lg font-semibold text-white">{analysis.predictiveModel['7dayProjection']}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-md">
                            <p className="font-bold text-gray-400">30-Day Projection</p>
                            <p className="text-lg font-semibold text-white">{analysis.predictiveModel['30dayProjection']}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded-md">
                            <p className="font-bold text-gray-400">Affected Regions</p>
                            <p className="text-base text-white">{analysis.predictiveModel.affectedRegions.join(', ')}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-200 mb-2">Top Recommendations</h3>
                    <ul className="space-y-2 text-sm">
                       {analysis.recommendations.slice(0, 3).map((rec, i) => (
                           <li key={i} className="bg-gray-900/50 p-3 rounded-md">
                               <p className={`font-bold ${rec.priority === 'IMMEDIATE' ? 'text-red-400' : 'text-yellow-400'}`}>{rec.priority}</p>
                               <p className="text-gray-200">{rec.action}</p>
                               <p className="text-xs text-gray-400">Target: {rec.targetAudience}</p>
                           </li>
                       ))}
                    </ul>
                </div>
          </div>
        </div>
      </main>

       <button
        onClick={onOpenChat}
        aria-label="Open AI Chat"
        className="fixed bottom-8 right-8 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
      >
        <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
      </button>
    </div>
  );
};

export default Dashboard;
