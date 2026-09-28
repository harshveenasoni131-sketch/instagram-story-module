import React, { useState } from 'react';
import './LanguageSettings.css';

export default function LanguageSettings() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationChannel, setVerificationChannel] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Supported languages list
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'hi', name: 'Hindi' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'fr', name: 'French (Requires Email OTP)' }
  ];

  // Fully comprehensive UI Translation Dictionary
  const translations = {
    en: {
      title: "Language Settings",
      choose: "Choose your preferred language:",
      button: "Change Language",
      processing: "Processing...",
      modalTitle: "Enter Verification Code",
      otpSentMobile: "OTP sent to your Mobile Number.",
      otpSentEmail: "OTP sent to your Email (French Request).",
      otpPlaceholder: "Enter 6-digit OTP",
      verifyButton: "Verify & Save"
    },
    es: {
      title: "Configuración de Idioma",
      choose: "Elige tu idioma preferido:",
      button: "Cambiar Idioma",
      processing: "Procesando...",
      modalTitle: "Introduce el código de verificación",
      otpSentMobile: "OTP enviado a tu número de móvil.",
      otpSentEmail: "OTP enviado a tu correo electrónico (Solicitud en francés).",
      otpPlaceholder: "Ingresa OTP de 6 dígitos",
      verifyButton: "Verificar y Guardar"
    },
    hi: {
      title: "भाषा सेटिंग्स",
      choose: "अपनी पसंदीदा भाषा चुनें:",
      button: "भाषा बदलें",
      processing: "प्रक्रिया हो रही है...",
      modalTitle: "सत्यापन कोड दर्ज करें",
      otpSentMobile: "आपके मोबाइल नंबर पर ओटीपी भेज दिया गया है।",
      otpSentEmail: "आपके ईमेल पर ओटीपी भेज दिया गया है (फ्रेंच अनुरोध)।",
      otpPlaceholder: "6-अंकों का ओटीपी दर्ज करें",
      verifyButton: "सत्यापित करें और सहेजें"
    },
    pt: {
      title: "Configurações de Idioma",
      choose: "Escolha seu idioma preferido:",
      button: "Mudar Idioma",
      processing: "Processando...",
      modalTitle: "Digite o Código de Verificação",
      otpSentMobile: "OTP enviado para o seu número de telemóvel.",
      otpSentEmail: "OTP enviado para o seu e-mail (Pedido em francês).",
      otpPlaceholder: "Digite o OTP de 6 dígitos",
      verifyButton: "Verificar e Salvar"
    },
    zh: {
      title: "语言设置",
      choose: "选择您的首选语言：",
      button: "更改语言",
      processing: "处理中...",
      modalTitle: "输入验证码",
      otpSentMobile: "验证码已发送至您的手机号码。",
      otpSentEmail: "验证码已发送至您的电子邮箱（法语请求）。",
      otpPlaceholder: "输入6位数验证码",
      verifyButton: "验证并保存"
    },
    fr: {
      title: "Paramètres de langue",
      choose: "Choisissez votre langue préférée :",
      button: "Changer de langue",
      processing: "Traitement...",
      modalTitle: "Entrer le code de vérification",
      otpSentMobile: "OTP envoyé sur votre numéro de mobile.",
      otpSentEmail: "OTP envoyé sur votre e-mail (Demande en français).",
      otpPlaceholder: "Entrer l'OTP à 6 chiffres",
      verifyButton: "Vérifier et Enregistrer"
    }
  };

  // Get current active translation pack
  const t = translations[selectedLanguage] || translations['en'];

  // Step 1: Request Language Change & Trigger OTP
  const handleRequestChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/language/request-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user_123', language: selectedLanguage })
      });

      const data = await response.json();
      if (data.success) {
        setVerificationChannel(data.verificationChannel);
        setIsModalOpen(true);
        setMessage(data.message);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Finalize Language Switch
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/language/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user_123', otp: otp, newLanguage: selectedLanguage })
      });

      const data = await response.json();
      setMessage(data.message);

      if (data.success) {
        setIsModalOpen(false);
        setOtp('');
      }
    } catch (error) {
      setMessage('Error verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="language-settings-container" style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>{t.title}</h2>
      <form onSubmit={handleRequestChange}>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          {t.choose}
        </label>
        <select 
          value={selectedLanguage} 
          onChange={(e) => setSelectedLanguage(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: '#0095f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? t.processing : t.button}
        </button>
      </form>

      {message && <p style={{ marginTop: '15px', fontSize: '14px' }}>{message}</p>}

      {/* OTP Verification Modal */}
      {isModalOpen && (
        <div className="otp-modal" style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '6px', background: '#f9f9f9' }}>
          <h3>{t.modalTitle}</h3>
          <p style={{ fontSize: '12px', color: '#666' }}>
            {verificationChannel === 'email' ? t.otpSentEmail : t.otpSentMobile}
          </p>
          <form onSubmit={handleVerifyOtp}>
            <input 
              type="text" 
              placeholder={t.otpPlaceholder}
              value={otp} 
              onChange={(e) => setOtp(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {t.verifyButton}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}