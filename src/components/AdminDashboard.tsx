/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import * as Icons from 'lucide-react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  LayoutDashboard, 
  Bell, 
  GraduationCap, 
  Settings,
  LogOut,
  Home,
  Info,
  Phone,
  Check,
  Users,
  Activity,
  BookOpen,
  ChevronRight,
  Newspaper,
  ArrowLeft,
  Award,
  Calendar,
  Globe,
  FileText,
  Calculator,
  Zap,
  Archive,
  Upload,
  Search,
  Filter,
  Mail,
  Loader2
} from 'lucide-react';

import { PageManager } from './admin/PageManager';
import { ContentManager } from './admin/ContentManager';
import { DepartmentManager } from './admin/DepartmentManager';
import { SystemManager } from './admin/SystemManager';

// Types
type TabType = 'news' | 'admissions' | 'features' | 'about' | 'contact' | 'home' | 'departments' | 'youth_union' | 'achievements' | 'schedule' | 'gallery' | 'archive' | 'messages' | 'admins' | 'news_page' | 'admissions_page';

interface AdminDashboardProps {
  onLogout: () => Promise<void>;
  onExit: () => void;
  user: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onExit, user: propUser }) => {
  const [activeTab, setActiveTab] = useState<TabType>('news');
  const [user, setUser] = useState<any>(propUser);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Modals & UI State
  const [modal, setModal] = useState<{show: boolean, title: string, message: string, type: 'info' | 'confirm', onConfirm?: () => void}>({
    show: false, title: '', message: '', type: 'info'
  });
  const [showLinkPicker, setShowLinkPicker] = useState<any>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [allNewsForPicker, setAllNewsForPicker] = useState<any[]>([]);
  const [allAdmissionsForPicker, setAllAdmissionsForPicker] = useState<any[]>([]);

  useEffect(() => {
    if (propUser) setUser(propUser);
  }, [propUser]);

  const handleLogout = async () => {
    await onLogout();
  };

  const showSuccess = (msg = "Dữ liệu đã được cập nhật thành công!") => {
    setModal({ show: true, title: "Thành công!", message: msg, type: 'info' });
  };

  const showAlert = (title: string, msg: string) => {
    setModal({ show: true, title, message: msg, type: 'info' });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModal({ show: true, title, message, type: 'confirm', onConfirm });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: any, form: any, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('school_assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('school_assets')
        .getPublicUrl(filePath);

      setter({ ...form, [field]: publicUrl });
      showSuccess("Tải lên tệp thành công!");
    } catch (error: any) {
      showAlert("Lỗi tải lên", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const fetchPickerData = async () => {
    const [newsRes, admRes] = await Promise.all([
      supabase.from('news').select('id, title').order('date', { ascending: false }).limit(50),
      supabase.from('admissions').select('id, title').order('created_at', { ascending: false }).limit(50)
    ]);
    if (newsRes.data) setAllNewsForPicker(newsRes.data);
    if (admRes.data) setAllAdmissionsForPicker(admRes.data);
  };

  if (!user && !loading) return null;

  const isSuperAdmin = user?.role === 'super_admin';
  const isYouthUnion = user?.role === 'youth_union_officer';
  const isDeptHead = user?.role === 'dept_head';

  const menuGroups = [
    {
      title: 'Nội dung cốt lõi',
      tabs: [
        { id: 'news', label: 'Quản lý Tin tức', icon: Newspaper, color: 'text-blue-600', show: isSuperAdmin },
        { id: 'admissions', label: 'Thông tin Tuyển sinh', icon: GraduationCap, color: 'text-emerald-600', show: isSuperAdmin },
        { id: 'youth_union', label: 'Hoạt động Đoàn', icon: Zap, color: 'text-orange-600', show: isSuperAdmin || isYouthUnion },
        { id: 'achievements', label: 'Quản lý Thành tích', icon: Award, color: 'text-amber-600', show: isSuperAdmin || isYouthUnion },
      ]
    },
    {
      title: 'Hệ thống trường',
      tabs: [
        { id: 'departments', label: 'Tổ chuyên môn', icon: Users, color: 'text-indigo-600', show: true },
        { id: 'schedule', label: 'Lịch công tác', icon: Calendar, color: 'text-rose-600', show: isSuperAdmin },
        { id: 'gallery', label: 'Thư viện ảnh', icon: Globe, color: 'text-cyan-600', show: isSuperAdmin || isYouthUnion },
        { id: 'archive', label: 'Lưu trữ văn bản', icon: FileText, color: 'text-violet-600', show: isSuperAdmin },
      ]
    },
    {
      title: 'Website & Cấu hình',
      tabs: [
        { id: 'home', label: 'Trang chủ', icon: Home, color: 'text-blue-500', show: isSuperAdmin },
        { id: 'features', label: 'Thẻ tính năng', icon: LayoutDashboard, color: 'text-indigo-500', show: isSuperAdmin },
        { id: 'about', label: 'Trang Giới thiệu', icon: Info, color: 'text-emerald-500', show: isSuperAdmin },
        { id: 'news_page', label: 'Trang Tin tức', icon: Bell, color: 'text-sky-500', show: isSuperAdmin },
        { id: 'admissions_page', label: 'Trang Tuyển sinh', icon: GraduationCap, color: 'text-teal-500', show: isSuperAdmin },
        { id: 'contact', label: 'Thông tin liên hệ', icon: Phone, color: 'text-purple-500', show: isSuperAdmin },
      ]
    },
    {
      title: 'Quản trị viên',
      tabs: [
        { id: 'messages', label: 'Phản hồi người dùng', icon: Mail, color: 'text-pink-600', show: isSuperAdmin },
        { id: 'admins', label: 'Quản lý tài khoản', icon: Settings, color: 'text-slate-600', show: isSuperAdmin },
      ]
    }
  ];

  const managerProps = {
    supabase,
    user,
    loading,
    setLoading,
    showSuccess,
    showAlert,
    showConfirm,
    handleFileUpload,
    isUploading,
    fetchPickerData,
    setShowLinkPicker,
    activeTab
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-blue-100">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full sticky top-0 shadow-sm z-50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-gradient-to-br from-white to-slate-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tight leading-none">ADMIN</span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Management Panel</span>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Cán bộ</span>
                <span className="text-sm font-black text-slate-800 line-clamp-1">{user?.display_name || 'Admin'}</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {menuGroups.map((group, gIdx) => {
            const visibleTabs = group.tabs.filter(t => t.show);
            if (visibleTabs.length === 0) return null;
            return (
              <div key={gIdx} className="space-y-2">
                <h4 className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">{group.title}</h4>
                <div className="space-y-1">
                  {visibleTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group overflow-hidden relative ${
                        activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <tab.icon className={`w-5 h-5 transition-colors ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                      <span className={`text-sm font-bold ${activeTab === tab.id ? 'text-white' : 'text-slate-600'}`}>{tab.label}</span>
                      {activeTab === tab.id && (
                        <motion.div layoutId="activeTabGlow" className="absolute left-0 w-1 h-2/3 bg-white rounded-full opacity-50" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-50 bg-slate-50/30 space-y-2">
          <button 
            onClick={onExit}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Quay lại trang chủ</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all font-bold group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="text-sm">Đăng xuất hệ thống</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 flex justify-between items-center z-40 px-10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 capitalize tracking-tight flex items-center gap-3">
              {activeTab.replace('_', ' ')}
            </h1>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Hệ thống đang trực tuyến</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
               <Search className="w-5 h-5" />
             </button>
             <button className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors relative">
               <Bell className="w-5 h-5" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>

        <div className="p-10 pb-20">
          {['news', 'admissions', 'youth_union', 'achievements'].includes(activeTab) && (
            <ContentManager {...managerProps} />
          )}

          {['home', 'features', 'about', 'admissions_page', 'news_page', 'contact'].includes(activeTab) && (
            <PageManager {...managerProps} />
          )}

          {activeTab === 'departments' && (
            <DepartmentManager {...managerProps} />
          )}

          {['schedule', 'gallery', 'archive', 'messages', 'admins'].includes(activeTab) && (
            <SystemManager {...managerProps} />
          )}
        </div>
      </main>

      {/* Custom Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 font-sans">
            <div className="p-8">
              <h3 className="text-2xl font-black text-slate-900 mb-4">{modal.title}</h3>
              <p className="text-slate-600 leading-relaxed font-medium">{modal.message}</p>
            </div>
            <div className="bg-slate-50 p-6 flex justify-end gap-3">
              {modal.type === 'confirm' ? (
                <>
                  <button 
                    onClick={() => setModal({ ...modal, show: false })}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    onClick={() => {
                      modal.onConfirm?.();
                      setModal({ ...modal, show: false });
                    }}
                    className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                  >
                    Xác nhận
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setModal({ ...modal, show: false })}
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Internal Link Picker Modal */}
      {showLinkPicker && (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm font-sans">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Search className="w-6 h-6 text-orange-600" />
                Chèn liên kết nội bộ
              </h3>
              <button 
                onClick={() => {
                  setShowLinkPicker(null);
                  setPickerSearch('');
                }}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Tìm kiếm tiêu đề tin tức, tuyển sinh..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all text-slate-800 font-bold placeholder:text-slate-400"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              {/* Tin tức Section */}
              <section>
                <div className="flex items-center justify-between mb-4 px-2">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Tin tức mới nhất</h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {allNewsForPicker
                    .filter(n => n.title.toLowerCase().includes(pickerSearch.toLowerCase()))
                    .map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const textarea = showLinkPicker.ref.current;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = showLinkPicker.form[showLinkPicker.field] || '';
                            const insertion = ` [${item.title}](news:${item.id}) `;
                            const newText = text.substring(0, start) + insertion + text.substring(end);
                            showLinkPicker.setter({ ...showLinkPicker.form, [showLinkPicker.field]: newText });
                            setShowLinkPicker(null);
                            setPickerSearch('');
                            setTimeout(() => { textarea.focus(); const newPos = start + insertion.length; textarea.setSelectionRange(newPos, newPos); }, 50);
                          }
                        }}
                        className="w-full text-left p-4 hover:bg-orange-50 rounded-2xl transition-all flex items-center justify-between group border border-transparent hover:border-orange-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                            <Newspaper className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-700 line-clamp-1">{item.title}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transform group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                </div>
              </section>

              {/* Tuyển sinh Section */}
              <section>
                <div className="flex items-center justify-between mb-4 px-2">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Thông tin tuyển sinh</h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {allAdmissionsForPicker
                    .filter(n => n.title.toLowerCase().includes(pickerSearch.toLowerCase()))
                    .map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const textarea = showLinkPicker.ref.current;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = showLinkPicker.form[showLinkPicker.field] || '';
                            const insertion = ` [${item.title}](admission:${item.id}) `;
                            const newText = text.substring(0, start) + insertion + text.substring(end);
                            showLinkPicker.setter({ ...showLinkPicker.form, [showLinkPicker.field]: newText });
                            setShowLinkPicker(null);
                            setPickerSearch('');
                            setTimeout(() => { textarea.focus(); const newPos = start + insertion.length; textarea.setSelectionRange(newPos, newPos); }, 50);
                          }
                        }}
                        className="w-full text-left p-4 hover:bg-blue-50 rounded-2xl transition-all flex items-center justify-between group border border-transparent hover:border-blue-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-700 line-clamp-1">{item.title}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                </div>
              </section>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => { setShowLinkPicker(null); setPickerSearch(''); }}
                className="px-8 py-3 bg-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-300 transition-all active:scale-95"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
