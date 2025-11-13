
export enum AlertLevel {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MODERATE = "MODERATE",
  LOW = "LOW",
  MINIMAL = "MINIMAL",
}

export interface Signal {
  source: string;
  description: string;
  severity: string;
  timestamp: string;
}

export interface Recommendation {
  action: string;
  priority: string;
  targetAudience: string;
  timeframe: string;
}

export interface OutbreakAnalysis {
  alertLevel: AlertLevel;
  riskScore: number;
  diseaseName: string;
  location: {
    country: string;
    region: string;
    coordinates: string;
  };
  signals: Signal[];
  analysis: {
    transmissionRate: string;
    spreadVelocity: string;
    populationAtRisk: string;
    historicalComparison: string;
  };
  recommendations: Recommendation[];
  predictiveModel: {
    "7dayProjection": string;
    "30dayProjection": string;
    peakDate: string;
    affectedRegions: string[];
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
