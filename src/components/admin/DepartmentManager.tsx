import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, BookOpen, ChevronRight, ArrowLeft, Info, Users, Calendar, FileText, ImageIcon, Filter, LayoutDashboard, BadgeCheck, GraduationCap } from 'lucide-react';
import * as Icons from 'lucide-react';
import { MarkdownEditorWithPreview, MarkdownContent } from '../MarkdownEditor';
import { AdminManagerProps } from './types';

export const DepartmentManager: React.FC<AdminManagerProps> = ({
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
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [isManagingDeptContent, setIsManagingDeptContent] = useState(false);
  const [deptActiveTab, setDeptActiveTab] = useState<'introduction' | 'personnel' | 'activities' | 'documents'>('introduction');
  const [adminSearch, setAdminSearch] = useState('');

  const [deptPersonnel, setDeptPersonnel] = useState<any[]>([]);
  const [deptActivities, setDeptActivities] = useState<any[]>([]);
  const [deptDocuments, setDeptDocuments] = useState<any[]>([]);

  const [deptForm, setDeptForm] = useState({ name: '', icon: 'BookOpen', description: '', content: '' });
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);

  const [personnelForm, setPersonnelForm] = useState({ name: '', position: '', bio: '', birth_date: '', education: '', image_url: '' });
  const [editingPersonnelId, setEditingPersonnelId] = useState<string | null>(null);

  const [activityForm, setActivityForm] = useState({ title: '', date: '', summary: '', description: '', document_url: '', content: '', image_url: '' });
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  const [documentForm, setDocumentForm] = useState({ title: '', description: '', file_url: '', category: 'Giáo án', grade: '10', is_new: true });
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);

  const [docGradeAdminFilter, setDocGradeAdminFilter] = useState<'all' | '10' | '11' | '12'>('all');
  const [docStatusAdminFilter, setDocStatusAdminFilter] = useState<'all' | 'new' | 'old'>('all');

  const deptContentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const activityTextareaRef = useRef<HTMLTextAreaElement>(null);

  const isDeptHead = user?.role === 'dept_head';

  useEffect(() => {
    fetchDepartments();
  }, [activeTab]);

  useEffect(() => {
    if (selectedDeptId) {
      fetchDeptData();
    }
  }, [selectedDeptId]);

  useEffect(() => {
    if (isDeptHead && user?.dept_id) {
       setSelectedDeptId(user.dept_id);
       setIsManagingDeptContent(true);
       setDeptActiveTab('introduction');
       fetchDeptData();
    }
  }, [isDeptHead]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('departments').select('*').order('name');
      if (data) setDepartmentsList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeptData = async () => {
    if (!selectedDeptId) return;
    setLoading(true);
    try {
      const [personnelRes, activitiesRes, documentsRes, deptInfoRes] = await Promise.all([
        supabase.from('personnel').select('*').eq('dept_id', selectedDeptId).order('position'),
        supabase.from('activities').select('*').eq('dept_id', selectedDeptId).order('date', { ascending: false }),
        supabase.from('dept_documents').select('*').eq('dept_id', selectedDeptId).order('created_at', { ascending: false }),
        supabase.from('departments').select('*').eq('id', selectedDeptId).single()
      ]);
      
      if (personnelRes.data) setDeptPersonnel(personnelRes.data);
      if (activitiesRes.data) setDeptActivities(activitiesRes.data);
      if (documentsRes.data) setDeptDocuments(documentsRes.data);
      if (deptInfoRes.data) {
        setDeptForm({
          name: deptInfoRes.data.name,
          icon: deptInfoRes.data.icon,
          description: deptInfoRes.data.description,
          content: deptInfoRes.data.content || ''
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDeptId || selectedDeptId) {
        const idToUpdate = editingDeptId || selectedDeptId;
        const { error } = await supabase.from('departments').update({ ...deptForm, updated_at: new Date() }).eq('id', idToUpdate);
        if (error) throw error;
        setEditingDeptId(null);
      } else {
        const { error } = await supabase.from('departments').insert([deptForm]);
        if (error) throw error;
      }
      showSuccess();
      fetchDepartments();
      if (selectedDeptId) fetchDeptData();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi lưu tổ chuyên môn: " + error.message);
    }
  };

  const handleDeleteDept = async (id: string) => {
    showConfirm("Xác nhận xóa", "Bạn có chắc chắn muốn xóa tổ chuyên môn này? Mọi dữ liệu nhân sự, hoạt động thuộc tổ này cũng sẽ bị ảnh hưởng.", async () => {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) showAlert("Lỗi", error.message);
      else fetchDepartments();
    });
  };

  const handleAddPersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId) return;
    try {
      if (editingPersonnelId) {
        const { error } = await supabase.from('personnel').update({ ...personnelForm, updated_at: new Date() }).eq('id', editingPersonnelId);
        if (error) throw error;
        setEditingPersonnelId(null);
      } else {
        const { error } = await supabase.from('personnel').insert([{ ...personnelForm, dept_id: selectedDeptId }]);
        if (error) throw error;
      }
      setPersonnelForm({ name: '', position: '', bio: '', birth_date: '', education: '', image_url: '' });
      showSuccess();
      fetchDeptData();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleDeletePersonnel = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa nhân sự này?", async () => {
      const { error } = await supabase.from('personnel').delete().eq('id', id);
      if (error) showAlert("Lỗi", error.message);
      else fetchDeptData();
    });
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId) return;
    try {
      if (editingActivityId) {
        const { error } = await supabase.from('activities').update({ ...activityForm, updated_at: new Date() }).eq('id', editingActivityId);
        if (error) throw error;
        setEditingActivityId(null);
      } else {
        const { error } = await supabase.from('activities').insert([{ ...activityForm, dept_id: selectedDeptId }]);
        if (error) throw error;
      }
      setActivityForm({ title: '', date: '', summary: '', description: '', document_url: '', content: '', image_url: '' });
      showSuccess();
      fetchDeptData();
    } catch (error: any) {
      showAlert("Lỗi", error.message);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa hoạt động này?", async () => {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) showAlert("Lỗi", error.message);
      else fetchDeptData();
    });
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId) return;
    try {
      if (editingDocumentId) {
        const { error } = await supabase.from('dept_documents').update({ ...documentForm, updated_at: new Date() }).eq('id', editingDocumentId);
        if (error) throw error;
        setEditingDocumentId(null);
      } else {
        const { error } = await supabase.from('dept_documents').insert([{ ...documentForm, dept_id: selectedDeptId }]);
        if (error) throw error;
      }
      setDocumentForm({ title: '', description: '', file_url: '', category: 'Giáo án', grade: '10', is_new: true });
      showSuccess();
      fetchDeptData();
    } catch (error: any) {
      showAlert("Lỗi", error.message);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa tài liệu này?", async () => {
      const { error } = await supabase.from('dept_documents').delete().eq('id', id);
      if (error) showAlert("Lỗi", error.message);
      else fetchDeptData();
    });
  };

  return (
    <div className="space-y-8">
      {!isManagingDeptContent ? (
        <div className="space-y-8">
          <form onSubmit={handleSaveDept} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              {editingDeptId ? <Edit className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
              {editingDeptId ? 'Hiệu chỉnh tổ chuyên môn' : 'Thêm tổ chuyên môn mới'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Tên tổ" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} className="p-3 border rounded-xl outline-none" required />
              <input type="text" placeholder="Icon" value={deptForm.icon} onChange={e => setDeptForm({...deptForm, icon: e.target.value})} className="p-3 border rounded-xl outline-none" required />
            </div>
            <textarea placeholder="Mô tả ngắn" value={deptForm.description} onChange={e => setDeptForm({...deptForm, description: e.target.value})} className="w-full p-3 border rounded-xl h-24 mb-4" required />
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">Lưu</button>
              {editingDeptId && <button type="button" onClick={() => { setEditingDeptId(null); setDeptForm({ name: '', icon: 'BookOpen', description: '', content: '' }); }} className="px-6 py-3 bg-slate-200 rounded-xl">Hủy</button>}
            </div>
          </form>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border">
              <Search className="w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Tìm tên tổ chuyên môn..." className="bg-transparent border-none outline-none text-sm w-full" value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentsList.filter(dept => dept.name?.toLowerCase().includes(adminSearch.toLowerCase())).map(dept => (
                <div key={dept.id} className="p-6 bg-white rounded-2xl border hover:border-blue-500 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{dept.name}</h4>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingDeptId(dept.id); setDeptForm({ name: dept.name, icon: dept.icon, description: dept.description, content: dept.content || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-1 text-blue-500"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteDept(dept.id)} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">{dept.description}</p>
                  <button onClick={() => { setSelectedDeptId(dept.id); setIsManagingDeptContent(true); setDeptActiveTab('introduction'); }} className="mt-4 flex items-center gap-1 text-blue-600 text-xs font-bold hover:underline">Quản lý <ChevronRight className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {!isDeptHead && (
            <button onClick={() => setIsManagingDeptContent(false)} className="flex items-center gap-2 text-blue-600 font-bold"><ArrowLeft className="w-5 h-5" /> Quay lại danh sách</button>
          )}

          <div className="bg-blue-900 text-white p-8 rounded-3xl relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase">{departmentsList.find(d => d.id === selectedDeptId)?.name}</h3>
                {isDeptHead && <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-blue-800/50 w-fit px-3 py-1.5 rounded-full border border-blue-700"><BadgeCheck className="w-4 h-4 text-green-400" /> Tài khoản: {user?.display_name}</div>}
             </div>
          </div>

          <div className="flex gap-4 p-1 bg-slate-100 rounded-xl w-fit">
            {(['introduction', 'personnel', 'activities', 'documents'] as const).map(tab => (
              <button key={tab} onClick={() => setDeptActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-bold ${deptActiveTab === tab ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>
                {tab === 'introduction' ? 'Giới thiệu' : tab === 'personnel' ? 'Nhân sự' : tab === 'activities' ? 'Hoạt động' : 'Tài liệu'}
              </button>
            ))}
          </div>

          {deptActiveTab === 'introduction' && (
            <div className="bg-white p-6 rounded-2xl border">
              <MarkdownEditorWithPreview 
                textareaRef={deptContentTextareaRef} setter={setDeptForm} form={deptForm} field="content" isUploading={isUploading} handleFileUpload={handleFileUpload} label="Giới thiệu"
                onShowInternalLinkPicker={() => { fetchPickerData(); setShowLinkPicker({ field: 'content', setter: setDeptForm, form: deptForm, ref: deptContentTextareaRef }); }}
              />
              <div className="mt-4 flex justify-end"><button onClick={handleSaveDept} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-md">Lưu</button></div>
            </div>
          )}

          {deptActiveTab === 'personnel' && (
            <div className="space-y-6">
              <form onSubmit={handleAddPersonnel} className="bg-white p-6 rounded-2xl border">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input type="text" placeholder="Họ tên" value={personnelForm.name} onChange={e => setPersonnelForm({...personnelForm, name: e.target.value})} className="p-3 border rounded-xl" required />
                    <input type="text" placeholder="Chức vụ" value={personnelForm.position} onChange={e => setPersonnelForm({...personnelForm, position: e.target.value})} className="p-3 border rounded-xl" required />
                 </div>
                 <textarea placeholder="Giới thiệu" value={personnelForm.bio} onChange={e => setPersonnelForm({...personnelForm, bio: e.target.value})} className="w-full p-3 border rounded-xl h-24 mb-4" />
                 <div className="flex gap-3">
                   <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">{editingPersonnelId ? 'Cập nhật' : 'Thêm'}</button>
                   {editingPersonnelId && <button type="button" onClick={() => { setEditingPersonnelId(null); setPersonnelForm({ name: '', position: '', bio: '', birth_date: '', education: '', image_url: '' }); }} className="px-6 py-3 bg-slate-200 rounded-xl">Hủy</button>}
                 </div>
              </form>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {deptPersonnel.map(p => (
                  <div key={p.id} className="bg-white p-5 rounded-2xl border text-center relative group">
                    <div className="flex gap-1 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingPersonnelId(p.id); setPersonnelForm({...p, bio: p.bio || '', birth_date: p.birth_date || '', education: p.education || '', image_url: p.image_url || ''}); }} className="p-1 text-blue-500"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeletePersonnel(p.id)} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold">{p.name[0]}</div>
                    <h5 className="font-bold">{p.name}</h5>
                    <p className="text-xs text-blue-600 uppercase font-black">{p.position}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {deptActiveTab === 'activities' && (
            <div className="space-y-6">
               <form onSubmit={handleAddActivity} className="bg-white p-6 rounded-2xl border">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input type="text" placeholder="Tiêu đề" value={activityForm.title} onChange={e => setActivityForm({...activityForm, title: e.target.value})} className="p-3 border rounded-xl" required />
                    <input type="datetime-local" value={activityForm.date} onChange={e => setActivityForm({...activityForm, date: e.target.value})} className="p-3 border rounded-xl" required />
                 </div>
                 <MarkdownEditorWithPreview textareaRef={activityTextareaRef} setter={setActivityForm} form={activityForm} field="content" isUploading={isUploading} handleFileUpload={handleFileUpload} label="Nội dung" onShowInternalLinkPicker={() => { fetchPickerData(); setShowLinkPicker({ field: 'content', setter: setActivityForm, form: activityForm, ref: activityTextareaRef }); }} />
                 <div className="flex gap-3 mt-4">
                    <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">{editingActivityId ? 'Cập nhật' : 'Thêm'}</button>
                 </div>
               </form>
               <div className="space-y-4">
                 {deptActivities.map(a => (
                   <div key={a.id} className="bg-white p-6 rounded-2xl border group">
                     <div className="flex justify-between items-start mb-2">
                       <h5 className="font-bold text-lg">{a.title}</h5>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setEditingActivityId(a.id); setActivityForm({ ...a, content: a.content || '', date: a.date || '', summary: a.summary || '', description: a.description || '', image_url: a.image_url || '', document_url: a.document_url || '' }); }} className="p-1 text-blue-500"><Edit className="w-5 h-5" /></button>
                         <button onClick={() => handleDeleteActivity(a.id)} className="p-1 text-red-500"><Trash2 className="w-5 h-5" /></button>
                       </div>
                     </div>
                     <div className="text-sm text-slate-500 line-clamp-3 prose prose-slate max-w-none"><MarkdownContent content={a.content} /></div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {deptActiveTab === 'documents' && (
            <div className="space-y-6">
               <form onSubmit={handleAddDocument} className="bg-white p-6 rounded-2xl border">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <input type="text" placeholder="Tên tài liệu" value={documentForm.title} onChange={e => setDocumentForm({...documentForm, title: e.target.value})} className="p-3 border rounded-xl" required />
                   <div className="flex gap-2">
                     <select value={documentForm.category} onChange={e => setDocumentForm({...documentForm, category: e.target.value})} className="flex-1 p-3 border rounded-xl">
                        <option>Giáo án</option><option>Đề KT</option><option>Chuyên đề</option><option>Hệ thống học tập</option>
                     </select>
                     <select value={documentForm.grade} onChange={e => setDocumentForm({...documentForm, grade: e.target.value})} className="p-3 border rounded-xl">
                        <option value="10">K10</option><option value="11">K11</option><option value="12">K12</option><option value="all">Chung</option>
                     </select>
                   </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input type="url" placeholder="Link tài liệu (Drive, Mediafire...)" value={documentForm.file_url} onChange={e => setDocumentForm({...documentForm, file_url: e.target.value})} className="md:col-span-2 p-3 border rounded-xl" required />
                    <label className="flex items-center justify-center gap-3 p-3 bg-slate-50 border rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={documentForm.is_new}
                        onChange={e => setDocumentForm({...documentForm, is_new: e.target.checked})}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className={`text-sm font-black uppercase tracking-widest ${documentForm.is_new ? 'text-blue-600' : 'text-slate-400'}`}>
                        {documentForm.is_new ? 'Tài liệu Mới' : 'Tài liệu Cũ'}
                      </span>
                    </label>
                 </div>
                 <textarea 
                    placeholder="Mô tả tóm tắt nội dung tài liệu (lược bớt)..." 
                    value={documentForm.description} 
                    onChange={e => setDocumentForm({...documentForm, description: e.target.value})} 
                    className="w-full p-3 border rounded-xl h-24 mb-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                 />
                 <button type="submit" className="px-10 py-3 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100">
                    {editingDocumentId ? 'Cập nhật tài liệu' : 'Đưa lên hệ thống'}
                 </button>
               </form>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deptDocuments.map(d => (
                    <div key={d.id} className="bg-white p-4 rounded-xl border flex justify-between items-center group">
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-bold text-slate-800">{d.title}</h5>
                            {d.is_new && <span className="px-1.5 py-0.5 bg-orange-600 text-white text-[8px] font-black rounded shadow-sm">NEW</span>}
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">K{d.grade}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">{d.category}</span>
                          </div>
                       </div>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setEditingDocumentId(d.id); setDocumentForm({...d, description: d.description || '', is_new: !!d.is_new}); }} className="p-1 text-blue-500"><Edit className="w-3.5 h-3.5" /></button>
                         <button onClick={() => handleDeleteDocument(d.id)} className="p-1 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
