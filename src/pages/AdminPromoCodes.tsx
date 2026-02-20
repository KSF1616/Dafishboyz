import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Tag, BarChart3, List, RefreshCw, Search, Filter, LogOut, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { DBPromoCode, PromoCodeStats, PromoCodeFormData } from '@/types/adminPromoCode';
import PromoCodeForm from '@/components/admin/PromoCodeForm';
import PromoCodeList from '@/components/admin/PromoCodeList';
import PromoCodeStatsComponent from '@/components/admin/PromoCodeStats';
import PromoCodeRedemptions from '@/components/admin/PromoCodeRedemptions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AdminPromoCodes: React.FC = () => {
  const [codes, setCodes] = useState<DBPromoCode[]>([]);
  const [stats, setStats] = useState<PromoCodeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<DBPromoCode | null>(null);
  const [viewingRedemptions, setViewingRedemptions] = useState<DBPromoCode | null>(null);
  const [deletingCode, setDeletingCode] = useState<DBPromoCode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();
  const { user, signOut, isDemo } = useAuth();

  useEffect(() => {
    fetchCodes();
    fetchStats();
  }, []);

  const fetchCodes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('promo-code-manager', {
        body: { action: 'list' }
      });
      if (data?.success) {
        setCodes(data.data || []);
      } else {
        throw new Error(data?.error || 'Failed to fetch codes');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('promo-code-manager', {
        body: { action: 'get-stats' }
      });
      if (data?.success) {
        setStats(data.data);
      }
      // Silently handle errors - stats are optional
    } catch {
      // Silently fail - promo code stats are optional
    }
    setIsStatsLoading(false);
  };


  const handleCreateCode = async (formData: PromoCodeFormData) => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('promo-code-manager', {
        body: { action: 'create', ...formData }
      });
      if (data?.success) {
        toast({ title: 'Success', description: 'Promo code created successfully!' });
        setShowForm(false);
        fetchCodes();
        fetchStats();
      } else {
        throw new Error(data?.error || 'Failed to create code');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setIsSaving(false);
  };

  const handleUpdateCode = async (formData: PromoCodeFormData) => {
    if (!editingCode) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('promo-code-manager', {
        body: { action: 'update', id: editingCode.id, ...formData }
      });
      if (data?.success) {
        toast({ title: 'Success', description: 'Promo code updated successfully!' });
        setEditingCode(null);
        fetchCodes();
        fetchStats();
      } else {
        throw new Error(data?.error || 'Failed to update code');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setIsSaving(false);
  };

  const handleToggleCode = async (code: DBPromoCode) => {
    try {
      const { data, error } = await supabase.functions.invoke('promo-code-manager', {
        body: { action: 'toggle', id: code.id, is_active: !code.is_active }
      });
      if (data?.success) {
        toast({ 
          title: code.is_active ? 'Code Disabled' : 'Code Enabled',
          description: `${code.code} has been ${code.is_active ? 'disabled' : 'enabled'}`
        });
        fetchCodes();
        fetchStats();
      } else {
        throw new Error(data?.error || 'Failed to toggle code');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteCode = async () => {
    if (!deletingCode) return;
    try {
      const { data, error } = await supabase.functions.invoke('promo-code-manager', {
        body: { action: 'delete', id: deletingCode.id }
      });
      if (data?.success) {
        toast({ title: 'Deleted', description: `${deletingCode.code} has been deleted` });
        setDeletingCode(null);
        fetchCodes();
        fetchStats();
      } else {
        throw new Error(data?.error || 'Failed to delete code');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // Filter codes
  const filteredCodes = codes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (code.description && code.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || code.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && code.is_active) ||
      (filterStatus === 'inactive' && !code.is_active);
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {isDemo && (
          <div className="mb-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-4 flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-600 dark:text-amber-400">Demo Mode Active</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Some operations may be limited in demo mode.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700">
              <ArrowLeft className="w-4 h-4" /> Back to Admin
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />Sign Out
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Tag className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Promo Code Manager</h1>
              <p className="text-gray-500">Create, manage, and track promotional codes</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { fetchCodes(); fetchStats(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />Refresh
            </Button>
            <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />New Code
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="codes" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="codes" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <List className="w-4 h-4" />
              Promo Codes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Codes Tab */}
          <TabsContent value="codes" className="space-y-4">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="free_trial">Free Trial</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Codes List */}
            <PromoCodeList
              codes={filteredCodes}
              onEdit={setEditingCode}
              onDelete={setDeletingCode}
              onToggle={handleToggleCode}
              onViewRedemptions={setViewingRedemptions}
              isLoading={isLoading}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <PromoCodeStatsComponent stats={stats} isLoading={isStatsLoading} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <PromoCodeForm
          onSubmit={handleCreateCode}
          onCancel={() => setShowForm(false)}
          isLoading={isSaving}
        />
      )}

      {/* Edit Form Modal */}
      {editingCode && (
        <PromoCodeForm
          code={editingCode}
          onSubmit={handleUpdateCode}
          onCancel={() => setEditingCode(null)}
          isLoading={isSaving}
        />
      )}

      {/* Redemptions Modal */}
      {viewingRedemptions && (
        <PromoCodeRedemptions
          code={viewingRedemptions}
          onClose={() => setViewingRedemptions(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCode} onOpenChange={() => setDeletingCode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promo Code?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingCode?.code}</strong>? This action cannot be undone.
              All redemption history will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCode} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPromoCodes;
