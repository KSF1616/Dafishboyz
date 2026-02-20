import React, { useState, useEffect } from 'react';
import { X, Users, Mail, Calendar, DollarSign, ShoppingCart, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DBPromoCode, PromoCodeRedemption } from '@/types/adminPromoCode';
import { supabase } from '@/lib/supabase';

interface PromoCodeRedemptionsProps {
  code: DBPromoCode;
  onClose: () => void;
}

const PromoCodeRedemptions: React.FC<PromoCodeRedemptionsProps> = ({ code, onClose }) => {
  const [redemptions, setRedemptions] = useState<PromoCodeRedemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRedemptions();
  }, [code.id]);

  const fetchRedemptions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('promo-code-manager', {
        body: { action: 'get-redemptions', code_id: code.id }
      });
      if (data?.success) {
        setRedemptions(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching redemptions:', err);
    }
    setIsLoading(false);
  };

  const filteredRedemptions = redemptions.filter(r => 
    r.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.customer_name && r.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.order_id && r.order_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const exportToCSV = () => {
    const headers = ['Email', 'Name', 'Order ID', 'Order Total', 'Discount', 'Date'];
    const rows = filteredRedemptions.map(r => [
      r.customer_email,
      r.customer_name || '',
      r.order_id || '',
      r.order_total?.toString() || '',
      r.discount_amount?.toString() || '',
      new Date(r.redeemed_at).toLocaleString()
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${code.code}-redemptions.csv`;
    a.click();
  };

  const totalDiscount = redemptions.reduce((sum, r) => sum + (r.discount_amount || 0), 0);
  const totalRevenue = redemptions.reduce((sum, r) => sum + (r.order_total || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Redemptions for {code.code}</h2>
              <p className="text-sm text-gray-500">{redemptions.length} total redemptions</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{redemptions.length}</div>
            <div className="text-sm text-gray-500">Total Uses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${totalDiscount.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Total Discounts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Total Revenue</div>
          </div>
        </div>

        {/* Search and Export */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by email, name, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={exportToCSV} disabled={redemptions.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Redemptions List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="w-48 h-4 bg-gray-200 dark:bg-gray-600 rounded" />
                      <div className="w-32 h-3 bg-gray-200 dark:bg-gray-600 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRedemptions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No matching redemptions' : 'No redemptions yet'}
              </h3>
              <p className="text-gray-500 mt-1">
                {searchTerm ? 'Try a different search term' : 'This code hasn\'t been used yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRedemptions.map((redemption) => (
                <div 
                  key={redemption.id} 
                  className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold">
                        {redemption.customer_email.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{redemption.customer_email}</span>
                        {redemption.customer_name && (
                          <span className="text-sm text-gray-500">({redemption.customer_name})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(redemption.redeemed_at).toLocaleString()}
                        </span>
                        {redemption.order_id && (
                          <span className="flex items-center gap-1">
                            <ShoppingCart className="w-3 h-3" />
                            Order: {redemption.order_id}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      {redemption.order_total && (
                        <div className="text-sm text-gray-500">
                          Order: ${redemption.order_total}
                        </div>
                      )}
                      {redemption.discount_amount && (
                        <div className="text-green-600 font-medium">
                          -${redemption.discount_amount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoCodeRedemptions;
