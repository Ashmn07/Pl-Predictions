'use client';

import React from 'react';
import { PredictionInsight, getInsightColor } from '@/lib/analyticsData';

interface InsightsPanelProps {
  insights: PredictionInsight[];
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💡</div>
          <p className="text-gray-500">No insights available yet</p>
          <p className="text-sm text-gray-400 mt-2">Make more predictions to get personalized insights</p>
        </div>
      </div>
    );
  }

  const groupedInsights = {
    high: insights.filter(i => i.priority === 'high'),
    medium: insights.filter(i => i.priority === 'medium'),
    low: insights.filter(i => i.priority === 'low')
  };

  const getInsightIcon = (type: PredictionInsight['type']) => {
    switch (type) {
      case 'strength': return '💪';
      case 'weakness': return '⚠️';
      case 'trend': return '📊';
      case 'opportunity': return '🎯';
    }
  };

  const getPriorityColor = (priority: PredictionInsight['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>💡</span>
            <span>Performance Insights</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">AI-powered analysis of your prediction patterns</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {insights.length} insight{insights.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Priority Sections */}
      <div className="space-y-6">
        {groupedInsights.high.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-red-700 mb-3 flex items-center space-x-2">
              <span>🚨</span>
              <span>High Priority ({groupedInsights.high.length})</span>
            </h4>
            <div className="space-y-3">
              {groupedInsights.high.map((insight, index) => (
                <div key={index} className={`border-l-4 p-4 rounded-lg ${getPriorityColor('high')}`}>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getInsightColor(insight.type)}`}>
                          {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{insight.description}</p>
                      
                      {insight.data && (
                        <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">{insight.data.metric}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-900">{insight.data.value}</span>
                              {insight.data.comparison && (
                                <span className="text-sm text-gray-500">
                                  vs {insight.data.comparison} avg
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {groupedInsights.medium.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-yellow-700 mb-3 flex items-center space-x-2">
              <span>⚡</span>
              <span>Medium Priority ({groupedInsights.medium.length})</span>
            </h4>
            <div className="space-y-3">
              {groupedInsights.medium.map((insight, index) => (
                <div key={index} className={`border-l-4 p-4 rounded-lg ${getPriorityColor('medium')}`}>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getInsightColor(insight.type)}`}>
                          {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{insight.description}</p>
                      
                      {insight.data && (
                        <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">{insight.data.metric}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-900">{insight.data.value}</span>
                              {insight.data.comparison && (
                                <span className="text-sm text-gray-500">
                                  vs {insight.data.comparison} avg
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {groupedInsights.low.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-blue-700 mb-3 flex items-center space-x-2">
              <span>📝</span>
              <span>Additional Insights ({groupedInsights.low.length})</span>
            </h4>
            <div className="space-y-3">
              {groupedInsights.low.map((insight, index) => (
                <div key={index} className={`border-l-4 p-4 rounded-lg ${getPriorityColor('low')}`}>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getInsightColor(insight.type)}`}>
                          {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{insight.description}</p>
                      
                      {insight.data && (
                        <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">{insight.data.metric}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-900">{insight.data.value}</span>
                              {insight.data.comparison && (
                                <span className="text-sm text-gray-500">
                                  vs {insight.data.comparison} avg
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-green-50 to-purple-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">💡 Quick Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                {insights.filter(i => i.type === 'strength').length}
              </div>
              <div className="text-sm text-gray-600">Strengths</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-red-600">
                {insights.filter(i => i.type === 'weakness').length}
              </div>
              <div className="text-sm text-gray-600">Areas to Improve</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-blue-600">
                {insights.filter(i => i.type === 'trend').length}
              </div>
              <div className="text-sm text-gray-600">Trends Identified</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-purple-600">
                {insights.filter(i => i.type === 'opportunity').length}
              </div>
              <div className="text-sm text-gray-600">Opportunities</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;