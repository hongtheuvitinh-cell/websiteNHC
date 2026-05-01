import React, { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Heading3, 
  List, 
  Table2, 
  Search, 
  Image as ImageIcon, 
  Type, 
  Link as LinkIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Palette, 
  Eye, 
  ChevronDown, 
  Monitor, 
  Loader2, 
  Calculator
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import 'katex/dist/katex.min.css';

// --- Markdown Helpers Start ---
const insertMarkdown = (
  ref: React.RefObject<HTMLTextAreaElement>, 
  setter: React.Dispatch<React.SetStateAction<any>>, 
  form: any, 
  field: string, 
  type: string,
  value?: string
) => {
  const textarea = ref.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = form[field] || '';
  const selectedText = text.substring(start, end);

  let insertion = '';
  let newCursorPos = start;

  switch (type) {
    case 'bold':
      insertion = `**${selectedText || 'bold text'}**`;
      newCursorPos = start + 2;
      break;
    case 'italic':
      insertion = `*${selectedText || 'italic text'}*`;
      newCursorPos = start + 1;
      break;
    case 'heading':
      insertion = `\n### ${selectedText || 'Heading'}\n`;
      newCursorPos = start + 5;
      break;
    case 'list':
      insertion = `\n- ${selectedText || 'list item'}\n`;
      newCursorPos = start + 3;
      break;
    case 'table':
      const [rows, cols] = (value || '2,2').split(',').map(Number);
      let header = '|';
      let separator = '|';
      for (let i = 0; i < cols; i++) {
        header += ` Tiêu đề ${i + 1} |`;
        separator += '---|';
      }
      insertion = `\n${header}\n${separator}\n`;
      for (let r = 0; r < rows; r++) {
        insertion += '|';
        for (let c = 0; c < cols; c++) {
          insertion += ' ... |';
        }
        insertion += '\n';
      }
      newCursorPos = start + insertion.length;
      break;
    case 'link':
      insertion = `[${selectedText || 'link name'}](https://example.com)`;
      newCursorPos = start + 1;
      break;
    case 'image':
      insertion = `![${selectedText || 'mô tả ảnh'}](https://example.com/image.jpg)`;
      newCursorPos = start + 2;
      break;
    case 'formula':
      const formulaPattern = value || 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}';
      const formulaPrefix = '\n$$ ';
      insertion = `${formulaPrefix}${selectedText || formulaPattern} $$\n`;
      newCursorPos = start + formulaPrefix.length;
      break;
    case 'align-left':
      insertion = `:::left\n${selectedText || 'left aligned text'}\n:::`;
      newCursorPos = start + 8;
      break;
    case 'align-center':
      insertion = `:::center\n${selectedText || 'center aligned text'}\n:::`;
      newCursorPos = start + 10;
      break;
    case 'align-right':
      insertion = `:::right\n${selectedText || 'right aligned text'}\n:::`;
      newCursorPos = start + 9;
      break;
    case 'align-justify':
      insertion = `:::justify\n${selectedText || 'justified text'}\n:::`;
      newCursorPos = start + 11;
      break;
    case 'font-size': {
      const size = value || '16px';
      const prefix = `<span style="font-size: ${size}">`;
      insertion = `${prefix}${selectedText || 'văn bản'}</span>`;
      newCursorPos = start + prefix.length;
      break;
    }
    case 'font-family': {
      const font = value || "'Inter', sans-serif";
      const prefix = `<span style="font-family: ${font}">`;
      insertion = `${prefix}${selectedText || 'văn bản'}</span>`;
      newCursorPos = start + prefix.length;
      break;
    }
    case 'text-color': {
      const color = value || 'blue';
      const prefix = `<span style="color: ${color}">`;
      insertion = `${prefix}${selectedText || 'văn bản'}</span>`;
      newCursorPos = start + prefix.length;
      break;
    }
    default:
      return;
  }

  const newText = text.substring(0, start) + insertion + text.substring(end);
  setter({ ...form, [field]: newText });

  setTimeout(() => {
    textarea.focus();
    if (type === 'table' || type === 'heading') {
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    } else {
      const contentText = selectedText || 
                          (type === 'bold' ? 'bold text' : 
                          type === 'italic' ? 'italic text' :
                          type === 'image' ? 'mô tả ảnh' :
                          (type === 'font-size' || type === 'font-family' || type === 'text-color') ? 'văn bản' :
                          type === 'formula' ? (value || 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}') :
                          'text');
      textarea.setSelectionRange(newCursorPos, newCursorPos + contentText.length);
    }
  }, 0);
};

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  setter: React.Dispatch<React.SetStateAction<any>>;
  form: any;
  field: string;
  isUploading: boolean;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<any>>,
    form: any,
    field: string,
    refTextarea?: React.RefObject<HTMLTextAreaElement>
  ) => Promise<void>;
  onShowInternalLinkPicker?: () => void;
}

const MarkdownToolbar = ({ 
  textareaRef, 
  setter, 
  form, 
  field,
  isUploading,
  handleFileUpload,
  onShowInternalLinkPicker
}: MarkdownToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMenu, setActiveMenu] = useState<'size' | 'font' | 'color' | 'table' | 'formula' | null>(null);
  const [tableGrid, setTableGrid] = useState({ rows: 2, cols: 2 });

  const fontSizes = [
    { label: 'XS (12PX)', value: '12px' },
    { label: 'SM (14PX)', value: '14px' },
    { label: 'REG (16PX)', value: '16px' },
    { label: 'LG (20PX)', value: '20px' },
    { label: 'XL (24PX)', value: '24px' },
    { label: '2XL (32PX)', value: '32px' },
    { label: '3XL (48PX)', value: '48px' },
  ];

  const fontFamilies = [
    { label: 'Sans (Inter)', value: "'Inter', sans-serif" },
    { label: 'Serif (Times)', value: "'Times New Roman', serif" },
    { label: 'Mono (Space)', value: "'Space Mono', monospace" },
    { label: 'Display (Outfit)', value: "'Outfit', sans-serif" },
  ];

  const colors = [
    { label: 'Đen', value: '#000000', class: 'bg-black' },
    { label: 'Xám', value: '#64748b', class: 'bg-slate-500' },
    { label: 'Đỏ', value: '#ef4444', class: 'bg-red-500' },
    { label: 'Cam', value: '#f97316', class: 'bg-orange-500' },
    { label: 'Vàng', value: '#eab308', class: 'bg-yellow-500' },
    { label: 'Xanh lá', value: '#22c55e', class: 'bg-green-500' },
    { label: 'Xanh dương', value: '#3b82f6', class: 'bg-blue-500' },
    { label: 'Tím', value: '#a855f7', class: 'bg-purple-500' },
    { label: 'Hồng', value: '#ec4899', class: 'bg-pink-500' },
  ];

  const formulas = [
    { label: 'Phân số', value: '\\frac{a}{b}', display: 'a/b' },
    { label: 'Căn bậc 2', value: '\\sqrt{x}', display: '√x' },
    { label: 'Căn bậc n', value: '\\sqrt[n]{x}', display: 'ⁿ√x' },
    { label: 'Mũ', value: 'x^{n}', display: 'xⁿ' },
    { label: 'Số hạ', value: 'x_{i}', display: 'xᵢ' },
    { label: 'Tổng (Σ)', value: '\\sum_{i=1}^{n} x_i', display: 'Σ' },
    { label: 'Tích phân (∫)', value: '\\int_{a}^{b} f(x) dx', display: '∫' },
    { label: 'Giới hạn (lim)', value: '\\lim_{x \\to \\infty} f(x)', display: 'lim' },
    { label: 'Vector', value: '\\vec{v}', display: '→v' },
    { label: 'Góc', value: '\\hat{A}', display: '∠A' },
    { label: 'Tam giác', value: '\\Delta ABC', display: 'Δ' },
    { label: 'Hệ phương trình', value: '\\begin{cases} x+y=1 \\\\ x-y=0 \\end{cases}', display: '{' },
  ];

  return (
    <div className="flex flex-wrap gap-1 mb-0 p-1.5 bg-white rounded-t-xl border border-slate-200 border-b-0">
      <div className="flex items-center gap-1 pr-2 border-r border-slate-100">
        <button type="button" onClick={() => insertMarkdown(textareaRef, setter, form, field, 'bold')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Bôi đậm">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => insertMarkdown(textareaRef, setter, form, field, 'italic')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="In nghiêng">
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => insertMarkdown(textareaRef, setter, form, field, 'heading')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Tiêu đề">
          <Heading3 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-slate-100">
        <button type="button" onClick={() => insertMarkdown(textareaRef, setter, form, field, 'list')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Danh sách">
          <List className="w-4 h-4" />
        </button>
        
        {/* Table Dropdown */}
        <div className="relative">
          <button 
            type="button" 
            onClick={() => setActiveMenu(activeMenu === 'table' ? null : 'table')}
            className={`p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 ${activeMenu === 'table' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
            title="Bảng biểu"
          >
            <Table2 className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {activeMenu === 'table' && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] p-4 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Kích thước bảng</p>
              
              <div className="flex flex-col gap-4">
                {/* Visual Grid Selector */}
                <div className="grid grid-cols-10 gap-1 mb-2">
                  {[...Array(50)].map((_, i) => {
                    const r = Math.floor(i / 10) + 1;
                    const c = (i % 10) + 1;
                    const isActive = r <= tableGrid.rows && c <= tableGrid.cols;
                    return (
                      <div 
                        key={i}
                        onMouseEnter={() => setTableGrid({ rows: r, cols: c })}
                        onClick={() => {
                          insertMarkdown(textareaRef, setter, form, field, 'table', `${r},${c}`);
                          setActiveMenu(null);
                        }}
                        className={`w-4 h-4 border rounded-sm cursor-pointer transition-colors ${isActive ? 'bg-blue-500 border-blue-600' : 'bg-slate-50 border-slate-200 hover:bg-blue-100'}`}
                      />
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-between gap-4 border-t border-slate-50 pt-3">
                  <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{tableGrid.rows} dòng x {tableGrid.cols} cột</span>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      min="1" 
                      max="50" 
                      value={tableGrid.rows} 
                      onChange={e => setTableGrid({...tableGrid, rows: Math.min(50, Math.max(1, parseInt(e.target.value) || 1))})}
                      className="w-10 p-1 border rounded text-[10px] font-bold text-center"
                    />
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      value={tableGrid.cols} 
                      onChange={e => setTableGrid({...tableGrid, cols: Math.min(10, Math.max(1, parseInt(e.target.value) || 1))})}
                      className="w-10 p-1 border rounded text-[10px] font-bold text-center"
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    insertMarkdown(textareaRef, setter, form, field, 'table', `${tableGrid.rows},${tableGrid.cols}`);
                    setActiveMenu(null);
                  }}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Chèn ({tableGrid.rows}x{tableGrid.cols})
                </button>
              </div>
            </div>
          )}
        </div>

        <button type="button" onClick={() => insertMarkdown(textareaRef, setter, form, field, 'link')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Chèn liên kết">
          <LinkIcon className="w-4 h-4" />
        </button>

        {/* Formula Dropdown */}
        <div className="relative">
          <button 
            type="button" 
            onClick={() => setActiveMenu(activeMenu === 'formula' ? null : 'formula')}
            className={`p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 ${activeMenu === 'formula' ? 'bg-orange-50 text-orange-600' : 'text-slate-600'}`}
            title="Công thức Toán học (LaTeX)"
          >
            <Calculator className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {activeMenu === 'formula' && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] p-3 grid grid-cols-3 gap-1.5 animate-in fade-in zoom-in-95 duration-200">
              <p className="col-span-3 text-[10px] font-black uppercase text-slate-400 p-1tracking-widest border-b border-slate-50 mb-1 flex items-center justify-between">
                <span>Công thức LaTeX</span>
                <span className="text-[8px] font-black bg-orange-100 text-orange-600 px-1 rounded">PRO</span>
              </p>
              {formulas.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => {
                    insertMarkdown(textareaRef, setter, form, field, 'formula', f.value);
                    setActiveMenu(null);
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-orange-50 border border-transparent hover:border-orange-100 transition-all gap-1.5 group h-16"
                >
                  <span className="text-[12px] font-black font-mono text-orange-600 group-hover:scale-110 transition-transform">{f.display}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate w-full text-center group-hover:text-slate-600">{f.label}</span>
                </button>
              ))}
              <div className="col-span-3 mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                 <p className="text-[8px] text-slate-500 font-medium leading-tight">
                   Mẹo: Bạn có thể nhập công thức LaTeX trực tiếp giữa hai cặp dấu $$ (vd: $$ x^2 $$) để hiển thị công thức toán.
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-slate-100">
        <button type="button" onClick={() => insertMarkdown(textareaRef, setter, form, field, 'align-left')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Canh trái">
          <AlignLeft className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => insertMarkdown(textareaRef, setter, form, field, 'align-center')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Canh giữa">
          <AlignCenter className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => insertMarkdown(textareaRef, setter, form, field, 'align-right')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Canh phải">
          <AlignRight className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => insertMarkdown(textareaRef, setter, form, field, 'align-justify')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" title="Canh đều">
          <div className="flex flex-col gap-0.5 items-center">
            <div className="w-4 h-[1.5px] bg-current"></div>
            <div className="w-4 h-[1.5px] bg-current"></div>
            <div className="w-4 h-[1.5px] bg-current"></div>
            <div className="w-3 h-[1.5px] bg-current mr-auto"></div>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-1 pl-2">
        {/* Size Dropdown */}
        <div className="relative">
          <button 
            type="button" 
            onClick={() => setActiveMenu(activeMenu === 'size' ? null : 'size')}
            className={`p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 ${activeMenu === 'size' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
          >
            <Type className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Size</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === 'size' ? 'rotate-180' : ''}`} />
          </button>
          
          {activeMenu === 'size' && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {fontSizes.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    insertMarkdown(textareaRef, setter, form, field, 'font-size', s.value);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Dropdown */}
        <div className="relative">
          <button 
            type="button" 
            onClick={() => setActiveMenu(activeMenu === 'font' ? null : 'font')}
            className={`p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 ${activeMenu === 'font' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
          >
            <Type className="w-4 h-4 opacity-50" />
            <span className="text-[10px] font-black uppercase tracking-wider">Font</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === 'font' ? 'rotate-180' : ''}`} />
          </button>
          
          {activeMenu === 'font' && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {fontFamilies.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  style={{ fontFamily: f.value }}
                  onClick={() => {
                    insertMarkdown(textareaRef, setter, form, field, 'font-family', f.value);
                    setActiveMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Dropdown */}
        <div className="relative">
          <button 
            type="button" 
            onClick={() => setActiveMenu(activeMenu === 'color' ? null : 'color')}
            className={`p-2 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 ${activeMenu === 'color' ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
          >
            <Palette className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-wider">Color</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === 'color' ? 'rotate-180' : ''}`} />
          </button>
          
          {activeMenu === 'color' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-[100] p-3 grid grid-cols-3 gap-2 animate-in fade-in zoom-in-95 duration-200">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    insertMarkdown(textareaRef, setter, form, field, 'text-color', c.value);
                    setActiveMenu(null);
                  }}
                  className="group flex flex-col items-center gap-1"
                >
                  <div className={`w-10 h-10 rounded-lg ${c.class} shadow-sm border border-black/5 group-hover:scale-110 transition-transform`} />
                  <span className="text-[8px] font-black text-slate-400 group-hover:text-slate-900 uppercase">{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-100 mx-2" />

        <button 
          type="button" 
          onClick={() => insertMarkdown(textareaRef, setter, form, field, 'image')}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors relative" 
          title="Chèn liên kết ảnh (URL)"
        >
          <LinkIcon className="w-4 h-4" />
          <ImageIcon className="w-2.5 h-2.5 absolute top-1 right-1 bg-white rounded-full" />
        </button>

        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/*,application/pdf"
          onChange={(e) => handleFileUpload(e, setter, form, field, textareaRef)}
        />
        
        <button 
          type="button" 
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()} 
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors disabled:opacity-50" 
          title="Tải ảnh/tài liệu lên"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : <ImageIcon className="w-4 h-4" />}
        </button>
        
        <button 
          type="button" 
          onClick={onShowInternalLinkPicker}
          className="p-2 hover:bg-slate-100 rounded-lg text-orange-600 transition-colors flex items-center gap-1 group" 
          title="Liên kết nội bộ"
        >
          <Search className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-wider">Link</span>
        </button>
      </div>
    </div>
  );
};

export const MarkdownContent = ({ content }: { content: string }) => {
  if (!content) return null;
  
  const parts = content.split(/(:::(?:center|right|left|justify)[\s\S]*?:::)/g);
  
  const sharedComponents = {
    img: ({ node, ...props }: any) => (
      <img 
        {...props} 
        className="max-w-full h-auto rounded-xl shadow-sm my-2 mx-auto block" 
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    ),
    a: ({ node, ...props }: any) => (
      <a 
        {...props} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-600 hover:underline font-medium"
      />
    ),
    span: ({ node, ...props }: any) => {
      const style = props.style || {};
      return <span {...props} style={style} />;
    }
  };

  const sharedPlugins = {
    remarkPlugins: [remarkMath, remarkGfm, remarkBreaks],
    rehypePlugins: [rehypeKatex, rehypeRaw]
  };

  return (
    <div className="markdown-body prose prose-slate prose-sm max-w-none">
      {parts.map((part, index) => {
        if (part.startsWith(':::center')) {
          const inner = part.replace(/^:::center\n?/, '').replace(/\n?:::$/, '').trim();
          return (
            <div key={index} className="flex flex-col items-center text-center w-full my-4">
              <ReactMarkdown {...sharedPlugins} components={sharedComponents}>{inner}</ReactMarkdown>
            </div>
          );
        }
        if (part.startsWith(':::right')) {
          const inner = part.replace(/^:::right\n?/, '').replace(/\n?:::$/, '').trim();
          return (
            <div key={index} className="flex flex-col items-end text-right w-full my-4">
              <ReactMarkdown {...sharedPlugins} components={sharedComponents}>{inner}</ReactMarkdown>
            </div>
          );
        }
        if (part.startsWith(':::left')) {
          const inner = part.replace(/^:::left\n?/, '').replace(/\n?:::$/, '').trim();
          return (
            <div key={index} className="flex flex-col items-start text-left w-full my-4">
              <ReactMarkdown {...sharedPlugins} components={sharedComponents}>{inner}</ReactMarkdown>
            </div>
          );
        }
        if (part.startsWith(':::justify')) {
          const inner = part.replace(/^:::justify\n?/, '').replace(/\n?:::$/, '').trim();
          return (
            <div key={index} className="flex flex-col w-full my-4 text-justify">
              <ReactMarkdown {...sharedPlugins} components={sharedComponents}>{inner}</ReactMarkdown>
            </div>
          );
        }
        if (!part.trim()) return null;
        return (
          <ReactMarkdown key={index} {...sharedPlugins} components={sharedComponents}>{part}</ReactMarkdown>
        );
      })}
    </div>
  );
};

export const MarkdownEditorWithPreview = ({
  textareaRef,
  setter,
  form,
  field,
  isUploading,
  handleFileUpload,
  onShowInternalLinkPicker,
  placeholder,
  rows = 15,
  label
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  setter: React.Dispatch<React.SetStateAction<any>>;
  form: any;
  field: string;
  isUploading: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<any>>, form: any, field: string, refTextarea?: React.RefObject<HTMLTextAreaElement>) => Promise<void>;
  onShowInternalLinkPicker?: () => void;
  placeholder?: string;
  rows?: number;
  label: string;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-black text-slate-700 uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Monitor className="w-3 h-3" /> Chế độ xem trước thời gian thực
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-[500px]">
        {/* Editor Side */}
        <div className="flex flex-col h-full">
          <MarkdownToolbar 
            textareaRef={textareaRef}
            setter={setter}
            form={form}
            field={field}
            isUploading={isUploading}
            handleFileUpload={handleFileUpload}
            onShowInternalLinkPicker={onShowInternalLinkPicker}
          />
          <textarea 
            ref={textareaRef}
            className="w-full flex-1 p-6 bg-slate-50 border border-slate-200 border-t-0 rounded-b-xl text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm leading-relaxed"
            rows={rows}
            placeholder={placeholder}
            value={form[field] || ''}
            onChange={(e) => setter({ ...form, [field]: e.target.value })}
          />
        </div>
        {/* Preview Side */}
        <div className="flex flex-col h-full">
          <div className="p-3.5 bg-slate-50 border border-slate-200 border-b-0 rounded-t-xl flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Bản xem trước (Preview)</span>
          </div>
          <div className="w-full flex-1 p-6 bg-white border border-slate-200 border-t-0 rounded-b-xl overflow-y-auto max-h-[600px]">
            {form[field] ? (
              <MarkdownContent content={form[field]} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 italic text-sm">
                Nội dung xem trước sẽ hiển thị tại đây...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
