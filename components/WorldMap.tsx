
import React, { useEffect, useRef } from 'react';
import { AlertLevel } from '../types';

interface WorldMapProps {
  region: string;
  alertLevel: AlertLevel;
}

const regionToIdMap: { [key: string]: string } = {
  'North America': 'north-america',
  'South America': 'south-america',
  'Europe': 'europe',
  'Africa': 'africa', // General Africa
  'West Africa': 'africa',
  'Asia': 'asia',
  'Southeast Asia': 'asia',
  'Oceania': 'oceania',
};

const alertColors: { [key in AlertLevel]: string } = {
    [AlertLevel.CRITICAL]: 'fill-brand-critical',
    [AlertLevel.HIGH]: 'fill-brand-high',
    [AlertLevel.MODERATE]: 'fill-brand-moderate',
    [AlertLevel.LOW]: 'fill-brand-low',
    [AlertLevel.MINIMAL]: 'fill-gray-600',
};


const WorldMap: React.FC<WorldMapProps> = ({ region, alertLevel }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const allPaths = svgRef.current.querySelectorAll('path');
        const targetId = regionToIdMap[region] || null;
        
        allPaths.forEach(path => {
            const pathId = path.getAttribute('data-region-id');
            // Reset styles
            path.setAttribute('class', 'fill-gray-700 stroke-gray-900 transition-all duration-500');
            
            if(pathId === targetId) {
                // Apply pulse and color to target
                path.classList.remove('fill-gray-700');
                path.classList.add(alertColors[alertLevel], 'animate-pulse');
            }
        });

    }, [region, alertLevel]);

  return (
    <svg 
        ref={svgRef}
        className="w-full h-full"
        version="1.1" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1000 567"
    >
        <path data-region-id="north-america" d="M166 113l-37 12-16-3-11 2-15 11-13-3-9 13-11-2-19 11v11l-3 10-14 3-10 12h-9l-9 8-14-6-11 2-15-11-9 11-10-11-12 2-6 5-11 3-12 11h-12l-5 8 2 6 9 8h8l8 5 3-5 5-2 16 2 5 3 24 16 11 15 15 2 24 12 7 13 8 2 21 16 23 2-4-10-8-14-22-29-10-11-11-6-15-12-7-13-17-19-14-7-10 2-14-11-25-19-20-4-13-15-20-11-20-22-13-10-11-10-15-12-19-4-11-9-15-19-12-11-8-12-14-11-20-11-9-10-10-9-10-12-7-9-11-15-11-12-10-9-7-11z"/>
        <path data-region-id="south-america" d="M259 313l-10 13-3 22 2 12-5 13-10 15-3 14 5 17 8 11 13 10 19 8 18-5 11-15 11-22 5-17-4-13-9-13-11-10-12-2-14 5-10 11-11 16-17 11-10-11-15-12-10-12-5-10-2-12 5-11 11-13 8-10 15-12 10-15 3-12-2-12-5-13-10-15-3-14-5-17-8-11-13-10-19-8-11 5-10-11-12-12-14-10-15-10-12-11-10-11-5-10-2-12 5-11 11-13 8-10 15-12 10-15 3-12-2-12-5-13-10-15-3-14-5-17-8-11-13-10-19-8-11 5-10-11-12-12-14-10-15-10-12-11-10-11-5-10-2-12 5-11 11-13 8-10 15-12 10z"/>
        <path data-region-id="africa" d="M421 213l-10 15-8 25 2 23 8 19 10 27 5 20 2 25-5 18-10 15-15 10-20-5-15-20-10-25-5-20 2-25 5-18 10-15 15-10 20 5 15 20 10 25 5 20-2 25 5 18 10 15 15 10 20-5 15-20 10-25 5-20-2-25-5-18-10-15-15-10-20 5-15 20-10 25-5 20 2-25 5-18 10-15 15-10 20-5 15-20-10-25-5-20-2-25-5-18-10-15-15-10-20 5-15 20-10 25-5 20 2 25 5 18 10 15 15 10 20-5-15-20-10-25-5-20z"/>
        <path data-region-id="europe" d="M473 103l-11 15-10 22-3 20 5 18 12 15 15 8 20-2 18-12 10-18 2-20-5-15-12-10-15-5-20 2-18 12-10 18-2 20 5 15 12 10 15 5 20-2 18-12-10-18-2-20-5-15-12-10-15-5-20 2-18 12-10 18-2-20-5-15-12-10-15-5-20 2-18 12-10 18-2-20-5-15-12-10-15-5-20 2-18 12-10 18-2-20-5-15-12-10-15-5-20 2z"/>
        <path data-region-id="asia" d="M570 83l-10 12-15 25-10 30 5 25 15 20 25 10 30-5 25-15 20-25 10-30-5-25-15-20-25-10-30 5-25 15-20 25-10 30 5 25-15-20-25-10-30-5-25 15-20-25-10-30-5-25 15-20-25-10-30-5-25 15-20-25-10-30-5-25 15-20-25-10-30-5-25 15-20-25-10-30-5-25 15-20-25-10-30-5-25 15z"/>
        <path data-region-id="oceania" d="M813 363l-10 8-12 15-5 18 5 15 12 10 18-5 15-12 8-15-5-18-12-10-18 5-15 12-8 15 5 18 12 10 18-5 15-12 8-15-5-18-12-10-18 5-15 12-8 15 5 18 12 10 18-5 15-12 8-15-5-18-12-10-18 5-15 12-8 15 5 18z"/>
    </svg>
  );
};

export default WorldMap;
