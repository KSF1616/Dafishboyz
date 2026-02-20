import React from 'react';
import { Edit2, Trash2, Users, Percent, DollarSign, Clock, Truck, ToggleLeft, ToggleRight, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DBPromoCode } from '@/types/adminPromoCode';

interface PromoCodeListProps {
  codes: DBPromoCode[];
  onEdit: (code: DBPromoCode) => void;
  onDelete: (code: DBPromoCode) => void;
  onToggle: (code: DBPromoCode) => void;
  onViewRedemptions: (code: DBPromoCode) => void;
  isLoading?: boolean;
}

const PromoCodeList: React.FC<PromoCodeListProps> = ({ 
  codes, 
  onEdit, 
  onDelete, 
  onToggle, 
  onViewRedemptions,
  isLoading 
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4 text-blue-500" />;
      case 'fixed': return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'free_trial': return <Clock className="w-4 h-4 text-purple-500" />;
      case 'free_shipping': return <Truck className="w-4 h-4 text-orange-500" />;
      default: return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      percentage: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      fixed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      free_trial: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      free_shipping: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const formatValue = (code: DBPromoCode) => {
    switch (code.type) {
      case 'percentage': return `${code.value}% off`;
      case 'fixed': return `$${code.value} off`;
      case 'free_trial': return `${code.free_trial_days || 0} days free`;
      case 'free_shipping': return 'Free shipping';
      default: return '';
    }
  };

  const isExpired = (code: DBPromoCode) => {
    if (!code.valid_until) return false;
    return new Date(code.valid_until) < new Date();
  };

  const isNotStarted = (code: DBPromoCode) => {
    if (!code.valid_from) return false;
    return new Date(code.valid_from) > new Date();
  };

  const isAtLimit = (code: DBPromoCode) => {
    if (!code.usage_limit) return false;
    return code.usage_count >= code.usage_limit;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (codes.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No promo codes found</h3>
        <p className="text-gray-500 mt-1">Create your first promo code to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {codes.map((code) => (
        <div 
          key={code.id} 
          className={`bg-white dark:bg-gray-800 rounded-xl p-4 border-2 transition-all ${
            code.is_active && !isExpired(code) && !isAtLimit(code) && !isNotStarted(code)
              ? 'border-green-200 dark:border-green-900/50' 
              : 'border-gray-200 dark:border-gray-700 opacity-75'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Code and Type */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {getTypeIcon(code.type)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-lg">{code.code}</span>
                  <Badge className={getTypeBadge(code.type)}>
                    {code.type.replace('_', ' ')}
                  </Badge>
                  {!code.is_active && (
                    <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700">Disabled</Badge>
                  )}
                  {isExpired(code) && (
                    <Badge variant="destructive">Expired</Badge>
                  )}
                  {isNotStarted(code) && (
                    <Badge className="bg-yellow-100 text-yellow-700">Not Started</Badge>
                  )}
                  {isAtLimit(code) && (
                    <Badge variant="destructive">Limit Reached</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{code.description || 'No description'}</p>
              </div>
            </div>

            {/* Value */}
            <div className="flex items-center gap-6 md:ml-auto">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{formatValue(code)}</div>
                {code.min_order_amount && (
                  <div className="text-xs text-gray-500">Min ${code.min_order_amount}</div>
                )}
              </div>

              {/* Usage */}
              <div className="text-center">
                <div className="flex items-center gap-1 text-lg font-bold">
                  <Users className="w-4 h-4 text-gray-400" />
                  {code.usage_count}
                  {code.usage_limit && <span className="text-gray-400">/{code.usage_limit}</span>}
                </div>
                <div className="text-xs text-gray-500">Uses</div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggle(code)}
                  title={code.is_active ? 'Disable code' : 'Enable code'}
                >
                  {code.is_active ? (
                    <ToggleRight className="w-5 h-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewRedemptions(code)}
                  title="View redemptions"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(code)}
                  title="Edit code"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(code)}
                  title="Delete code"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Validity info */}
          {(code.valid_from || code.valid_until || code.applicable_to !== 'all') && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 text-xs text-gray-500">
              {code.valid_from && (
                <span>From: {new Date(code.valid_from).toLocaleDateString()}</span>
              )}
              {code.valid_until && (
                <span>Until: {new Date(code.valid_until).toLocaleDateString()}</span>
              )}
              {code.applicable_to !== 'all' && (
                <span className="capitalize">Applies to: {code.applicable_to}</span>
              )}
              {code.requires_physical && (
                <span>Requires physical item</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PromoCodeList;
