import React from 'react';

export interface AdminManagerProps {
  supabase: any;
  user: any;
  loading: boolean;
  setLoading: (l: boolean) => void;
  showSuccess: (msg?: string) => void;
  showAlert: (title: string, msg: string) => void;
  showConfirm: (title: string, msg: string, onConfirm: () => void) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, setter: any, form: any, field: string) => Promise<void>;
  isUploading: boolean;
  fetchPickerData: () => void;
  setShowLinkPicker: (config: any) => void;
  activeTab: string;
}
