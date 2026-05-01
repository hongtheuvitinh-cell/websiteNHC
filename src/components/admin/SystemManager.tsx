import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, Calendar, Globe, Archive, Mail, Users, Save, Upload, Zap, Loader2, ImageIcon, Type } from 'lucide-react';
import { MarkdownEditorWithPreview } from '../MarkdownEditor';
import { AdminManagerProps } from './types';

export const SystemManager: React.FC<AdminManagerProps> = ({
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
}) => {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [archiveDocuments, setArchiveDocuments] = useState<any[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [adminSearch, setAdminSearch] = useState('');

  const [scheduleForm, setScheduleForm] = useState({ title: '', week: '', date_range: '', content: '', file_url: '', start_date: '', end_date: '' });
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  const [galleryForm, setGalleryForm] = useState({ title: '', image_url: '', category: 'Hoạt động trường', description: '', images_json: '[]' });
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  const [archiveForm, setArchiveForm] = useState({ title: '', category: 'Nội bộ', year: new Date().getFullYear(), type: 'Chương trình', file_url: '', description: '' });
  const [editingArchiveId, setEditingArchiveId] = useState<string | null>(null);

  const [adminUserForm, setAdminUserForm] = useState({ username: '', password: '', display_name: '', role: 'dept_head', dept_id: '' });
  const [editingAdminUserId, setEditingAdminUserId] = useState<string | null>(null);

  const scheduleTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    fetchSystemData();
  }, [activeTab]);

  const fetchSystemData = async () => {
    if (['schedule', 'gallery', 'archive', 'messages', 'admins'].includes(activeTab)) {
      setLoading(true);
      try {
        if (activeTab === 'schedule') {
          const { data } = await supabase.from('schedules').select('*').order('start_date', { ascending: false });
          if (data) setSchedule(data);
        } else if (activeTab === 'gallery') {
          const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
          if (data) setGallery(data);
        } else if (activeTab === 'archive') {
          const { data } = await supabase.from('archive_documents').select('*').order('created_at', { ascending: false });
          if (data) setArchiveDocuments(data);
        } else if (activeTab === 'messages') {
          const { data } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
          if (data) setContactSubmissions(data);
        } else if (activeTab === 'admins') {
          const [usersRes, deptsRes] = await Promise.all([
            supabase.from('admin_users').select('*').order('display_name'),
            supabase.from('departments').select('id, name').order('name')
          ]);
          if (usersRes.data) setAdminUsers(usersRes.data);
          if (deptsRes.data) setDepartmentsList(deptsRes.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingScheduleId) {
        const { error } = await supabase.from('schedules').update({ ...scheduleForm, updated_at: new Date() }).eq('id', editingScheduleId);
        if (error) throw error;
        setEditingScheduleId(null);
      } else {
        const { error } = await supabase.from('schedules').insert([{ ...scheduleForm }]);
        if (error) throw error;
      }
      setScheduleForm({ title: '', week: '', date_range: '', content: '', file_url: '', start_date: '', end_date: '' });
      showSuccess();
      fetchSystemData();
    } catch (error: any) {
      showAlert("Lỗi", error.message);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa lịch công tác này?", async () => {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) showAlert("Lỗi", error.message);
      else fetchSystemData();
    });
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalData = { ...galleryForm, images_json: JSON.stringify(galleryImages) };
      if (editingGalleryId) {
        const { error } = await supabase.from('gallery').update({ ...finalData, updated_at: new Date() }).eq('id', editingGalleryId);
        if (error) throw error;
        setEditingGalleryId(null);
      } else {
        const { error } = await supabase.from('gallery').insert([{ ...finalData }]);
        if (error) throw error;
      }
      setGalleryForm({ title: '', image_url: '', category: 'Hoạt động trường', description: '', images_json: '[]' });
      setGalleryImages([]);
      showSuccess();
      fetchSystemData();
    } catch (error: any) {
      showAlert("Lỗi", error.message);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa ảnh này?", async () => {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) showAlert("Lỗi", error.message);
      else fetchSystemData();
    });
  };

  const handleSaveArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArchiveId) {
        const { error } = await supabase.from('archive_documents').update({ ...archiveForm, updated_at: new Date() }).eq('id', editingArchiveId);
        if (error) throw error;
        setEditingArchiveId(null);
      } else {
        const { error } = await supabase.from('archive_documents').insert([{ ...archiveForm }]);
        if (error) throw error;
      }
      setArchiveForm({ title: '', category: 'Nội bộ', year: new Date().getFullYear(), type: 'Chương trình', file_url: '', description: '' });
      showSuccess();
      fetchSystemData();
    } catch (error: any) {
      showAlert("Lỗi", error.message);
    }
  };

  const handleDeleteArchive = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa văn bản này?", async () => {
      const { error } = await supabase.from('archive_documents').delete().eq('id', id);
      if (error) showAlert("Lỗi", error.message);
      else fetchSystemData();
    });
  };

  const handleDeleteMessage = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa phản hồi này?", async () => {
      const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
      if (error) showAlert("Lỗi", error.message);
      else fetchSystemData();
    });
  };

  const handleSaveAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdminUserId) {
        const { error } = await supabase.from('admin_users').update(adminUserForm).eq('id', editingAdminUserId);
        if (error) throw error;
        setEditingAdminUserId(null);
      } else {
        const { error } = await supabase.from('admin_users').insert([adminUserForm]);
        if (error) throw error;
      }
      setAdminUserForm({ username: '', password: '', display_name: '', role: 'dept_head', dept_id: '' });
      showSuccess();
      fetchSystemData();
    } catch (error: any) {
      showAlert("Lỗi", error.message);
    }
  };

  const handleDeleteAdminUser = async (id: string) => {
    if (id === user.id) {
      showAlert("Lỗi", "Bạn không thể tự xóa tài khoản của chính mình.");
      return;
    }
    showConfirm("Xác nhận xóa", "Xóa tài khoản quản trị này?", async () => {
      const { error } = await supabase.from('admin_users').delete().eq('id', id);
      if (error) showAlert("Lỗi", error.message);
      else fetchSystemData();
    });
  };

  return (
    <div className="space-y-8">
      {activeTab === 'schedule' && (
        <div className="space-y-8">
          <form onSubmit={handleSaveSchedule} className="bg-white p-6 rounded-2xl border">
            <h3 className="text-lg font-bold mb-4">{editingScheduleId ? 'Sửa lịch' : 'Thêm lịch'}</h3>
            <input type="text" placeholder="Tiêu đề" value={scheduleForm.title} onChange={e => setScheduleForm({...scheduleForm, title: e.target.value})} className="w-full p-3 border rounded-xl mb-4" required />
            <MarkdownEditorWithPreview textareaRef={scheduleTextareaRef} setter={setScheduleForm} form={scheduleForm} field="content" isUploading={isUploading} handleFileUpload={handleFileUpload} label="Nội dung" onShowInternalLinkPicker={() => { fetchPickerData(); setShowLinkPicker({ field: 'content', setter: setScheduleForm, form: scheduleForm, ref: scheduleTextareaRef }); }} />
            <div className="flex gap-4 mt-4">
               <input type="datetime-local" value={scheduleForm.start_date} onChange={e => setScheduleForm({...scheduleForm, start_date: e.target.value})} className="flex-1 p-3 border rounded-xl" required />
               <input type="datetime-local" value={scheduleForm.end_date} onChange={e => setScheduleForm({...scheduleForm, end_date: e.target.value})} className="flex-1 p-3 border rounded-xl" required />
            </div>
            <button type="submit" className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl">Lưu</button>
          </form>
          <div className="bg-white rounded-2xl border overflow-hidden">
             {schedule.map(item => (
                <div key={item.id} className="p-4 border-b flex justify-between items-center grow h-full last:border-0 hover:bg-slate-50 transition-colors">
                   <div>
                      <h4 className="font-bold">{item.title}</h4>
                      <p className="text-xs text-slate-400">{new Date(item.start_date).toLocaleDateString('vi-VN')} - {new Date(item.end_date).toLocaleDateString('vi-VN')}</p>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => { setEditingScheduleId(item.id); setScheduleForm({ ...item, week: item.week || '', date_range: item.date_range || '', file_url: item.file_url || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 text-blue-500"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => handleDeleteSchedule(item.id)} className="p-2 text-red-500"><Trash2 className="w-5 h-5" /></button>
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-8">
           <form onSubmit={handleSaveGallery} className="bg-white p-6 rounded-2xl border">
              <h3 className="text-lg font-bold mb-4">{editingGalleryId ? 'Sửa ảnh' : 'Thêm bộ ảnh'}</h3>
              <input type="text" placeholder="Tiêu đề" value={galleryForm.title} onChange={e => setGalleryForm({...galleryForm, title: e.target.value})} className="w-full p-3 border rounded-xl mb-4" required />
              <input type="url" placeholder="Link ảnh bọc" value={galleryForm.image_url} onChange={e => setGalleryForm({...galleryForm, image_url: e.target.value})} className="w-full p-3 border rounded-xl mb-4" required />
              <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl">Lưu</button>
           </form>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.map(item => (
                 <div key={item.id} className="bg-white rounded-xl border overflow-hidden relative group aspect-square">
                    <img src={item.image_url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-2">
                       <h4 className="text-white text-xs font-bold text-center mb-2">{item.title}</h4>
                       <div className="flex gap-2">
                          <button onClick={() => { setEditingGalleryId(item.id); setGalleryForm({...item, images_json: item.images_json || '[]'}); try { setGalleryImages(JSON.parse(item.images_json || '[]')); } catch (e) { setGalleryImages([]); } window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1 bg-white/20 text-white rounded"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteGallery(item.id)} className="p-1 bg-red-500 text-white rounded"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'archive' && (
        <div className="space-y-8">
           <form onSubmit={handleSaveArchive} className="bg-white p-6 rounded-2xl border">
              <input type="text" placeholder="Tiêu đề" value={archiveForm.title} onChange={e => setArchiveForm({...archiveForm, title: e.target.value})} className="w-full p-3 border rounded-xl mb-4" required />
              <div className="flex gap-3 mb-4">
                 <select value={archiveForm.category} onChange={e => setArchiveForm({...archiveForm, category: e.target.value})} className="flex-1 p-3 border rounded-xl">
                    <option>Nội bộ</option><option>Sở, Bộ</option>
                 </select>
                 <input type="url" placeholder="Link tải" value={archiveForm.file_url} onChange={e => setArchiveForm({...archiveForm, file_url: e.target.value})} className="flex-[2] p-3 border rounded-xl" required />
              </div>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl">Lưu</button>
           </form>
           <table className="w-full bg-white border">
              <thead className="bg-slate-50"><tr><th className="p-3 text-left">Tiêu đề</th><th className="p-3 text-left">Nhóm</th><th className="p-3 text-right">Lệnh</th></tr></thead>
              <tbody>
                {archiveDocuments.map(item => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3 text-sm">{item.title}</td>
                    <td className="p-3">
                      <span className="text-[10px] bg-slate-100 px-2 rounded">{item.category}</span>
                    </td>
                    <td className="p-3 text-right">
                       <button onClick={() => { setEditingArchiveId(item.id); setArchiveForm({...item}); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1 text-blue-500"><Edit className="w-4 h-4" /></button>
                       <button onClick={() => handleDeleteArchive(item.id)} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-6">
           <div className="flex justify-between items-center py-4 border-b">
              <h3 className="font-bold text-xl">Hộp thư góp ý ({contactSubmissions.length})</h3>
              <button onClick={() => fetchSystemData()} className="p-2 text-blue-500 hover:bg-blue-50 rounded italic text-sm">Làm mới</button>
           </div>
           {contactSubmissions.map(msg => (
             <div key={msg.id} className="bg-white p-6 rounded-2xl border shadow-sm relative grow h-full mb-4">
                <div className="flex justify-between mb-4">
                   <div>
                      <h5 className="font-bold">{msg.name}</h5>
                      <p className="text-xs text-slate-400">{msg.email} - {new Date(msg.created_at).toLocaleString('vi-VN')}</p>
                   </div>
                   <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-5 h-5" /></button>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl italic text-slate-600">"{msg.message}"</div>
             </div>
           ))}
        </div>
      )}

      {activeTab === 'admins' && isSuperAdmin && (
        <div className="space-y-8">
           <form onSubmit={handleSaveAdminUser} className="bg-white p-6 rounded-2xl border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input type="text" placeholder="Username" value={adminUserForm.username} onChange={e => setAdminUserForm({...adminUserForm, username: e.target.value})} className="p-3 border rounded-xl" required />
                 <input type="text" placeholder="Password" value={adminUserForm.password} onChange={e => setAdminUserForm({...adminUserForm, password: e.target.value})} className="p-3 border rounded-xl" required />
              </div>
              <input type="text" placeholder="Tên hiển thị" value={adminUserForm.display_name} onChange={e => setAdminUserForm({...adminUserForm, display_name: e.target.value})} className="w-full p-3 border rounded-xl" required />
              <select value={adminUserForm.role} onChange={e => setAdminUserForm({...adminUserForm, role: e.target.value})} className="w-full p-3 border rounded-xl">
                 <option value="super_admin">Ban Giám Hiệu</option>
                 <option value="youth_union_officer">Cán bộ Đoàn</option>
                 <option value="dept_head">Tổ trưởng</option>
              </select>
              {adminUserForm.role === 'dept_head' && (
                <select value={adminUserForm.dept_id} onChange={e => setAdminUserForm({...adminUserForm, dept_id: e.target.value})} className="w-full p-3 border rounded-xl" required>
                   <option value="">-- Chọn tổ phụ trách --</option>
                   {departmentsList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              )}
              <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl">Lưu tài khoản</button>
           </form>
           <table className="w-full bg-white border">
              <thead><tr className="bg-slate-50"><th className="p-3 text-left">Tên</th><th className="p-3 text-left">Quyền</th><th className="p-3 text-right">Lệnh</th></tr></thead>
              <tbody>
                {adminUsers.map(u => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3 font-bold">{u.display_name} ({u.username})</td>
                    <td className="p-3 text-xs uppercase">{u.role}</td>
                    <td className="p-3 text-right">
                       <button onClick={() => { setEditingAdminUserId(u.id); setAdminUserForm({...u, dept_id: u.dept_id || ''}); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mx-1 text-blue-500"><Edit className="w-4 h-4" /></button>
                       <button onClick={() => handleDeleteAdminUser(u.id)} className="mx-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};
