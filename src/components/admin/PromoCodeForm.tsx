import React, { useState, useEffect } from 'react';
import { X, Tag, Percent, DollarSign, Clock, Gift, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DBPromoCode, PromoCodeFormData } from '@/types/adminPromoCode';

interface PromoCodeFormProps {
  code?: DBPromoCode | null;
  onSubmit: (data: PromoCodeFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PromoCodeForm: React.FC<PromoCodeFormProps> = ({ code, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<PromoCodeFormData>({
    code: '',
    type: 'percentage',
    value: 0,
    description: '',
    applicable_to: 'all',
    requires_physical: false,
    is_active: true
  });

  useEffect(() => {
    if (code) {
      setFormData({
        code: code.code,
        type: code.type,
        value: code.value,
        description: code.description || '',
        min_order_amount: code.min_order_amount || undefined,
        max_discount: code.max_discount || undefined,
        valid_from: code.valid_from ? code.valid_from.split('T')[0] : undefined,
        valid_until: code.valid_until ? code.valid_until.split('T')[0] : undefined,
        usage_limit: code.usage_limit || undefined,
        applicable_to: code.applicable_to,
        requires_physical: code.requires_physical,
        free_trial_days: code.free_trial_days || undefined,
        free_trial_feature: code.free_trial_feature || undefined,
        is_active: code.is_active
      });
    }
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      case 'free_trial': return <Clock className="w-4 h-4" />;
      case 'free_shipping': return <Truck className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Tag className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold">{code ? 'Edit Promo Code' : 'Create New Promo Code'}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Code and Type */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Promo Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SAVE20"
                className="mt-1 uppercase"
                required
                disabled={!!code}
              />
            </div>
            <div>
              <Label htmlFor="type">Discount Type *</Label>
              <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    <span className="flex items-center gap-2"><Percent className="w-4 h-4" /> Percentage Off</span>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Fixed Amount</span>
                  </SelectItem>
                  <SelectItem value="free_trial">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Free Trial</span>
                  </SelectItem>
                  <SelectItem value="free_shipping">
                    <span className="flex items-center gap-2"><Truck className="w-4 h-4" /> Free Shipping</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Value based on type */}
          {(formData.type === 'percentage' || formData.type === 'fixed') && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">
                  {formData.type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount ($)'}
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {formData.type === 'percentage' ? '%' : '$'}
                  </span>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="pl-8"
                    min={0}
                    max={formData.type === 'percentage' ? 100 : undefined}
                  />
                </div>
              </div>
              {formData.type === 'percentage' && (
                <div>
                  <Label htmlFor="max_discount">Maximum Discount ($)</Label>
                  <Input
                    id="max_discount"
                    type="number"
                    value={formData.max_discount || ''}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value ? Number(e.target.value) : undefined })}
                    className="mt-1"
                    placeholder="No limit"
                    min={0}
                  />
                </div>
              )}
            </div>
          )}

          {/* Free Trial specific fields */}
          {formData.type === 'free_trial' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="free_trial_days">Trial Duration (days)</Label>
                <Input
                  id="free_trial_days"
                  type="number"
                  value={formData.free_trial_days || ''}
                  onChange={(e) => setFormData({ ...formData, free_trial_days: Number(e.target.value) })}
                  className="mt-1"
                  placeholder="30"
                  min={1}
                />
              </div>
              <div>
                <Label htmlFor="free_trial_feature">Feature Name</Label>
                <Input
                  id="free_trial_feature"
                  value={formData.free_trial_feature || ''}
                  onChange={(e) => setFormData({ ...formData, free_trial_feature: e.target.value })}
                  className="mt-1"
                  placeholder="e.g., Digital Game Tools"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1"
              placeholder="Describe what this promo code offers..."
              rows={2}
            />
          </div>

          {/* Restrictions */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_order_amount">Minimum Order Amount ($)</Label>
              <Input
                id="min_order_amount"
                type="number"
                value={formData.min_order_amount || ''}
                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1"
                placeholder="No minimum"
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="usage_limit">Usage Limit</Label>
              <Input
                id="usage_limit"
                type="number"
                value={formData.usage_limit || ''}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1"
                placeholder="Unlimited"
                min={1}
              />
            </div>
          </div>

          {/* Validity Period */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valid_from">Valid From</Label>
              <Input
                id="valid_from"
                type="date"
                value={formData.valid_from || ''}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value || undefined })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="valid_until">Valid Until</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until || ''}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value || undefined })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Applicable To */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="applicable_to">Applies To</Label>
              <Select value={formData.applicable_to} onValueChange={(v: any) => setFormData({ ...formData, applicable_to: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="physical">Physical Products Only</SelectItem>
                  <SelectItem value="digital">Digital Products Only</SelectItem>
                  <SelectItem value="bundle">Bundles Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4 pt-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="requires_physical"
                  checked={formData.requires_physical}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_physical: checked })}
                />
                <Label htmlFor="requires_physical" className="cursor-pointer">Requires Physical Item</Label>
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active" className="cursor-pointer font-medium">
              {formData.is_active ? 'Code is Active' : 'Code is Disabled'}
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-purple-600 hover:bg-purple-700">
              {isLoading ? 'Saving...' : code ? 'Update Code' : 'Create Code'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoCodeForm;
