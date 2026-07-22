"use client";

import React, { useState } from 'react';
import PageHeader from "@/components/ui/PageHeader";
import { Search, Plus, Filter, MoreVertical, Shield, ShieldCheck, User, Loader2, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersService } from '@/services/users.service';
import { StructuresService } from '@/services/structures.service';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [createdUserAuth, setCreatedUserAuth] = useState<{email: string, temporary_password: string} | null>(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    numero_telephone: '',
    role: 'AGENT_TERRAIN',
    id_structure_sanitaire: '',
  });

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: UsersService.getAllUsers,
  });

  const { data: structures = [] } = useQuery({
    queryKey: ['structures'],
    queryFn: StructuresService.getAll,
    enabled: formData.role === 'ADMIN', // Only fetch structures if role is ADMIN
  });

  const createUserMutation = useMutation({
    mutationFn: (data: any) => UsersService.createUser(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Show the success screen with the temporary password
      if (data && data.temporary_password) {
        setCreatedUserAuth({
          email: data.email,
          temporary_password: data.temporary_password
        });
      } else {
        // Fallback if no password was returned (e.g. for some roles or updates in backend)
        setIsAddModalOpen(false);
      }
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        numero_telephone: '',
        role: 'AGENT_TERRAIN',
        id_structure_sanitaire: '',
      });
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
      alert("Failed to create user. Please try again.");
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (userId: string) => UsersService.resetPassword(userId),
    onSuccess: (data, variables) => {
      const user = users.find((u: any) => u.id === variables);
      if (data && data.temporary_password) {
        setCreatedUserAuth({
          email: user?.email || 'Unknown',
          temporary_password: data.temporary_password
        });
        setIsAddModalOpen(true);
      }
      setActiveDropdownId(null);
    },
    onError: (error) => {
      console.error("Failed to reset password:", error);
      alert("Failed to reset password.");
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string, status: string }) => UsersService.updateUser(userId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setActiveDropdownId(null);
    },
    onError: (error) => {
      console.error("Failed to update status:", error);
      alert("Failed to update status.");
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="w-4 h-4 text-purple-500" />;
      case 'VALIDEUR_MEDICAL': return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      default: return <User className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-y-auto bg-gray-50/50" style={{ scrollbarWidth: 'thin' }}>
      <PageHeader title="Users Management">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#65b741] text-white rounded-lg text-sm font-semibold hover:bg-[#5aa43a] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </PageHeader>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search users..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b border-gray-100">User</th>
                <th className="p-4 border-b border-gray-100">Role</th>
                <th className="p-4 border-b border-gray-100">Status</th>
                <th className="p-4 border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#65b741]" />
                      <span>Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-red-500">
                    Failed to load users. Ensure you are authenticated and the API is running.
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                          {user.firstName ? user.firstName.charAt(0) : (user.email ? user.email.charAt(0).toUpperCase() : '?')}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role?.toUpperCase() || '')}
                        <span className="text-sm font-medium text-gray-700">{user.role}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                        user.status === 'ACTIF' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {user.status === 'ACTIF' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right relative">
                      <button 
                        onClick={() => setActiveDropdownId(activeDropdownId === user.id ? null : user.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeDropdownId === user.id && (
                        <>
                          {/* Invisible overlay to close dropdown when clicking outside */}
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setActiveDropdownId(null)}
                          />
                          <div className="absolute right-12 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 text-left">
                            <button
                              onClick={() => resetPasswordMutation.mutate(user.id)}
                              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                            >
                              Reset Password
                            </button>
                            <button
                              onClick={() => toggleStatusMutation.mutate({ userId: user.id, status: user.status === 'ACTIF' ? 'INACTIF' : 'ACTIF' })}
                              className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 ${user.status === 'ACTIF' ? 'text-red-600' : 'text-green-600'}`}
                            >
                              {user.status === 'ACTIF' ? 'Deactivate User' : 'Activate User'}
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {createdUserAuth ? 'User Created Successfully' : 'Add New User'}
              </h2>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setCreatedUserAuth(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {createdUserAuth ? (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">The user has been successfully created. Please copy the temporary password and send it to them securely.</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</span>
                    <p className="font-medium text-gray-900">{createdUserAuth.email}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Temporary Password</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 p-2 bg-white border border-gray-200 rounded text-sm font-mono text-gray-800 break-all">
                        {createdUserAuth.temporary_password}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(createdUserAuth.temporary_password);
                          alert("Password copied to clipboard!");
                        }}
                        className="px-3 py-2 bg-white border border-gray-200 rounded shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setCreatedUserAuth(null);
                    }}
                    className="w-full py-2 bg-[#65b741] text-white rounded-lg text-sm font-semibold hover:bg-[#5aa43a] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Phone Number (Optional)</label>
                  <input
                    type="text"
                    name="numero_telephone"
                    value={formData.numero_telephone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
                  >
                    <option value="AGENT_TERRAIN">Agent Terrain</option>
                    <option value="VALIDEUR_MEDICAL">Valideur Médical</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {formData.role === 'ADMIN' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Structure Sanitaire</label>
                    <select
                      name="id_structure_sanitaire"
                      required
                      value={formData.id_structure_sanitaire}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
                    >
                      <option value="" disabled>Select a structure</option>
                      {structures.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.nom}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-[#65b741] text-white rounded-lg text-sm font-semibold hover:bg-[#5aa43a] transition-colors disabled:opacity-50"
                  >
                    {createUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Create User
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
