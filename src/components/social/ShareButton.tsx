'use client';

import React, { useState } from 'react';
import { 
  SOCIAL_PLATFORMS, 
  ShareData, 
  shareContent, 
  copyToClipboard,
  shareViaEmail,
  shareViaSMS
} from '@/lib/socialSharing';

interface ShareButtonProps {
  data: ShareData;
  buttonText?: string;
  buttonClass?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  data, 
  buttonText = 'Share',
  buttonClass = 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors',
  size = 'md',
  showLabel = true
}) => {
  const [showModal, setShowModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyLink = async () => {
    const url = data.url || window.location.href;
    const success = await copyToClipboard(url);
    
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const iconSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const buttonSize = size === 'sm' ? 'p-2' : size === 'lg' ? 'p-4' : 'p-3';

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={buttonClass}
      >
        <span className="mr-2">📤</span>
        {showLabel && buttonText}
      </button>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Share</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Content Preview */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 mb-1">{data.title}</h4>
              <p className="text-sm text-gray-600">{data.text}</p>
              {data.url && (
                <p className="text-xs text-blue-600 mt-1 truncate">{data.url}</p>
              )}
            </div>

            {/* Social Platforms */}
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Share on social media</h4>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => {
                      shareContent(platform, data);
                      setShowModal(false);
                    }}
                    className={`${buttonSize} ${platform.color} text-white rounded-lg transition-colors flex flex-col items-center space-y-1`}
                  >
                    <span className={iconSize}>{platform.icon}</span>
                    {showLabel && (
                      <span className="text-xs font-medium">{platform.name}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Direct Share Options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Or share directly</h4>
                
                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🔗</span>
                    <span className="text-sm font-medium text-gray-900">Copy link</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    copySuccess ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {copySuccess ? '✓ Copied' : 'Copy'}
                  </span>
                </button>

                {/* Email */}
                <button
                  onClick={() => {
                    shareViaEmail(data);
                    setShowModal(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">📧</span>
                  <span className="text-sm font-medium text-gray-900">Share via email</span>
                </button>

                {/* SMS */}
                <button
                  onClick={() => {
                    shareViaSMS(data);
                    setShowModal(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">💬</span>
                  <span className="text-sm font-medium text-gray-900">Share via SMS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;