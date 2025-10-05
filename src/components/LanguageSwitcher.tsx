
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <Globe size={16} className="text-gray-600" />
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-auto border-none shadow-none p-0 h-auto bg-transparent focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pt">{t('language.portuguese')}</SelectItem>
          <SelectItem value="en">{t('language.english')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
