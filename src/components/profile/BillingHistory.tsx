import React from 'react';
import { BillingHistoryItem, formatPrice } from '@/types/subscription';
import { Receipt, Download, CheckCircle, XCircle, RefreshCw, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BillingHistoryProps {
  history: BillingHistoryItem[];
}

const BillingHistory: React.FC<BillingHistoryProps> = ({ history }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-amber-500" />;
      case 'plan_change':
        return <ArrowUpDown className="w-4 h-4 text-blue-500" />;
      case 'canceled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Receipt className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      case 'plan_change':
        return 'Plan Change';
      case 'canceled':
        return 'Canceled';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'plan_change':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'canceled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-purple-500" />
          Billing History
        </h4>
        <div className="text-center py-8">
          <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No billing history yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-purple-500" />
          Billing History
        </h4>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {history.map((item) => (
          <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  {getStatusIcon(item.status)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {item.description || 'Subscription Payment'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                    {item.period_start && item.period_end && (
                      <span className="ml-2">
                        ({new Date(item.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(item.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
                
                {item.amount_cents > 0 && (
                  <span className="font-semibold text-gray-900 dark:text-white min-w-[60px] text-right">
                    {formatPrice(item.amount_cents)}
                  </span>
                )}
                
                {item.invoice_pdf_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(item.invoice_pdf_url!, '_blank')}
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingHistory;
