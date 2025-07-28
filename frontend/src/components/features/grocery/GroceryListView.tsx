import React, { useState, useEffect } from 'react';
import { CheckIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../ui/Button';
import type { GroceryItem, MealPlan } from '../../../types';

interface GroceryListViewProps {
  mealPlanId?: string;
  className?: string;
}

interface GroceryItemWithId extends GroceryItem {
  id: string;
  addedManually?: boolean;
}

// Mock grocery list data for MVP
const mockGroceryItems: GroceryItemWithId[] = [
  // Produce
  { id: '1', item: 'Tomatoes', quantity: '4 large', category: 'produce', checked: false, notes: 'For pasta sauce' },
  { id: '2', item: 'Onions', quantity: '2 medium', category: 'produce', checked: true },
  { id: '3', item: 'Garlic', quantity: '1 bulb', category: 'produce', checked: false },
  { id: '4', item: 'Bell Peppers', quantity: '3', category: 'produce', checked: false, notes: 'Red or yellow' },
  
  // Pantry
  { id: '5', item: 'Olive Oil', quantity: '1 bottle', category: 'pantry', checked: false },
  { id: '6', item: 'Pasta', quantity: '2 boxes', category: 'pantry', checked: true },
  { id: '7', item: 'Rice', quantity: '1 bag', category: 'pantry', checked: false },
  
  // Dairy
  { id: '8', item: 'Milk', quantity: '1 gallon', category: 'dairy', checked: false },
  { id: '9', item: 'Cheese', quantity: '8 oz', category: 'dairy', checked: false, notes: 'Parmesan' },
  
  // Meat
  { id: '10', item: 'Chicken Breast', quantity: '2 lbs', category: 'meat', checked: false },
  { id: '11', item: 'Ground Beef', quantity: '1 lb', category: 'meat', checked: true },
];

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

export function GroceryListView({ mealPlanId, className = '' }: GroceryListViewProps) {
  const { user } = useAuth();
  const [groceryItems, setGroceryItems] = useState<GroceryItemWithId[]>(mockGroceryItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', amount: '', unit: '', category: 'other' as keyof typeof CATEGORY_LABELS });
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Group items by category
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

  return (
    <div className={`grocery-list-view ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Grocery List
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {totalItems} items • {checkedItems} completed
          </p>
        </div>

        <div className="flex space-x-2">
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

      {/* Grocery Items by Category */}
      <div className="space-y-6">
        {CATEGORY_ORDER.map(category => {
          const items = groupedItems[category];
          if (!items || items.length === 0) return null;

          return (
            <div key={category} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} ({items.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-600">
                {items.map(item => (
                  <GroceryItemRow
                    key={item.id}
                    item={item}
                    onToggleCheck={toggleItemCheck}
                    onDelete={deleteItem}
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
            <span className="text-2xl">🛒</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No grocery items yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add items manually or generate a list from your meal plans
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Your First Item
          </Button>
        </div>
      )}
    </div>
  );
}

// Individual grocery item component
interface GroceryItemRowProps {
  item: GroceryItemWithId;
  onToggleCheck: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

function GroceryItemRow({ item, onToggleCheck, onDelete }: GroceryItemRowProps) {
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
          {item.addedManually && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Manual
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
