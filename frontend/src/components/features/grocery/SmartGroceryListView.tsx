import React, { useState, useEffect } from 'react';
import { CheckIcon, PlusIcon, TrashIcon, PrinterIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../ui/Button';
import { PrintableGroceryList } from './PrintableGroceryList';
import { WalmartExportButton } from './WalmartExportButton';
import { staplesService } from '../../../services/staplesService';
import type { GroceryItem, StapleSuggestion, HouseholdStaple } from '../../../types';

interface SmartGroceryListViewProps {
  mealPlanId?: string;
  className?: string;
}

interface GroceryItemWithId extends GroceryItem {
  id: string;
  addedManually?: boolean;
}

const CATEGORY_LABELS = {
  produce: '🥬 Produce',
  dairy: '🥛 Dairy',
  meat: '🥩 Meat & Seafood',
  pantry: '🥫 Pantry',
  frozen: '🧊 Frozen',
  bakery: '🍞 Bakery',
  other: '📦 Other'
};

const CATEGORY_ORDER = ['produce', 'dairy', 'meat', 'pantry', 'frozen', 'bakery', 'other'];

export function SmartGroceryListView({ mealPlanId, className = '' }: SmartGroceryListViewProps) {
  const { user } = useAuth();
  const [groceryItems, setGroceryItems] = useState<GroceryItemWithId[]>([]);
  const [stapleSuggestions, setStapleSuggestions] = useState<StapleSuggestion[]>([]);
  const [showStapleReview, setShowStapleReview] = useState(false);
  const [selectedStaples, setSelectedStaples] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', amount: '', unit: '', category: 'other' as keyof typeof CATEGORY_LABELS });
  const [loading, setLoading] = useState(true);

  // Mock data for development - includes items from planned meals
  const mockPlannedMealItems: GroceryItemWithId[] = [
    // From planned dinner recipes
    { id: 'recipe-1', item: 'Chicken Thighs', quantity: '2 lbs', category: 'meat', checked: false, source: 'recipe', notes: 'For Monday dinner' },
    { id: 'recipe-2', item: 'Broccoli', quantity: '2 heads', category: 'produce', checked: false, source: 'recipe', notes: 'For Monday dinner' },
    { id: 'recipe-3', item: 'Ground Turkey', quantity: '1 lb', category: 'meat', checked: false, source: 'recipe', notes: 'For Wednesday tacos' },
    { id: 'recipe-4', item: 'Taco Shells', quantity: '1 box', category: 'pantry', checked: false, source: 'recipe', notes: 'For Wednesday tacos' },
    { id: 'recipe-5', item: 'Salmon Fillets', quantity: '4 pieces', category: 'meat', checked: false, source: 'recipe', notes: 'For Friday dinner' },
  ];

  useEffect(() => {
    loadGroceryData();
  }, [user, mealPlanId]);

  const loadGroceryData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load planned meal items (mock for now)
      setGroceryItems(mockPlannedMealItems);

      // Load staple suggestions
      const suggestions = await staplesService.getStapleSuggestions('dummy-household', mealPlanId || 'mock-plan');
      setStapleSuggestions(suggestions);
      
      // Pre-select suggested staples
      const suggestedIds = suggestions.filter(s => s.suggested).map(s => s.staple.id);
      setSelectedStaples(new Set(suggestedIds));
      
    } catch (error) {
      console.error('Failed to load grocery data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group items by category and source
  const groupedItems = groceryItems.reduce((groups, item) => {
    const category = item.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, GroceryItemWithId[]>);

  // Calculate progress
  const totalItems = groceryItems.length;
  const checkedItems = groceryItems.filter(item => item.checked).length;
  const progressPercentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  const toggleItemCheck = (itemId: string) => {
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }

    setGroceryItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const addNewItem = () => {
    if (!newItem.name.trim()) return;

    const item: GroceryItemWithId = {
      id: Date.now().toString(),
      item: newItem.name.trim(),
      quantity: `${newItem.amount.trim()} ${newItem.unit.trim()}`.trim(),
      category: newItem.category,
      checked: false,
      source: 'manual',
      addedManually: true
    };

    setGroceryItems(items => [...items, item]);
    setNewItem({ name: '', amount: '', unit: '', category: 'other' });
    setShowAddForm(false);
  };

  const deleteItem = (itemId: string) => {
    setGroceryItems(items => items.filter(item => item.id !== itemId));
  };

  const clearCheckedItems = () => {
    setGroceryItems(items => items.filter(item => !item.checked));
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleStapleSelection = (stapleId: string) => {
    const newSelected = new Set(selectedStaples);
    if (newSelected.has(stapleId)) {
      newSelected.delete(stapleId);
    } else {
      newSelected.add(stapleId);
    }
    setSelectedStaples(newSelected);
  };

  const addSelectedStaplesToList = () => {
    const staplesToAdd = stapleSuggestions
      .filter(s => selectedStaples.has(s.staple.id))
      .map(s => ({
        id: `staple-${s.staple.id}`,
        item: s.staple.item_name,
        quantity: '', // User can add quantity later
        category: s.staple.category,
        checked: false,
        source: 'staple' as const,
        staple_id: s.staple.id
      }));

    setGroceryItems(items => [...items, ...staplesToAdd]);
    setShowStapleReview(false);
    setSelectedStaples(new Set());
  };

  const checkForDuplicates = (stapleItem: string) => {
    return groceryItems.some(item => 
      item.item.toLowerCase() === stapleItem.toLowerCase()
    );
  };

  // Generate meal plan info for print
  const mealPlanName = "Weekly Grocery List";
  const weekRange = `Week of ${new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric' 
  })} - ${new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`smart-grocery-list-view ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Smart Grocery List
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {totalItems} items • {checkedItems} completed
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {stapleSuggestions.filter(s => s.suggested).length > 0 && !showStapleReview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStapleReview(true)}
              className="text-purple-600 hover:text-purple-700"
            >
              <SparklesIcon className="h-4 w-4 mr-1" />
              Review Staples ({stapleSuggestions.filter(s => s.suggested).length})
            </Button>
          )}
          {totalItems > 0 && (
            <>
              <WalmartExportButton
                groceryItems={groceryItems}
                size="sm"
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-blue-600 hover:text-blue-700"
              >
                <PrinterIcon className="h-4 w-4 mr-1" />
                Print List
              </Button>
            </>
          )}
          {checkedItems > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCheckedItems}
              className="text-red-600 hover:text-red-700"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Clear Checked
            </Button>
          )}
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalItems > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Shopping Progress</span>
            <span>{progressPercentage}% complete</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Staple Review Modal */}
      {showStapleReview && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2 text-purple-500" />
              Review Suggested Staples
            </h3>
            <button
              onClick={() => setShowStapleReview(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Based on your household's shopping patterns, we suggest adding these staples to your list:
          </p>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {stapleSuggestions.filter(s => s.suggested).map(suggestion => {
              const isDuplicate = checkForDuplicates(suggestion.staple.item_name);
              return (
                <div key={suggestion.staple.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedStaples.has(suggestion.staple.id)}
                    onChange={() => toggleStapleSelection(suggestion.staple.id)}
                    disabled={isDuplicate}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${isDuplicate ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                        {suggestion.staple.item_name}
                      </span>
                      {isDuplicate && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Already in list
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {suggestion.reason === 'weekly_due' && 'Weekly staple due'}
                      {suggestion.reason === 'biweekly_due' && 'Bi-weekly staple due'}
                      {suggestion.reason === 'monthly_due' && 'Monthly staple due'}
                      {suggestion.reason === 'not_purchased_recently' && `Not purchased in ${suggestion.days_since_last_purchase} days`}
                      {suggestion.staple.frequency && ` • Usually buy ${suggestion.staple.frequency}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex space-x-3 mt-6">
            <Button onClick={addSelectedStaplesToList} disabled={selectedStaples.size === 0}>
              Add Selected ({selectedStaples.size})
            </Button>
            <Button variant="outline" onClick={() => setShowStapleReview(false)}>
              Skip for Now
            </Button>
          </div>
        </div>
      )}

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Add New Item
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Amount"
                value={newItem.amount}
                onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Unit"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-3">
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value as keyof typeof CATEGORY_LABELS })}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button onClick={addNewItem} size="sm">
              Add Item
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewItem({ name: '', amount: '', unit: '', category: 'other' });
              }}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Three-Tier Grocery List */}
      <div className="space-y-6">
        {CATEGORY_ORDER.map(category => {
          const items = groupedItems[category];
          if (!items || items.length === 0) return null;

          // Group by source within category
          const recipeItems = items.filter(item => item.source === 'recipe');
          const stapleItems = items.filter(item => item.source === 'staple');
          const manualItems = items.filter(item => item.source === 'manual');

          return (
            <div key={category} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} ({items.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-600">
                {/* Recipe Items */}
                {recipeItems.map(item => (
                  <GroceryItemRow
                    key={item.id}
                    item={item}
                    onToggleCheck={toggleItemCheck}
                    onDelete={deleteItem}
                    sourceLabel="From planned meals"
                  />
                ))}
                
                {/* Staple Items */}
                {stapleItems.map(item => (
                  <GroceryItemRow
                    key={item.id}
                    item={item}
                    onToggleCheck={toggleItemCheck}
                    onDelete={deleteItem}
                    sourceLabel="Household staple"
                  />
                ))}
                
                {/* Manual Items */}
                {manualItems.map(item => (
                  <GroceryItemRow
                    key={item.id}
                    item={item}
                    onToggleCheck={toggleItemCheck}
                    onDelete={deleteItem}
                    sourceLabel="Added manually"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {totalItems === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <SparklesIcon className="h-8 w-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Smart grocery list is ready!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Plan some meals or add items manually to get started
          </p>
          <div className="flex justify-center space-x-3">
            <Button onClick={() => setShowStapleReview(true)} variant="outline">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Review Staples
            </Button>
            <Button onClick={() => setShowAddForm(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      )}

      {/* Hidden Printable Version */}
      <PrintableGroceryList
        groceryItems={groceryItems}
        mealPlanName={mealPlanName}
        weekRange={weekRange}
      />
    </div>
  );
}

// Individual grocery item component with source indication
interface GroceryItemRowProps {
  item: GroceryItemWithId;
  onToggleCheck: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  sourceLabel?: string;
}

function GroceryItemRow({ item, onToggleCheck, onDelete, sourceLabel }: GroceryItemRowProps) {
  const getSourceColor = (source?: string) => {
    switch (source) {
      case 'recipe': return 'bg-blue-100 text-blue-800';
      case 'staple': return 'bg-purple-100 text-purple-800';
      case 'manual': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`p-4 flex items-center space-x-3 ${item.checked ? 'opacity-60' : ''}`}>
      {/* Checkbox */}
      <button
        onClick={() => onToggleCheck(item.id)}
        className={`
          flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
          transition-all duration-200 ease-in-out
          ${item.checked
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
          }
        `}
      >
        {item.checked && <CheckIcon className="h-4 w-4" />}
      </button>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
            {item.item}
          </span>
          {item.source && (
            <span className={`text-xs px-2 py-1 rounded ${getSourceColor(item.source)}`}>
              {sourceLabel || item.source}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          {item.quantity && (
            <span>{item.quantity}</span>
          )}
          {item.notes && (
            <span className="italic">"{item.notes}"</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onDelete(item.id)}
          className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
          title="Delete item"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
