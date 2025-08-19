'use client';

import React, { useState } from 'react';
import { createLeague, CreateLeagueData } from '@/lib/leagueData';

interface CreateLeagueProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateLeague: React.FC<CreateLeagueProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateLeagueData>({
    name: '',
    description: '',
    type: 'private',
    maxMembers: 20,
    prize: '',
    rules: ['All predictions must be submitted 1 hour before kickoff']
  });
  const [isCreating, setIsCreating] = useState(false);
  const [newRule, setNewRule] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const league = await createLeague(formData);
      console.log('Created league:', league);
      onSuccess?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create league');
    } finally {
      setIsCreating(false);
    }
  };

  const addRule = () => {
    if (newRule.trim() && !formData.rules?.includes(newRule.trim())) {
      setFormData(prev => ({
        ...prev,
        rules: [...(prev.rules || []), newRule.trim()]
      }));
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Create New League</h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            League Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter league name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your league and what makes it special..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* League Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          League Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type: 'private' }))}
            className={`p-4 border-2 rounded-lg text-left ${
              formData.type === 'private'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">🔒</span>
              <span className="font-medium">Private League</span>
            </div>
            <p className="text-sm text-gray-600">
              Invite-only with join code. Perfect for friends and colleagues.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, type: 'public' }))}
            className={`p-4 border-2 rounded-lg text-left ${
              formData.type === 'public'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">🌍</span>
              <span className="font-medium">Public League</span>
            </div>
            <p className="text-sm text-gray-600">
              Open to everyone. Great for building large communities.
            </p>
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Members
          </label>
          <select
            value={formData.maxMembers || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              maxMembers: e.target.value ? parseInt(e.target.value) : undefined 
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">No limit</option>
            <option value="5">5 members</option>
            <option value="10">10 members</option>
            <option value="15">15 members</option>
            <option value="20">20 members</option>
            <option value="50">50 members</option>
            <option value="100">100 members</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prize (Optional)
          </label>
          <input
            type="text"
            value={formData.prize || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
            placeholder="e.g., £50 Amazon voucher"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Rules */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          League Rules
        </label>
        
        {/* Existing Rules */}
        <div className="space-y-2 mb-3">
          {formData.rules?.map((rule, index) => (
            <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 mt-0.5">•</span>
              <span className="text-sm text-gray-900 flex-1">{rule}</span>
              <button
                type="button"
                onClick={() => removeRule(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add New Rule */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            placeholder="Add a league rule..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
          />
          <button
            type="button"
            onClick={addRule}
            disabled={!newRule.trim()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          * Required fields
        </div>
        
        <div className="flex space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isCreating}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={isCreating || !formData.name.trim() || !formData.description.trim()}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create League'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateLeague;