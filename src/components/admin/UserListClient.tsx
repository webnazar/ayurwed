'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldCheck, Mail, Phone, Calendar, UserCheck, UserX, User, Shield, Info, Edit, Check, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
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

  // Statistics
  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      consultants: users.filter(u => u.role === 'CONSULTANT').length,
      manufacturers: users.filter(u => u.role === 'MANUFACTURER').length,
      consumers: users.filter(u => u.role === 'CONSUMER').length,
    };
  }, [users]);

  // Handle patch action
  const handleUpdateUser = async (userId: number, updates: { role?: string; isActive?: boolean }) => {
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
      case 'ADMIN':
        return 'bg-brand-gold/15 text-brand-gold-dark border-brand-gold/30';
      case 'CONSULTANT':
        return 'bg-brand-green-light text-brand-green border-brand-green/30';
      case 'MANUFACTURER':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-brand-green-border/10 shadow-sm text-center">
          <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Total</span>
          <span className="text-xl font-extrabold text-brand-green">{stats.total}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-brand-green-border/10 shadow-sm text-center">
          <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Active</span>
          <span className="text-xl font-extrabold text-emerald-600">{stats.active}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-brand-green-border/10 shadow-sm text-center">
          <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Inactive</span>
          <span className="text-xl font-extrabold text-red-500">{stats.inactive}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-brand-green-border/10 shadow-sm text-center">
          <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Admins</span>
          <span className="text-xl font-extrabold text-brand-gold-dark">{stats.admins}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-brand-green-border/10 shadow-sm text-center">
          <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Doctors</span>
          <span className="text-xl font-extrabold text-brand-green">{stats.consultants}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-brand-green-border/10 shadow-sm text-center">
          <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Brand Mfrs</span>
          <span className="text-xl font-extrabold text-indigo-600">{stats.manufacturers}</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-brand-green-border/10 shadow-sm text-center col-span-2 md:col-span-1">
          <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">Consumers</span>
          <span className="text-xl font-extrabold text-gray-600">{stats.consumers}</span>
        </div>
      </div>

      {/* Action Filters Panel */}
      <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-shrink-0 bg-brand-green text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-brand-gold hover:text-brand-green transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Create User
          </button>
          
          <div className="flex flex-col lg:flex-row gap-4 flex-grow w-full justify-end">
          {/* Search Box */}
          <div className="relative flex-grow max-w-xl">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-foreground/40">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Search users by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-brand-green" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl px-3 py-2.5 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Administrators</option>
                <option value="CONSULTANT">Consultants</option>
                <option value="MANUFACTURER">Manufacturers</option>
                <option value="CONSUMER">Consumers</option>
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl px-3 py-2.5 text-xs font-semibold focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-brand-gold-light/40 border border-brand-green-border/10 rounded-2xl px-3 py-2.5 text-xs font-semibold focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-az">Name A-Z</option>
              <option value="name-za">Name Z-A</option>
            </select>
          </div>
        </div>
      </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-2xl border border-brand-green-border/10">
          <table className="min-w-full divide-y divide-brand-green-border/10 bg-white">
            <thead className="bg-brand-gold-light/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">System Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-brand-green uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-brand-green uppercase tracking-wider">Actions</th>
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
                  <tr key={user.id} className="hover:bg-brand-gold-light/10 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-brand-gold/25 text-brand-green rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm border border-brand-gold/15">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
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
                        <option value="CONSUMER">CONSUMER</option>
                        <option value="CONSULTANT">CONSULTANT</option>
                        <option value="MANUFACTURER">MANUFACTURER</option>
                        <option value="ADMIN">ADMIN</option>
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleUpdateUser(user.id, { isActive: !user.isActive })}
                        disabled={loadingUserId === user.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
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
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-brand-gold hover:text-brand-green font-bold inline-flex items-center gap-1 border border-brand-gold/30 hover:border-brand-green px-2.5 py-1.5 rounded-xl transition-all"
                      >
                        <Info className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-brand-green-border/10 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-250">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-green to-[#0f381b] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    selectedUser.name.charAt(0).toUpperCase()
                  )}
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
                className="text-white/70 hover:text-white text-sm font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full"
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-gold-light/40 border border-brand-green-border/5 rounded-2xl p-4">
                  <span className="text-[10px] text-brand-foreground/50 block font-bold uppercase tracking-wider">User ID</span>
                  <span className="text-sm font-extrabold text-brand-green"># {selectedUser.id}</span>
                </div>
                <div className="bg-brand-gold-light/40 border border-brand-green-border/5 rounded-2xl p-4">
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

              {/* Advanced Controls */}
              <div className="pt-4 border-t border-brand-green-border/10 space-y-3">
                <span className="text-xs font-bold text-brand-green uppercase tracking-wide block">Administrative Actions</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleUpdateUser(selectedUser.id, { isActive: !selectedUser.isActive });
                      setSelectedUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
                    }}
                    className={`flex-grow text-center text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all ${
                      selectedUser.isActive
                        ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {selectedUser.isActive ? 'Suspend User' : 'Activate User'}
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
          <div className="bg-white rounded-[32px] border border-brand-green-border/10 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-250">
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
                  className="w-full text-sm bg-brand-gold-light/40 border border-brand-green-border/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Email Address</label>
                <input required type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full text-sm bg-brand-gold-light/40 border border-brand-green-border/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Temporary Password</label>
                <input required type="text" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full text-sm bg-brand-gold-light/40 border border-brand-green-border/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold" />
              </div>
              <div>
                <label className="text-xs font-bold text-brand-foreground/60 block mb-1.5">Account Role</label>
                <select value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full text-sm bg-brand-gold-light/40 border border-brand-green-border/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold font-bold">
                  <option value="CONSUMER">CONSUMER</option>
                  <option value="CONSULTANT">CONSULTANT</option>
                  <option value="MANUFACTURER">MANUFACTURER</option>
                  <option value="ADMIN">ADMIN</option>
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
    </div>
  );
}
