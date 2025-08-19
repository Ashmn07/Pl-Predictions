'use client';

import React from 'react';
import { SortOption, FilterOption } from '@/app/leaderboard/page';

interface LeaderboardFiltersProps {
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  filterBy: FilterOption;
  setFilterBy: (filter: FilterOption) => void;
}

const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({
  sortBy,
  setSortBy,
  filterBy,
  setFilterBy
}) => {
  const sortOptions = [
    { value: 'totalPoints' as SortOption, label: 'Total Points', icon: '🏆' },
    { value: 'weeklyPoints' as SortOption, label: 'This Week', icon: '📈' },
    { value: 'accuracyRate' as SortOption, label: 'Accuracy', icon: '🎯' }
  ];

  const filterOptions = [
    { value: 'all' as FilterOption, label: 'All Predictors', icon: '👥' },
    { value: 'top10' as FilterOption, label: 'Top 10', icon: '🔟' },
    { value: 'friends' as FilterOption, label: 'Your Circle', icon: '👫' },
    { value: 'rising' as FilterOption, label: 'Rising Stars', icon: '🌟' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Sort Options */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex space-x-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  sortBy === option.value
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Options */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <span className="text-sm font-medium text-gray-700">Show:</span>
          <div className="flex space-x-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterBy(option.value)}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filterBy === option.value
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active filters indicator */}
      {(sortBy !== 'totalPoints' || filterBy !== 'all') && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Active filters:</span>
              {sortBy !== 'totalPoints' && (
                <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 rounded">
                  <span>{sortOptions.find(o => o.value === sortBy)?.icon}</span>
                  <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                </span>
              )}
              {filterBy !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-50 text-purple-700 rounded">
                  <span>{filterOptions.find(o => o.value === filterBy)?.icon}</span>
                  <span>{filterOptions.find(o => o.value === filterBy)?.label}</span>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSortBy('totalPoints');
                setFilterBy('all');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardFilters;