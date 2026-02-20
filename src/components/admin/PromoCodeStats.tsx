import React from 'react';
import { Tag, Users, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { PromoCodeStats as Stats } from '@/types/adminPromoCode';

interface PromoCodeStatsProps {
  stats: Stats | null;
  isLoading?: boolean;
}

const PromoCodeStatsComponent: React.FC<PromoCodeStatsProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
            <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Codes',
      value: stats.totalCodes,
      icon: Tag,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
      subtext: `${stats.activeCodes} active`
    },
    {
      label: 'Total Redemptions',
      value: stats.totalRedemptions,
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
      subtext: 'All time'
    },
    {
      label: 'Discounts Given',
      value: `$${stats.totalDiscountGiven.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600',
      subtext: 'Total savings'
    },
    {
      label: 'Avg. Discount',
      value: stats.totalRedemptions > 0 
        ? `$${(stats.totalDiscountGiven / stats.totalRedemptions).toFixed(2)}`
        : '$0.00',
      icon: TrendingUp,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
      subtext: 'Per redemption'
    }
  ];

  // Calculate max values for chart scaling
  const maxRedemptions = Math.max(...stats.chartData.map(d => d.redemptions), 1);
  const maxDiscount = Math.max(...stats.chartData.map(d => d.discount), 1);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.subtext}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Redemptions Over Time Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Redemptions (Last 30 Days)</h3>
          </div>
          <div className="h-48 flex items-end gap-1">
            {stats.chartData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center group relative">
                <div 
                  className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                  style={{ 
                    height: `${(day.redemptions / maxRedemptions) * 100}%`,
                    minHeight: day.redemptions > 0 ? '4px' : '0px'
                  }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    <br />
                    {day.redemptions} redemptions
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Discount Amount Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Discounts Given (Last 30 Days)</h3>
          </div>
          <div className="h-48 flex items-end gap-1">
            {stats.chartData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center group relative">
                <div 
                  className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                  style={{ 
                    height: `${(day.discount / maxDiscount) * 100}%`,
                    minHeight: day.discount > 0 ? '4px' : '0px'
                  }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    <br />
                    ${day.discount.toFixed(2)} discounted
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Top Codes and Recent Redemptions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Codes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Top Performing Codes
          </h3>
          {stats.topCodes.length === 0 ? (
            <p className="text-gray-500 text-sm">No redemptions yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topCodes.map((code, index) => (
                <div key={code.code} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-mono font-medium flex-1">{code.code}</span>
                  <span className="text-sm text-gray-500">{code.count} uses</span>
                  <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(code.count / (stats.topCodes[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Redemptions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Recent Redemptions
          </h3>
          {stats.recentRedemptions.length === 0 ? (
            <p className="text-gray-500 text-sm">No redemptions yet</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.recentRedemptions.map((redemption) => (
                <div key={redemption.id} className="flex items-center justify-between text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
                  <div>
                    <div className="font-medium">{redemption.customer_email}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(redemption.redeemed_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-purple-600">{redemption.code}</div>
                    {redemption.discount_amount && (
                      <div className="text-xs text-green-600">-${redemption.discount_amount}</div>
                    )}
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

export default PromoCodeStatsComponent;
