import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Zap, Search, Bell, GraduationCap, Users, Award, Calendar } from 'lucide-react';
import { MarkdownEditorWithPreview } from '../MarkdownEditor';
import { AdminManagerProps } from './types';

export const ContentManager: React.FC<AdminManagerProps> = ({
  supabase,
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
  const [news, setNews] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [youthUnion, setYouthUnion] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [adminSearch, setAdminSearch] = useState('');

  const [newsForm, setNewsForm] = useState({ title: '', content: '', category: 'Tin tức', image_url: '', is_new: true });
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  
  const [admissionForm, setAdmissionForm] = useState({ title: '', summary: '', content: '', deadline: '', year: new Date().getFullYear(), document_url: '', is_new: true });
  const [editingAdmissionId, setEditingAdmissionId] = useState<string | null>(null);

  const [youthUnionForm, setYouthUnionForm] = useState({ title: '', summary: '', content: '', date: '', image_url: '' });
  const [editingYouthUnionId, setEditingYouthUnionId] = useState<string | null>(null);

  const [achievementForm, setAchievementForm] = useState({ title: '', student_name: '', class: '', year: '2025-2026', award: '', type: 'academic', description: '', image_url: '' });
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);

  const newsTextareaRef = useRef<HTMLTextAreaElement>(null);
  const admissionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const youthUnionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const achievementTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchContentData();
  }, [activeTab]);

  const fetchContentData = async () => {
    if (['news', 'admissions', 'youth_union', 'achievements'].includes(activeTab)) {
      setLoading(true);
      try {
        if (activeTab === 'news') {
          const { data } = await supabase.from('news').select('*').order('date', { ascending: false });
          if (data) setNews(data);
        } else if (activeTab === 'admissions') {
          const { data } = await supabase.from('admissions').select('*').order('created_at', { ascending: false });
          if (data) setAdmissions(data);
        } else if (activeTab === 'youth_union') {
          const { data } = await supabase.from('youth_union').select('*').order('date', { ascending: false });
          if (data) setYouthUnion(data);
        } else if (activeTab === 'achievements') {
          const { data } = await supabase.from('achievements').select('*').order('created_at', { ascending: false });
          if (data) setAchievements(data);
        }
      } catch (error) {
        console.error("Error fetching content data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNewsId) {
        const { error } = await supabase.from('news').update({ ...newsForm, date: new Date() }).eq('id', editingNewsId);
        if (error) throw error;
        setEditingNewsId(null);
      } else {
        const { error } = await supabase.from('news').insert([{ ...newsForm, date: new Date() }]);
        if (error) throw error;
      }
      setNewsForm({ title: '', content: '', category: 'Tin tức', image_url: '', is_new: true });
      showSuccess();
      fetchContentData();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleClearAllNew = async () => {
    showConfirm("Xác nhận", "Gỡ trạng thái 'NEW' của tất cả bài viết?", async () => {
      const { error } = await supabase.from('news').update({ is_new: false }).eq('is_new', true);
      if (error) showAlert("Lỗi", error.message);
      else {
        showSuccess("Đã gỡ tất cả 'NEW'");
        fetchContentData();
      }
    });
  };

  const handleDeleteNews = async (id: string) => {
    showConfirm("Xác nhận xóa", "Bạn có chắc chắn muốn xóa tin tức này?", async () => {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
      else fetchContentData();
    });
  };

  const handleEditNews = (item: any) => {
    setEditingNewsId(item.id);
    setNewsForm({ title: item.title, content: item.content, category: item.category, image_url: item.image_url || '', is_new: !!item.is_new });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdmissionId) {
        const { error } = await supabase.from('admissions').update({ ...admissionForm, updated_at: new Date() }).eq('id', editingAdmissionId);
        if (error) throw error;
        setEditingAdmissionId(null);
      } else {
        const { error } = await supabase.from('admissions').insert([{ ...admissionForm }]);
        if (error) throw error;
      }
      setAdmissionForm({ title: '', summary: '', content: '', deadline: '', year: 2026, document_url: '', is_new: true });
      showSuccess();
      fetchContentData();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleDeleteAdmission = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa thông tin tuyển sinh này?", async () => {
      const { error } = await supabase.from('admissions').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
      else fetchContentData();
    });
  };

  const handleEditAdmission = (item: any) => {
    setEditingAdmissionId(item.id);
    setAdmissionForm({ title: item.title, summary: item.summary || '', content: item.content, deadline: item.deadline || '', year: item.year || 2026, document_url: item.document_url || '', is_new: !!item.is_new });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveYouthUnion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingYouthUnionId) {
        const { error } = await supabase.from('youth_union').update({ ...youthUnionForm, updated_at: new Date() }).eq('id', editingYouthUnionId);
        if (error) throw error;
        setEditingYouthUnionId(null);
      } else {
        const { error } = await supabase.from('youth_union').insert([{ ...youthUnionForm }]);
        if (error) throw error;
      }
      setYouthUnionForm({ title: '', summary: '', content: '', date: '', image_url: '' });
      showSuccess();
      fetchContentData();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleDeleteYouthUnion = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa hoạt động Đoàn này?", async () => {
      const { error } = await supabase.from('youth_union').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
      else fetchContentData();
    });
  };

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAchievementId) {
        const { error } = await supabase.from('achievements').update({ ...achievementForm, updated_at: new Date() }).eq('id', editingAchievementId);
        if (error) throw error;
        setEditingAchievementId(null);
      } else {
        const { error } = await supabase.from('achievements').insert([{ ...achievementForm }]);
        if (error) throw error;
      }
      setAchievementForm({ title: '', student_name: '', class: '', year: '2025-2026', award: '', type: 'academic', description: '', image_url: '' });
      showSuccess();
      fetchContentData();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa thành tích này?", async () => {
      const { error } = await supabase.from('achievements').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
      else fetchContentData();
    });
  };

  const filteredNews = news.filter(item => 
    item.title?.toLowerCase().includes(adminSearch.toLowerCase()) || 
    item.category?.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const filteredAdmissions = admissions.filter(item => 
    item.title?.toLowerCase().includes(adminSearch.toLowerCase()) || 
    item.summary?.toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {activeTab === 'news' && (
        <div className="space-y-8">
          <form onSubmit={handleAddNews} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                {editingNewsId ? <Edit className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                {editingNewsId ? 'Hiệu chỉnh tin tức' : 'Thêm tin mới'}
              </h3>
              <button 
                type="button"
                onClick={handleClearAllNew}
                className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors font-bold flex items-center gap-1.5 border border-slate-200"
              >
                <Zap className="w-3.5 h-3.5 text-orange-500" /> Gỡ toàn bộ "NEW"
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input 
                type="text" 
                placeholder="Tiêu đề tin tức" 
                value={newsForm.title}
                onChange={e => setNewsForm({...newsForm, title: e.target.value})}
                className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex gap-4">
                <select 
                  value={newsForm.category}
                  onChange={e => setNewsForm({...newsForm, category: e.target.value})}
                  className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Tin tức</option>
                  <option>Thông báo</option>
                  <option>Sự kiện</option>
                </select>
                <label className="flex items-center gap-2 px-4 border rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={newsForm.is_new}
                    onChange={e => setNewsForm({...newsForm, is_new: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-bold text-slate-700">Hiện "NEW"</span>
                </label>
              </div>
            </div>
            <MarkdownEditorWithPreview 
              textareaRef={newsTextareaRef} 
              setter={setNewsForm} 
              form={newsForm} 
              field="content" 
              isUploading={isUploading}
              handleFileUpload={handleFileUpload}
              label="Nội dung chi tiết"
              placeholder="Nhập nội dung bài viết tin tức tại đây (sử dụng Markdown)..."
              onShowInternalLinkPicker={() => {
                fetchPickerData();
                setShowLinkPicker({ field: 'content', setter: setNewsForm, form: newsForm, ref: newsTextareaRef });
              }}
            />
            <div className="mt-4 flex gap-3">
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                {editingNewsId ? 'Cập nhật' : 'Đăng tin'}
              </button>
              {editingNewsId && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingNewsId(null);
                    setNewsForm({ title: '', content: '', category: 'Tin tức', image_url: '', is_new: true });
                  }}
                  className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                >
                  Hủy bỏ
                </button>
              )}
            </div>
          </form>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm tin tức..." 
                className="bg-transparent border-none outline-none text-sm w-full"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
              />
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-bold text-slate-600">ID</th>
                  <th className="p-4 font-bold text-slate-600">Tiêu đề</th>
                  <th className="p-4 font-bold text-slate-600">Loại</th>
                  <th className="p-4 font-bold text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredNews.map(item => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="p-4 text-[10px] font-mono text-slate-400 select-all">{item.id}</td>
                    <td className="p-4 text-sm font-medium">
                      {item.title}
                      {item.is_new && <span className="ml-2 px-1.5 py-0.5 bg-orange-600 text-white text-[8px] font-black rounded shadow-sm">NEW</span>}
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{item.category}</span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleEditNews(item)} className="text-blue-500 hover:text-blue-700 p-2"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => handleDeleteNews(item.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'admissions' && (
        <div className="space-y-8">
          <form onSubmit={handleAddAdmission} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              {editingAdmissionId ? <Edit className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
              {editingAdmissionId ? 'Hiệu chỉnh tuyển sinh' : 'Thêm tuyển sinh'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input 
                type="text" placeholder="Tiêu đề" 
                value={admissionForm.title} onChange={e => setAdmissionForm({...admissionForm, title: e.target.value})}
                className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 col-span-2" required
              />
              <input 
                type="date" value={admissionForm.deadline} onChange={e => setAdmissionForm({...admissionForm, deadline: e.target.value})}
                className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required
              />
              <input 
                type="text" placeholder="Tóm tắt ngắn" 
                value={admissionForm.summary} onChange={e => setAdmissionForm({...admissionForm, summary: e.target.value})}
                className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 md:col-span-3"
              />
            </div>
            <MarkdownEditorWithPreview 
              textareaRef={admissionTextareaRef} setter={setAdmissionForm} form={admissionForm} 
              field="content" isUploading={isUploading} handleFileUpload={handleFileUpload}
              label="Nội dung tuyển sinh" placeholder="Nhập nội dung tuyển sinh..."
              onShowInternalLinkPicker={() => {
                fetchPickerData();
                setShowLinkPicker({ field: 'content', setter: setAdmissionForm, form: admissionForm, ref: admissionTextareaRef });
              }}
            />
            <div className="mt-4 flex gap-3">
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                {editingAdmissionId ? 'Cập nhật' : 'Lưu'}
              </button>
              {editingAdmissionId && (
                <button type="button" onClick={() => { setEditingAdmissionId(null); setAdmissionForm({ title: '', summary: '', content: '', deadline: '', year: 2026, document_url: '', is_new: true }); }} className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors">Hủy</button>
              )}
            </div>
          </form>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Tìm kiếm..." className="bg-transparent border-none outline-none text-sm w-full" value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} />
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 font-bold text-slate-600">ID</th>
                  <th className="p-4 font-bold text-slate-600">Tiêu đề</th>
                  <th className="p-4 font-bold text-slate-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="p-4 text-[10px] font-mono text-slate-400 select-all">{item.id}</td>
                    <td className="p-4 text-sm font-medium">{item.title}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleEditAdmission(item)} className="text-blue-500 p-2"><Edit className="w-5 h-5" /></button>
                      <button onClick={() => handleDeleteAdmission(item.id)} className="text-red-500 p-2"><Trash2 className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'youth_union' && (
        <div className="space-y-8">
          <form onSubmit={handleSaveYouthUnion} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              {editingYouthUnionId ? <Edit className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
              {editingYouthUnionId ? 'Hiệu chỉnh hoạt động Đoàn' : 'Thêm hoạt động Đoàn'}
            </h3>
            <input type="text" placeholder="Tiêu đề" value={youthUnionForm.title} onChange={e => setYouthUnionForm({...youthUnionForm, title: e.target.value})} className="w-full p-3 border rounded-xl outline-none" required />
            <MarkdownEditorWithPreview 
              textareaRef={youthUnionTextareaRef} setter={setYouthUnionForm} form={youthUnionForm} field="content" 
              isUploading={isUploading} handleFileUpload={handleFileUpload} label="Nội dung"
              onShowInternalLinkPicker={() => { fetchPickerData(); setShowLinkPicker({ field: 'content', setter: setYouthUnionForm, form: youthUnionForm, ref: youthUnionTextareaRef }); }}
            />
            <input type="datetime-local" value={youthUnionForm.date} onChange={e => setYouthUnionForm({...youthUnionForm, date: e.target.value})} className="w-full p-3 border rounded-xl outline-none" required />
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">Lưu</button>
              {editingYouthUnionId && <button type="button" onClick={() => { setEditingYouthUnionId(null); setYouthUnionForm({ title: '', summary: '', content: '', date: '', image_url: '' }); }} className="px-6 py-3 bg-slate-200 rounded-xl">Hủy</button>}
            </div>
          </form>
          <div className="bg-white p-4 rounded-2xl border">
            {youthUnion.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 border-b last:border-0 grow h-full">
                <div>
                  <h4 className="font-bold">{item.title}</h4>
                  <p className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingYouthUnionId(item.id); setYouthUnionForm({ title: item.title, summary: item.summary || '', content: item.content, date: item.date || '', image_url: item.image_url || '' }); }} className="p-2 text-blue-500"><Edit className="w-5 h-5" /></button>
                  <button onClick={() => handleDeleteYouthUnion(item.id)} className="p-2 text-red-500"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-8">
          <form onSubmit={handleSaveAchievement} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              {editingAchievementId ? <Edit className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
              {editingAchievementId ? 'Hiệu chỉnh thành tích' : 'Thêm thành tích'}
            </h3>
            <input type="text" placeholder="Tiêu đề" value={achievementForm.title} onChange={e => setAchievementForm({...achievementForm, title: e.target.value})} className="w-full p-3 border rounded-xl outline-none" required />
            <MarkdownEditorWithPreview 
              textareaRef={achievementTextareaRef} setter={setAchievementForm} form={achievementForm} field="description" 
              isUploading={isUploading} handleFileUpload={handleFileUpload} label="Mô tả"
              onShowInternalLinkPicker={() => { fetchPickerData(); setShowLinkPicker({ field: 'description', setter: setAchievementForm, form: achievementForm, ref: achievementTextareaRef }); }}
            />
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">Lưu</button>
              {editingAchievementId && <button type="button" onClick={() => { setEditingAchievementId(null); setAchievementForm({ title: '', student_name: '', class: '', year: '2025-2026', award: '', type: 'academic', description: '', image_url: '' }); }} className="px-6 py-3 bg-slate-200 rounded-xl">Hủy</button>}
            </div>
          </form>
          <div className="bg-white p-4 rounded-2xl border">
            {achievements.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 border-b last:border-0 grow h-full">
                <h4 className="font-bold">{item.title}</h4>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingAchievementId(item.id); setAchievementForm({ title: item.title, description: item.description, year: item.year, type: item.type, student_name: item.student_name || '', class: item.class || '', award: item.award || '', image_url: item.image_url || '' }); }} className="p-2 text-blue-500"><Edit className="w-5 h-5" /></button>
                  <button onClick={() => handleDeleteAchievement(item.id)} className="p-2 text-red-500"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
