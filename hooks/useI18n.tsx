import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Explicitly supported languages requested by the user
export const supportedLanguages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'st', name: 'Sesotho', native: 'Sesotho' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' }
];

const INTERNAL_FALLBACKS: any = {
    en: {
        "app.title": "Attendance System",
        "auth.login_tab": "Login",
        "auth.signup_tab": "Sign Up",
        "auth.employee_tab": "Quick ID",
        "auth.email": "Email Address",
        "auth.password": "Password",
        "auth.login_button": "Log In",
        "auth.logging_in": "Logging in...",
        "auth.login_subtitle": "Login to manage your team",
        "sidebar.dashboard": "Dashboard"
    }
};

interface I18nContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string, replacements?: { [key: string]: string | number }, options?: { defaultValue?: string }) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getNested = (obj: any, path: string): string | undefined => {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState('en');
    const [translations, setTranslations] = useState<any>({});
    const [fallbackTranslations, setFallbackTranslations] = useState<any>(INTERNAL_FALLBACKS.en);

    useEffect(() => {
        const savedLang = localStorage.getItem('language');
        if (savedLang && supportedLanguages.some(l => l.code === savedLang)) {
            setLanguageState(savedLang);
        } else {
            const browserLang = navigator.language.split(/[-_]/)[0];
            if (supportedLanguages.some(l => l.code === browserLang)) {
                setLanguageState(browserLang);
            }
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                // Try to load local locale file
                const response = await fetch(`./locales/${language}.json`);
                if (response.ok) {
                    const json = await response.json();
                    setTranslations(json);
                } else {
                    // If specific locale fails, use internal English fallback
                    setTranslations(INTERNAL_FALLBACKS.en);
                }
            } catch (error) {
                console.warn(`I18n Fetch Error for ${language}, using fallbacks.`);
                setTranslations(INTERNAL_FALLBACKS.en);
            }
        };

        load();
    }, [language]);

    const setLanguage = (lang: string) => {
        if (supportedLanguages.some(l => l.code === lang)) {
            setLanguageState(lang);
            localStorage.setItem('language', lang);
        }
    };

    const t = useCallback((key: string, replacements?: { [key: string]: string | number }, options?: { defaultValue?: string }) => {
        let translation = getNested(translations, key) || getNested(fallbackTranslations, key);

        if (typeof translation !== 'string') {
            return options?.defaultValue || key; 
        }

        if (replacements) {
            Object.keys(replacements).forEach(rKey => {
                translation = (translation as string).replace(`{${rKey}}`, String(replacements[rKey]));
            });
        }
        return translation;
    }, [translations, fallbackTranslations]);
    
    useEffect(() => {
        document.title = t('app.title') || 'Attendance System';
    }, [t, language]);

    const value = { language, setLanguage, t };

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextType => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};