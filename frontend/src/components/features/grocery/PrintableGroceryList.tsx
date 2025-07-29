import React from 'react';
import type { GroceryItem } from '../../../types';

interface GroceryItemWithId extends GroceryItem {
  id: string;
  addedManually?: boolean;
}

interface PrintableGroceryListProps {
  groceryItems: GroceryItemWithId[];
  mealPlanName?: string;
  weekRange?: string;
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

export function PrintableGroceryList({ groceryItems, mealPlanName, weekRange }: PrintableGroceryListProps) {
  // Group items by category
  const groupedItems = groceryItems.reduce((groups, item) => {
    const category = item.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, GroceryItemWithId[]>);

  const totalItems = groceryItems.length;
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="print-grocery-list">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          .print-grocery-list {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #000;
            background: #fff;
            padding: 20px;
            max-width: 8.5in;
            margin: 0 auto;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          
          .print-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 5px 0;
          }
          
          .print-subtitle {
            font-size: 14px;
            color: #666;
            margin: 0;
          }
          
          .print-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 12px;
            color: #666;
          }
          
          .print-category {
            margin-bottom: 25px;
            break-inside: avoid;
          }
          
          .print-category-header {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            padding: 8px 12px;
            background: #f5f5f5;
            border-left: 4px solid #007AFF;
          }
          
          .print-item {
            display: flex;
            align-items: center;
            padding: 6px 0;
            border-bottom: 1px dotted #ddd;
          }
          
          .print-checkbox {
            width: 16px;
            height: 16px;
            border: 2px solid #333;
            margin-right: 12px;
            flex-shrink: 0;
          }
          
          .print-item-content {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .print-item-name {
            font-weight: 500;
            font-size: 14px;
          }
          
          .print-item-details {
            font-size: 12px;
            color: #666;
            text-align: right;
          }
          
          .print-notes {
            font-style: italic;
            color: #888;
            font-size: 11px;
            margin-top: 2px;
          }
          
          .print-footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          
          .print-stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border: 1px solid #ddd;
          }
          
          .print-stat {
            text-align: center;
          }
          
          .print-stat-number {
            font-size: 18px;
            font-weight: bold;
            color: #007AFF;
          }
          
          .print-stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 2px;
          }
        }
        
        @media screen {
          .print-grocery-list {
            display: none;
          }
        }
        `
      }} />

      {/* Header */}
      <div className="print-header">
        <h1 className="print-title">🛒 Grocery Shopping List</h1>
        {mealPlanName && (
          <p className="print-subtitle">{mealPlanName}</p>
        )}
        {weekRange && (
          <p className="print-subtitle">{weekRange}</p>
        )}
      </div>

      {/* Meta Information */}
      <div className="print-meta">
        <span>Generated: {currentDate}</span>
        <span>Total Items: {totalItems}</span>
      </div>

      {/* Shopping Stats */}
      <div className="print-stats">
        <div className="print-stat">
          <div className="print-stat-number">{totalItems}</div>
          <div className="print-stat-label">Total Items</div>
        </div>
        <div className="print-stat">
          <div className="print-stat-number">{Object.keys(groupedItems).length}</div>
          <div className="print-stat-label">Categories</div>
        </div>
        <div className="print-stat">
          <div className="print-stat-number">___</div>
          <div className="print-stat-label">Completed</div>
        </div>
      </div>

      {/* Grocery Items by Category */}
      {CATEGORY_ORDER.map(category => {
        const items = groupedItems[category];
        if (!items || items.length === 0) return null;

        return (
          <div key={category} className="print-category">
            <div className="print-category-header">
              {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} ({items.length} items)
            </div>
            {items.map(item => (
              <div key={item.id} className="print-item">
                <div className="print-checkbox"></div>
                <div className="print-item-content">
                  <div>
                    <div className="print-item-name">{item.item}</div>
                    {item.notes && (
                      <div className="print-notes">Note: {item.notes}</div>
                    )}
                  </div>
                  <div className="print-item-details">
                    {item.quantity && <div>{item.quantity}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* Footer */}
      <div className="print-footer">
        <p>Generated by MealMate - Your Personal Meal Planning Assistant</p>
        <p>Happy Shopping! 🛍️</p>
      </div>
    </div>
  );
}
