'use client';

import React from 'react';

interface ProfileHeaderProps {
  user?: any;
  userStats?: any;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, userStats }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center py-8">
        <div className="text-4xl mb-4">👤</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Header</h2>
        <p className="text-gray-500">Enhanced profile display coming soon</p>
      </div>
    </div>
  );
};

export default ProfileHeader;