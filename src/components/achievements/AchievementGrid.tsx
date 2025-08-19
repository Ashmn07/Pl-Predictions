'use client';

import React from 'react';

interface AchievementGridProps {
  userAchievements?: any[];
  showAll?: boolean;
}

const AchievementGrid: React.FC<AchievementGridProps> = ({ 
  userAchievements = [], 
  showAll = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🏆</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Achievements</h2>
        <p className="text-gray-500">Achievement system coming soon</p>
        <p className="text-sm text-gray-400 mt-2">
          Unlock badges by completing prediction challenges!
        </p>
      </div>
    </div>
  );
};

export default AchievementGrid;