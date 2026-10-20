'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldCheck, Mail, Phone, Calendar, UserCheck, UserX, User, Shield, Info, Edit, Check, Plus, X, Eye, Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import SafeImage from '@/components/ui/SafeImage';

const PROTECTED_EMAILS = ['ayurwed.com@gmail.com', 'webnazar@gmail.com'];

interface OrderItemInfo {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;

  orders?: OrderItemInfo[];
}

export default function UserListClient({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  
  // Create User state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'CONSUMER' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ id: 0, name: '', email: '', password: '', role: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      consultants: users.filter(u => u.role === 'CONSULTANT').length,
      consumers: users.filter(u => u.role === 'CONSUMER').length,
    };
  }, [users]);

  // Handle patch action
  const handleUpdateUser = async (userId: number, updates: { role?: string; isActive?: boolean; name?: string; email?: string; password?: string }) => {
    setLoadingUserId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, ...updates }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const updatedUser = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
      toast.success('User updated successfully');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error updating user');
    } finally {
      setLoadingUserId(null);
    }
  };
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create user');
      }
      const newUser = await res.json();
      setUsers(prev => [newUser, ...prev]);
      setIsCreateModalOpen(false);
      setCreateForm({ name: '', email: '', password: '', role: 'CONSUMER' });
      toast.success('User created successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error creating user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(true);
    try {
      const updates: any = { name: editForm.name, email: editForm.email, role: editForm.role };
      if (editForm.password) updates.password = editForm.password;

      await handleUpdateUser(editForm.id, updates);
      
      // Update selectedUser if it's currently open
      if (selectedUser && selectedUser.id === editForm.id) {
        setSelectedUser({ ...selectedUser, name: editForm.name, email: editForm.email, role: editForm.role });
      }
      setIsEditModalOpen(false);
    } finally {
      setIsEditing(false);
    }
  };

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return users
      .filter(u => {
        const matchesSearch = 
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.phone && u.phone.includes(searchTerm));
        
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        const matchesStatus = 
          statusFilter === 'ALL' || 
          (statusFilter === 'ACTIVE' && u.isActive) || 
          (statusFilter === 'INACTIVE' && !u.isActive);

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'name-az') return a.name.localeCompare(b.name);
        if (sortBy === 'name-za') return b.name.localeCompare(a.name);
        return 0;
      });
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'badge-role-admin';
      case 'CONSULTANT': return 'badge-role-consultant';
      default: return 'badge-neutral';
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete user');
      }
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error deleting user');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* ── Header Banner with Merged Search & Controls (Minimal Margins, No Subtitle) ── */}
      <div className="dashboard-header-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="dashboard-header-title text-lg sm:text-xl">Users</h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-56 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-green/60 dark:text-foreground/40" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-card/90 dark:bg-card border border-brand-green/20 dark:border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 text-foreground placeholder:text-foreground/40 shadow-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-0.5"
                  title="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <div className="relative flex-shrink-0">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-card/90 dark:bg-card border border-brand-green/20 dark:border-border rounded-xl py-2 px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-green/30 shadow-sm cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admins</option>
                <option value="CONSULTANT">Doctors</option>
                <option value="CONSUMER">Consumers</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative flex-shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-card/90 dark:bg-card border border-brand-green/20 dark:border-border rounded-xl py-2 px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-green/30 shadow-sm cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Add User Button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              title="Create New User"
              className="inline-flex items-center justify-center gap-1.5 bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm shrink-0 whitespace-nowrap active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-card rounded-2xl p-3.5 border border-border shadow-sm text-center">
          <span className="text-[10px] text-foreground/50 block font-bold uppercase tracking-wider">Total</span>
          <span className="text-lg font-extrabold text-brand-green">{stats.total}</span>
        </div>
        <div className="bg-card rounded-2xl p-3.5 border border-border shadow-sm text-center">
          <span className="text-[10px] text-foreground/50 block font-bold uppercase tracking-wider">Active</span>
          <span className="text-lg font-extrabold text-emerald-600">{stats.active}</span>
        </div>
        <div className="bg-card rounded-2xl p-3.5 border border-border shadow-sm text-center">
          <span className="text-[10px] text-foreground/50 block font-bold uppercase tracking-wider">Inactive</span>
          <span className="text-lg font-extrabold text-rose-500">{stats.inactive}</span>
        </div>
        <div className="bg-card rounded-2xl p-3.5 border border-border shadow-sm text-center">
          <span className="text-[10px] text-foreground/50 block font-bold uppercase tracking-wider">Admins</span>
          <span className="text-lg font-extrabold text-brand-gold-dark">{stats.admins}</span>
        </div>
        <div className="bg-card rounded-2xl p-3.5 border border-border shadow-sm text-center">
          <span className="text-[10px] text-foreground/50 block font-bold uppercase tracking-wider">Doctors</span>
          <span className="text-lg font-extrabold text-brand-green">{stats.consultants}</span>
        </div>
        <div className="bg-card rounded-2xl p-3.5 border border-border shadow-sm text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-foreground/50 block font-bold uppercase tracking-wider">Users</span>
          <span className="text-lg font-extrabold text-muted-foreground">{stats.consumers}</span>
        </div>
      </div>

      {/* Table Sorting Control */}
      <div className="flex justify-end items-center gap-2 text-xs">
        <span className="text-foreground/50 font-bold">Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-az">Name A-Z</option>
          <option value="name-za">Name Z-A</option>
        </select>
      </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full divide-y divide-brand-green-border/10 bg-card">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">System Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-brand-green uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-green-border/10 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-brand-foreground/50">
                    No users found matching filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-brand-gold text-brand-green dark:text-black flex-shrink-0">
                          <SafeImage
                            src={user.avatar}
                            fallbackSrc="/avatar.webp"
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-brand-green flex items-center gap-1.5">
                            {user.name}
                            {user.role === 'ADMIN' && <Shield className="h-4 w-4 text-brand-gold" />}
                          </div>
                          <div className="text-xs text-brand-foreground/60">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        disabled={loadingUserId === user.id}
                        onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                        className={`text-xs border rounded-full px-3 py-1 font-bold outline-none cursor-pointer ${getRoleStyle(user.role)}`}
                      >
                        <option value="CONSUMER">User</option>
                        <option value="CONSULTANT">Doctor</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1 text-xs text-brand-foreground/75">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-brand-foreground/45" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-brand-foreground/45" />
                          <span>{user.phone || 'Not provided'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-brand-foreground/60">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleUpdateUser(user.id, { isActive: !user.isActive })}
                        disabled={loadingUserId === user.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          user.isActive ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <UserX className="h-3.5 w-3.5" />
                            <span>Suspended</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2 text-xs">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {!PROTECTED_EMAILS.includes(user.email) && (
                        <button
                          onClick={() => setDeleteConfirmId(user.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      {/* User Details Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[32px] border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-250">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-card/20 flex-shrink-0">
                  <SafeImage
                    src={selectedUser.avatar}
                    fallbackSrc="/avatar.webp"
                    alt={selectedUser.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg flex items-center gap-2">
                    {selectedUser.name}
                    {selectedUser.role === 'ADMIN' && <Shield className="h-4.5 w-4.5 text-brand-gold" />}
                  </h3>
                  <span className="text-xs text-brand-green-light font-bold uppercase tracking-wider">{selectedUser.role} Account</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-white/70 hover:text-white text-sm font-bold bg-card/10 hover:bg-card/20 px-3 py-1.5 rounded-full"
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted border border-brand-green-border/5 rounded-2xl p-4">
                  <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">User ID</span>
                  <span className="text-sm font-extrabold text-brand-green"># {selectedUser.id}</span>
                </div>
                <div className="bg-muted border border-brand-green-border/5 rounded-2xl p-4">
                  <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Status</span>
                  <span className={`text-sm font-extrabold ${selectedUser.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedUser.isActive ? 'Active System Account' : 'Suspended'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 border-b border-brand-green-border/5 pb-2">
                  <Mail className="h-5 w-5 text-brand-green" />
                  <div>
                    <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Email Address</span>
                    <span className="text-sm text-brand-foreground font-semibold">{selectedUser.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-brand-green-border/5 pb-2">
                  <Phone className="h-5 w-5 text-brand-green" />
                  <div>
                    <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Phone Number</span>
                    <span className="text-sm text-brand-foreground font-semibold">{selectedUser.phone || 'No phone registered'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-brand-green-border/5 pb-2">
                  <Calendar className="h-5 w-5 text-brand-green" />
                  <div>
                    <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Registration Date</span>
                    <span className="text-sm text-brand-foreground font-semibold">
                      {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Orders for Consumers */}
              {selectedUser.role === 'CONSUMER' && selectedUser.orders && (
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-2 text-brand-green">
                    <ShoppingBag className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wide">Recent Orders</span>
                  </div>
                  {selectedUser.orders.length > 0 ? (
                    <div className="space-y-2">
                      {selectedUser.orders.map(order => (
                        <div key={order.id} className="bg-muted border border-border rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-extrabold text-brand-green block">#{order.orderNumber}</span>
                            <span className="text-[10px] text-brand-foreground/60">{new Date(order.createdAt).toLocaleDateString()} • {order.itemCount} items</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold block">₹{order.totalAmount.toFixed(2)}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                              order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              order.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                              'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-brand-foreground/50 text-center py-4 bg-muted/50 rounded-xl border border-dashed border-border">
                      No orders placed yet.
                    </div>
                  )}
                </div>
              )}

              {/* Advanced Controls */}
              <div className="pt-4 border-t border-border space-y-3">
                <span className="text-xs font-bold text-brand-green uppercase tracking-wide block">Administrative Actions</span>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      handleUpdateUser(selectedUser.id, { isActive: !selectedUser.isActive });
                      setSelectedUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
                    }}
                    className={`w-full text-center text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all ${
                      selectedUser.isActive ? 'badge-danger' : 'badge-success'
                    }`}
                  >
                    {selectedUser.isActive ? 'Suspend User' : 'Activate User'}
                  </button>

                  {selectedUser.role === 'CONSULTANT' && (
                    <div className="flex gap-3">
                      <a href={`/consultants/${selectedUser.id}`} target="_blank" rel="noreferrer" className="flex-1 text-center text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all bg-muted text-brand-foreground hover:bg-muted/80">
                        View Public Profile
                      </a>
                      <a href={`/admin/users/${selectedUser.id}/edit-profile`} className="flex-1 text-center text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green">
                        Edit Profile Details
                      </a>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setEditForm({ id: selectedUser.id, name: selectedUser.name, email: selectedUser.email, password: '', role: selectedUser.role });
                      setIsEditModalOpen(true);
                    }}
                    className="w-full text-center text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all bg-card border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white"
                  >
                    Edit Core Account Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[32px] border border-border shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-250">
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-gold" /> Create New User
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white/70 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Full Name</label>
                <input required type="text" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full text-sm bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Email Address</label>
                <input required type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full text-sm bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Temporary Password</label>
                <input required type="text" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full text-sm bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Account Role</label>
                <select value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full text-sm bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold font-bold">
                  <option value="CONSUMER">User</option>
                  <option value="CONSULTANT">Doctor</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={isCreating}
                  className="w-full bg-brand-green text-white font-bold py-3.5 rounded-full hover:bg-brand-gold hover:text-brand-green transition-colors text-sm disabled:opacity-50">
                  {isCreating ? 'Creating...' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[32px] border border-border shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-250">
            <div className="bg-gradient-to-r from-brand-gold to-brand-gold-dark p-6 text-brand-green flex items-center justify-between">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Edit className="h-5 w-5" /> Edit Account Settings
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-brand-green/70 hover:text-brand-green p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Full Name</label>
                <input required type="text" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full text-sm bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Email Address</label>
                <input required type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  disabled={PROTECTED_EMAILS.includes(editForm.email)}
                  className={`w-full text-sm bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none ${PROTECTED_EMAILS.includes(editForm.email) ? 'opacity-50 cursor-not-allowed' : 'focus:border-brand-gold'}`} />
                {PROTECTED_EMAILS.includes(editForm.email) && (
                  <p className="text-[10px] text-brand-foreground/50 mt-1 pl-1 font-semibold italic">This default admin email cannot be changed.</p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">New Password (Leave blank to keep current)</label>
                <input type="text" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Leave empty to remain unchanged"
                  className="w-full text-sm bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Account Role</label>
                <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full text-sm bg-muted border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold font-bold">
                  <option value="CONSUMER">User</option>
                  <option value="CONSULTANT">Doctor</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={isEditing || loadingUserId !== null}
                  className="w-full bg-brand-gold text-brand-green font-bold py-3.5 rounded-full hover:bg-brand-green hover:text-white transition-colors text-sm disabled:opacity-50">
                  {isEditing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-border">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground">Delete User?</h3>
              <p className="text-sm text-brand-foreground/60">
                Are you sure you want to permanently delete this user? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 bg-muted border-t border-border flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl bg-card border border-border text-sm font-bold hover:bg-muted-foreground/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirmId)} 
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
