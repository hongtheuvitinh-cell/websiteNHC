import React, { useState, useEffect, useRef } from 'react';
import { Settings, Home, Info, Phone, Plus, GraduationCap, Bell, Save, Edit, Trash2 } from 'lucide-react';
import { MarkdownEditorWithPreview } from '../MarkdownEditor';
import { AdminManagerProps } from './types';

export const PageManager: React.FC<AdminManagerProps> = ({
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
  const [homeForm, setHomeForm] = useState({ banner_title: '', banner_description: '', banner_image: '' });
  const [aboutForm, setAboutForm] = useState({ main_text: '', history: '', core_values: '' });
  const [contactForm, setContactForm] = useState({ name: '', slogan: '', phone: '', email: '', address: '' });
  const [admissionsPageForm, setAdmissionsPageForm] = useState({ banner_title: '', banner_description: '' });
  const [newsPageForm, setNewsPageForm] = useState({ banner_title: '', banner_description: '' });
  const [features, setFeatures] = useState<any[]>([]);
  const [featureForm, setFeatureForm] = useState({ title: '', description: '', icon: 'BookOpen', color: 'bg-blue-100 text-blue-700', order_num: 0 });
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);

  const aboutMainTextareaRef = useRef<HTMLTextAreaElement>(null);
  const aboutHistoryTextareaRef = useRef<HTMLTextAreaElement>(null);
  const aboutCoreValuesTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchPageData();
  }, [activeTab]);

  const fetchPageData = async () => {
    if (['home', 'about', 'contact', 'admissions_page', 'news_page', 'features'].includes(activeTab)) {
      setLoading(true);
      try {
        if (activeTab === 'home') {
          const { data } = await supabase.from('home_config').select('*').single();
          if (data) setHomeForm(data);
        } else if (activeTab === 'about') {
          const { data } = await supabase.from('about_config').select('*').single();
          if (data) setAboutForm(data);
        } else if (activeTab === 'contact') {
          const { data } = await supabase.from('contact_config').select('*').single();
          if (data) setContactForm(data);
        } else if (activeTab === 'admissions_page') {
          const { data } = await supabase.from('admissions_page_config').select('*').single();
          if (data) setAdmissionsPageForm(data);
        } else if (activeTab === 'news_page') {
          const { data } = await supabase.from('news_page_config').select('*').single();
          if (data) setNewsPageForm(data);
        } else if (activeTab === 'features') {
          const { data } = await supabase.from('features').select('*').order('order_num', { ascending: true });
          if (data) setFeatures(data);
        }
      } catch (error) {
        console.error("Error fetching page data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveHome = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('home_config').upsert({ id: 1, ...homeForm, updated_at: new Date() });
    if (error) showAlert("Lỗi", "Lỗi lưu cấu hình: " + error.message);
    else showSuccess();
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('about_config').upsert({ id: 1, ...aboutForm, updated_at: new Date() });
    if (error) showAlert("Lỗi", "Lỗi lưu giới thiệu: " + error.message);
    else showSuccess();
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('contact_config').upsert({ id: 1, ...contactForm, updated_at: new Date() });
    if (error) showAlert("Lỗi", "Lỗi lưu thông tin: " + error.message);
    else showSuccess();
  };

  const handleSaveAdmissionsPage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('admissions_page_config').upsert({ id: 1, ...admissionsPageForm, updated_at: new Date() });
    if (error) showAlert("Lỗi", "Lỗi lưu cấu hình: " + error.message);
    else showSuccess();
  };

  const handleSaveNewsPage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('news_page_config').upsert({ id: 1, ...newsPageForm, updated_at: new Date() });
    if (error) showAlert("Lỗi", "Lỗi lưu cấu hình: " + error.message);
    else showSuccess();
  };

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFeatureId) {
        const { error } = await supabase.from('features').update({ ...featureForm, updated_at: new Date() }).eq('id', editingFeatureId);
        if (error) throw error;
        setEditingFeatureId(null);
      } else {
        const { error } = await supabase.from('features').insert([featureForm]);
        if (error) throw error;
      }
      setFeatureForm({ title: '', description: '', icon: 'BookOpen', color: 'bg-blue-100 text-blue-700', order_num: 0 });
      showSuccess();
      fetchPageData();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi lưu thẻ: " + error.message);
    }
  };

  const handleDeleteFeature = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa thẻ tính năng này?", async () => {
      const { error } = await supabase.from('features').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
      else fetchPageData();
    });
  };

  const handleEditFeature = (item: any) => {
    setEditingFeatureId(item.id);
    setFeatureForm({
      title: item.title,
      description: item.description,
      icon: item.icon || 'BookOpen',
      color: item.color || 'bg-blue-100 text-blue-700',
      order_num: item.order_num || 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {activeTab === 'home' && (
        <form onSubmit={handleSaveHome} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Settings className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cấu hình Trang chủ</h2>
              <p className="text-sm text-slate-500">Chỉnh sửa nội dung banner và giao diện trang chủ</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề Banner</label>
              <input 
                type="text" 
                value={homeForm.banner_title}
                onChange={e => setHomeForm({...homeForm, banner_title: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả Banner</label>
              <textarea 
                value={homeForm.banner_description}
                onChange={e => setHomeForm({...homeForm, banner_description: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">URL Hình ảnh Banner</label>
              <input 
                type="text" 
                value={homeForm.banner_image}
                onChange={e => setHomeForm({...homeForm, banner_image: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
            <Save className="w-5 h-5" /> Lưu thay đổi
          </button>
        </form>
      )}

      {activeTab === 'about' && (
        <form onSubmit={handleSaveAbout} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Info className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cấu hình Trang Giới thiệu</h2>
              <p className="text-sm text-slate-500">Chỉnh sửa nội dung giới thiệu, lịch sử và giá trị cốt lõi</p>
            </div>
          </div>
          <div className="space-y-6">
            <MarkdownEditorWithPreview 
              textareaRef={aboutMainTextareaRef} 
              setter={setAboutForm} 
              form={aboutForm} 
              field="main_text" 
              isUploading={isUploading}
              handleFileUpload={handleFileUpload}
              label="Văn bản giới thiệu chính"
              placeholder="Nhập nội dung giới thiệu chính..."
              onShowInternalLinkPicker={() => {
                fetchPickerData();
                setShowLinkPicker({ field: 'main_text', setter: setAboutForm, form: aboutForm, ref: aboutMainTextareaRef });
              }}
            />
            <MarkdownEditorWithPreview 
              textareaRef={aboutHistoryTextareaRef} 
              setter={setAboutForm} 
              form={aboutForm} 
              field="history" 
              isUploading={isUploading}
              handleFileUpload={handleFileUpload}
              label="Lịch sử hình thành"
              placeholder="Nhập nội dung lịch sử hình thành..."
              onShowInternalLinkPicker={() => {
                fetchPickerData();
                setShowLinkPicker({ field: 'history', setter: setAboutForm, form: aboutForm, ref: aboutHistoryTextareaRef });
              }}
            />
            <MarkdownEditorWithPreview 
              textareaRef={aboutCoreValuesTextareaRef} 
              setter={setAboutForm} 
              form={aboutForm} 
              field="core_values" 
              isUploading={isUploading}
              handleFileUpload={handleFileUpload}
              label="Giá trị cốt lõi"
              placeholder="Nhập nội dung giá trị cốt lõi..."
              onShowInternalLinkPicker={() => {
                fetchPickerData();
                setShowLinkPicker({ field: 'core_values', setter: setAboutForm, form: aboutForm, ref: aboutCoreValuesTextareaRef });
              }}
            />
          </div>
          <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
            <Save className="w-5 h-5" /> Lưu thay đổi
          </button>
        </form>
      )}

      {activeTab === 'features' && (
        <div className="space-y-8">
          <form onSubmit={handleSaveFeature} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              {editingFeatureId ? <Edit className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
              {editingFeatureId ? 'Hiệu chỉnh thẻ' : 'Thêm thẻ mới'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input 
                type="text" 
                placeholder="Tiêu đề" 
                value={featureForm.title}
                onChange={e => setFeatureForm({...featureForm, title: e.target.value})}
                className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input 
                type="text" 
                placeholder="Icon (ví dụ: BookOpen, Users, Award)" 
                value={featureForm.icon}
                onChange={e => setFeatureForm({...featureForm, icon: e.target.value})}
                className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input 
                type="text" 
                placeholder="Màu sắc (Tailwind class, ví dụ: bg-blue-100 text-blue-700)" 
                value={featureForm.color}
                onChange={e => setFeatureForm({...featureForm, color: e.target.value})}
                className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input 
                type="number" 
                placeholder="Thứ tự" 
                value={featureForm.order_num}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  setFeatureForm({...featureForm, order_num: isNaN(val) ? 0 : val});
                }}
                className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <textarea 
              placeholder="Mô tả ngắn" 
              value={featureForm.description}
              onChange={e => setFeatureForm({...featureForm, description: e.target.value})}
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24 mb-4"
              required
            />
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                {editingFeatureId ? 'Cập nhật' : 'Thêm mới'}
              </button>
              {editingFeatureId && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingFeatureId(null);
                    setFeatureForm({ title: '', description: '', icon: 'BookOpen', color: 'bg-blue-100 text-blue-700', order_num: 0 });
                  }}
                  className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                >
                  Hủy bỏ
                </button>
              )}
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-end gap-2 mb-4">
                  <button onClick={() => handleEditFeature(item)} className="text-blue-500 hover:text-blue-700">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteFeature(item.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'admissions_page' && (
        <form onSubmit={handleSaveAdmissionsPage} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cấu hình Trang Tuyển sinh</h2>
              <p className="text-sm text-slate-500">Chỉnh sửa tiêu đề banner và mô tả trang tuyển sinh</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề Banner</label>
              <input 
                type="text" 
                value={admissionsPageForm.banner_title}
                onChange={e => setAdmissionsPageForm({...admissionsPageForm, banner_title: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả Banner</label>
              <textarea 
                value={admissionsPageForm.banner_description}
                onChange={e => setAdmissionsPageForm({...admissionsPageForm, banner_description: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>
          </div>
          <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
            <Save className="w-5 h-5" /> Lưu cấu hình
          </button>
        </form>
      )}

      {activeTab === 'news_page' && (
        <form onSubmit={handleSaveNewsPage} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Bell className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cấu hình Trang Tin tức</h2>
              <p className="text-sm text-slate-500">Chỉnh sửa tiêu đề banner và mô tả trang tin tức</p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề Banner</label>
              <input 
                type="text" 
                value={newsPageForm.banner_title}
                onChange={e => setNewsPageForm({...newsPageForm, banner_title: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả Banner</label>
              <textarea 
                value={newsPageForm.banner_description}
                onChange={e => setNewsPageForm({...newsPageForm, banner_description: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>
          </div>
          <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
            <Save className="w-5 h-5" /> Lưu cấu hình
          </button>
        </form>
      )}

      {activeTab === 'contact' && (
        <form onSubmit={handleSaveContact} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Phone className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Thông tin liên hệ & Nhà trường</h2>
              <p className="text-sm text-slate-500">Cập nhật thông tin cơ bản, địa chỉ và slogan</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tên trường</label>
              <input 
                type="text" 
                value={contactForm.name}
                onChange={e => setContactForm({...contactForm, name: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Slogan</label>
              <input 
                type="text" 
                value={contactForm.slogan}
                onChange={e => setContactForm({...contactForm, slogan: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại</label>
              <input 
                type="text" 
                value={contactForm.phone}
                onChange={e => setContactForm({...contactForm, phone: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input 
                type="email" 
                value={contactForm.email}
                onChange={e => setContactForm({...contactForm, email: e.target.value})}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Địa chỉ</label>
            <input 
              type="text" 
              value={contactForm.address}
              onChange={e => setContactForm({...contactForm, address: e.target.value})}
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
            <Save className="w-5 h-5" /> Lưu cấu hình
          </button>
        </form>
      )}
    </div>
  );
};
