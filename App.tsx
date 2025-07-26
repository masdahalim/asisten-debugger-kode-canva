import React, { useState, useCallback, ChangeEvent, useEffect } from 'react';
import { analyzeCanvaCode } from './services/geminiService';
import ResultDisplay from './components/ResultDisplay';
import Spinner from './components/Spinner';
import { UploadIcon, SparklesIcon, ErrorIcon, SunIcon, MoonIcon } from './components/icons';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedTheme = window.localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  };

  const handleSubmit = useCallback(async () => {
    if (!prompt && !image) {
      setError('Harap masukkan prompt kode atau unggah gambar untuk dianalisis.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setAnalysis('');
    
    try {
      const result = await analyzeCanvaCode(prompt, image);
      setAnalysis(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan yang tidak diketahui.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, image]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-300 transition-colors duration-300">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-500 via-cyan-500 to-teal-400 bg-clip-text text-transparent">
            Asisten Debugger Kode Canva
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Partner AI Anda untuk men-debug dan menyempurnakan prompt Canva Code.
          </p>
           <div className="flex items-center justify-center gap-6 mt-4">
             <a href="https://www.threads.com/@masdahalim" target="_blank" rel="noopener noreferrer" className="text-sm text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300 transition-colors">
              Created by Masda Halim
            </a>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </button>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Input Panel */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">1. Masukkan Kode Anda</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
                  Tempel prompt Anda (HTML, JSON, dll.)
                </label>
                <textarea
                  id="prompt-input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="<Card padding={...}>...</Card>"
                  className="w-full h-64 p-3 font-mono text-sm bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out text-gray-900 dark:text-white"
                  aria-label="Input Prompt Kode"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">
                  Unggah screenshot error (opsional)
                </label>
                {imagePreview ? (
                  <div className="relative group">
                    <img src={imagePreview} alt="Pratinjau Gambar" className="w-full rounded-lg border border-gray-300 dark:border-slate-600" />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Hapus gambar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="file-upload"
                    className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-slate-900 dark:hover:bg-slate-700 transition"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon />
                        <p className="mb-2 text-sm text-gray-500 dark:text-slate-500"><span className="font-semibold text-teal-500 dark:text-teal-400">Klik untuk mengunggah</span> atau seret file</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500">PNG, JPG, atau GIF</p>
                    </div>
                    <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || (!prompt && !image)}
              className="mt-6 w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Menganalisis...
                </>
              ) : (
                <>
                  <SparklesIcon />
                  Analisis Kode
                </>
              )}
            </button>
          </div>
          
          {/* Output Panel */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700">
             <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">2. Dapatkan Analisis AI</h2>
            <div className="h-full min-h-[30rem] bg-gray-100 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-gray-400 dark:text-slate-500">
                    <Spinner size="lg"/>
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-slate-400">AI sedang menganalisis kode Anda...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-red-500 dark:text-red-400">
                    <ErrorIcon />
                    <p className="mt-4 font-semibold">Terjadi Kesalahan</p>
                    <p className="text-sm">{error}</p>
                </div>
              ) : analysis ? (
                <ResultDisplay analysis={analysis} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                    <SparklesIcon className="h-12 w-12 text-teal-500/80 dark:text-teal-600/60 mb-4" />
                    <p className="font-semibold text-gray-600 dark:text-slate-400">Hasil analisis Anda akan muncul di sini.</p>
                    <p className="text-sm">Masukkan kode dan/atau gambar untuk memulai.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;