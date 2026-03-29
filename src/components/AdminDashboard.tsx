/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
  ArrowLeft,
  Award,
  Calendar,
  Globe,
  FileText,
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  PenTool,
  History,
  Map,
  Languages,
  Scale,
  Dumbbell,
  Monitor
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type TabType = 'news' | 'admissions' | 'home' | 'about' | 'contact' | 'admissions_page' | 'news_page' | 'features' | 'departments' | 'youth_union' | 'achievements' | 'schedule' | 'gallery';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('news');
  const [news, setNews] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [youthUnion, setYouthUnion] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [deptPersonnel, setDeptPersonnel] = useState<any[]>([]);
  const [deptActivities, setDeptActivities] = useState<any[]>([]);
  const [deptDocuments, setDeptDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editingAdmissionId, setEditingAdmissionId] = useState<string | null>(null);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editingYouthUnionId, setEditingYouthUnionId] = useState<string | null>(null);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [editingPersonnelId, setEditingPersonnelId] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);

  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [isManagingDeptContent, setIsManagingDeptContent] = useState(false);
  const [deptActiveTab, setDeptActiveTab] = useState<'personnel' | 'activities' | 'documents'>('personnel');

  // Modal state
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    type: 'alert' | 'confirm';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'alert'
  });

  const showAlert = (title: string, message: string) => {
    setModal({ show: true, title, message, type: 'alert' });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModal({ show: true, title, message, onConfirm, type: 'confirm' });
  };

  // Form states
  const [newsForm, setNewsForm] = useState({ title: '', summary: '', content: '', category: 'Tin tức', imageUrl: '', documentUrl: '', detailUrl: '' });
  const [admissionForm, setAdmissionForm] = useState({ title: '', summary: '', content: '', deadline: '', year: 2026, documentUrl: '', detailUrl: '' });
  const [featureForm, setFeatureForm] = useState({ title: '', description: '', icon: 'BookOpen', color: 'bg-blue-100 text-blue-700', order: 0, detailUrl: '' });
  const [deptForm, setDeptForm] = useState({ name: '', icon: 'BookOpen', description: '', detailUrl: '' });
  const [youthUnionForm, setYouthUnionForm] = useState({ title: '', summary: '', content: '', date: '', imageUrl: '', detailUrl: '' });
  const [achievementForm, setAchievementForm] = useState({ title: '', studentName: '', class: '', year: '2025-2026', award: '', imageUrl: '', type: 'academic', description: '', detailUrl: '' });
  const [scheduleForm, setScheduleForm] = useState({ title: '', week: '', dateRange: '', content: '', fileUrl: '', startDate: '', endDate: '', detailUrl: '' });
  const [galleryForm, setGalleryForm] = useState({ title: '', imageUrl: '', category: 'Hoạt động trường', description: '', detailUrl: '' });
  const [personnelForm, setPersonnelForm] = useState({ name: '', position: '', bio: '', imageUrl: '' });
  const [activityForm, setActivityForm] = useState({ title: '', date: '', summary: '', description: '', imageUrl: '', documentUrl: '', content: '', detailUrl: '' });
  const [documentForm, setDocumentForm] = useState({ title: '', description: '', fileUrl: '', category: 'Giáo án' });
  
  const [homeForm, setHomeForm] = useState({ 
    bannerTitle: 'Môi trường giáo dục hiện đại & thân thiện', 
    bannerDescription: 'Với đội ngũ giáo viên tâm huyết và cơ sở vật chất khang trang, chúng tôi cam kết mang lại chất lượng giáo dục tốt nhất cho học sinh.',
    bannerImage: 'https://picsum.photos/seed/school/1200/600',
    renderType: 'standard',
    htmlContent: ''
  });

  const [aboutForm, setAboutForm] = useState({
    mainText: '',
    history: '',
    coreValues: '',
    renderType: 'standard',
    htmlContent: ''
  });

  const [admissionsPageForm, setAdmissionsPageForm] = useState({
    renderType: 'standard',
    htmlContent: ''
  });

  const [newsPageForm, setNewsPageForm] = useState({
    renderType: 'standard',
    htmlContent: ''
  });

  const [contactForm, setContactForm] = useState({
    name: '',
    slogan: '',
    address: '',
    phone: '',
    email: '',
    renderType: 'standard',
    htmlContent: ''
  });

  const departments = [
    { id: 'toan', name: 'Tổ Toán', icon: 'Calculator' },
    { id: 'ly', name: 'Tổ Vật lý', icon: 'Zap' },
    { id: 'hoa', name: 'Tổ Hóa học', icon: 'FlaskConical' },
    { id: 'sinh', name: 'Tổ Sinh học', icon: 'Dna' },
    { id: 'van', name: 'Tổ Ngữ văn', icon: 'PenTool' },
    { id: 'su', name: 'Tổ Lịch sử', icon: 'History' },
    { id: 'dia', name: 'Tổ Địa lý', icon: 'Map' },
    { id: 'anh', name: 'Tổ Ngoại ngữ', icon: 'Languages' },
    { id: 'gdcd', name: 'Tổ GDCD', icon: 'Scale' },
    { id: 'tdqp', name: 'Tổ Thể dục - QP', icon: 'Dumbbell' },
    { id: 'tin', name: 'Tổ Tin học - CN', icon: 'Monitor' }
  ];

  useEffect(() => {
    let channel: any = null;
    setLoading(true);

    const fetchData = async () => {
      if (activeTab === 'news') {
        const { data } = await supabase.from('news').select('*').order('date', { ascending: false });
        if (data) setNews(data);
        channel = supabase.channel('news_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, fetchData).subscribe();
      } else if (activeTab === 'admissions') {
        const { data } = await supabase.from('admissions').select('*').order('year', { ascending: false });
        if (data) setAdmissions(data);
        channel = supabase.channel('adm_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'admissions' }, fetchData).subscribe();
      } else if (activeTab === 'home') {
        const { data } = await supabase.from('home_content').select('*').eq('id', 'main').maybeSingle();
        if (data) setHomeForm(data);
      } else if (activeTab === 'about') {
        const { data } = await supabase.from('about_content').select('*').eq('id', 'main').maybeSingle();
        if (data) setAboutForm(prev => ({ ...prev, ...data }));
      } else if (activeTab === 'contact') {
        const { data } = await supabase.from('school_info').select('*').eq('id', 'main').maybeSingle();
        if (data) setContactForm(data);
      } else if (activeTab === 'admissions_page') {
        const { data } = await supabase.from('admissions_content').select('*').eq('id', 'main').maybeSingle();
        if (data) setAdmissionsPageForm(data);
      } else if (activeTab === 'news_page') {
        const { data } = await supabase.from('news_content').select('*').eq('id', 'main').maybeSingle();
        if (data) setNewsPageForm(data);
      } else if (activeTab === 'departments') {
        const { data } = await supabase.from('departments').select('*');
        if (data) setDepartmentsList(data);
        channel = supabase.channel('depts_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, fetchData).subscribe();
      } else if (activeTab === 'youth_union') {
        const { data } = await supabase.from('youth_union').select('*').order('date', { ascending: false });
        if (data) setYouthUnion(data);
        channel = supabase.channel('yu_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'youth_union' }, fetchData).subscribe();
      } else if (activeTab === 'achievements') {
        const { data } = await supabase.from('achievements').select('*').order('year', { ascending: false });
        if (data) setAchievements(data);
        channel = supabase.channel('ach_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'achievements' }, fetchData).subscribe();
      } else if (activeTab === 'schedule') {
        const { data } = await supabase.from('schedules').select('*').order('start_date', { ascending: false });
        if (data) setSchedule(data);
        channel = supabase.channel('sch_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, fetchData).subscribe();
      } else if (activeTab === 'gallery') {
        const { data } = await supabase.from('gallery').select('*').order('title', { ascending: true });
        if (data) setGallery(data);
        channel = supabase.channel('gal_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, fetchData).subscribe();
      }
      setLoading(false);
    };

    fetchData();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeTab]);

  useEffect(() => {
    if (selectedDeptId && isManagingDeptContent) {
      setLoading(true);
      
      const fetchDeptData = async () => {
        const { data: personnel } = await supabase.from('personnel').select('*').eq('dept_id', selectedDeptId);
        if (personnel) setDeptPersonnel(personnel);
        const { data: activities } = await supabase.from('activities').select('*').eq('dept_id', selectedDeptId).order('date', { ascending: false });
        if (activities) setDeptActivities(activities);
        const { data: docs } = await supabase.from('dept_documents').select('*').eq('dept_id', selectedDeptId).order('created_at', { ascending: false });
        if (docs) setDeptDocuments(docs);
        setLoading(false);
      };

      fetchDeptData();

      const pChannel = supabase.channel('p_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'personnel', filter: `dept_id=eq.${selectedDeptId}` }, fetchDeptData).subscribe();
      const aChannel = supabase.channel('a_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'activities', filter: `dept_id=eq.${selectedDeptId}` }, fetchDeptData).subscribe();
      const dChannel = supabase.channel('d_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'dept_documents', filter: `dept_id=eq.${selectedDeptId}` }, fetchDeptData).subscribe();

      return () => {
        supabase.removeChannel(pChannel);
        supabase.removeChannel(aChannel);
        supabase.removeChannel(dChannel);
      };
    }
  }, [selectedDeptId, isManagingDeptContent]);

  const showSuccess = () => {
    setSaveStatus('Đã lưu thành công!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNewsId) {
        const { error } = await supabase.from('news').update({ ...newsForm, updated_at: new Date() }).eq('id', editingNewsId);
        if (error) throw error;
        setEditingNewsId(null);
      } else {
        const { error } = await supabase.from('news').insert([{ ...newsForm, date: new Date() }]);
        if (error) throw error;
      }
      setNewsForm({ title: '', summary: '', content: '', category: 'Tin tức', imageUrl: '', documentUrl: '', detailUrl: '' });
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi khi lưu tin tức: " + error.message);
    }
  };

  const handleEditNews = (item: any) => {
    setEditingNewsId(item.id);
    setNewsForm({
      title: item.title,
      summary: item.summary || '',
      content: item.content,
      category: item.category,
      imageUrl: item.imageUrl || '',
      documentUrl: item.documentUrl || '',
      detailUrl: item.detailUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteNews = async (id: string) => {
    showConfirm("Xác nhận xóa", "Bạn có chắc chắn muốn xóa tin này?", async () => {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
    });
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
      setAdmissionForm({ title: '', summary: '', content: '', deadline: '', year: 2026, documentUrl: '', detailUrl: '' });
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi khi lưu thông tin tuyển sinh: " + error.message);
    }
  };

  const handleEditAdmission = (item: any) => {
    setEditingAdmissionId(item.id);
    setAdmissionForm({
      title: item.title,
      summary: item.summary || '',
      content: item.content,
      deadline: item.deadline,
      year: item.year,
      documentUrl: item.documentUrl || '',
      detailUrl: item.detailUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAdmission = async (id: string) => {
    showConfirm("Xác nhận xóa", "Bạn có chắc chắn muốn xóa thông tin này?", async () => {
      const { error } = await supabase.from('admissions').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
    });
  };

  const handleSaveHome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('home_content').upsert({ id: 'main', ...homeForm, updated_at: new Date() });
      if (error) throw error;
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('about_content').upsert({ id: 'main', ...aboutForm, updated_at: new Date() });
      if (error) throw error;
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('school_info').upsert({ id: 'main', ...contactForm, updated_at: new Date() });
      if (error) throw error;
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleSaveAdmissionsPage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('admissions_content').upsert({ id: 'main', ...admissionsPageForm, updated_at: new Date() });
      if (error) throw error;
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleSaveNewsPage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('news_content').upsert({ id: 'main', ...newsPageForm, updated_at: new Date() });
      if (error) throw error;
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFeatureId) {
        const { error } = await supabase.from('features').update({ ...featureForm, updated_at: new Date() }).eq('id', editingFeatureId);
        if (error) throw error;
        setEditingFeatureId(null);
      } else {
        const { error } = await supabase.from('features').insert([{ ...featureForm }]);
        if (error) throw error;
      }
      setFeatureForm({ title: '', description: '', icon: 'BookOpen', color: 'bg-blue-100 text-blue-700', order: 0, detailUrl: '' });
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi khi lưu tính năng: " + error.message);
    }
  };

  const handleEditFeature = (item: any) => {
    setEditingFeatureId(item.id);
    setFeatureForm({
      title: item.title,
      description: item.description,
      icon: item.icon,
      color: item.color,
      order: item.order || 0,
      detailUrl: item.detailUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteFeature = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa thẻ này?", async () => {
      const { error } = await supabase.from('features').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
    });
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDeptId) {
        const { error } = await supabase.from('departments').update({ ...deptForm, updated_at: new Date() }).eq('id', editingDeptId);
        if (error) throw error;
        setEditingDeptId(null);
      } else {
        const { error } = await supabase.from('departments').insert([{ ...deptForm }]);
        if (error) throw error;
      }
      setDeptForm({ name: '', icon: 'BookOpen', description: '', detailUrl: '' });
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi khi lưu tổ chuyên môn: " + error.message);
    }
  };

  const handleDeleteDept = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa tổ này sẽ không xóa các dữ liệu con (nhân sự, hoạt động) nhưng tổ sẽ không hiển thị. Tiếp tục?", async () => {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
    });
  };

  const handleEditYouthUnion = (item: any) => {
    setEditingYouthUnionId(item.id);
    setYouthUnionForm({
      title: item.title,
      summary: item.summary || '',
      content: item.content,
      date: item.date || '',
      imageUrl: item.imageUrl || '',
      detailUrl: item.detailUrl || ''
    });
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
      setYouthUnionForm({ title: '', summary: '', content: '', date: '', imageUrl: '', detailUrl: '' });
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleDeleteYouthUnion = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa hoạt động này?", async () => {
      const { error } = await supabase.from('youth_union').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
    });
  };

  const handleEditAchievement = (item: any) => {
    setEditingAchievementId(item.id);
    setAchievementForm({
      title: item.title,
      studentName: item.studentName || '',
      class: item.class || '',
      year: item.year || '2025-2026',
      award: item.award || '',
      imageUrl: item.imageUrl || '',
      type: item.type || 'academic',
      description: item.description || '',
      detailUrl: item.detailUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setAchievementForm({ title: '', studentName: '', class: '', year: '2025-2026', award: '', imageUrl: '', type: 'academic', description: '', detailUrl: '' });
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa thành tích này?", async () => {
      const { error } = await supabase.from('achievements').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
    });
  };

  const handleEditSchedule = (item: any) => {
    setEditingScheduleId(item.id);
    setScheduleForm({
      title: item.title,
      week: item.week || '',
      dateRange: item.dateRange || '',
      content: item.content || '',
      fileUrl: item.fileUrl || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      detailUrl: item.detailUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setScheduleForm({ title: '', week: '', dateRange: '', content: '', fileUrl: '', startDate: '', endDate: '', detailUrl: '' });
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa lịch công tác này?", async () => {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
    });
  };

  const handleEditGallery = (item: any) => {
    setEditingGalleryId(item.id);
    setGalleryForm({
      title: item.title,
      imageUrl: item.imageUrl || '',
      category: item.category || 'Hoạt động trường',
      description: item.description || '',
      detailUrl: item.detailUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGalleryId) {
        const { error } = await supabase.from('gallery').update({ ...galleryForm, updated_at: new Date() }).eq('id', editingGalleryId);
        if (error) throw error;
        setEditingGalleryId(null);
      } else {
        const { error } = await supabase.from('gallery').insert([{ ...galleryForm }]);
        if (error) throw error;
      }
      setGalleryForm({ title: '', imageUrl: '', category: 'Hoạt động trường', description: '', detailUrl: '' });
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    showConfirm("Xác nhận xóa", "Xóa ảnh này?", async () => {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
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
      setPersonnelForm({ name: '', position: '', bio: '', imageUrl: '' });
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleDeletePersonnel = async (id: string) => {
    if (!selectedDeptId) return;
    showConfirm("Xác nhận xóa", "Xóa nhân sự này?", async () => {
      const { error } = await supabase.from('personnel').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
    });
  };

  const handleEditActivity = (item: any) => {
    setEditingActivityId(item.id);
    setActivityForm({
      title: item.title,
      date: item.date || '',
      summary: item.summary || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      documentUrl: item.document_url || '',
      content: item.content || '',
      detailUrl: item.detail_url || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId) return;
    try {
      const payload = {
        title: activityForm.title,
        date: activityForm.date,
        summary: activityForm.summary,
        description: activityForm.description,
        imageUrl: activityForm.imageUrl,
        document_url: activityForm.documentUrl,
        content: activityForm.content,
        detail_url: activityForm.detailUrl,
        dept_id: selectedDeptId
      };
      if (editingActivityId) {
        const { error } = await supabase.from('activities').update({ ...payload, updated_at: new Date() }).eq('id', editingActivityId);
        if (error) throw error;
        setEditingActivityId(null);
      } else {
        const { error } = await supabase.from('activities').insert([payload]);
        if (error) throw error;
      }
      setActivityForm({ title: '', date: '', summary: '', description: '', imageUrl: '', documentUrl: '', content: '', detailUrl: '' });
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!selectedDeptId) return;
    showConfirm("Xác nhận xóa", "Xóa hoạt động này?", async () => {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
    });
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId) return;
    try {
      const payload = {
        title: documentForm.title,
        description: documentForm.description,
        file_url: documentForm.fileUrl,
        category: documentForm.category,
        dept_id: selectedDeptId
      };
      if (editingDocumentId) {
        const { error } = await supabase.from('dept_documents').update({ ...payload, updated_at: new Date() }).eq('id', editingDocumentId);
        if (error) throw error;
        setEditingDocumentId(null);
      } else {
        const { error } = await supabase.from('dept_documents').insert([payload]);
        if (error) throw error;
      }
      setDocumentForm({ title: '', description: '', fileUrl: '', category: 'Giáo án' });
      showSuccess();
    } catch (error: any) {
      showAlert("Lỗi", "Lỗi: " + error.message);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!selectedDeptId) return;
    showConfirm("Xác nhận xóa", "Xóa tài liệu này?", async () => {
      const { error } = await supabase.from('dept_documents').delete().eq('id', id);
      if (error) showAlert("Lỗi", "Lỗi khi xóa: " + error.message);
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <LayoutDashboard className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold uppercase tracking-tight">Quản trị</h1>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          <button 
            onClick={() => setActiveTab('news')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'news' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Bell className="w-5 h-5" /> Danh sách Tin tức
          </button>
          <button 
            onClick={() => setActiveTab('news_page')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'news_page' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Settings className="w-5 h-5" /> Trang Tin tức
          </button>
          <button 
            onClick={() => setActiveTab('admissions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admissions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <GraduationCap className="w-5 h-5" /> Danh sách Tuyển sinh
          </button>
          <button 
            onClick={() => setActiveTab('admissions_page')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admissions_page' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Settings className="w-5 h-5" /> Trang Tuyển sinh
          </button>
          <button 
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'home' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Home className="w-5 h-5" /> Trang chủ
          </button>
          <button 
            onClick={() => setActiveTab('features')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'features' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Plus className="w-5 h-5" /> Thẻ Tính năng
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'about' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Info className="w-5 h-5" /> Giới thiệu
          </button>
          <button 
            onClick={() => setActiveTab('contact')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'contact' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Phone className="w-5 h-5" /> Liên hệ & Cấu hình
          </button>
          <button 
            onClick={() => setActiveTab('departments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'departments' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <BookOpen className="w-5 h-5" /> Tổ chuyên môn
          </button>
          <button 
            onClick={() => setActiveTab('youth_union')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'youth_union' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users className="w-5 h-5" /> Hoạt động Đoàn
          </button>
          <button 
            onClick={() => setActiveTab('achievements')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'achievements' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Award className="w-5 h-5" /> Thành tích học tập
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'schedule' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Calendar className="w-5 h-5" /> Lịch công tác
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'gallery' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Globe className="w-5 h-5" /> Thư viện ảnh
          </button>
        </nav>

        <button 
          onClick={() => supabase.auth.signOut()}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Đăng xuất
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800">
              {activeTab === 'news' && 'Quản lý Danh sách Tin tức'}
              {activeTab === 'news_page' && 'Cấu hình Trang Tin tức'}
              {activeTab === 'admissions' && 'Quản lý Danh sách Tuyển sinh'}
              {activeTab === 'admissions_page' && 'Cấu hình Trang Tuyển sinh'}
              {activeTab === 'home' && 'Hiệu chỉnh Trang chủ'}
              {activeTab === 'features' && 'Quản lý Thẻ Tính năng'}
              {activeTab === 'about' && 'Hiệu chỉnh Trang giới thiệu'}
              {activeTab === 'contact' && 'Cấu hình thông tin trường'}
              {activeTab === 'departments' && 'Quản lý Tổ chuyên môn'}
            </h2>
            {saveStatus && (
              <div className="flex items-center gap-2 text-green-600 font-bold animate-in slide-in-from-top-4">
                <Check className="w-5 h-5" /> {saveStatus}
              </div>
            )}
          </div>

          {activeTab === 'news' && (
            <div className="space-y-8">
              <form onSubmit={handleAddNews} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  {editingNewsId ? <Edit className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                  {editingNewsId ? 'Hiệu chỉnh tin tức' : 'Thêm tin mới'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input 
                    type="text" 
                    placeholder="Tiêu đề tin tức" 
                    value={newsForm.title}
                    onChange={e => setNewsForm({...newsForm, title: e.target.value})}
                    className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <select 
                    value={newsForm.category}
                    onChange={e => setNewsForm({...newsForm, category: e.target.value})}
                    className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Tin tức</option>
                    <option>Thông báo</option>
                    <option>Sự kiện</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Tóm tắt ngắn (hiển thị ở danh sách)" 
                    value={newsForm.summary}
                    onChange={e => setNewsForm({...newsForm, summary: e.target.value})}
                    className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                  />
                  <input 
                    type="url" 
                    placeholder="Link hình ảnh minh họa (tùy chọn)" 
                    value={newsForm.imageUrl}
                    onChange={e => setNewsForm({...newsForm, imageUrl: e.target.value})}
                    className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    type="url" 
                    placeholder="Link tài liệu đính kèm (tùy chọn)" 
                    value={newsForm.documentUrl}
                    onChange={e => setNewsForm({...newsForm, documentUrl: e.target.value})}
                    className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    type="url" 
                    placeholder="Link chi tiết bên ngoài (Google Doc, Sheet, HTML...)" 
                    value={newsForm.detailUrl}
                    onChange={e => setNewsForm({...newsForm, detailUrl: e.target.value})}
                    className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                  />
                </div>
                <textarea 
                  placeholder="Nội dung chi tiết" 
                  value={newsForm.content}
                  onChange={e => setNewsForm({...newsForm, content: e.target.value})}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-32 mb-4"
                  required
                />
                <div className="flex gap-3">
                  <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    {editingNewsId ? 'Cập nhật' : 'Đăng tin'}
                  </button>
                  {editingNewsId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingNewsId(null);
                        setNewsForm({ title: '', summary: '', content: '', category: 'Tin tức', imageUrl: '', documentUrl: '', detailUrl: '' });
                      }}
                      className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                  )}
                </div>
              </form>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-bold text-slate-600">Tiêu đề</th>
                      <th className="p-4 font-bold text-slate-600">Loại</th>
                      <th className="p-4 font-bold text-slate-600">Ngày đăng</th>
                      <th className="p-4 font-bold text-slate-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {news.map(item => (
                      <tr key={item.id} className="border-b border-slate-100 last:border-none">
                        <td className="p-4 text-sm font-medium">{item.title}</td>
                        <td className="p-4 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{item.category}</span>
                        </td>
                        <td className="p-4 text-sm text-slate-500">
                          {item.date?.toDate ? item.date.toDate().toLocaleDateString('vi-VN') : 'Đang xử lý...'}
                        </td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => handleEditNews(item)} className="text-blue-500 hover:text-blue-700 p-2">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteNews(item.id)} className="text-red-500 hover:text-red-700 p-2">
                            <Trash2 className="w-5 h-5" />
                          </button>
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
                  {editingAdmissionId ? 'Hiệu chỉnh thông tin tuyển sinh' : 'Thêm thông tin tuyển sinh'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input 
                    type="text" 
                    placeholder="Tiêu đề" 
                    value={admissionForm.title}
                    onChange={e => setAdmissionForm({...admissionForm, title: e.target.value})}
                    className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                    required
                  />
                  <input 
                    type="date" 
                    value={admissionForm.deadline}
                    onChange={e => setAdmissionForm({...admissionForm, deadline: e.target.value})}
                    className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Tóm tắt ngắn (hiển thị ở danh sách)" 
                    value={admissionForm.summary}
                    onChange={e => setAdmissionForm({...admissionForm, summary: e.target.value})}
                    className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 md:col-span-3"
                  />
                  <input 
                    type="url" 
                    placeholder="Link tài liệu đính kèm (tùy chọn)" 
                    value={admissionForm.documentUrl}
                    onChange={e => setAdmissionForm({...admissionForm, documentUrl: e.target.value})}
                    className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                  />
                  <input 
                    type="url" 
                    placeholder="Link chi tiết bên ngoài (Google Doc, Sheet, HTML...)" 
                    value={admissionForm.detailUrl}
                    onChange={e => setAdmissionForm({...admissionForm, detailUrl: e.target.value})}
                    className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <textarea 
                  placeholder="Nội dung tuyển sinh" 
                  value={admissionForm.content}
                  onChange={e => setAdmissionForm({...admissionForm, content: e.target.value})}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-32 mb-4"
                  required
                />
                <div className="flex gap-3">
                  <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    {editingAdmissionId ? 'Cập nhật' : 'Lưu thông tin'}
                  </button>
                  {editingAdmissionId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingAdmissionId(null);
                        setAdmissionForm({ title: '', summary: '', content: '', deadline: '', year: 2026, documentUrl: '', detailUrl: '' });
                      }}
                      className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                  )}
                </div>
              </form>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-bold text-slate-600">Tiêu đề</th>
                      <th className="p-4 font-bold text-slate-600">Năm học</th>
                      <th className="p-4 font-bold text-slate-600">Hạn chót</th>
                      <th className="p-4 font-bold text-slate-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admissions.map(item => (
                      <tr key={item.id} className="border-b border-slate-100 last:border-none">
                        <td className="p-4 text-sm font-medium">{item.title}</td>
                        <td className="p-4 text-sm">{item.year}</td>
                        <td className="p-4 text-sm text-slate-500">{item.deadline}</td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => handleEditAdmission(item)} className="text-blue-500 hover:text-blue-700 p-2">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteAdmission(item.id)} className="text-red-500 hover:text-red-700 p-2">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
                    value={featureForm.order}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      setFeatureForm({...featureForm, order: isNaN(val) ? 0 : val});
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
                        setFeatureForm({ title: '', description: '', icon: 'BookOpen', color: 'bg-blue-100 text-blue-700', order: 0, detailUrl: '' });
                      }}
                      className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                  )}
                </div>
              </form>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" /> Danh sách thẻ hiện tại
                </h3>
                {features.length === 0 && (
                  <button 
                    onClick={async () => {
                      const defaults = [
                        { title: 'Chương trình đào tạo', description: 'Đổi mới phương pháp dạy học, phát huy tính sáng tạo của học sinh.', icon: 'BookOpen', color: 'bg-blue-100 text-blue-700', order: 1 },
                        { title: 'Hoạt động ngoại khóa', description: 'Phát triển kỹ năng mềm qua các câu lạc bộ và sự kiện văn thể mỹ.', icon: 'Users', color: 'bg-green-100 text-green-700', order: 2 },
                        { title: 'Thành tích nổi bật', description: 'Tự hào với nhiều giải thưởng cấp quốc gia và quốc tế hàng năm.', icon: 'Award', color: 'bg-amber-100 text-amber-700', order: 3 }
                      ];
                      for (const f of defaults) {
                        await supabase.from('features').insert([f]);
                      }
                    }}
                    className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    Khôi phục 3 tính năng mặc định
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.length > 0 ? features.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group">
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
                    <div className="mt-4 text-xs font-mono text-slate-400">Icon: {item.icon}</div>
                  </div>
                )) : (
                  <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-400 italic">Chưa có tính năng nào được tạo. Hãy thêm mới hoặc khôi phục mặc định.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'home' && (
            <form onSubmit={handleSaveHome} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex gap-4 p-1 bg-slate-100 rounded-xl w-fit mb-6">
                <button 
                  type="button"
                  onClick={() => setHomeForm({...homeForm, renderType: 'standard'})}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${homeForm.renderType === 'standard' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  Giao diện chuẩn
                </button>
                <button 
                  type="button"
                  onClick={() => setHomeForm({...homeForm, renderType: 'html'})}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${homeForm.renderType === 'html' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  Nhúng HTML
                </button>
              </div>

              {homeForm.renderType === 'standard' ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề Banner</label>
                    <input 
                      type="text" 
                      value={homeForm.bannerTitle}
                      onChange={e => setHomeForm({...homeForm, bannerTitle: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả Banner</label>
                    <textarea 
                      value={homeForm.bannerDescription}
                      onChange={e => setHomeForm({...homeForm, bannerDescription: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">URL Hình ảnh Banner</label>
                    <input 
                      type="text" 
                      value={homeForm.bannerImage}
                      onChange={e => setHomeForm({...homeForm, bannerImage: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung HTML (Nhúng toàn bộ trang chủ)</label>
                  <textarea 
                    value={homeForm.htmlContent}
                    onChange={e => setHomeForm({...homeForm, htmlContent: e.target.value})}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-96 font-mono text-sm"
                    placeholder="<div class='custom-home'>...</div>"
                  />
                  <p className="text-xs text-slate-500 mt-2 italic">* Lưu ý: HTML này sẽ thay thế toàn bộ phần nội dung chính của trang chủ.</p>
                </div>
              )}
              
              <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                <Save className="w-5 h-5" /> Lưu thay đổi
              </button>
            </form>
          )}

          {activeTab === 'about' && (
            <form onSubmit={handleSaveAbout} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex gap-4 p-1 bg-slate-100 rounded-xl w-fit mb-6">
                <button 
                  type="button"
                  onClick={() => setAboutForm({...aboutForm, renderType: 'standard'})}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${aboutForm.renderType === 'standard' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  Giao diện chuẩn
                </button>
                <button 
                  type="button"
                  onClick={() => setAboutForm({...aboutForm, renderType: 'html'})}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${aboutForm.renderType === 'html' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  Nhúng HTML
                </button>
              </div>

              {aboutForm.renderType === 'standard' ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Văn bản giới thiệu chính</label>
                    <textarea 
                      value={aboutForm.mainText}
                      onChange={e => setAboutForm({...aboutForm, mainText: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Lịch sử hình thành</label>
                    <textarea 
                      value={aboutForm.history}
                      onChange={e => setAboutForm({...aboutForm, history: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Giá trị cốt lõi</label>
                    <textarea 
                      value={aboutForm.coreValues}
                      onChange={e => setAboutForm({...aboutForm, coreValues: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung HTML (Nhúng trang giới thiệu)</label>
                  <textarea 
                    value={aboutForm.htmlContent}
                    onChange={e => setAboutForm({...aboutForm, htmlContent: e.target.value})}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-96 font-mono text-sm"
                    placeholder="<section>...</section>"
                  />
                </div>
              )}
              
              <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                <Save className="w-5 h-5" /> Lưu thay đổi
              </button>
            </form>
          )}

          {activeTab === 'admissions_page' && (
            <form onSubmit={handleSaveAdmissionsPage} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex gap-4 p-1 bg-slate-100 rounded-xl w-fit mb-6">
                <button 
                  type="button"
                  onClick={() => setAdmissionsPageForm({...admissionsPageForm, renderType: 'standard'})}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${admissionsPageForm.renderType === 'standard' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  Giao diện chuẩn (Danh sách)
                </button>
                <button 
                  type="button"
                  onClick={() => setAdmissionsPageForm({...admissionsPageForm, renderType: 'html'})}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${admissionsPageForm.renderType === 'html' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  Nhúng HTML
                </button>
              </div>

              {admissionsPageForm.renderType === 'html' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung HTML (Nhúng trang tuyển sinh)</label>
                  <textarea 
                    value={admissionsPageForm.htmlContent}
                    onChange={e => setAdmissionsPageForm({...admissionsPageForm, htmlContent: e.target.value})}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-96 font-mono text-sm"
                    placeholder="<div class='admissions-page'>...</div>"
                  />
                </div>
              )}

              {admissionsPageForm.renderType === 'standard' && (
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-blue-800">
                  <p className="font-medium">Chế độ hiển thị chuẩn đang được kích hoạt. Hệ thống sẽ hiển thị danh sách các thông tin tuyển sinh từ tab "Danh sách Tuyển sinh".</p>
                </div>
              )}
              
              <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                <Save className="w-5 h-5" /> Lưu cấu hình
              </button>
            </form>
          )}

          {activeTab === 'news_page' && (
            <form onSubmit={handleSaveNewsPage} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex gap-4 p-1 bg-slate-100 rounded-xl w-fit mb-6">
                <button 
                  type="button"
                  onClick={() => setNewsPageForm({...newsPageForm, renderType: 'standard'})}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${newsPageForm.renderType === 'standard' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  Giao diện chuẩn (Danh sách)
                </button>
                <button 
                  type="button"
                  onClick={() => setNewsPageForm({...newsPageForm, renderType: 'html'})}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${newsPageForm.renderType === 'html' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  Nhúng HTML
                </button>
              </div>

              {newsPageForm.renderType === 'html' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung HTML (Nhúng trang tin tức)</label>
                  <textarea 
                    value={newsPageForm.htmlContent}
                    onChange={e => setNewsPageForm({...newsPageForm, htmlContent: e.target.value})}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-96 font-mono text-sm"
                    placeholder="<div class='news-page'>...</div>"
                  />
                </div>
              )}

              {newsPageForm.renderType === 'standard' && (
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-blue-800">
                  <p className="font-medium">Chế độ hiển thị chuẩn đang được kích hoạt. Hệ thống sẽ hiển thị danh sách các tin tức từ tab "Danh sách Tin tức".</p>
                </div>
              )}
              
              <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                <Save className="w-5 h-5" /> Lưu cấu hình
              </button>
            </form>
          )}

          {activeTab === 'contact' && (
            <form onSubmit={handleSaveContact} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex gap-4 p-1 bg-slate-100 rounded-xl w-fit mb-6">
                <button 
                  type="button"
                  onClick={() => setContactForm({...contactForm, renderType: 'standard'})}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${contactForm.renderType === 'standard' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  Giao diện chuẩn
                </button>
                <button 
                  type="button"
                  onClick={() => setContactForm({...contactForm, renderType: 'html'})}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${contactForm.renderType === 'html' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                  Nhúng HTML
                </button>
              </div>

              {contactForm.renderType === 'standard' ? (
                <>
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
                </>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung HTML (Nhúng trang liên hệ)</label>
                  <textarea 
                    value={contactForm.htmlContent}
                    onChange={e => setContactForm({...contactForm, htmlContent: e.target.value})}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-96 font-mono text-sm"
                    placeholder="<div class='contact-page'>...</div>"
                  />
                </div>
              )}
              
              <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                <Save className="w-5 h-5" /> Lưu cấu hình
              </button>
            </form>
          )}

          {activeTab === 'departments' && (
            <div className="space-y-8">
              {!isManagingDeptContent ? (
                <div className="space-y-8">
                  <form onSubmit={handleSaveDept} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      {editingDeptId ? <Edit className="w-5 h-5 text-amber-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                      {editingDeptId ? 'Hiệu chỉnh tổ chuyên môn' : 'Thêm tổ chuyên môn mới'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input 
                        type="text" 
                        placeholder="Tên tổ (ví dụ: Tổ Toán)" 
                        value={deptForm.name}
                        onChange={e => setDeptForm({...deptForm, name: e.target.value})}
                        className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Icon (ví dụ: Calculator, Zap, FlaskConical)" 
                        value={deptForm.icon}
                        onChange={e => setDeptForm({...deptForm, icon: e.target.value})}
                        className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input 
                        type="url" 
                        placeholder="Link chi tiết bên ngoài (tùy chọn)" 
                        value={deptForm.detailUrl}
                        onChange={e => setDeptForm({...deptForm, detailUrl: e.target.value})}
                        className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                      />
                    </div>
                    <textarea 
                      placeholder="Mô tả ngắn về tổ" 
                      value={deptForm.description}
                      onChange={e => setDeptForm({...deptForm, description: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24 mb-4"
                      required
                    />
                    <div className="flex gap-3">
                      <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                        {editingDeptId ? 'Cập nhật' : 'Thêm tổ'}
                      </button>
                      {editingDeptId && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingDeptId(null);
                            setDeptForm({ name: '', icon: 'BookOpen', description: '', detailUrl: '' });
                          }}
                          className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departmentsList.map(dept => (
                      <div 
                        key={dept.id}
                        className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg text-slate-800 group-hover:text-blue-600">{dept.name}</h4>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => {
                                setEditingDeptId(dept.id);
                                setDeptForm({ 
                                  name: dept.name, 
                                  icon: dept.icon, 
                                  description: dept.description,
                                  detailUrl: dept.detailUrl || ''
                                });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteDept(dept.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{dept.description}</p>
                        <button 
                          onClick={() => {
                            setSelectedDeptId(dept.id);
                            setIsManagingDeptContent(true);
                          }}
                          className="mt-4 flex items-center gap-1 text-blue-600 text-xs font-bold hover:underline"
                        >
                          Quản lý nhân sự & hoạt động <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  <button 
                    onClick={() => setIsManagingDeptContent(false)}
                    className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800"
                  >
                    <ArrowLeft className="w-5 h-5" /> Quay lại danh sách tổ
                  </button>

                  <div className="bg-blue-900 text-white p-8 rounded-3xl shadow-lg">
                    <h3 className="text-2xl font-bold uppercase tracking-wider">
                      {departmentsList.find(d => d.id === selectedDeptId)?.name}
                    </h3>
                    <p className="text-blue-200 mt-2">Cập nhật thông tin nhân sự, hoạt động và tài liệu của tổ.</p>
                  </div>

                  {/* Tabs for Department Content */}
                  <div className="flex gap-4 p-1 bg-slate-100 rounded-xl w-fit mb-6">
                    <button 
                      onClick={() => setDeptActiveTab('personnel')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${deptActiveTab === 'personnel' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                    >
                      Nhân sự
                    </button>
                    <button 
                      onClick={() => setDeptActiveTab('activities')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${deptActiveTab === 'activities' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                    >
                      Hoạt động
                    </button>
                    <button 
                      onClick={() => setDeptActiveTab('documents')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${deptActiveTab === 'documents' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                    >
                      Tài liệu
                    </button>
                  </div>

                  {deptActiveTab === 'personnel' && (
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" /> Quản lý Nhân sự
                      </h4>
                      <form onSubmit={handleAddPersonnel} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input 
                            type="text" 
                            placeholder="Họ và tên giáo viên" 
                            value={personnelForm.name}
                            onChange={e => setPersonnelForm({...personnelForm, name: e.target.value})}
                            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                          <input 
                            type="text" 
                            placeholder="Chức vụ (ví dụ: Tổ trưởng, Giáo viên)" 
                            value={personnelForm.position}
                            onChange={e => setPersonnelForm({...personnelForm, position: e.target.value})}
                            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                          <input 
                            type="url" 
                            placeholder="Link ảnh chân dung (tùy chọn)" 
                            value={personnelForm.imageUrl}
                            onChange={e => setPersonnelForm({...personnelForm, imageUrl: e.target.value})}
                            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                          />
                        </div>
                        <textarea 
                          placeholder="Giới thiệu ngắn gọn" 
                          value={personnelForm.bio}
                          onChange={e => setPersonnelForm({...personnelForm, bio: e.target.value})}
                          className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24 mb-4"
                        />
                        <div className="flex gap-3">
                          <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                            {editingPersonnelId ? 'Cập nhật' : 'Thêm nhân sự'}
                          </button>
                          {editingPersonnelId && (
                            <button 
                              type="button" 
                              onClick={() => {
                                setEditingPersonnelId(null);
                                setPersonnelForm({ name: '', position: '', bio: '', imageUrl: '' });
                              }}
                              className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      </form>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {deptPersonnel.map(p => (
                          <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                              <img src={p.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-slate-800 truncate">{p.name}</h5>
                              <p className="text-xs text-slate-500">{p.position}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setEditingPersonnelId(p.id);
                                  setPersonnelForm({ name: p.name, position: p.position, bio: p.bio || '', imageUrl: p.imageUrl || '' });
                                }}
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeletePersonnel(p.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {deptActiveTab === 'activities' && (
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-600" /> Hoạt động chuyên môn
                      </h4>
                      <form onSubmit={handleAddActivity} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input 
                            type="text" 
                            placeholder="Tiêu đề hoạt động" 
                            value={activityForm.title}
                            onChange={e => setActivityForm({...activityForm, title: e.target.value})}
                            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                          <input 
                            type="datetime-local" 
                            value={activityForm.date}
                            onChange={e => setActivityForm({...activityForm, date: e.target.value})}
                            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4 mb-4">
                          <input 
                            type="text" 
                            placeholder="Tóm tắt ngắn (hiển thị ở danh sách)" 
                            value={activityForm.summary}
                            onChange={e => setActivityForm({...activityForm, summary: e.target.value})}
                            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <textarea 
                            placeholder="Nội dung chi tiết (Markdown)" 
                            value={activityForm.content}
                            onChange={e => setActivityForm({...activityForm, content: e.target.value})}
                            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-48"
                            required
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input 
                              type="url" 
                              placeholder="Link ảnh (tùy chọn)" 
                              value={activityForm.imageUrl}
                              onChange={e => setActivityForm({...activityForm, imageUrl: e.target.value})}
                              className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input 
                              type="url" 
                              placeholder="Link tài liệu đính kèm (tùy chọn)" 
                              value={activityForm.documentUrl}
                              onChange={e => setActivityForm({...activityForm, documentUrl: e.target.value})}
                              className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <input 
                            type="url" 
                            placeholder="Link chi tiết bên ngoài (tùy chọn)" 
                            value={activityForm.detailUrl}
                            onChange={e => setActivityForm({...activityForm, detailUrl: e.target.value})}
                            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                            {editingActivityId ? 'Cập nhật' : 'Thêm hoạt động'}
                          </button>
                          {editingActivityId && (
                            <button 
                              type="button" 
                              onClick={() => {
                                setEditingActivityId(null);
                                setActivityForm({ title: '', date: '', summary: '', description: '', imageUrl: '', documentUrl: '', content: '', detailUrl: '' });
                              }}
                              className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      </form>

                      <div className="space-y-4">
                        {deptActivities.map(a => (
                          <div key={a.id} className="bg-white p-6 rounded-2xl border border-slate-200 group">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-bold text-lg text-slate-800">{a.title}</h5>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  {a.date ? new Date(a.date).toLocaleString('vi-VN') : 'Chưa có ngày'}
                                </div>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => {
                                    setEditingActivityId(a.id);
                                    setActivityForm({ 
                                      title: a.title, 
                                      content: a.content || '', 
                                      date: a.date || '', 
                                      summary: a.summary || '',
                                      description: a.description || '', 
                                      imageUrl: a.imageUrl || '', 
                                      documentUrl: a.documentUrl || '',
                                      detailUrl: a.detailUrl || ''
                                    });
                                  }}
                                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDeleteActivity(a.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                            <div className="text-sm text-slate-500 line-clamp-3 prose prose-slate max-w-none">
                              <ReactMarkdown>{a.content}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {deptActiveTab === 'documents' && (
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-blue-600" /> Tài liệu chuyên môn
                      </h4>
                      <form onSubmit={handleAddDocument} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input 
                            type="text" 
                            placeholder="Tên tài liệu" 
                            value={documentForm.title}
                            onChange={e => setDocumentForm({...documentForm, title: e.target.value})}
                            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                          <input 
                            type="url" 
                            placeholder="Link tải tài liệu (Google Drive, Dropbox...)" 
                            value={documentForm.fileUrl}
                            onChange={e => setDocumentForm({...documentForm, fileUrl: e.target.value})}
                            className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="flex gap-3">
                          <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                            {editingDocumentId ? 'Cập nhật' : 'Thêm tài liệu'}
                          </button>
                          {editingDocumentId && (
                            <button 
                              type="button" 
                              onClick={() => {
                                setEditingDocumentId(null);
                                setDocumentForm({ title: '', description: '', fileUrl: '', category: 'Giáo án' });
                              }}
                              className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                            >
                              Hủy
                            </button>
                          )}
                        </div>
                      </form>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {deptDocuments.map(d => (
                          <div key={d.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <FileText className="w-8 h-8 text-blue-500" />
                              <div>
                                <h5 className="font-bold text-slate-800">{d.title}</h5>
                                <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Xem tài liệu</a>
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => {
                                  setEditingDocumentId(d.id);
                                  setDocumentForm({ title: d.title, fileUrl: d.fileUrl, description: d.description || '', category: d.category || 'Giáo án' });
                                }}
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteDocument(d.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'youth_union' && (
            <div className="space-y-8">
              <form onSubmit={handleSaveYouthUnion} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {editingYouthUnionId ? <Edit className="w-6 h-6 text-amber-600" /> : <Plus className="w-6 h-6 text-blue-600" />}
                  {editingYouthUnionId ? 'Hiệu chỉnh hoạt động Đoàn' : 'Thêm hoạt động Đoàn mới'}
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề</label>
                    <input 
                      type="text" 
                      value={youthUnionForm.title}
                      onChange={e => setYouthUnionForm({...youthUnionForm, title: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tóm tắt ngắn (hiển thị ở danh sách)</label>
                    <input 
                      type="text" 
                      value={youthUnionForm.summary}
                      onChange={e => setYouthUnionForm({...youthUnionForm, summary: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung (Markdown)</label>
                    <textarea 
                      value={youthUnionForm.content}
                      onChange={e => setYouthUnionForm({...youthUnionForm, content: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-64"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Ngày diễn ra</label>
                    <input 
                      type="datetime-local" 
                      value={youthUnionForm.date}
                      onChange={e => setYouthUnionForm({...youthUnionForm, date: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Link ảnh (tùy chọn)</label>
                    <input 
                      type="url" 
                      value={youthUnionForm.imageUrl}
                      onChange={e => setYouthUnionForm({...youthUnionForm, imageUrl: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Link chi tiết bên ngoài (Google Doc, Sheet, HTML...)</label>
                    <input 
                      type="url" 
                      value={youthUnionForm.detailUrl}
                      onChange={e => setYouthUnionForm({...youthUnionForm, detailUrl: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Save className="w-5 h-5" /> {editingYouthUnionId ? 'Cập nhật' : 'Lưu hoạt động'}
                  </button>
                  {editingYouthUnionId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingYouthUnionId(null);
                        setYouthUnionForm({ title: '', summary: '', content: '', date: '', imageUrl: '', detailUrl: '' });
                      }}
                      className="px-8 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>

              <div className="grid grid-cols-1 gap-4">
                {youthUnion.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      {item.imageUrl && <img src={item.imageUrl} className="w-16 h-16 rounded-lg object-cover" />}
                      <div>
                        <h4 className="font-bold text-slate-800">{item.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <Calendar className="w-3 h-3" />
                          {item.date && !isNaN(new Date(item.date).getTime()) ? new Date(item.date).toLocaleString('vi-VN') : 'Chưa có ngày'}
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1 mt-1">{item.content}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingYouthUnionId(item.id);
                          setYouthUnionForm({ title: item.title, summary: item.summary || '', content: item.content, date: item.date || '', imageUrl: item.imageUrl || '', detailUrl: item.detailUrl || '' });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteYouthUnion(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-8">
              <form onSubmit={handleSaveAchievement} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {editingAchievementId ? <Edit className="w-6 h-6 text-amber-600" /> : <Plus className="w-6 h-6 text-blue-600" />}
                  {editingAchievementId ? 'Hiệu chỉnh thành tích' : 'Thêm thành tích mới'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề thành tích</label>
                    <input 
                      type="text" 
                      value={achievementForm.title}
                      onChange={e => setAchievementForm({...achievementForm, title: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Năm học</label>
                    <input 
                      type="text" 
                      value={achievementForm.year}
                      onChange={e => setAchievementForm({...achievementForm, year: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Loại thành tích</label>
                    <select 
                      value={achievementForm.type}
                      onChange={e => setAchievementForm({...achievementForm, type: e.target.value as any})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="academic">Học thuật</option>
                      <option value="sport">Thể thao</option>
                      <option value="art">Nghệ thuật</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả chi tiết</label>
                    <textarea 
                      value={achievementForm.description}
                      onChange={e => setAchievementForm({...achievementForm, description: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-32"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Link chi tiết bên ngoài (tùy chọn)</label>
                    <input 
                      type="url" 
                      value={achievementForm.detailUrl}
                      onChange={e => setAchievementForm({...achievementForm, detailUrl: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Save className="w-5 h-5" /> {editingAchievementId ? 'Cập nhật' : 'Lưu thành tích'}
                  </button>
                  {editingAchievementId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingAchievementId(null);
                        setAchievementForm({ title: '', studentName: '', class: '', year: '2025-2026', award: '', imageUrl: '', type: 'academic', description: '', detailUrl: '' });
                      }}
                      className="px-8 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>

              <div className="grid grid-cols-1 gap-4">
                {achievements.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center group">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.type === 'academic' ? 'bg-blue-100 text-blue-600' :
                          item.type === 'sport' ? 'bg-green-100 text-green-600' :
                          item.type === 'art' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-xs font-bold text-slate-400">{item.year}</span>
                      </div>
                      <h4 className="font-bold text-slate-800">{item.title}</h4>
                      <p className="text-sm text-slate-500 line-clamp-1">{item.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingAchievementId(item.id);
                          setAchievementForm({ title: item.title, description: item.description, year: item.year, type: item.type, studentName: item.studentName || '', class: item.class || '', award: item.award || '', imageUrl: item.imageUrl || '', detailUrl: item.detailUrl || '' });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteAchievement(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-8">
              <form onSubmit={handleSaveSchedule} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {editingScheduleId ? <Edit className="w-6 h-6 text-amber-600" /> : <Plus className="w-6 h-6 text-blue-600" />}
                  {editingScheduleId ? 'Hiệu chỉnh lịch công tác' : 'Thêm lịch công tác mới'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề lịch (ví dụ: Lịch tuần 25)</label>
                    <input 
                      type="text" 
                      value={scheduleForm.title}
                      onChange={e => setScheduleForm({...scheduleForm, title: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Ngày bắt đầu</label>
                    <input 
                      type="date" 
                      value={scheduleForm.startDate}
                      onChange={e => setScheduleForm({...scheduleForm, startDate: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Ngày kết thúc</label>
                    <input 
                      type="date" 
                      value={scheduleForm.endDate}
                      onChange={e => setScheduleForm({...scheduleForm, endDate: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung lịch (Markdown/HTML)</label>
                    <textarea 
                      value={scheduleForm.content}
                      onChange={e => setScheduleForm({...scheduleForm, content: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-64 font-mono text-sm"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Link chi tiết bên ngoài (tùy chọn)</label>
                    <input 
                      type="url" 
                      value={scheduleForm.detailUrl}
                      onChange={e => setScheduleForm({...scheduleForm, detailUrl: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Save className="w-5 h-5" /> {editingScheduleId ? 'Cập nhật' : 'Lưu lịch'}
                  </button>
                  {editingScheduleId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingScheduleId(null);
                        setScheduleForm({ title: '', week: '', dateRange: '', content: '', fileUrl: '', startDate: '', endDate: '', detailUrl: '' });
                      }}
                      className="px-8 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>

              <div className="grid grid-cols-1 gap-4">
                {schedule.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center group">
                    <div>
                      <h4 className="font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                        {item.startDate} — {item.endDate}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingScheduleId(item.id);
                          setScheduleForm({ title: item.title, content: item.content, startDate: item.startDate, endDate: item.endDate, week: item.week || '', dateRange: item.dateRange || '', fileUrl: item.fileUrl || '', detailUrl: item.detailUrl || '' });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteSchedule(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-8">
              <form onSubmit={handleSaveGallery} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  {editingGalleryId ? <Edit className="w-6 h-6 text-amber-600" /> : <Plus className="w-6 h-6 text-blue-600" />}
                  {editingGalleryId ? 'Hiệu chỉnh ảnh' : 'Thêm ảnh mới'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tiêu đề ảnh/Sự kiện</label>
                    <input 
                      type="text" 
                      value={galleryForm.title}
                      onChange={e => setGalleryForm({...galleryForm, title: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Link ảnh (URL)</label>
                    <input 
                      type="url" 
                      value={galleryForm.imageUrl}
                      onChange={e => setGalleryForm({...galleryForm, imageUrl: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Danh mục</label>
                    <input 
                      type="text" 
                      value={galleryForm.category}
                      onChange={e => setGalleryForm({...galleryForm, category: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Hoạt động, Cơ sở vật chất..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả (tùy chọn)</label>
                    <input 
                      type="text" 
                      value={galleryForm.description}
                      onChange={e => setGalleryForm({...galleryForm, description: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Link chi tiết bên ngoài (tùy chọn)</label>
                    <input 
                      type="url" 
                      value={galleryForm.detailUrl}
                      onChange={e => setGalleryForm({...galleryForm, detailUrl: e.target.value})}
                      className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                    <Save className="w-5 h-5" /> {editingGalleryId ? 'Cập nhật' : 'Lưu ảnh'}
                  </button>
                  {editingGalleryId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingGalleryId(null);
                        setGalleryForm({ title: '', imageUrl: '', description: '', category: 'Hoạt động trường', detailUrl: '' });
                      }}
                      className="px-8 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group relative aspect-square">
                    <img src={item.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                      <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                      <p className="text-white/70 text-[10px] mb-4">{item.category}</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingGalleryId(item.id);
                            setGalleryForm({ title: item.title, imageUrl: item.imageUrl, description: item.description || '', category: item.category || '', detailUrl: item.detailUrl || '' });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteGallery(item.id)} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Custom Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h3 className="text-2xl font-black text-slate-900 mb-4">{modal.title}</h3>
              <p className="text-slate-600 leading-relaxed">{modal.message}</p>
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
    </div>
  );
}
