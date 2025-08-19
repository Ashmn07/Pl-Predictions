'use client';

import React from 'react';
import { Achievement } from '@/lib/mockUsers';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  unlocked?: boolean;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  size = 'medium',
  showDetails = false,
  unlocked = true 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-16 h-16 text-xs',
          icon: 'text-lg',
          text: 'text-xs'
        };
      case 'large':
        return {
          container: 'w-24 h-24 text-sm',
          icon: 'text-3xl',
          text: 'text-sm'
        };
      default:
        return {
          container: 'w-20 h-20 text-sm',
          icon: 'text-2xl',
          text: 'text-sm'
        };
    }
  };

  const getRarityColors = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return unlocked 
          ? 'from-yellow-400 via-yellow-500 to-yellow-600 border-yellow-400 shadow-yellow-200'
          : 'from-gray-200 via-gray-300 to-gray-400 border-gray-300';
      case 'epic':
        return unlocked
          ? 'from-purple-400 via-purple-500 to-purple-600 border-purple-400 shadow-purple-200'
          : 'from-gray-200 via-gray-300 to-gray-400 border-gray-300';
      case 'rare':
        return unlocked
          ? 'from-blue-400 via-blue-500 to-blue-600 border-blue-400 shadow-blue-200'
          : 'from-gray-200 via-gray-300 to-gray-400 border-gray-300';
      default:
        return unlocked
          ? 'from-green-400 via-green-500 to-green-600 border-green-400 shadow-green-200'
          : 'from-gray-200 via-gray-300 to-gray-400 border-gray-300';
    }
  };

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'accuracy': return '🎯';
      case 'volume': return '📊';
      case 'streak': return '🔥';
      case 'special': return '⭐';
      default: return '🏆';
    }
  };

  const sizeClasses = getSizeClasses();
  const rarityColors = getRarityColors(achievement.rarity);
  const categoryIcon = getCategoryIcon(achievement.category);

  if (showDetails) {
    return (
      <div className={`bg-white rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-lg ${
        unlocked ? 'border-gray-200 hover:border-gray-300' : 'border-gray-100 opacity-60'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`bg-gradient-to-br ${rarityColors} rounded-full border-2 flex items-center justify-center ${sizeClasses.container} shadow-lg flex-shrink-0`}>
            <span className={`${sizeClasses.icon} ${unlocked ? 'opacity-100' : 'opacity-40'}`}>
              {unlocked ? achievement.icon : '🔒'}
            </span>
          </div>
          
          <div className="flex-grow min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-semibold ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                {achievement.name}
              </h3>
              <span className="text-xs" title={`${achievement.category} achievement`}>
                {categoryIcon}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {achievement.rarity}
              </span>
            </div>
            
            <p className={`text-sm ${unlocked ? 'text-gray-600' : 'text-gray-400'} mb-2`}>
              {achievement.description}
            </p>
            
            {unlocked && achievement.unlockedAt && (
              <p className="text-xs text-green-600 font-medium">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            )}
            
            {!unlocked && (
              <p className="text-xs text-gray-400 font-medium">
                Not yet unlocked
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Simple badge view
  return (
    <div 
      className={`bg-gradient-to-br ${rarityColors} rounded-full border-2 flex items-center justify-center ${sizeClasses.container} shadow-lg transition-transform hover:scale-105 cursor-pointer`}
      title={`${achievement.name}: ${achievement.description}${unlocked && achievement.unlockedAt ? ` (Unlocked ${new Date(achievement.unlockedAt).toLocaleDateString()})` : ''}`}
    >
      <span className={`${sizeClasses.icon} ${unlocked ? 'opacity-100' : 'opacity-40'}`}>
        {unlocked ? achievement.icon : '🔒'}
      </span>
    </div>
  );
};

export default AchievementBadge;