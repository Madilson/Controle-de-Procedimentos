import React, { useRef, useState } from 'react';
import CogIcon from './icons/CogIcon';
import TrashIcon from './icons/TrashIcon';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogo: string | null;
  onSaveLogo: (logoDataUrl: string | null) => void;
  currentBanner: string | null;
  onSaveBanner: (bannerDataUrl: string | null) => void;
}

const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
  currentLogo,
  onSaveLogo,
  currentBanner,
  onSaveBanner
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (file.type !== 'image/png') {
      setError('Por favor, envie apenas arquivos PNG.');
      return;
    }

    // Check file size (limit to ~2MB to be safe with localStorage)
    if (file.size > 2 * 1024 * 1024) {
       setError('A imagem é muito grande. O limite é 2MB.');
       return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === 'logo') {
          onSaveLogo(result);
      } else {
          onSaveBanner(result);
      }
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    onSaveLogo(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleRemoveBanner = () => {
    onSaveBanner(null);
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
             <CogIcon className="w-6 h-6" />
             Configurações do Sistema
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
            {/* Logo Section */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logomarca da Empresa
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Substitui o título na tela inicial e de login. (PNG, max 2MB)
                </p>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                    {currentLogo ? (
                        <div className="relative">
                            <img src={currentLogo} alt="Logo Preview" className="max-h-24 object-contain" />
                            <button 
                                onClick={handleRemoveLogo}
                                className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full shadow-sm hover:bg-red-200"
                                title="Remover logo"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 text-sm">
                            <span>Sem logo</span>
                        </div>
                    )}
                    
                    <div className="mt-4 w-full">
                        <input 
                            type="file" 
                            accept="image/png"
                            ref={logoInputRef}
                            onChange={(e) => handleFileChange(e, 'logo')}
                            className="block w-full text-sm text-gray-500 dark:text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-xs file:font-semibold
                                file:bg-primary-50 file:text-primary-700
                                hover:file:bg-primary-100
                            "
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700"></div>

             {/* Banner Section */}
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Banner do Dashboard
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Exibido no topo da página inicial. (PNG, max 2MB)
                </p>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                    {currentBanner ? (
                        <div className="relative w-full">
                            <img src={currentBanner} alt="Banner Preview" className="w-full h-32 object-cover rounded-md" />
                            <button 
                                onClick={handleRemoveBanner}
                                className="absolute top-2 right-2 bg-red-100 text-red-600 p-1 rounded-full shadow-sm hover:bg-red-200"
                                title="Remover banner"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 text-sm">
                            <span>Sem banner</span>
                        </div>
                    )}
                    
                    <div className="mt-4 w-full">
                        <input 
                            type="file" 
                            accept="image/png"
                            ref={bannerInputRef}
                            onChange={(e) => handleFileChange(e, 'banner')}
                            className="block w-full text-sm text-gray-500 dark:text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-xs file:font-semibold
                                file:bg-primary-50 file:text-primary-700
                                hover:file:bg-primary-100
                            "
                        />
                    </div>
                </div>
            </div>
            
            {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg flex justify-end">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
                Fechar
            </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsModal;