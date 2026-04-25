/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Calendar, 
  Phone, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft,
  Award, 
  Globe, 
  Maximize2,
  Layers,
  Bell,
  Search,
  MapPin,
  Home,
  LogIn,
  LogOut,
  LayoutDashboard,
  Loader2,
  ExternalLink,
  Lock,
  X,
  AlertCircle
} from 'lucide-react';
import { supabase } from './lib/supabase';
import AdminDashboard from './components/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import 'katex/dist/katex.min.css';

export default function App() {
  const [activeMenu, setActiveMenu] = useState('Trang chủ');
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [news, setNews] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [homeContent, setHomeContent] = useState<any>(null);
  const [aboutContent, setAboutContent] = useState<any>(null);
  const [admissionsContent, setAdmissionsContent] = useState<any>(null);
  const [newsContent, setNewsContent] = useState<any>(null);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [selectedYouthUnion, setSelectedYouthUnion] = useState<any>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [selectedDeptActivity, setSelectedDeptActivity] = useState<any>(null);
  const [deptPersonnel, setDeptPersonnel] = useState<any[]>([]);
  const [deptActivities, setDeptActivities] = useState<any[]>([]);
  const [deptDocuments, setDeptDocuments] = useState<any[]>([]);
  const [activeDeptTab, setActiveDeptTab] = useState<'personnel' | 'activities' | 'documents' | 'introduction'>('introduction');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveTypeFilter, setArchiveTypeFilter] = useState('Tất cả');

  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [youthUnion, setYouthUnion] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [archiveDocuments, setArchiveDocuments] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);

  const MarkdownContent = ({ content }: { content: string }) => {
    if (!content) return null;

    // Split content into parts based on alignment markers :::center ... :::
    const parts = content.split(/(:::(?:center|right|left)[\s\S]*?:::)/g);

    const sharedComponents = {
      img: ({ node, ...props }: any) => (
        <img 
          {...props} 
          className="max-w-full h-auto rounded-2xl shadow-md my-6 mx-auto block border border-slate-100" 
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ),
      a: ({ node, ...props }: any) => (
        <a 
          {...props} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-4 font-bold"
        />
      ),
      p: ({ node, ...props }: any) => (
        <p className="mb-4 whitespace-pre-wrap" {...props} />
      )
    };

    const sharedPlugins = {
      remarkPlugins: [remarkMath, remarkGfm, remarkBreaks],
      rehypePlugins: [rehypeKatex, rehypeRaw]
    };

    return (
      <div className="markdown-body prose prose-slate prose-lg max-w-none prose-p:leading-relaxed prose-li:my-1 prose-headings:text-blue-900 prose-strong:text-slate-900 prose-strong:font-black">
        {parts.map((part, index) => {
          if (part.startsWith(':::center')) {
            const inner = part.replace(/^:::center\n?/, '').replace(/\n?:::$/, '').trim();
            return (
              <div key={index} className="flex flex-col items-center text-center w-full my-6">
                <ReactMarkdown {...sharedPlugins} components={sharedComponents}>
                  {inner}
                </ReactMarkdown>
              </div>
            );
          }
          if (part.startsWith(':::right')) {
            const inner = part.replace(/^:::right\n?/, '').replace(/\n?:::$/, '').trim();
            return (
              <div key={index} className="flex flex-col items-end text-right w-full my-6">
                <ReactMarkdown {...sharedPlugins} components={sharedComponents}>
                  {inner}
                </ReactMarkdown>
              </div>
            );
          }
          if (part.startsWith(':::left')) {
            const inner = part.replace(/^:::left\n?/, '').replace(/\n?:::$/, '').trim();
            return (
              <div key={index} className="flex flex-col items-start text-left w-full my-6">
                <ReactMarkdown {...sharedPlugins} components={sharedComponents}>
                  {inner}
                </ReactMarkdown>
              </div>
            );
          }
          if (!part.trim()) return null;
          return (
            <ReactMarkdown key={index} {...sharedPlugins} components={sharedComponents}>
              {part}
            </ReactMarkdown>
          );
        })}
      </div>
    );
  };

  const adminEmail = "trieuhaminh@gmail.com";

  useEffect(() => {
    const checkAdmin = (sessionUser: any) => {
      const isEmailAdmin = sessionUser?.email === adminEmail;
      const isPasswordAdmin = localStorage.getItem('admin_authenticated') === 'true';
      setIsAdmin(isEmailAdmin || isPasswordAdmin);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      checkAdmin(session?.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      checkAdmin(session?.user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // News
    const fetchNews = async () => {
      const { data } = await supabase.from('news').select('*').order('date', { ascending: false }).limit(10);
      if (data) setNews(data);
    };
    fetchNews();
    const newsChannel = supabase.channel('news_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, fetchNews).subscribe();

    // Admissions
    const fetchAdmissions = async () => {
      const { data } = await supabase.from('admissions').select('*').order('year', { ascending: false });
      if (data) setAdmissions(data);
    };
    fetchAdmissions();
    const admissionsChannel = supabase.channel('admissions_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'admissions' }, fetchAdmissions).subscribe();

    // Features
    const fetchFeatures = async () => {
      const { data } = await supabase.from('features').select('*').order('order_num', { ascending: true });
      if (data) setFeatures(data);
    };
    fetchFeatures();
    const featuresChannel = supabase.channel('features_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'features' }, fetchFeatures).subscribe();

    // Youth Union
    const fetchYouthUnion = async () => {
      const { data } = await supabase.from('youth_union').select('*').order('date', { ascending: false });
      if (data) setYouthUnion(data);
    };
    fetchYouthUnion();
    const youthUnionChannel = supabase.channel('youth_union_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'youth_union' }, fetchYouthUnion).subscribe();

    // Departments
    const fetchDepts = async () => {
      const { data } = await supabase.from('departments').select('*');
      if (data) setDepartmentsList(data);
    };
    fetchDepts();
    const deptsChannel = supabase.channel('depts_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, fetchDepts).subscribe();

    // Achievements
    const fetchAchievements = async () => {
      const { data } = await supabase.from('achievements').select('*').order('year', { ascending: false });
      if (data) setAchievements(data);
    };
    fetchAchievements();
    const achievementsChannel = supabase.channel('achievements_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'achievements' }, fetchAchievements).subscribe();

    // Schedules
    const fetchSchedules = async () => {
      const { data } = await supabase.from('schedules').select('*').order('start_date', { ascending: false });
      if (data) setSchedules(data);
    };
    fetchSchedules();
    const schedulesChannel = supabase.channel('schedules_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, fetchSchedules).subscribe();

    // Gallery
    const fetchGallery = async () => {
      const { data } = await supabase.from('gallery').select('*').order('title', { ascending: true });
      if (data) setGallery(data);
    };
    fetchGallery();
    const galleryChannel = supabase.channel('gallery_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, fetchGallery).subscribe();

    // Archive Documents
    const fetchArchive = async () => {
      const { data } = await supabase.from('archive_documents').select('*').order('year', { ascending: false }).order('created_at', { ascending: false });
      if (data) setArchiveDocuments(data);
    };
    fetchArchive();
    const archiveChannel = supabase.channel('archive_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'archive_documents' }, fetchArchive).subscribe();

    // Static contents
    const fetchStatic = async () => {
      const { data: home } = await supabase.from('home_content').select('*').eq('id', 'main').maybeSingle();
      if (home) setHomeContent(home);
      const { data: about } = await supabase.from('about_content').select('*').eq('id', 'main').maybeSingle();
      if (about) setAboutContent(about);
      const { data: adm } = await supabase.from('admissions_content').select('*').eq('id', 'main').maybeSingle();
      if (adm) setAdmissionsContent(adm);
      const { data: newsP } = await supabase.from('news_content').select('*').eq('id', 'main').maybeSingle();
      if (newsP) setNewsContent(newsP);
      const { data: info } = await supabase.from('school_info').select('*').eq('id', 'main').maybeSingle();
      if (info) setSchoolInfo(info);
    };
    fetchStatic();
    const homeChannel = supabase.channel('home_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'home_content' }, fetchStatic).subscribe();
    const aboutChannel = supabase.channel('about_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'about_content' }, fetchStatic).subscribe();
    const admContentChannel = supabase.channel('adm_content_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'admissions_content' }, fetchStatic).subscribe();
    const newsContentChannel = supabase.channel('news_content_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'news_content' }, fetchStatic).subscribe();
    const infoChannel = supabase.channel('info_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'school_info' }, fetchStatic).subscribe();

    return () => {
      supabase.removeChannel(newsChannel);
      supabase.removeChannel(admissionsChannel);
      supabase.removeChannel(featuresChannel);
      supabase.removeChannel(youthUnionChannel);
      supabase.removeChannel(deptsChannel);
      supabase.removeChannel(achievementsChannel);
      supabase.removeChannel(schedulesChannel);
      supabase.removeChannel(galleryChannel);
      supabase.removeChannel(archiveChannel);
      supabase.removeChannel(homeChannel);
      supabase.removeChannel(aboutChannel);
      supabase.removeChannel(admContentChannel);
      supabase.removeChannel(newsContentChannel);
      supabase.removeChannel(infoChannel);
    };
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      const fetchDeptData = async () => {
        const { data: personnel } = await supabase.from('personnel').select('*').eq('dept_id', selectedDepartment.id);
        if (personnel) setDeptPersonnel(personnel);
        const { data: activities } = await supabase.from('activities').select('*').eq('dept_id', selectedDepartment.id).order('date', { ascending: false });
        if (activities) setDeptActivities(activities);
        const { data: docs } = await supabase.from('dept_documents').select('*').eq('dept_id', selectedDepartment.id).order('created_at', { ascending: false });
        if (docs) setDeptDocuments(docs);
      };
      fetchDeptData();
      
      const pChannel = supabase.channel('p_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'personnel', filter: `dept_id=eq.${selectedDepartment.id}` }, fetchDeptData).subscribe();
      const aChannel = supabase.channel('a_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'activities', filter: `dept_id=eq.${selectedDepartment.id}` }, fetchDeptData).subscribe();
      const dChannel = supabase.channel('d_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'dept_documents', filter: `dept_id=eq.${selectedDepartment.id}` }, fetchDeptData).subscribe();

      return () => {
        supabase.removeChannel(pChannel);
        supabase.removeChannel(aChannel);
        supabase.removeChannel(dChannel);
      };
    }
  }, [selectedDepartment]);

  const handleLogin = async () => {
    setShowLoginModal(true);
  };

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setShowLoginModal(false);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError("Lỗi đăng nhập Google. Vui lòng thử lại.");
    }
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
    
    if (adminPasswordInput === correctPassword) {
      localStorage.setItem('admin_authenticated', 'true');
      setIsAdmin(true);
      setShowLoginModal(false);
      setAdminPasswordInput('');
    } else {
      setLoginError("Mật khẩu không chính xác.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('admin_authenticated');
    setIsAdmin(false);
    setShowAdmin(false);
  };

  const renderContent = () => {
    if (selectedNews && activeMenu === 'Tin tức') {
      return (
        <div className="animate-in slide-in-from-right duration-500 space-y-4">
          <button 
            onClick={() => setSelectedNews(null)}
            className="group flex items-center gap-1.5 text-blue-600 text-xs font-black uppercase tracking-wider hover:text-blue-800 transition-all mb-4 bg-white px-3 py-1.5 rounded-full border border-blue-100 shadow-sm"
          >
            <Icons.ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Quay lại
          </button>
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm p-6 md:p-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                  {selectedNews.category}
                </span>
                <span className="text-slate-400 flex items-center gap-2 text-sm">
                  <Icons.Calendar className="w-4 h-4" />
                  {selectedNews.date?.toDate ? selectedNews.date.toDate().toLocaleDateString('vi-VN') : 
                   (selectedNews.date ? new Date(selectedNews.date).toLocaleDateString('vi-VN') : 'Mới')}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight flex items-center gap-2 flex-wrap">
                {selectedNews.title}
                {(selectedNews.is_new || !selectedNews.date || isNaN(new Date(selectedNews.date).getTime())) && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-black rounded shadow-sm animate-pulse shrink-0 tracking-wider">NEW</span>
                )}
              </h2>
              <div className="h-1.5 w-20 bg-blue-800 rounded-full"></div>
              
              <div className="text-lg text-slate-600 leading-relaxed">
                <div className="space-y-6">
                  <MarkdownContent content={selectedNews.content} />
                  
                  <div className="flex flex-col gap-4 mt-8">
                    {selectedNews.document_url && (
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icons.FileText className="w-6 h-6 text-blue-600" />
                          <div>
                            <p className="font-bold text-blue-900">Tài liệu đính kèm</p>
                            <p className="text-sm text-blue-600 truncate max-w-[200px] md:max-w-md">{selectedNews.document_url}</p>
                          </div>
                        </div>
                        <a 
                          href={selectedNews.document_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                          <Icons.ExternalLink className="w-4 h-4" /> Tải về
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedAdmission && activeMenu === 'Tuyển sinh') {
      return (
        <div className="animate-in slide-in-from-right duration-500 space-y-8">
          <button 
            onClick={() => setSelectedAdmission(null)}
            className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors"
          >
            <Icons.ArrowLeft className="w-5 h-5" /> Quay lại danh sách
          </button>
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-blue-900">{selectedAdmission.title}</h3>
                <div className="h-1.5 w-24 bg-blue-800 rounded-full"></div>
              </div>
              <span className="px-6 py-2 bg-blue-100 text-blue-700 rounded-full text-lg font-bold">
                Năm học {selectedAdmission.year}
              </span>
            </div>
            <div className="prose prose-slate max-w-none text-lg text-slate-600 leading-relaxed">
              <MarkdownContent content={selectedAdmission.content} />
              
              <div className="flex flex-col gap-4 mt-8">
                {selectedAdmission.document_url && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icons.FileText className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-bold text-blue-900">Tài liệu đính kèm</p>
                        <p className="text-sm text-blue-600 truncate max-w-[200px] md:max-w-md">{selectedAdmission.document_url}</p>
                      </div>
                    </div>
                    <a 
                      href={selectedAdmission.document_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Icons.ExternalLink className="w-4 h-4" /> Tải về
                    </a>
                  </div>
                )}

              </div>
            </div>
            <div className="flex items-center gap-3 text-red-600 font-black text-xl p-6 bg-red-50 rounded-2xl border border-red-100">
              <Icons.Calendar className="w-6 h-6" />
              <span>Hạn chót nộp hồ sơ: {new Date(selectedAdmission.deadline).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>
      );
    }

    if (activeMenu === 'Giới thiệu' && aboutContent?.render_type === 'html') {
      return (
        <div className="animate-in fade-in duration-500 prose prose-slate max-w-none" 
             dangerouslySetInnerHTML={{ __html: aboutContent.html_content }} />
      );
    }

    if (activeMenu === 'Tuyển sinh' && admissionsContent?.render_type === 'html') {
      return (
        <div className="animate-in fade-in duration-500 prose prose-slate max-w-none" 
             dangerouslySetInnerHTML={{ __html: admissionsContent.html_content }} />
      );
    }

    if (activeMenu === 'Tin tức' && newsContent?.render_type === 'html') {
      return (
        <div className="animate-in fade-in duration-500 prose prose-slate max-w-none" 
             dangerouslySetInnerHTML={{ __html: newsContent.html_content }} />
      );
    }

    if (activeMenu === 'Lưu trữ văn bản') {
      const filteredDocs = archiveDocuments.filter(d => {
        const matchesSearch = d.title.toLowerCase().includes(archiveSearch.toLowerCase()) || 
                             (d.description?.toLowerCase().includes(archiveSearch.toLowerCase()));
        const matchesType = archiveTypeFilter === 'Tất cả' || d.type === archiveTypeFilter;
        return matchesSearch && matchesType;
      });

      const docTypes = ['Tất cả', ...new Set(archiveDocuments.map(d => d.type))];

      return (
        <div className="animate-in fade-in duration-500 space-y-12">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <h2 className="text-2xl font-black text-blue-900 flex items-center gap-3">
                <Icons.Archive className="w-8 h-8 text-blue-600" /> Lưu trữ văn bản & Tài liệu
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                 <div className="relative flex-1 sm:w-64">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Tìm tên văn bản..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={archiveSearch}
                      onChange={(e) => setArchiveSearch(e.target.value)}
                    />
                 </div>
                 <select 
                    className="py-2 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                    value={archiveTypeFilter}
                    onChange={(e) => setArchiveTypeFilter(e.target.value)}
                 >
                   {docTypes.map(type => (
                     <option key={type} value={type}>{type}</option>
                   ))}
                 </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Nội bộ Group */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b-2 border-emerald-500 pb-2 w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Văn bản Nội bộ
                </h3>
                <div className="space-y-4">
                  {filteredDocs.filter(d => d.category === 'Nội bộ').length > 0 ? (
                    filteredDocs.filter(d => d.category === 'Nội bộ').map((doc) => (
                      <div key={doc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mb-1 inline-block">{doc.type} {doc.year ? `- ${doc.year}` : ''}</span>
                            <h4 className="font-bold text-slate-900 line-clamp-2 leading-tight mb-1">{doc.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2">{doc.description}</p>
                          </div>
                          {doc.file_url && (
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-blue-600 rounded-xl shadow-sm border border-slate-100 hover:bg-blue-600 hover:text-white transition-all transform group-hover:scale-110">
                              <Icons.ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm italic">Đang cập nhật...</div>
                  )}
                </div>
              </div>

              {/* Sở, Bộ Group */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b-2 border-purple-500 pb-2 w-fit">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span> Văn bản Sở, Bộ
                </h3>
                <div className="space-y-4">
                  {filteredDocs.filter(d => ['Sở, Bộ', 'Số, Bộ', 'Sổ, Bộ'].includes(d.category)).length > 0 ? (
                    filteredDocs.filter(d => ['Sở, Bộ', 'Số, Bộ', 'Sổ, Bộ'].includes(d.category)).map((doc) => (
                      <div key={doc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2 py-0.5 rounded mb-1 inline-block">{doc.type} {doc.year ? `- ${doc.year}` : ''}</span>
                            <h4 className="font-bold text-slate-900 line-clamp-2 leading-tight mb-1">{doc.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2">{doc.description}</p>
                          </div>
                          {doc.file_url && (
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-blue-600 rounded-xl shadow-sm border border-slate-100 hover:bg-blue-600 hover:text-white transition-all transform group-hover:scale-110">
                              <Icons.ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm italic">Đang cập nhật...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-900 text-white rounded-3xl space-y-4">
              <Icons.ShieldCheck className="w-10 h-10 text-blue-400" />
              <h4 className="text-lg font-bold">Lưu ý</h4>
              <p className="text-sm text-blue-100 leading-relaxed font-medium">Toàn bộ văn bản được đăng tải đều là bản sao từ văn bản gốc, có giá trị nội bộ tại nhà trường.</p>
            </div>
            <div className="md:col-span-2 p-8 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row items-center gap-6">
               <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                 <Icons.Search className="w-8 h-8 text-blue-800" />
               </div>
               <div>
                 <h4 className="text-xl font-black text-blue-900 mb-2">Tra cứu văn bản nhanh chóng</h4>
                 <p className="text-slate-600 text-sm font-medium mb-4">Bạn đang tìm kiếm một nghị định hay nội quy cụ thể? Hãy sử dụng công cụ tìm kiếm trên thanh điều hướng hoặc liên hệ VP nhà trường để được hỗ trợ.</p>
               </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeMenu === 'Liên hệ' && schoolInfo?.render_type === 'html') {
      return (
        <div className="animate-in fade-in duration-500 prose prose-slate max-w-none" 
             dangerouslySetInnerHTML={{ __html: schoolInfo.html_content }} />
      );
    }

    if (activeMenu === 'Trang chủ' && homeContent?.render_type === 'html') {
      return (
        <div className="animate-in fade-in duration-500 prose prose-slate max-w-none" 
             dangerouslySetInnerHTML={{ __html: homeContent.html_content }} />
      );
    }

    switch (activeMenu) {
      case 'Giới thiệu':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 uppercase">Về {schoolInfo?.name || 'Trường THPT'}</h2>
            <div className="h-1.5 w-24 bg-blue-800 rounded-full mb-8"></div>
            <div className="prose prose-slate max-w-none">
              <MarkdownContent content={aboutContent?.main_text || 'Đang tải thông tin giới thiệu...'} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
                <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Lịch sử hình thành</h3>
                  <MarkdownContent content={aboutContent?.history || 'Đang tải lịch sử hình thành...'} />
                </div>
                <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100">
                  <h3 className="text-xl font-bold text-amber-900 mb-4">Giá trị cốt lõi</h3>
                  <MarkdownContent content={aboutContent?.core_values || 'Đang tải giá trị cốt lõi...'} />
                </div>
              </div>
            </div>
          </div>
        );
      case 'Tuyển sinh':
        const filteredAdmissions = admissions.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 uppercase">Thông tin tuyển sinh</h2>
            <div className="h-1.5 w-24 bg-blue-800 rounded-full mb-8"></div>
            <div className="space-y-0.5 border-t border-slate-100 pt-4">
              {filteredAdmissions.length > 0 ? filteredAdmissions.map(item => (
                <div 
                  key={item.id} 
                  className="flex flex-wrap items-center gap-x-4 py-1 border-b border-slate-50 hover:bg-slate-50 transition-colors text-sm"
                >
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <span className="font-bold text-slate-900 shrink-0">Tiêu đề:</span>
                    <span className="text-slate-700 truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-bold text-slate-900">Thời gian:</span>
                    <span className="text-slate-500">
                      {item.deadline ? new Date(item.deadline).toLocaleDateString('vi-VN') : '...'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedAdmission(item);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-blue-600 font-bold hover:underline shrink-0"
                  >
                    &lt;xem chi tiết&gt;
                  </button>
                </div>
              )) : (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Hiện chưa có thông tin tuyển sinh mới.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'Tin tức':
        const filteredNews = news.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()));
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 uppercase">Tin tức & Sự kiện</h2>
            <div className="h-1.5 w-24 bg-blue-800 rounded-full mb-8"></div>
            <div className="space-y-0.5 border-t border-slate-100 pt-4">
              {filteredNews.map(item => (
                <div 
                  key={item.id} 
                  className="flex flex-wrap items-center gap-x-4 py-1 border-b border-slate-50 hover:bg-slate-50 transition-colors text-sm"
                >
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <span className="font-bold text-slate-900 shrink-0">Tiêu đề:</span>
                    <span className="text-slate-700 truncate">{item.title}</span>
                    {(item.is_new || !item.date || isNaN(new Date(item.date).getTime())) && (
                      <span className="ml-1 px-1.5 py-0.5 bg-orange-600 text-white text-[8px] font-black rounded shadow-sm shrink-0">NEW</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-bold text-slate-900">Thời gian:</span>
                    <span className="text-slate-500">
                      {item.date && !isNaN(new Date(item.date).getTime()) ? new Date(item.date).toLocaleDateString('vi-VN') : '---'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedNews(item);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-blue-600 font-bold hover:underline shrink-0"
                  >
                    &lt;xem chi tiết&gt;
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Lưu trữ văn bản':
        const filteredArchive = archiveDocuments.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 uppercase">Lưu trữ văn bản & Tài liệu</h2>
            <div className="h-1.5 w-24 bg-blue-800 rounded-full mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {['Nội bộ', 'Sở, Bộ', 'Số bộ'].map(cat => {
                const docs = filteredArchive.filter(d => d.category === cat || (cat === 'Sở, Bộ' && d.category === 'Số bộ'));
                if (docs.length === 0 && cat === 'Số bộ') return null; // Group Số bộ with Sở, Bộ
                if (docs.length === 0 && cat !== 'Sở, Bộ') return null; 
                
                return (
                  <div key={cat} className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 border-b-2 border-slate-100 pb-2 flex items-center gap-2">
                       <Icons.Archive className="w-5 h-5 text-blue-600" />
                       {cat === 'Sở, Bộ' ? 'Văn bản Sở, Bộ' : cat}
                    </h3>
                    <div className="space-y-2">
                      {docs.map(doc => (
                        <div key={doc.id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all flex justify-between items-center group">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">{doc.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <span className="font-medium bg-slate-100 px-2 py-0.5 rounded">{doc.type}</span>
                              <span className="shrink-0">• {doc.year}</span>
                              {doc.category === 'Số bộ' && <span className="text-[10px] bg-amber-50 text-amber-600 px-1 rounded border border-amber-100">Cũ</span>}
                            </div>
                          </div>
                          {doc.file_url && (
                            <a 
                              href={doc.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                              title="Tải văn bản"
                            >
                              <Icons.FileText className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      ))}
                      {docs.length === 0 && (
                        <p className="text-sm text-slate-400 italic py-4">Chưa có văn bản trong danh mục này.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredArchive.length === 0 && searchQuery && (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                <Icons.Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Không tìm thấy tài liệu phù hợp với "{searchQuery}".</p>
              </div>
            )}
          </div>
        );
      case 'Liên hệ':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 uppercase">Liên hệ với chúng tôi</h2>
            <div className="h-1.5 w-24 bg-blue-800 rounded-full mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-2xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Địa chỉ</h4>
                    <p className="text-slate-600">{schoolInfo?.address || '123 Đường ABC, Quận XYZ, Hà Nội'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 text-green-800 rounded-2xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Điện thoại</h4>
                    <p className="text-slate-600">{schoolInfo?.phone || '024.1234.5678'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-800 rounded-2xl flex items-center justify-center shrink-0">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Email</h4>
                    <p className="text-slate-600">{schoolInfo?.email || 'contact@thptminhkhai.edu.vn'}</p>
                  </div>
                </div>
              </div>
              <form className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-4">
                <input type="text" placeholder="Họ và tên" className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="email" placeholder="Email liên hệ" className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500" />
                <textarea placeholder="Nội dung tin nhắn" className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 h-32"></textarea>
                <button className="w-full py-3 bg-blue-800 text-white font-bold rounded-xl hover:bg-blue-900 transition-colors">Gửi thông tin</button>
              </form>
            </div>
          </div>
        );
      case 'Tổ chuyên môn':
        if (selectedDepartment) {
          if (selectedDeptActivity) {
            return (
              <div className="animate-in slide-in-from-right duration-500 space-y-8">
                <button 
                  onClick={() => setSelectedDeptActivity(null)}
                  className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors"
                >
                  <Icons.ArrowLeft className="w-5 h-5" /> Quay lại tổ chuyên môn
                </button>

                <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm p-8 md:p-12">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                    <Icons.Calendar className="w-4 h-4" />
                    {selectedDeptActivity.date && !isNaN(new Date(selectedDeptActivity.date).getTime()) ? new Date(selectedDeptActivity.date).toLocaleString('vi-VN') : '...'}
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">{selectedDeptActivity.title}</h2>
                  <div className="h-1.5 w-24 bg-blue-800 rounded-full mb-10"></div>
                  
                  {selectedDeptActivity.image_url && (
                    <div className="mb-10 rounded-3xl overflow-hidden shadow-lg">
                      <img src={selectedDeptActivity.image_url} className="w-full h-auto max-h-[600px] object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}

                  <div className="prose prose-slate max-w-none text-lg text-slate-600 leading-relaxed">
                    {selectedDeptActivity.summary && (
                      <p className="text-xl font-bold text-blue-900 mb-8 p-6 bg-blue-50 rounded-2xl border-l-4 border-blue-600">
                        {selectedDeptActivity.summary}
                      </p>
                    )}
                    <MarkdownContent content={selectedDeptActivity.content || selectedDeptActivity.description} />
                  </div>

                  <div className="flex flex-wrap gap-4 mt-12 pt-8 border-t border-slate-100">
                    {selectedDeptActivity.document_url && (
                      <a 
                        href={selectedDeptActivity.document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-blue-800 text-white font-bold rounded-2xl hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                      >
                        Tài liệu đính kèm <Icons.FileText className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          const IconComponent = (Icons as any)[selectedDepartment.icon] || Icons.BookOpen;
          return (
            <div className="animate-in slide-in-from-right duration-500 space-y-8">
              <button 
                onClick={() => setSelectedDepartment(null)}
                className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" /> Quay lại danh sách tổ
              </button>
              <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm p-8 md:p-12">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-blue-100 text-blue-800 rounded-2xl flex items-center justify-center shadow-sm">
                    <IconComponent className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase">{selectedDepartment.name}</h2>
                    <div className="h-1.5 w-24 bg-blue-800 rounded-full mt-2"></div>
                  </div>
                </div>
                <div className="prose prose-slate max-w-none text-lg text-slate-600 leading-relaxed">
                  <p className="font-bold text-xl text-blue-900 mb-8">{selectedDepartment.description}</p>
                  
                  {/* Tabs Navigation */}
                  <div className="flex border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
                    <button 
                      onClick={() => setActiveDeptTab('introduction')}
                      className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all border-b-2 shrink-0 ${activeDeptTab === 'introduction' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      Giới thiệu
                    </button>
                    <button 
                      onClick={() => setActiveDeptTab('personnel')}
                      className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all border-b-2 shrink-0 ${activeDeptTab === 'personnel' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      Nhân sự
                    </button>
                    <button 
                      onClick={() => setActiveDeptTab('activities')}
                      className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all border-b-2 shrink-0 ${activeDeptTab === 'activities' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      Hoạt động
                    </button>
                    <button 
                      onClick={() => setActiveDeptTab('documents')}
                      className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all border-b-2 shrink-0 ${activeDeptTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      Tài liệu
                    </button>
                  </div>

                  <div className="mt-8">
                    {/* Introduction Tab */}
                    {activeDeptTab === 'introduction' && (
                      <div className="animate-in fade-in duration-300">
                        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                          <MarkdownContent content={selectedDepartment.content || 'Nội dung giới thiệu đang được cập nhật...'} />
                        </div>
                      </div>
                    )}

                    {/* Personnel Tab */}
                    {activeDeptTab === 'personnel' && (
                      <div className="animate-in fade-in duration-300">
                        <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                          <Icons.Users className="w-7 h-7 text-blue-600" /> Nhân sự của tổ
                        </h4>
                        {deptPersonnel.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {deptPersonnel.map((p) => {
                              const initials = p.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(-2);
                              return (
                                <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-300">
                                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg mb-4 group-hover:scale-105 transition-transform duration-500 border-4 border-white">
                                    {initials}
                                  </div>
                                  
                                  <div className="min-w-0">
                                    <h5 className="font-bold text-slate-900 text-lg leading-tight mb-1">{p.name}</h5>
                                    <p className="text-blue-600 font-extrabold text-[10px] uppercase tracking-[0.2em] mb-4">{p.position}</p>
                                    
                                    <div className="flex flex-col items-center gap-1.5 mb-5">
                                      {p.birth_date && (
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                          <Icons.Calendar className="w-3 h-3 text-blue-500" />
                                          <span>Sinh: {p.birth_date}</span>
                                        </div>
                                      )}
                                      {p.education && (
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 px-3">
                                          <Icons.GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                                          <span className="line-clamp-1">{p.education}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {p.bio && (
                                    <div className="pt-4 border-t border-slate-50 mt-auto w-full">
                                      <p className="text-[11px] text-slate-500 italic leading-relaxed leading-snug px-2">
                                        "{p.bio}"
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                            <p className="text-slate-400 italic">Dữ liệu nhân sự đang được cập nhật...</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Activities Tab */}
                    {activeDeptTab === 'activities' && (
                      <div className="animate-in fade-in duration-300">
                        <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                          <Icons.Activity className="w-7 h-7 text-green-600" /> Hoạt động chuyên môn
                        </h4>
                        {deptActivities.length > 0 ? (
                          <div className="space-y-6">
                            {deptActivities.map((a) => (
                              <div key={a.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                                {a.image_url && (
                                  <div className="w-full md:w-48 h-48 md:h-auto rounded-2xl overflow-hidden shrink-0">
                                    <img src={a.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                                    <Icons.Calendar className="w-4 h-4" />
                                    {a.date && !isNaN(new Date(a.date).getTime()) ? new Date(a.date).toLocaleString('vi-VN') : '...'}
                                  </div>
                                  <h5 className="text-xl font-bold text-slate-900 mb-3">{a.title}</h5>
                                  <div className="text-slate-600 leading-relaxed mb-4 line-clamp-3">
                                    <MarkdownContent content={a.summary || a.content || a.description} />
                                  </div>
                                  <div className="flex flex-wrap gap-4">
                                    <button 
                                      onClick={() => {
                                        setSelectedDeptActivity(a);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md"
                                    >
                                      Xem chi tiết <Icons.ChevronRight className="w-4 h-4" />
                                    </button>
                                    {a.document_url && (
                                      <a 
                                        href={a.document_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                                      >
                                        <Icons.FileText className="w-4 h-4" /> Tài liệu đính kèm
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                            <p className="text-slate-400 italic">Các hoạt động chuyên môn đang được cập nhật...</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Documents Tab */}
                    {activeDeptTab === 'documents' && (
                      <div className="animate-in fade-in duration-300">
                        <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                          <Icons.BookOpen className="w-7 h-7 text-amber-600" /> Tài liệu tổ chuyên môn
                        </h4>
                        {deptDocuments.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {deptDocuments.map((docItem) => (
                              <div key={docItem.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-100 transition-colors">
                                    <Icons.FileText className="w-6 h-6" />
                                  </div>
                                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">
                                    {docItem.category}
                                  </span>
                                </div>
                                <h5 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-800 transition-colors">{docItem.title}</h5>
                                {docItem.description && (
                                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 italic">{docItem.description}</p>
                                )}
                                <a 
                                  href={docItem.file_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                >
                                  <Icons.Download className="w-4 h-4" /> Tải tài liệu
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                            <p className="text-slate-400 italic">Kho tài liệu đang được cập nhật...</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }
        const filteredDepts = departmentsList.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 uppercase">Tổ chuyên môn</h2>
            <div className="h-1.5 w-24 bg-blue-800 rounded-full mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDepts.map((dept) => {
                const IconComponent = (Icons as any)[dept.icon] || Icons.BookOpen;
                return (
                  <div 
                    key={dept.id} 
                    className="p-6 bg-white border border-slate-100 rounded-3xl hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setActiveDeptTab('introduction');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="w-14 h-14 bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-800 rounded-2xl flex items-center justify-center mb-4 transition-colors shadow-sm">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-800 transition-colors">{dept.name}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2">{dept.description}</p>
                    <div className="mt-4 flex items-center text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Xem chi tiết <Icons.ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredDepts.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                <Icons.Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Không tìm thấy tổ chuyên môn phù hợp.</p>
              </div>
            )}
          </div>
        );
      case 'Hoạt động Đoàn':
        if (selectedYouthUnion) {
          return (
            <div className="animate-in slide-in-from-right duration-500 space-y-8">
              <button 
                onClick={() => setSelectedYouthUnion(null)}
                className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" /> Quay lại danh sách
              </button>

              <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm p-8 md:p-12">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                  <Icons.Calendar className="w-4 h-4" />
                  {selectedYouthUnion.date && !isNaN(new Date(selectedYouthUnion.date).getTime()) ? new Date(selectedYouthUnion.date).toLocaleString('vi-VN') : '...'}
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">{selectedYouthUnion.title}</h2>
                <div className="h-1.5 w-24 bg-blue-800 rounded-full mb-10"></div>
                
                <div className="prose prose-slate max-w-none text-lg text-slate-600 leading-relaxed">
                  {selectedYouthUnion.summary && (
                    <p className="text-xl font-bold text-blue-900 mb-8 p-6 bg-blue-50 rounded-2xl border-l-4 border-blue-600">
                      {selectedYouthUnion.summary}
                    </p>
                  )}
                  <MarkdownContent content={selectedYouthUnion.content} />
                </div>
              </div>
            </div>
          );
        }
        const filteredYouth = youthUnion.filter(y => y.title.toLowerCase().includes(searchQuery.toLowerCase()));
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 uppercase">Hoạt động Đoàn</h2>
            <div className="h-1.5 w-24 bg-blue-800 rounded-full mb-8"></div>
            <div className="space-y-0.5 border-t border-slate-100 pt-4">
              {filteredYouth.map(item => (
                <div 
                  key={item.id} 
                  className="flex flex-wrap items-center gap-x-4 py-1 border-b border-slate-50 hover:bg-slate-50 transition-colors text-sm"
                >
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <span className="font-bold text-slate-900 shrink-0">Tiêu đề:</span>
                    <span className="text-slate-700 truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-bold text-slate-900">Thời gian:</span>
                    <span className="text-slate-500">
                      {item.date && !isNaN(new Date(item.date).getTime()) ? new Date(item.date).toLocaleDateString('vi-VN') : '...'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedYouthUnion(item);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-blue-600 font-bold hover:underline shrink-0"
                  >
                    &lt;xem chi tiết&gt;
                  </button>
                </div>
              ))}
              {filteredYouth.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                  <Icons.Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Không tìm thấy hoạt động Đoàn phù hợp.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'Thành tích học tập':
        if (selectedAchievement) {
          return (
            <div className="animate-in slide-in-from-right duration-500 space-y-8">
              <button 
                onClick={() => setSelectedAchievement(null)}
                className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" /> Quay lại danh sách
              </button>

              <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm p-8 md:p-12">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    selectedAchievement.type === 'academic' ? 'bg-blue-100 text-blue-700' :
                    selectedAchievement.type === 'sport' ? 'bg-green-100 text-green-700' :
                    selectedAchievement.type === 'art' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedAchievement.type === 'academic' ? 'Học thuật' :
                     selectedAchievement.type === 'sport' ? 'Thể thao' :
                     selectedAchievement.type === 'art' ? 'Nghệ thuật' : 'Thành tích khác'}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                    <Icons.Calendar className="w-4 h-4" />
                    Năm học {selectedAchievement.year}
                  </span>
                </div>

                <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">{selectedAchievement.title}</h2>
                <div className="h-1.5 w-24 bg-blue-800 rounded-full mb-10"></div>
                
                {selectedAchievement.image_url && (
                  <div className="mb-10 rounded-3xl overflow-hidden shadow-lg border border-slate-100">
                    <img src={selectedAchievement.image_url} className="w-full h-auto max-h-[600px] object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}

                <div className="prose prose-slate max-w-none text-lg text-slate-600 leading-relaxed">
                  <MarkdownContent content={selectedAchievement.description} />
                </div>
              </div>
            </div>
          );
        }
        const filteredAchievements = achievements.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 uppercase">Thành tích học tập</h2>
            <div className="h-1.5 w-24 bg-blue-800 rounded-full mb-8"></div>
            <div className="space-y-0.5 border-t border-slate-100 pt-4">
              {filteredAchievements.map(item => (
                <div 
                  key={item.id} 
                  className="flex flex-wrap items-center gap-x-4 py-1 border-b border-slate-50 hover:bg-slate-50 transition-colors text-sm"
                >
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <span className="font-bold text-slate-900 shrink-0">Tiêu đề:</span>
                    <span className="text-slate-700 truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-bold text-slate-900">Năm học:</span>
                    <span className="text-slate-500">{item.year}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedAchievement(item);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-blue-600 font-bold hover:underline shrink-0"
                  >
                    &lt;xem chi tiết&gt;
                  </button>
                </div>
              ))}
              {filteredAchievements.length === 0 && (
                <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                  <Icons.Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Không tìm thấy thành tích phù hợp.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'Lịch công tác':
        if (selectedSchedule && activeMenu === 'Lịch công tác') {
          return (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <button 
                onClick={() => setSelectedSchedule(null)}
                className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all mb-6"
              >
                <Icons.ArrowLeft className="w-5 h-5" /> QUAY LẠI DANH SÁCH
              </button>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-8 md:p-12">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                      Lịch công tác
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                      <Icons.Calendar className="w-4 h-4" />
                      {selectedSchedule.start_date ? new Date(selectedSchedule.start_date).toLocaleDateString('vi-VN') : 'Mới'}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 leading-tight">
                    {selectedSchedule.title}
                  </h1>

                  <div className="prose prose-slate max-w-none mb-10">
                    <MarkdownContent content={selectedSchedule.content || 'Đang cập nhật nội dung...'} />
                  </div>

                </div>
              </div>
            </div>
          );
        }
        const filteredSchedules = schedules.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 uppercase">Lịch công tác</h2>
            <div className="h-1.5 w-24 bg-blue-800 rounded-full mb-8"></div>
            <div className="space-y-0.5 border-t border-slate-100 pt-4">
              {filteredSchedules.map(item => (
                <div 
                  key={item.id} 
                  className="flex flex-wrap items-center gap-x-4 py-1 border-b border-slate-50 hover:bg-slate-50 transition-colors text-sm"
                >
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <span className="font-bold text-slate-900 shrink-0">Tiêu đề:</span>
                    <span className="text-slate-700 truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-bold text-slate-900">Thời gian:</span>
                    <span className="text-slate-500">
                      {item.start_date ? new Date(item.start_date).toLocaleDateString('vi-VN') : '...'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedSchedule(item);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-blue-600 font-bold hover:underline shrink-0"
                  >
                    &lt;xem chi tiết&gt;
                  </button>
                </div>
              ))}
              {filteredSchedules.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                  <Icons.Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Không tìm thấy lịch công tác phù hợp.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'Thư viện ảnh':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 uppercase">Thư viện ảnh</h2>
            <div className="h-1.5 w-24 bg-blue-800 rounded-full mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {gallery.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => {
                    const images = JSON.parse(item.images_json || '[]');
                    if (images.length > 0) {
                      setActiveSlideshow(item);
                      setCurrentSlideIndex(0);
                    }
                  }}
                  className={`group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 ${item.images_json && JSON.parse(item.images_json).length > 0 ? 'cursor-pointer' : ''}`}
                >
                  <div className="aspect-square overflow-hidden relative">
                    <img src={item.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm w-fit">
                        {item.category}
                      </span>
                      {item.images_json && JSON.parse(item.images_json).length > 0 && (
                        <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 w-fit">
                          <Icons.Layers className="w-3 h-3" /> {JSON.parse(item.images_json).length} ảnh
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-slate-900 mb-1 group-hover:text-blue-800 transition-colors">{item.title}</h3>
                    {item.description && <p className="text-xs text-slate-500 line-clamp-2 italic mb-3">{item.description}</p>}
                    <div className="flex items-center justify-between mt-auto">
                      {item.images_json && JSON.parse(item.images_json).length > 0 && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Icons.Maximize2 className="w-3 h-3" /> Xem bộ ảnh
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {gallery.length === 0 && (
                <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                  <Icons.Image className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Thư viện ảnh đang được cập nhật...</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <section className="relative rounded-3xl overflow-hidden aspect-[21/9] bg-slate-200 group">
              <img 
                src={homeContent?.banner_image || "https://picsum.photos/seed/school/1200/600"} 
                alt="Trường học" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex flex-col justify-end p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">{homeContent?.banner_title || 'Môi trường giáo dục hiện đại & thân thiện'}</h3>
                <p className="text-blue-100 max-w-xl">{homeContent?.banner_description || 'Với đội ngũ giáo viên tâm huyết và cơ sở vật chất khang trang, chúng tôi cam kết mang lại chất lượng giáo dục tốt nhất cho học sinh.'}</p>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {features.length > 0 ? features.map((card) => {
                const IconComponent = (Icons as any)[card.icon] || Icons.HelpCircle;
                return (
                  <div key={card.id} className="p-6 border border-slate-100 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1 bg-white">
                    <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-slate-800">{card.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{card.description}</p>
                  </div>
                );
              }) : (
                [
                  { title: 'Chương trình đào tạo', desc: 'Đổi mới phương pháp dạy học, phát huy tính sáng tạo của học sinh.', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
                  { title: 'Hoạt động ngoại khóa', desc: 'Phát triển kỹ năng mềm qua các câu lạc bộ và sự kiện văn thể mỹ.', icon: Users, color: 'bg-green-100 text-green-700' },
                  { title: 'Thành tích nổi bật', desc: 'Tự hào với nhiều giải thưởng cấp quốc gia và quốc tế hàng năm.', icon: Award, color: 'bg-amber-100 text-amber-700' }
                ].map((card, i) => (
                  <div key={i} className="p-6 border border-slate-100 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1 bg-white">
                    <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                      <card.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-slate-800">{card.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
                  </div>
                ))
              )}
            </div>

            <section className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">
                    {admissions[0]?.title || 'Thông tin tuyển sinh'}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {admissions[0]?.content || 'Đang tải thông tin tuyển sinh mới nhất...'}
                  </p>
                  <div className="flex gap-4">
                    <button onClick={() => handleMenuClick('Tuyển sinh')} className="px-6 py-3 bg-blue-800 text-white font-bold rounded-xl hover:bg-blue-900 transition-colors shadow-lg shadow-blue-200">Xem chi tiết</button>
                    <button className="px-6 py-3 border-2 border-blue-800 text-blue-800 font-bold rounded-xl hover:bg-blue-50 transition-colors">Tải hồ sơ mẫu</button>
                  </div>
                </div>
                <div className="w-full md:w-64 aspect-square bg-white rounded-2xl shadow-inner border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
                  <Calendar className="w-12 h-12 text-blue-800 mb-2" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Hạn chót nộp hồ sơ</span>
                  <span className="text-3xl font-black text-blue-900">
                    {admissions[0]?.deadline ? new Date(admissions[0].deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '15/06'}
                  </span>
                  <span className="text-sm font-medium text-slate-500">Năm {admissions[0]?.year || 2026}</span>
                </div>
              </div>
            </section>
          </div>
        );
    }
  };
  const topMenuItems = ['Trang chủ', 'Giới thiệu', 'Tuyển sinh', 'Tin tức', 'Lưu trữ văn bản', 'Liên hệ'];
  const subMenuItems = [
    { name: 'Tổ chuyên môn', icon: BookOpen },
    { name: 'Hoạt động Đoàn', icon: Users },
    { name: 'Thành tích học tập', icon: Award },
    { name: 'Lịch công tác', icon: Calendar },
    { name: 'Thư viện ảnh', icon: Globe }
  ];

  const [activeSlideshow, setActiveSlideshow] = useState<any | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    setSelectedNews(null);
    setSelectedAdmission(null);
    setSelectedSchedule(null);
    setSelectedYouthUnion(null);
    setSelectedAchievement(null);
    setSelectedDepartment(null);
    setSelectedDeptActivity(null);
    setActiveDeptTab('personnel');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsDetailClick = (item: any) => {
    setActiveMenu('Tin tức');
    setSelectedNews(item);
    setSelectedAdmission(null);
    setSelectedSchedule(null);
    setSelectedYouthUnion(null);
    setSelectedAchievement(null);
    setSelectedDepartment(null);
    setSelectedDeptActivity(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (showAdmin && isAdmin) {
    return <AdminDashboard onLogout={handleLogout} onExit={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Bar (Contact Info) */}
      <div className="bg-blue-900 text-white py-2 px-6 flex justify-between items-center text-xs font-medium">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {schoolInfo?.phone || '024.1234.5678'}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {schoolInfo?.address || '123 Đường ABC, Quận XYZ, Hà Nội'}</span>
        </div>
        <div className="flex gap-4 items-center">
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAdmin(true)}
                className="flex items-center gap-1 hover:text-blue-200 transition-colors bg-blue-800 px-3 py-1 rounded-full"
              >
                <LayoutDashboard className="w-3 h-3" /> Quản trị hệ thống
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 hover:text-red-200 transition-colors text-red-300"
              >
                <LogOut className="w-3 h-3" /> Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {loginError && (
                <span className="text-[10px] text-red-200 bg-red-800/50 px-2 py-0.5 rounded animate-pulse max-w-[150px] truncate md:max-w-none">
                  {loginError}
                </span>
              )}
              <button 
                onClick={handleLogin}
                className="flex items-center gap-1 hover:text-blue-200 transition-colors"
              >
                <LogIn className="w-3 h-3" /> Đăng nhập quản trị
              </button>
            </div>
          )}
          <button className="hover:text-blue-200 transition-colors">Sổ liên lạc điện tử</button>
        </div>
      </div>

      {/* Header */}
      <header className="h-28 border-b border-slate-200 flex items-center px-10 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center text-white shadow-lg">
            <GraduationCap className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-blue-900 uppercase">{schoolInfo?.name || 'Trường THPT'}</h1>
            <div className="flex items-center gap-6">
              <p className="text-sm text-slate-500 italic font-medium">"{schoolInfo?.slogan || 'Trí tuệ - Đạo đức - Sáng tạo'}"</p>
              
              {/* Search Bar - Moved closer to title */}
              <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all group" title="Tìm kiếm theo tiêu đề Tin tức hoặc Tuyển sinh">
                <Icons.Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Tìm tin tức, tuyển sinh..." 
                  className="bg-transparent border-none outline-none text-xs w-40 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="h-14 border-b border-slate-200 flex items-center px-10 gap-8 bg-white shadow-sm sticky top-0 z-10">
        {topMenuItems.map((item) => (
          <button
            key={item}
            onClick={() => handleMenuClick(item)}
            className={`text-sm font-bold uppercase tracking-wide transition-all hover:text-blue-800 relative py-4 ${
              activeMenu === item ? 'text-blue-800' : 'text-slate-600'
            }`}
          >
            {item}
            {activeMenu === item && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-800 rounded-t-full"></span>
            )}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-72 border-r border-slate-200 bg-white p-6 hidden md:block">
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900 mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4" /> Thông báo mới
              </h2>
              <div className="space-y-3">
                {news.length > 0 ? news.map((item) => (
                  <div 
                    key={item.id} 
                    className="text-xs border-b border-slate-100 pb-2 hover:text-blue-600 cursor-pointer transition-colors"
                    onClick={() => handleNewsDetailClick(item)}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-slate-400">
                        {item.date?.toDate ? item.date.toDate().toLocaleDateString('vi-VN') : 
                         (item.date && !isNaN(new Date(item.date).getTime()) ? new Date(item.date).toLocaleDateString('vi-VN') : '')}
                      </span>
                    </div>
                    <p className="font-medium line-clamp-2 flex items-center gap-1 flex-wrap">
                      {item.title}
                      {(item.is_new || !item.date || isNaN(new Date(item.date).getTime())) && (
                        <span className="px-1 py-0.5 bg-orange-600 text-white text-[7px] font-black rounded-sm shadow-sm leading-none shrink-0 uppercase">NEW</span>
                      )}
                    </p>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 italic">Chưa có thông báo mới</p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900 mb-4">Danh mục chính</h2>
              <ul className="space-y-1">
                {subMenuItems.map((item) => (
                  <li key={item.name}>
                    <button 
                      onClick={() => handleMenuClick(item.name)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-800 rounded-lg transition-all group"
                    >
                      <item.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-800" />
                      <span>{item.name}</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-white">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Home className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Trang chủ / {activeMenu}</span>
            </div>
          </div>
          
          {renderContent()}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-12 pb-6 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="w-8 h-8 text-blue-400" />
              <h4 className="text-xl font-bold uppercase tracking-tight">{schoolInfo?.name || 'Trường THPT'}</h4>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Nơi đào tạo những thế hệ học sinh năng động, sáng tạo và có trách nhiệm với cộng đồng.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 border-l-4 border-blue-500 pl-3">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="https://hanoi.edu.vn" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Sở Giáo dục & Đào tạo Hà Nội</a></li>
              <li><a href="https://moet.gov.vn" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Bộ Giáo dục & Đào tạo</a></li>
              <li><a href="https://thisinh.thitotnghiepthpt.edu.vn/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Cổng thông tin thi THPT Quốc gia</a></li>
              <li><a href="https://hcm.edu.vn/homehcm" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Sở Giáo dục & Đào tạo TPHCM</a></li>
              <li><a href="https://hoclieu.vn" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Thư viện học liệu số</a></li>
              <li><a href="https://truonghocviet.vn/" target="_blank" rel="noopener noreferrer" className="hover:text-white text-blue-400 font-bold transition-colors flex items-center gap-1">Sổ liên lạc điện tử <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 border-l-4 border-blue-500 pl-3">Thông tin liên hệ</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-blue-400 shrink-0" /> {schoolInfo?.address || '123 Đường ABC, Quận XYZ, Hà Nội'}</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-400 shrink-0" /> {schoolInfo?.phone || '024.1234.5678'}</li>
              <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400 shrink-0" /> {schoolInfo?.email || 'trieuhaminh.gmail.vn'}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          &copy; 2026 {schoolInfo?.name || 'Trường THPT Nguyễn Hữu Cầu'}. Thiết kế và vận hành bởi Tổ CNTT.
        </div>
      </footer>

      {/* Slideshow Modal */}
      <AnimatePresence>
        {activeSlideshow && (
          <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-10">
            <motion.button 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => setActiveSlideshow(null)}
              className="absolute top-6 right-6 text-white/60 hover:text-white p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all z-10"
            >
              <X className="w-8 h-8" />
            </motion.button>

            <div className="relative w-full max-w-6xl h-[70vh] md:h-[75vh] flex items-center justify-center group mt-4">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentSlideIndex}
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  src={JSON.parse(activeSlideshow.images_json)[currentSlideIndex].url} 
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>

              {JSON.parse(activeSlideshow.images_json).length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentSlideIndex((currentSlideIndex - 1 + JSON.parse(activeSlideshow.images_json).length) % JSON.parse(activeSlideshow.images_json).length)}
                    className="absolute left-0 md:-left-20 p-4 bg-white/5 hover:bg-white/20 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-xl backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-10 h-10" />
                  </button>
                  <button 
                    onClick={() => setCurrentSlideIndex((currentSlideIndex + 1) % JSON.parse(activeSlideshow.images_json).length)}
                    className="absolute right-0 md:-right-20 p-4 bg-white/5 hover:bg-white/20 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-xl backdrop-blur-sm"
                  >
                    <ChevronRight className="w-10 h-10" />
                  </button>
                </>
              )}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center max-w-5xl px-6"
            >
              <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                <div className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-widest rounded">
                  {activeSlideshow.category}
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">{activeSlideshow.title}</h3>
                {JSON.parse(activeSlideshow.images_json)[currentSlideIndex].caption && (
                  <p className="text-blue-200 text-sm italic font-medium">
                    — "{JSON.parse(activeSlideshow.images_json)[currentSlideIndex].caption}"
                  </p>
                )}
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="flex justify-center gap-2 overflow-x-auto max-w-full no-scrollbar">
                  {JSON.parse(activeSlideshow.images_json).map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentSlideIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlideIndex ? 'bg-blue-500 w-8' : 'bg-white/20 w-2 hover:bg-white/40'}`}
                    />
                  ))}
                </div>
                
                <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
                  Ảnh {currentSlideIndex + 1} / {JSON.parse(activeSlideshow.images_json).length}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-blue-900 p-8 text-white relative">
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Đăng nhập Quản trị</h3>
                  <p className="text-blue-300 text-sm">Truy cập hệ thống quản lý trường học</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <form onSubmit={handlePasswordLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mật khẩu admin</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="password"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      autoFocus
                    />
                  </div>
                  {loginError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {loginError}
                    </p>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" /> Đăng nhập
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500 font-medium">Hoặc đăng nhập với</span>
                </div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                className="w-full border border-slate-200 py-3 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Tiếp tục với Google
              </button>
            </div>
            
            <div className="bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">
                Chỉ dành cho cán bộ quản lý và giáo viên được cấp quyền.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
