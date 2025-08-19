export interface ShareData {
  title: string;
  text: string;
  url?: string;
  image?: string;
}

export interface SocialPlatform {
  name: string;
  icon: string;
  shareUrl: (data: ShareData) => string;
  color: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    name: 'Twitter',
    icon: '🐦',
    color: 'bg-blue-500 hover:bg-blue-600',
    shareUrl: (data: ShareData) => {
      const url = encodeURIComponent(data.url || window.location.href);
      const text = encodeURIComponent(`${data.text} ${url}`);
      return `https://twitter.com/intent/tweet?text=${text}`;
    }
  },
  {
    name: 'Facebook',
    icon: '📘',
    color: 'bg-blue-600 hover:bg-blue-700',
    shareUrl: (data: ShareData) => {
      const url = encodeURIComponent(data.url || window.location.href);
      const quote = encodeURIComponent(data.text);
      return `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;
    }
  },
  {
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-blue-700 hover:bg-blue-800',
    shareUrl: (data: ShareData) => {
      const url = encodeURIComponent(data.url || window.location.href);
      const title = encodeURIComponent(data.title);
      const summary = encodeURIComponent(data.text);
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
    }
  },
  {
    name: 'WhatsApp',
    icon: '💬',
    color: 'bg-green-500 hover:bg-green-600',
    shareUrl: (data: ShareData) => {
      const text = encodeURIComponent(`${data.text} ${data.url || window.location.href}`);
      return `https://wa.me/?text=${text}`;
    }
  },
  {
    name: 'Reddit',
    icon: '🤖',
    color: 'bg-orange-500 hover:bg-orange-600',
    shareUrl: (data: ShareData) => {
      const url = encodeURIComponent(data.url || window.location.href);
      const title = encodeURIComponent(data.title);
      return `https://reddit.com/submit?url=${url}&title=${title}`;
    }
  },
  {
    name: 'Telegram',
    icon: '✈️',
    color: 'bg-blue-400 hover:bg-blue-500',
    shareUrl: (data: ShareData) => {
      const text = encodeURIComponent(`${data.text} ${data.url || window.location.href}`);
      return `https://t.me/share/url?text=${text}`;
    }
  }
];

// Predefined share templates for different contexts
export const SHARE_TEMPLATES = {
  prediction: {
    title: 'My Premier League Prediction',
    text: 'Check out my latest Premier League predictions! Think you can do better?'
  },
  leaderboard: {
    title: 'Premier League Predictions Leaderboard',
    text: 'Check out my ranking in the Premier League predictions leaderboard!'
  },
  achievement: {
    title: 'New Achievement Unlocked!',
    text: 'Just unlocked a new achievement in Premier League predictions!'
  },
  league: {
    title: 'Join My Premier League Predictions League',
    text: 'Join my private Premier League predictions league and compete with friends!'
  },
  accuracy: {
    title: 'My Prediction Accuracy',
    text: 'Check out my Premier League prediction accuracy stats!'
  },
  streak: {
    title: 'Prediction Streak',
    text: 'I\'m on a hot streak with my Premier League predictions!'
  }
};

export const shareContent = async (platform: SocialPlatform, data: ShareData): Promise<void> => {
  const shareUrl = platform.shareUrl(data);
  
  // Check if Web Share API is available and supported
  if (navigator.share && platform.name === 'Native') {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url || window.location.href
      });
      return;
    } catch (error) {
      console.log('Native sharing failed, falling back to web sharing');
    }
  }
  
  // Open sharing window
  const width = 600;
  const height = 400;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  window.open(
    shareUrl,
    `share-${platform.name}`,
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  );
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for browsers that don&apos;t support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const generateInviteLink = (leagueId: string, joinCode?: string): string => {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams();
  
  if (joinCode) {
    params.set('code', joinCode);
  }
  
  const queryString = params.toString();
  return `${baseUrl}/leagues/${leagueId}${queryString ? `?${queryString}` : ''}`;
};

export const generateShareableStats = (stats: {
  rank?: number;
  points?: number;
  accuracy?: number;
  predictions?: number;
  achievements?: number;
}): ShareData => {
  const { rank, points, accuracy, predictions, achievements } = stats;
  
  let text = 'Check out my Premier League prediction stats: ';
  const statParts = [];
  
  if (rank) statParts.push(`#${rank} rank`);
  if (points) statParts.push(`${points} points`);
  if (accuracy) statParts.push(`${accuracy}% accuracy`);
  if (predictions) statParts.push(`${predictions} predictions made`);
  if (achievements) statParts.push(`${achievements} achievements`);
  
  text += statParts.join(', ');
  text += ' 🏆⚽';
  
  return {
    title: 'My Premier League Prediction Stats',
    text
  };
};

export const generatePredictionShareData = (
  homeTeam: string,
  awayTeam: string,
  prediction: string,
  confidence?: number
): ShareData => {
  let text = `My prediction for ${homeTeam} vs ${awayTeam}: ${prediction}`;
  
  if (confidence) {
    text += ` (${confidence}% confidence)`;
  }
  
  text += ' ⚽🔮 What do you think?';
  
  return {
    title: `${homeTeam} vs ${awayTeam} Prediction`,
    text
  };
};

// Email sharing functionality
export const shareViaEmail = (data: ShareData, recipientEmail?: string): void => {
  const subject = encodeURIComponent(data.title);
  const body = encodeURIComponent(`${data.text}\n\n${data.url || window.location.href}`);
  const recipient = recipientEmail ? encodeURIComponent(recipientEmail) : '';
  
  const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;
  window.location.href = mailtoUrl;
};

// SMS sharing functionality
export const shareViaSMS = (data: ShareData, phoneNumber?: string): void => {
  const message = encodeURIComponent(`${data.text} ${data.url || window.location.href}`);
  const recipient = phoneNumber ? encodeURIComponent(phoneNumber) : '';
  
  const smsUrl = `sms:${recipient}?body=${message}`;
  window.location.href = smsUrl;
};