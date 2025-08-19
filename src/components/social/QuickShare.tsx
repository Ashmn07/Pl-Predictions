'use client';

import React from 'react';
import { 
  SOCIAL_PLATFORMS, 
  ShareData, 
  shareContent,
  SHARE_TEMPLATES,
  generateShareableStats,
  generatePredictionShareData
} from '@/lib/socialSharing';

interface QuickShareProps {
  type: 'prediction' | 'stats' | 'achievement' | 'league' | 'custom';
  data?: Partial<ShareData>;
  context?: {
    homeTeam?: string;
    awayTeam?: string;
    prediction?: string;
    stats?: {
      rank?: number;
      points?: number;
      accuracy?: number;
      predictions?: number;
      achievements?: number;
    };
    achievement?: string;
    leagueName?: string;
  };
  platforms?: string[];
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical' | 'grid';
}

const QuickShare: React.FC<QuickShareProps> = ({
  type,
  data = {},
  context = {},
  platforms = ['Twitter', 'Facebook', 'WhatsApp'],
  size = 'md',
  layout = 'horizontal'
}) => {
  const getShareData = (): ShareData => {
    switch (type) {
      case 'prediction':
        if (context.homeTeam && context.awayTeam && context.prediction) {
          return generatePredictionShareData(
            context.homeTeam,
            context.awayTeam,
            context.prediction
          );
        }
        return { ...SHARE_TEMPLATES.prediction, ...data };

      case 'stats':
        if (context.stats) {
          return generateShareableStats(context.stats);
        }
        return { ...SHARE_TEMPLATES.accuracy, ...data };

      case 'achievement':
        return {
          ...SHARE_TEMPLATES.achievement,
          text: context.achievement 
            ? `Just unlocked: ${context.achievement}! 🏆`
            : SHARE_TEMPLATES.achievement.text,
          ...data
        };

      case 'league':
        return {
          ...SHARE_TEMPLATES.league,
          text: context.leagueName
            ? `Join "${context.leagueName}" - my Premier League predictions league!`
            : SHARE_TEMPLATES.league.text,
          ...data
        };

      default:
        return {
          title: 'Premier League Predictions',
          text: 'Check out this Premier League predictions app!',
          ...data
        };
    }
  };

  const selectedPlatforms = SOCIAL_PLATFORMS.filter(platform =>
    platforms.includes(platform.name)
  );

  const shareData = getShareData();
  
  const iconSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const buttonSize = size === 'sm' ? 'p-2' : size === 'lg' ? 'p-4' : 'p-3';

  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col space-y-2';
      case 'grid':
        return 'grid grid-cols-2 gap-2';
      default:
        return 'flex space-x-2';
    }
  };

  if (selectedPlatforms.length === 0) {
    return null;
  }

  return (
    <div className={getLayoutClasses()}>
      {selectedPlatforms.map((platform) => (
        <button
          key={platform.name}
          onClick={() => shareContent(platform, shareData)}
          className={`${buttonSize} ${platform.color} text-white rounded-lg transition-colors flex items-center justify-center space-x-2 min-w-fit`}
          title={`Share on ${platform.name}`}
        >
          <span className={iconSize}>{platform.icon}</span>
          {(size === 'lg' || layout === 'vertical') && (
            <span className="text-sm font-medium">{platform.name}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default QuickShare;