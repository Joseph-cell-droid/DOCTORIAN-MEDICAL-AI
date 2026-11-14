import { isMarianMTModeActive, runMarianInference } from './marianMT';

export interface TranslationKeys {
  // Page / Tab Titles
  'Dashboard': string;
  'Doctorian Neural Core': string;
  'Genomic Longevity Core': string;
  'Medical Illustrator': string;
  'CognisHub Node': string;
  'Biomatic Sandbox': string;
  'Diagnostic Lab': string;
  'Bio-Monitor Console': string;
  'Health Progress Trace': string;
  'Vitality Matrix': string;
  'Bio-Pharmacy Depot': string;
  'Connect Specialists': string;
  'Systems Information': string;
  'Admin Command Matrix': string;
  'Systems Hub': string;

  // Sidebar Titles
  'Clinical Systems Hub': string;
  'Clinical Core': string;
  'Diagnostics & Labs': string;
  'Clinics & Systems': string;

  // UI Action Words & Placeholders
  'Search System...': string;
  'Active System': string;
  'Cache Core': string;
  'Linguistic Matrix': string;
  'Select primary interface dialect': string;
  'Welcome Dr.': string;
  'Workspace Status: Active': string;
  'Quick Diagnostics Panel': string;
  'Hands-free Listening Active': string;
  'Ask Doctorian Anything...': string;
  'Active Session': string;
  'Settings': string;
  'Emergency SOS': string;
  'Clinical Systems Information': string;
  [key: string]: string;
}

export type LanguageCode = 
  | 'English (US)' 
  | 'English (UK)' 
  | 'Spanish' 
  | 'French' 
  | 'German' 
  | 'Chinese' 
  | 'Hindi' 
  | 'Arabic' 
  | 'Portuguese' 
  | 'Swahili' 
  | 'Luganda' 
  | 'Runyankole-Rukiga'
  | 'Acholi-Luo'
  | 'Langi'
  | 'Iteso'
  | 'Lusoga'
  | 'Lugbara'
  | 'Runyoro-Rutooro'
  | 'Rukonjo'
  | 'Samia'
  | 'Karamojong'
  | 'Russian'
  | 'Japanese'
  | 'Korean'
  | 'Italian'
  | 'Turkish';

export const translations: Record<LanguageCode, TranslationKeys> = {
  'English (US)': {
    'Dashboard': 'Dashboard',
    'Doctorian Neural Core': 'Doctorian Neural Core',
    'Genomic Longevity Core': 'Genomic Longevity Core',
    'Medical Illustrator': 'Medical Illustrator',
    'CognisHub Node': 'CognisHub Node',
    'Biomatic Sandbox': 'Biomatic Sandbox',
    'Diagnostic Lab': 'Diagnostic Lab',
    'Bio-Monitor Console': 'Bio-Monitor Console',
    'Health Progress Trace': 'Health Progress Trace',
    'Vitality Matrix': 'Vitality Matrix',
    'Bio-Pharmacy Depot': 'Bio-Pharmacy Depot',
    'Connect Specialists': 'Connect Specialists',
    'Systems Information': 'Systems Information',
    'Admin Command Matrix': 'Admin Command Matrix',
    'Systems Hub': 'Systems Hub',
    'Clinical Systems Hub': 'Clinical Systems Hub',
    'Clinical Core': 'Clinical Core',
    'Diagnostics & Labs': 'Diagnostics & Labs',
    'Clinics & Systems': 'Clinics & Systems',
    'Search System...': 'Search System...',
    'Active System': 'Active System',
    'Cache Core': 'Cache Core',
    'Linguistic Matrix': 'Linguistic Matrix',
    'Select primary interface dialect': 'Select primary interface dialect',
    'Welcome Dr.': 'Welcome Dr.',
    'Workspace Status: Active': 'Workspace Status: Active',
    'Quick Diagnostics Panel': 'Quick Diagnostics Panel',
    'Hands-free Listening Active': 'Hands-free Listening Active',
    'Ask Doctorian Anything...': 'Ask Doctorian Anything...',
    'Active Session': 'Active Session',
    'Settings': 'Settings',
    'Emergency SOS': 'Emergency SOS',
    'Clinical Systems Information': 'Clinical Systems Information',
    'Medical Image Analyzer': 'Medical Image Analyzer',
    'Medication Adherence': 'Medication Adherence',
    'Clinical Safety Disclaimer': 'Clinical Safety Disclaimer',
    'Guest Mode': 'Guest Mode',
    'Uganda DPPA 2019': 'Uganda DPPA 2019'
  },
  'English (UK)': {
    'Dashboard': 'Dashboard',
    'Doctorian Neural Core': 'Doctorian Neural Core',
    'Genomic Longevity Core': 'Genomic Longevity Core',
    'Medical Illustrator': 'Medical Illustrator',
    'CognisHub Node': 'CognisHub Node',
    'Biomatic Sandbox': 'Biomatic Sandbox',
    'Diagnostic Lab': 'Diagnostic Lab',
    'Bio-Monitor Console': 'Bio-Monitor Console',
    'Health Progress Trace': 'Health Progress Trace',
    'Vitality Matrix': 'Vitality Matrix',
    'Bio-Pharmacy Depot': 'Bio-Pharmacy Depot',
    'Connect Specialists': 'Connect Specialists',
    'Systems Information': 'Systems Information',
    'Admin Command Matrix': 'Admin Command Matrix',
    'Systems Hub': 'Systems Hub',
    'Clinical Systems Hub': 'Clinical Systems Hub',
    'Clinical Core': 'Clinical Core',
    'Diagnostics & Labs': 'Diagnostics & Labs',
    'Clinics & Systems': 'Clinics & Systems',
    'Search System...': 'Search System...',
    'Active System': 'Active System',
    'Cache Core': 'Cache Core',
    'Linguistic Matrix': 'Linguistic Matrix',
    'Select primary interface dialect': 'Select primary interface dialect',
    'Welcome Dr.': 'Welcome Dr.',
    'Workspace Status: Active': 'Workspace Status: Active',
    'Quick Diagnostics Panel': 'Quick Diagnostics Panel',
    'Hands-free Listening Active': 'Hands-free Listening Active',
    'Ask Doctorian Anything...': 'Ask Doctorian Anything...',
    'Active Session': 'Active Session',
    'Settings': 'Settings',
    'Emergency SOS': 'Emergency SOS',
    'Clinical Systems Information': 'Clinical Systems Information'
  },
  'Luganda': {
    'Dashboard': 'Wwebbulaasi',
    'Doctorian Neural Core': 'Omutima Gwa Doctorian',
    'Genomic Longevity Core': 'Ebikwatagana ku Nsigo',
    'Medical Illustrator': 'Ekifaananyi ky’Eddagala',
    'CognisHub Node': 'Ekitongole kya CognisHub',
    'Biomatic Sandbox': 'Ssanduku ya Biomatic',
    'Diagnostic Lab': 'Ekebezi lya Diagnostics',
    'Bio-Monitor Console': 'Ekyuma kikeba Obulamu',
    'Health Progress Trace': 'Kalonda w’Obulamu',
    'Vitality Matrix': 'Ebizimbuka mu Bulamu',
    'Bio-Pharmacy Depot': 'Ettundiro ly’Eddagala',
    'Connect Specialists': 'Yunga ku Bakugu',
    'Systems Information': 'Ebyemiganyulo gya Diagnostics',
    'Admin Command Matrix': 'Obuyinza obukulu obwa Admin',
    'Systems Hub': 'Ekitongole kya Systems',
    'Clinical Systems Hub': 'Ekisenge kya Systems Hub',
    'Clinical Core': 'Ekitundu kya Clinical Core',
    'Diagnostics & Labs': 'Diagnostics & Makebezi',
    'Clinics & Systems': 'Ddwaliro ne Mikutu',
    'Search System...': 'Noonya mu mikutu...',
    'Active System': 'Okukola Kuli Ku Maanyi',
    'Cache Core': 'Kakebe asigaddevo',
    'Linguistic Matrix': 'Kyusa Olulimi lwo',
    'Select primary interface dialect': 'Ondola n’olulimi lwe weetaaga',
    'Welcome Dr.': 'Nsanyuse okulaba Musawo',
    'Workspace Status: Active': 'Okukola kulungi munda',
    'Quick Diagnostics Panel': 'Makebezi ag’amangu',
    'Hands-free Listening Active': 'Okutu ku mikutu',
    'Ask Doctorian Anything...': 'Yogera ne Doctorian wano...',
    'Active Session': 'Kiseera kya bulamu',
    'Settings': 'Ntegeka',
    'Emergency SOS': 'Amangu ddaala SOS',
    'Clinical Systems Information': 'Ebyemiganyulo eby’Eddagala',
    'Doctorian AI Core': 'Omutima gwa Doctorian AI',
    'Optimal': 'Etuuse bulungi',
    'Cardiac Flux': 'Okukuba kw’Omutima',
    'Neural Energy': 'Amaanyi g’Omubiri',
    'Resets Daily': 'Kizzebwawo Bulijjo',
    'Hydration': 'Okunywamu Amaazzi',
    'Primary clinical reasoning layer. Successfully integrated and synchronizing real-time Uganda Ministry of Health Care Guidance protocols, VHT community registry logs, bio-stethoscope diagnostics, and regional patient telemetry with sub-millisecond latencies.': 'Ekiini ekikulu eky’okuwabula ekituuse. Kikoleddwamu dda pulotokolo z’Obulamu eza Minisitule y’Obulamu eya Uganda, ebiwandiiko bya VHT, ebyuma bya stethoscope, ne mikutu gy’abarwadde mu dakiika mbu.',
    'Change UI Language': 'Kyusa Olulimi lw’Ekyuma',
    'Core Operations': 'Okukola Okusookera ddala',
    "Doctors' Dashboard": 'Wwebbulaasi y’Omusawo',
    'Medical Image Analyzer': 'Ekyuma Ekikebera Ebifaananyi by’Eddagala',
    'Medication Adherence': 'Okugoberera Eddagala',
    'Clinical Safety Disclaimer': 'Okulabula ku Bukuumi bw’Obulamu',
    'Guest Mode': 'Okugezesa kw’Omugenyi',
    'Uganda DPPA 2019': 'Etteeka lya Uganda DPPA 2019'
  },
  'Swahili': {
    'Dashboard': 'Mwangaza',
    'Doctorian Neural Core': 'Kiini Neural cha Doctorian',
    'Genomic Longevity Core': 'Kiini cha Genomic Longevity',
    'Medical Illustrator': 'Mchoro wa Kimatibabu',
    'CognisHub Node': 'Nodi ya CognisHub',
    'Biomatic Sandbox': 'Sanduku la Biomatic',
    'Diagnostic Lab': 'Maabara ya Uchunguzi',
    'Bio-Monitor Console': 'Dashibodi ya Bio-Monitor',
    'Health Progress Trace': 'Ufuatiliaji wa Afya',
    'Vitality Matrix': 'Matrix ya Uhai',
    'Bio-Pharmacy Depot': 'Duka la Dawa',
    'Connect Specialists': 'Wagonjwa na Wataalamu',
    'Systems Information': 'Habari za Mifumo',
    'Admin Command Matrix': 'Matrix ya Amri ya Admin',
    'Systems Hub': 'Mifumo ya Hub',
    'Clinical Systems Hub': 'Mifumo ya Kliniki',
    'Clinical Core': 'Kiini cha Kliniki',
    'Diagnostics & Labs': 'Uchunguzi na Maabara',
    'Clinics & Systems': 'Kliniki na Mifumo',
    'Search System...': 'Tafuta Kwenye Mfumo...',
    'Active System': 'Mfumo Unafanya Kazi',
    'Cache Core': 'Kache ya Ndani',
    'Linguistic Matrix': 'Matunzio ya Lugha',
    'Select primary interface dialect': 'Chagua lugha kuu ya kiolesura',
    'Welcome Dr.': 'Karibu Daktari',
    'Workspace Status: Active': 'Hali ya Kazi: Imewashwa',
    'Quick Diagnostics Panel': 'Jopo la Uchunguzi wa Haraka',
    'Hands-free Listening Active': 'Usikilizaji Bila Mikono',
    'Ask Doctorian Anything...': 'Uliza Doctorian Chochote...',
    'Active Session': 'Kipindi Kinachoendelea',
    'Settings': 'Mipangilio',
    'Emergency SOS': 'Dharura ya SOS',
    'Clinical Systems Information': 'Habari za Mifumo ya Kliniki',
    'Doctorian AI Core': 'Kiini cha Doctorian AI',
    'Optimal': 'Bora Kabisa',
    'Cardiac Flux': 'Kasi ya Moyo',
    'Neural Energy': 'Nguvu ya Ubongo',
    'Resets Daily': 'Hurejeeshwa Kila Siku',
    'Hydration': 'Kiwango cha Maji',
    'Primary clinical reasoning layer. Successfully integrated and synchronizing real-time Uganda Ministry of Health Care Guidance protocols, VHT community registry logs, bio-stethoscope diagnostics, and regional patient telemetry with sub-millisecond latencies.': 'Kiini kikuu cha uchambuzi wa matibabu. Kimeunganishwa kikamilifu na miongozo ya Wizara ya Afya ya Uganda, kumbukumbu za VHT, vipimo vya stethoscope, na telemetry kwa sekunde chache.',
    'Change UI Language': 'Badili Lugha ya Kiolesura',
    'Core Operations': 'Shughuli Kuu',
    "Doctors' Dashboard": 'Mwangaza wa Madaktari'
  },
  'Spanish': {
    'Dashboard': 'Panel Control',
    'Doctorian Neural Core': 'Núcleo Neural Doctorian',
    'Genomic Longevity Core': 'Núcleo de Longevidad Genómica',
    'Medical Illustrator': 'Ilustrador Médico',
    'CognisHub Node': 'Nodo CognisHub',
    'Biomatic Sandbox': 'Arenero Biomático',
    'Diagnostic Lab': 'Laboratorio Diagnóstico',
    'Bio-Monitor Console': 'Consola de Bio-Monitoreo',
    'Health Progress Trace': 'Seguimiento de Progreso',
    'Vitality Matrix': 'Matriz de Vitalidad',
    'Bio-Pharmacy Depot': 'Depósito Bio-Farmacia',
    'Connect Specialists': 'Conectar Especialistas',
    'Systems Information': 'Información del Sistema',
    'Admin Command Matrix': 'Matriz de Comando Admin',
    'Systems Hub': 'Centro de Sistemas',
    'Clinical Systems Hub': 'Centro Clínico de Sistemas',
    'Clinical Core': 'Núcleo Clínico',
    'Diagnostics & Labs': 'Diagnósticos y Labs',
    'Clinics & Systems': 'Clínicas y Sistemas',
    'Search System...': 'Buscar en el sistema...',
    'Active System': 'Sistema Activo',
    'Cache Core': 'Núcleo en Caché',
    'Linguistic Matrix': 'Matriz Lingüística',
    'Select primary interface dialect': 'Seleccione el dialecto de la interfaz principal',
    'Welcome Dr.': 'Bienvenido Dr.',
    'Workspace Status: Active': 'Estado del Área: Activo',
    'Quick Diagnostics Panel': 'Panel de Diagnósticos Rápidos',
    'Hands-free Listening Active': 'Escucha Manos Libres Activa',
    'Ask Doctorian Anything...': 'Pregúntale a Doctorian lo que sea...',
    'Active Session': 'Sesión Activa',
    'Settings': 'Ajustes',
    'Emergency SOS': 'SOS de Emergencia',
    'Clinical Systems Information': 'Información Clínica de Sistemas',
    'Doctorian AI Core': 'Núcleo AI Doctorian',
    'Optimal': 'Óptimo',
    'Cardiac Flux': 'Flujo Cardíaco',
    'Neural Energy': 'Energía Neuronal',
    'Resets Daily': 'Se reinicia diariamente',
    'Hydration': 'Hidratación',
    'Primary clinical reasoning layer. Successfully integrated and synchronizing real-time Uganda Ministry of Health Care Guidance protocols, VHT community registry logs, bio-stethoscope diagnostics, and regional patient telemetry with sub-millisecond latencies.': 'Capa principal de razonamiento clínico. Integrada con éxito y sincronizando protocolos de orientación del Ministerio de Salud de Uganda en tiempo real, registros de VHT, diagnósticos de bioestetoscopio y telemetría de pacientes regionales con latencias de submiliseis.',
    'Change UI Language': 'Cambiar idioma de la interfaz',
    'Core Operations': 'Operaciones principales',
    "Doctors' Dashboard": 'Panel de Médicos'
  },
  'French': {
    'Dashboard': 'Tableau de Bord',
    'Doctorian Neural Core': 'Noyau Neural Doctorian',
    'Genomic Longevity Core': 'Noyau de Longévité Génomique',
    'Medical Illustrator': 'Illustrateur Médical',
    'CognisHub Node': 'Nœud CognisHub',
    'Biomatic Sandbox': 'Bac à Sable Biomatique',
    'Diagnostic Lab': 'Laboratoire Diagnostic',
    'Bio-Monitor Console': 'Console Bio-Moniteur',
    'Health Progress Trace': 'Suivi du Progrès',
    'Vitality Matrix': 'Matrice de Vitalité',
    'Bio-Pharmacy Depot': 'Dépôt Bio-Pharmacie',
    'Connect Specialists': 'Connecter Spécialistes',
    'Systems Information': 'Informations Système',
    'Admin Command Matrix': 'Matrice Commande Admin',
    'Systems Hub': 'Hub des Systèmes',
    'Clinical Systems Hub': 'Hub des Systèmes Cliniques',
    'Clinical Core': 'Noyau Clinique',
    'Diagnostics & Labs': 'Diagnostics & Labos',
    'Clinics & Systems': 'Cliniques & Systèmes',
    'Search System...': 'Rechercher un système...',
    'Active System': 'Système Actif',
    'Cache Core': 'Noyau Cache',
    'Linguistic Matrix': 'Matrice Linguistique',
    'Select primary interface dialect': 'Sélectionnez le dialecte principal',
    'Welcome Dr.': 'Bienvenue Dr.',
    'Workspace Status: Active': 'Statut Espace: Actif',
    'Quick Diagnostics Panel': 'Panneau Diagnostic Rapide',
    'Hands-free Listening Active': 'Écoute Mains Libres Active',
    'Ask Doctorian Anything...': 'Demandez n\'importe quoi à Doctorian...',
    'Active Session': 'Session Active',
    'Settings': 'Paramètres',
    'Emergency SOS': 'SOS Urgence',
    'Clinical Systems Information': 'Informations Cliniques Systèmes',
    'Doctorian AI Core': 'Noyau IA Doctorian',
    'Optimal': 'Optimal',
    'Cardiac Flux': 'Flux Cardiaque',
    'Neural Energy': 'Énergie Neuronale',
    'Resets Daily': 'Réinitialisation quotidienne',
    'Hydration': 'Hydratation',
    'Primary clinical reasoning layer. Successfully integrated and synchronizing real-time Uganda Ministry of Health Care Guidance protocols, VHT community registry logs, bio-stethoscope diagnostics, and regional patient telemetry with sub-millisecond latencies.': 'Couche principale de raisonnement clinique. Intégrée avec succès et synchronisant les protocoles du ministère de la Santé de l’Ouganda, les journaux VHT, les diagnostics de biostéthoscope et la télémétrie des patients.',
    'Change UI Language': 'Changer la langue d’interface',
    'Core Operations': 'Opérations Principales',
    "Doctors' Dashboard": 'Tableau de bord des médecins'
  },
  'German': {
    'Dashboard': 'Dashboard',
    'Doctorian Neural Core': 'Doctorian Neural-Kern',
    'Genomic Longevity Core': 'Genomischer Langlebigkeits-Kern',
    'Medical Illustrator': 'Medizinischer Illustrator',
    'CognisHub Node': 'CognisHub-Knoten',
    'Biomatic Sandbox': 'Biomatische Sandbox',
    'Diagnostic Lab': 'Diagnostisches Labor',
    'Bio-Monitor Console': 'Bio-Monitor-Konsole',
    'Health Progress Trace': 'Gesundheits-Fortschritt',
    'Vitality Matrix': 'Vitalitäts-Matrix',
    'Bio-Pharmacy Depot': 'Bio-Pharmazie-Depot',
    'Connect Specialists': 'Spezialisten verbinden',
    'Systems Information': 'Systeminformationen',
    'Admin Command Matrix': 'Admin-Befehlsmatrix',
    'Systems Hub': 'Systeme-Hub',
    'Clinical Systems Hub': 'Klinisches Systeme-Hub',
    'Clinical Core': 'Klinischer Kern',
    'Diagnostics & Labs': 'Diagnostik & Labore',
    'Clinics & Systems': 'Kliniken & Systeme',
    'Search System...': 'System durchsuchen...',
    'Active System': 'Aktives System',
    'Cache Core': 'Cache-Kern',
    'Linguistic Matrix': 'Linguistische Matrix',
    'Select primary interface dialect': 'Wählen Sie den primären Schnittstellendialekt',
    'Welcome Dr.': 'Willkommen Dr.',
    'Workspace Status: Active': 'Arbeitsbereichs-Status: Aktiv',
    'Quick Diagnostics Panel': 'Schnell-Diagnose-Panel',
    'Hands-free Listening Active': 'Freihändiges Hören Aktiv',
    'Ask Doctorian Anything...': 'Fragen Sie Doctorian alles...',
    'Active Session': 'Aktive Sitzung',
    'Settings': 'Einstellungen',
    'Emergency SOS': 'Notfall-SOS',
    'Clinical Systems Information': 'Klinische Systeminformationen'
  },
  'Chinese': {
    'Dashboard': '仪表盘',
    'Doctorian Neural Core': 'Doctorian 神经核心',
    'Genomic Longevity Core': '基因长寿核心',
    'Medical Illustrator': '医学插画师',
    'CognisHub Node': 'CognisHub 节点',
    'Biomatic Sandbox': '生物沙盒',
    'Diagnostic Lab': '诊断实验室',
    'Bio-Monitor Console': '生物监测控制台',
    'Health Progress Trace': '健康进度追踪',
    'Vitality Matrix': '生命活力矩阵',
    'Bio-Pharmacy Depot': '生物药房仓库',
    'Connect Specialists': '联系专家',
    'Systems Information': '系统信息',
    'Admin Command Matrix': '管理员控制矩阵',
    'Systems Hub': '系统中心',
    'Clinical Systems Hub': '临床系统中心',
    'Clinical Core': '临床核心',
    'Diagnostics & Labs': '诊断与实验室',
    'Clinics & Systems': '诊所与系统',
    'Search System...': '搜索系统...',
    'Active System': '系统运行中',
    'Cache Core': '缓存核心',
    'Linguistic Matrix': '语言矩阵',
    'Select primary interface dialect': '选择主要界面语言',
    'Welcome Dr.': '欢迎，医生',
    'Workspace Status: Active': '工作台状态：激活',
    'Quick Diagnostics Panel': '快速诊断面板',
    'Hands-free Listening Active': '免手持倾听激活',
    'Ask Doctorian Anything...': '咨询 Doctorian 任何问题...',
    'Active Session': '活动会话',
    'Settings': '系统设置',
    'Emergency SOS': '紧急求助 SOS',
    'Clinical Systems Information': '临床系统参考信息'
  },
  'Hindi': {
    'Dashboard': 'डैशबोर्ड',
    'Doctorian Neural Core': 'डॉक्टोरियन न्यूरल कोर',
    'Genomic Longevity Core': 'जीनोमिक दीर्घायु कोर',
    'Medical Illustrator': 'मेडिकल इलस्ट्रेटर',
    'CognisHub Node': 'कॉग्निसहब नोड',
    'Biomatic Sandbox': 'बायोमैटिक सैंडबॉक्स',
    'Diagnostic Lab': 'डायग्नोस्टिक लैब',
    'Bio-Monitor Console': 'बायो-मॉनिटर कंसोल',
    'Health Progress Trace': 'स्वास्थ्य प्रगति ट्रैकर',
    'Vitality Matrix': 'वाइटलिटी मैट्रिक्स',
    'Bio-Pharmacy Depot': 'बायो-फार्मेसी डिपो',
    'Connect Specialists': 'विशेषज्ञों से जुड़ें',
    'Systems Information': 'प्रणाली सूचना',
    'Admin Command Matrix': 'एडमिन कमांड मैट्रिक्स',
    'Systems Hub': 'सिस्टम हब',
    'Clinical Systems Hub': 'क्लिनिकल सिस्टम हब',
    'Clinical Core': 'क्लिनिकल कोर',
    'Diagnostics & Labs': 'डायग्नोस्टिक्स और लैब्स',
    'Clinics & Systems': 'क्लिनिक और सिस्टम',
    'Search System...': 'प्रणाली खोजें...',
    'Active System': 'सक्रिय प्रणाली',
    'Cache Core': 'कैश कोर',
    'Linguistic Matrix': 'भाषाई मैट्रिक्स',
    'Select primary interface dialect': 'प्राथमिक इंटरफ़ेस बोली चुनें',
    'Welcome Dr.': 'स्वागत है डॉ.',
    'Workspace Status: Active': 'कार्यक्षेत्र स्थिति: सक्रिय',
    'Quick Diagnostics Panel': 'त्वरित निदान पैनल',
    'Hands-free Listening Active': 'हैंड्स-फ्री लिसनिंग सक्रिय',
    'Ask Doctorian Anything...': 'डॉक्टोरियन से कुछ भी पूछें...',
    'Active Session': 'सक्रिय सत्र',
    'Settings': 'सेटिंग्स',
    'Emergency SOS': 'आपातकालीन एसओएस',
    'Clinical Systems Information': 'क्लिनिकल प्रणाली जानकारी'
  },
  'Arabic': {
    'Dashboard': 'لوحة التحكم',
    'Doctorian Neural Core': 'النواة العصبية للدكتور',
    'Genomic Longevity Core': 'نواة طول العمر الجيني',
    'Medical Illustrator': 'الرسام الطبي',
    'CognisHub Node': 'عقدة CognisHub',
    'Biomatic Sandbox': 'صندوق الرمل البيولوجي',
    'Diagnostic Lab': 'المختبر التشخيصي',
    'Bio-Monitor Console': 'منصة المراقبة الحيوية',
    'Health Progress Trace': 'تتبع التقدم الصحي',
    'Vitality Matrix': 'مصفوفة الحيوية',
    'Bio-Pharmacy Depot': 'مستودع الصيدلة الحيوية',
    'Connect Specialists': 'اتصال الأخصائيين',
    'Systems Information': 'معلومات الأنظمة',
    'Admin Command Matrix': 'مصفوفة القيادة الإدارية',
    'Systems Hub': 'مركز الأنظمة',
    'Clinical Systems Hub': 'مركز الأنظمة السريرية',
    'Clinical Core': 'النواة السريرية',
    'Diagnostics & Labs': 'التشخيص والمختبرات',
    'Clinics & Systems': 'العيادات والأنظمة',
    'Search System...': 'البحث في النظام...',
    'Active System': 'النظام نشط',
    'Cache Core': 'النواة المخزنة',
    'Linguistic Matrix': 'المصفوفة اللغوية',
    'Select primary interface dialect': 'اختر لغة الواجهة الرئيسية',
    'Welcome Dr.': 'مرحباً دكتور',
    'Workspace Status: Active': 'حالة مساحة العمل: نشط',
    'Quick Diagnostics Panel': 'لوحة التشخيص السريع',
    'Hands-free Listening Active': 'الاستماع اللاسلكي نشط',
    'Ask Doctorian Anything...': 'اسأل دكتور الصيدلة عن أي شيء...',
    'Active Session': 'جلسة نشطة',
    'Settings': 'الإعدادات',
    'Emergency SOS': 'طوارئ SOS',
    'Clinical Systems Information': 'معلومات الأنظمة السريرية'
  },
  'Portuguese': {
    'Dashboard': 'Painel Geral',
    'Doctorian Neural Core': 'Núcleo Neural Doctorian',
    'Genomic Longevity Core': 'Núcleo de Longevidade Genômica',
    'Medical Illustrator': 'Ilustrador Médico',
    'CognisHub Node': 'Nodo CognisHub',
    'Biomatic Sandbox': 'Sandbox Biomática',
    'Diagnostic Lab': 'Laboratório Clínico',
    'Bio-Monitor Console': 'Painel de Bio-Monitoramento',
    'Health Progress Trace': 'Histórico de Progresso',
    'Vitality Matrix': 'Matriz de Vitalidade',
    'Bio-Pharmacy Depot': 'Depósito Bio-Farmácia',
    'Connect Specialists': 'Conectar Especialistas',
    'Systems Information': 'Informações do Sistema',
    'Admin Command Matrix': 'Matriz de Comando Admin',
    'Systems Hub': 'Hub de Sistemas',
    'Clinical Systems Hub': 'Hub de Sistemas Clínicos',
    'Clinical Core': 'Núcleo Clínico',
    'Diagnostics & Labs': 'Diagnósticos & Laboratórios',
    'Clinics & Systems': 'Clínicas & Sistemas',
    'Search System...': 'Buscar no Sistema...',
    'Active System': 'Sistema Ativo',
    'Cache Core': 'Núcleo de Cache',
    'Linguistic Matrix': 'Matriz Linguística',
    'Select primary interface dialect': 'Selecione o idioma principal da interface',
    'Welcome Dr.': 'Bem-vindo Dr.',
    'Workspace Status: Active': 'Workspace Status: Ativo',
    'Quick Diagnostics Panel': 'Painel de Diagnóstico Rápido',
    'Hands-free Listening Active': 'Escuta Viva-Voz Ativa',
    'Ask Doctorian Anything...': 'Pergunte qualquer coisa ao Doctorian...',
    'Active Session': 'Sessão Ativa',
    'Settings': 'Configurações',
    'Emergency SOS': 'SOS de Emergência',
    'Clinical Systems Information': 'Informações Clínicas do Sistema'
  },
  'Russian': {
    'Dashboard': 'Панель управления',
    'Doctorian Neural Core': 'Нейронное ядро Докториан',
    'Genomic Longevity Core': 'Ядро геномного долголетия',
    'Medical Illustrator': 'Медицинский иллюстратор',
    'CognisHub Node': 'Узел CognisHub',
    'Biomatic Sandbox': 'Биоматическая песочница',
    'Diagnostic Lab': 'Диагностическая лаборатория',
    'Bio-Monitor Console': 'Био-монитор консоль',
    'Health Progress Trace': 'График здоровья',
    'Vitality Matrix': 'Матрица жизненных сил',
    'Bio-Pharmacy Depot': 'Био-аптечный склад',
    'Connect Specialists': 'Связаться со специалистами',
    'Systems Information': 'Системная информация',
    'Admin Command Matrix': 'Матрица администратора',
    'Systems Hub': 'Системный хаб',
    'Clinical Systems Hub': 'Клинический системный хаб',
    'Clinical Core': 'Клиническое ядро',
    'Diagnostics & Labs': 'Диагностика и лаборатории',
    'Clinics & Systems': 'Клиники и системы',
    'Search System...': 'Поиск по системе...',
    'Active System': 'Активный режим',
    'Cache Core': 'Локальный кэш',
    'Linguistic Matrix': 'Языковая матрица',
    'Select primary interface dialect': 'Выберите основной рабочий язык',
    'Welcome Dr.': 'Добро пожаловать, док',
    'Workspace Status: Active': 'Рабочая область: Активна',
    'Quick Diagnostics Panel': 'Панель быстрой диагностики',
    'Hands-free Listening Active': 'Голосовой режим активен',
    'Ask Doctorian Anything...': 'Спросите Doctorian о чем угодно...',
    'Active Session': 'Активная сессия',
    'Settings': 'Настройки',
    'Emergency SOS': 'Экстренный SOS',
    'Clinical Systems Information': 'Справочная клиническая информация'
  },
  'Japanese': {
    'Dashboard': 'ダッシュボード',
    'Doctorian Neural Core': 'ドクトリアン・ニューラルコア',
    'Genomic Longevity Core': 'ゲノム長寿コア',
    'Medical Illustrator': 'メディカル・イラストレーター',
    'CognisHub Node': 'CognisHub ノード',
    'Biomatic Sandbox': 'バイオマティック・サンドボックス',
    'Diagnostic Lab': '診断ラボ',
    'Bio-Monitor Console': 'バイオモニター・コンソール',
    'Health Progress Trace': '健康進捗追跡',
    'Vitality Matrix': 'バイタリティ・マトリクス',
    'Bio-Pharmacy Depot': 'バイオ調剤デポ',
    'Connect Specialists': '専門医連携',
    'Systems Information': 'システム情報',
    'Admin Command Matrix': '管理コマンド・マトリクス',
    'Systems Hub': 'システム・ハブ',
    'Clinical Systems Hub': '臨床システム・ハブ',
    'Clinical Core': '臨床コアシステム',
    'Diagnostics & Labs': '診断＆ラボラトリー',
    'Clinics & Systems': 'クリニック＆システム',
    'Search System...': 'システムを検索...',
    'Active System': 'アクティブ・システム',
    'Cache Core': 'キャッシュ・コア',
    'Linguistic Matrix': '言語マトリクス',
    'Select primary interface dialect': '主言語インターフェースの選択',
    'Welcome Dr.': 'ようこそ、医師',
    'Workspace Status: Active': 'ワークスペース：有効',
    'Quick Diagnostics Panel': '簡易診断パネル',
    'Hands-free Listening Active': 'ハンズフリー聞き取り中',
    'Ask Doctorian Anything...': 'ドクトリアンに何でも質問してください...',
    'Active Session': 'アクティブ・セッション',
    'Settings': '設定項目',
    'Emergency SOS': '緊急SOS',
    'Clinical Systems Information': '臨床システム情報'
  },
  'Korean': {
    'Dashboard': '대시보드',
    'Doctorian Neural Core': '닥토리안 뉴럴 코어',
    'Genomic Longevity Core': '게놈 수명 코어',
    'Medical Illustrator': '메디컬 일러스트레이터',
    'CognisHub Node': 'CognisHub 노드',
    'Biomatic Sandbox': '바이오매틱 샌드박스',
    'Diagnostic Lab': '진단 연구소',
    'Bio-Monitor Console': '바이오 모니터 콘솔',
    'Health Progress Trace': '건강 진행 추적',
    'Vitality Matrix': '바이탈리티 매트릭스',
    'Bio-Pharmacy Depot': '바이오 약국 저장소',
    'Connect Specialists': '전문의 네트워킹',
    'Systems Information': '시스템 정보',
    'Admin Command Matrix': '관리 명령 매트릭스',
    'Systems Hub': '시스템 허브',
    'Clinical Systems Hub': '임상 시스템 허브',
    'Clinical Core': '임상 코어',
    'Diagnostics & Labs': '진단 및 실험실',
    'Clinics & Systems': '클리닉 및 시스템',
    'Search System...': '시스템 검색...',
    'Active System': '활성 시스템',
    'Cache Core': '캐시 코어',
    'Linguistic Matrix': '언어 매트릭스',
    'Select primary interface dialect': '기본 인터페이스 언어 선택',
    'Welcome Dr.': '환영합니다, 의사 선생님',
    'Workspace Status: Active': '워크스페이스 상태: 활성',
    'Quick Diagnostics Panel': '신속 진단 패널',
    'Hands-free Listening Active': '핸즈프리 듣기 활성화',
    'Ask Doctorian Anything...': '닥토리안에게 무엇이든 질문하세요...',
    'Active Session': '활성 세션',
    'Settings': '설정',
    'Emergency SOS': '긴급 SOS',
    'Clinical Systems Information': '임상 시스템 정보'
  },
  'Italian': {
    'Dashboard': 'Cruscotto',
    'Doctorian Neural Core': 'Nucleo Neurale Doctorian',
    'Genomic Longevity Core': 'Nucleo Longgevità Genomica',
    'Medical Illustrator': 'Illustratore Medico',
    'CognisHub Node': 'Nodo CognisHub',
    'Biomatic Sandbox': 'Sandbox Biomotica',
    'Diagnostic Lab': 'Laboratorio Diagnostico',
    'Bio-Monitor Console': 'Console Bio-Monitor',
    'Health Progress Trace': 'Tracciamento Salute',
    'Vitality Matrix': 'Matrice della Vitalità',
    'Bio-Pharmacy Depot': 'Deposito Bio-Farmaceutico',
    'Connect Specialists': 'Connetti Specialisti',
    'Systems Information': 'Informazioni di Sistema',
    'Admin Command Matrix': 'Matrice Comando Admin',
    'Systems Hub': 'Centro Sistemi',
    'Clinical Systems Hub': 'Centro Sistemi Clinici',
    'Clinical Core': 'Core Clinico',
    'Diagnostics & Labs': 'Diagnostica e Laboratori',
    'Clinics & Systems': 'Cliniche e Sistemi',
    'Search System...': 'Cerca nel sistema...',
    'Active System': 'Sistema Attivo',
    'Cache Core': 'Nucleo Cache',
    'Linguistic Matrix': 'Matrice Linguistica',
    'Select primary interface dialect': 'Seleziona dialetto di interfaccia principale',
    'Welcome Dr.': 'Benvenuto Dr.',
    'Workspace Status: Active': 'Stato Workspace: Attivo',
    'Quick Diagnostics Panel': 'Pannello Diagnostica Rapida',
    'Hands-free Listening Active': 'Riconoscimento Vocale Attivo',
    'Ask Doctorian Anything...': 'Chiedi qualunque cosa a Doctorian...',
    'Active Session': 'Sessione Attiva',
    'Settings': 'Impostazioni',
    'Emergency SOS': 'SOS Emergenza',
    'Clinical Systems Information': 'Informazioni Cliniche Sistemi'
  },
  'Turkish': {
    'Dashboard': 'Kontrol Paneli',
    'Doctorian Neural Core': 'Doctorian Sinir Çekirdeği',
    'Genomic Longevity Core': 'Genomik Uzun Ömür Çekirdeği',
    'Medical Illustrator': 'Medikal İllüstratör',
    'CognisHub Node': 'CognisHub Düğümü',
    'Biomatic Sandbox': 'Biyomatik Kum Havuzu',
    'Diagnostic Lab': 'Tanı Laboratuvarı',
    'Bio-Monitor Console': 'Biyo-Monitör Konsolu',
    'Health Progress Trace': 'Sağlık İlerleme İzleme',
    'Vitality Matrix': 'Canlılık Matrisi',
    'Bio-Pharmacy Depot': 'Biyo-Eczane Deposu',
    'Connect Specialists': 'Uzmanlarla Bağlantı Kur',
    'Systems Information': 'Sistem Bilgileri',
    'Admin Command Matrix': 'Yönetici Komut Matrisi',
    'Systems Hub': 'Sistemler Merkezi',
    'Clinical Systems Hub': 'Klinik Sistemler Hub',
    'Clinical Core': 'Klinik Çekirdek',
    'Diagnostics & Labs': 'Teşhis ve Laboratuvarlar',
    'Clinics & Systems': 'Klinikler ve Sistemler',
    'Search System...': 'Sistemde ara...',
    'Active System': 'Aktif Sistem',
    'Cache Core': 'Önbellek Çekirdeği',
    'Linguistic Matrix': 'Dil Matrisi',
    'Select primary interface dialect': 'Birincil arayüz dilini seçin',
    'Welcome Dr.': 'Hoş Geldiniz Dr.',
    'Workspace Status: Active': 'Çalışma Alanı Durumu: Aktif',
    'Quick Diagnostics Panel': 'Hızlı Teşhis Paneli',
    'Hands-free Listening Active': 'Mikrofon Dinlemesi Aktif',
    'Ask Doctorian Anything...': 'Doctorian\'a İstediğinizi Sorun...',
    'Active Session': 'Aktif Oturum',
    'Settings': 'Ayarlar',
    'Emergency SOS': 'Acil Durum SOS',
    'Clinical Systems Information': 'Klinik Sistemleri Bilgisi'
  },
  'Runyankole-Rukiga': {
    'Dashboard': 'Ebaandi y\'eMirimo',
    'Doctorian Neural Core': 'Omutima Gwa Doctorian',
    'Genomic Longevity Core': 'Eby\'obusika n\'Obusingye',
    'Medical Illustrator': 'Oshushura Eddagala',
    'CognisHub Node': 'Kitebe kya CognisHub',
    'Biomatic Sandbox': 'Akasanduku ka Biomatic',
    'Diagnostic Lab': 'Kebezi y\'Oburwire',
    'Bio-Monitor Console': 'Enyuma y\'Oburamu',
    'Health Progress Trace': 'Kuronda Oburamu',
    'Vitality Matrix': 'Ebizimbya Oburamu',
    'Bio-Pharmacy Depot': 'Eitundiro ry\'Eddagala',
    'Connect Specialists': 'Yunga n\'Abashaho ba Kugu',
    'Systems Information': 'Makuru ga Sistemu',
    'Admin Command Matrix': 'Obushobozi bwa Admin',
    'Systems Hub': 'Ekitongole kya Sistemu',
    'Clinical Systems Hub': 'Kitebe ky\'Obushaho',
    'Clinical Core': 'Ekitundu ky\'Obushaho',
    'Diagnostics & Labs': 'Kukebera n\'Oburwire',
    'Clinics & Systems': 'Klinika n\'eSistemu',
    'Search System...': 'Sherura Sistemu...',
    'Active System': 'Ekarikukora',
    'Cache Core': 'Akuzaire',
    'Linguistic Matrix': 'Kyusa Emigambire',
    'Select primary interface dialect': 'Toorana Olulimi Rwawe',
    'Welcome Dr.': 'Kasiibo Musawo',
    'Workspace Status: Active': 'Emirimo: Negyenda Gye',
    'Quick Diagnostics Panel': 'Kukebera Kw\'amangu',
    'Hands-free Listening Active': 'Kuhurira Kuri Ku maanyi',
    'Ask Doctorian Anything...': 'Buuza Doctorian Kyona kyona...',
    'Active Session': 'Kiseera Ky\'Omurimo',
    'Settings': 'Entebekesa',
    'Emergency SOS': 'Obusingye SOS',
    'Clinical Systems Information': 'Makuru g\'Eddagala',
    'Doctorian AI Core': 'Omutima gwa Doctorian AI',
    'Optimal': 'Gye Kirungi',
    'Cardiac Flux': 'Okukuba kw’Omutima',
    'Neural Energy': 'Amaanyi g’Omubiri',
    'Resets Daily': 'Kigarurwaho Bulijo',
    'Hydration': 'Okunywa Amaizi',
    'Change UI Language': 'Kyusa Olulimi rwa Sistemu',
    'Core Operations': 'Emirimo y’Ekiini',
    "Doctors' Dashboard": 'Ebaandi y’Omushaho',
    'Medical Image Analyzer': 'Okushwijuma Ebishushani by’Obujanjabi',
    'Medication Adherence': 'Okukuratira Eddagala',
    'Clinical Safety Disclaimer': 'Okurabura ahari Oburingaaniza bw’Obujanjabi',
    'Guest Mode': 'Emiringo y’Omugyenyi',
    'Uganda DPPA 2019': 'Ekiragiro kya Uganda DPPA 2019'
  },
  'Acholi-Luo': {
    'Dashboard': 'Pany kin mogo',
    'Doctorian Neural Core': 'Cwiny Doctorian',
    'Genomic Longevity Core': 'Kwan me Nying',
    'Medical Illustrator': 'Agoy me yat',
    'CognisHub Node': 'Kitebe me CognisHub',
    'Biomatic Sandbox': 'Cogo me Biomatic',
    'Diagnostic Lab': 'Maabara me ngolo bur',
    'Bio-Monitor Console': 'Pany me ngolo kwo',
    'Health Progress Trace': 'Luny kwo pa yat',
    'Vitality Matrix': 'Matrix me kwo',
    'Bio-Pharmacy Depot': 'Kabedo me yat',
    'Connect Specialists': 'Kub ki ludito yat',
    'Systems Information': 'Ngec me lany',
    'Admin Command Matrix': 'Twero pa dako admin',
    'Systems Hub': 'Wi lany dduc',
    'Clinical Systems Hub': 'Kabedo me lany yat',
    'Clinical Core': 'Core me yat',
    'Diagnostics & Labs': 'Ngolo bur ki Maabara',
    'Clinics & Systems': 'Odwac ki Lany',
    'Search System...': 'Yen lany...',
    'Active System': 'Yele ma tye kati',
    'Cache Core': 'Cencor me kodo kwo',
    'Linguistic Matrix': 'Lok leb piny',
    'Select primary interface dialect': 'Yer leb me mabor',
    'Welcome Dr.': 'Marako Musawo',
    'Workspace Status: Active': 'Tic: Tye katice',
    'Quick Diagnostics Panel': 'Ngolo bur mapi',
    'Hands-free Listening Active': 'Winjo bot lok tye katice',
    'Ask Doctorian Anything...': 'Peny Doctorian gin dduc...',
    'Active Session': 'Kawa me bur',
    'Settings': 'Ayuba',
    'Emergency SOS': 'Peke me SOS',
    'Clinical Systems Information': 'Ngec me yat dduc',
    'Doctorian AI Core': 'Cwiny Doctorian AI',
    'Optimal': 'Ber Adada',
    'Cardiac Flux': 'Cwiny ma Kodo',
    'Neural Energy': 'Teko me Kwo',
    'Resets Daily': 'Yubbe nino dduc',
    'Hydration': 'Okodo Pii',
    'Change UI Language': 'Alook leb me lany',
    'Core Operations': 'Tic ma Cal',
    "Doctors' Dashboard": 'Pany pa Musawo',
    'Medical Image Analyzer': 'Kwan me Cal me Yat',
    'Medication Adherence': 'Luboo Cor Yat',
    'Clinical Safety Disclaimer': 'Juk me Gwoko Kwo',
    'Guest Mode': 'Kit me Welo',
    'Uganda DPPA 2019': 'Cik me Uganda DPPA 2019'
  },
  'Langi': {
    'Dashboard': 'Kany me ngol',
    'Doctorian Neural Core': 'Cwiny Doctorian Lango',
    'Genomic Longevity Core': 'Kikok kor obola',
    'Medical Illustrator': 'Acogi me yat',
    'CognisHub Node': 'Otok me CognisHub',
    'Biomatic Sandbox': 'Akasanduk me Biomatic',
    'Diagnostic Lab': 'Kabedo me ngolo bur',
    'Bio-Monitor Console': 'Monitor me kwo',
    'Health Progress Trace': 'Nino kor kwo',
    'Vitality Matrix': 'Teko me kwo',
    'Bio-Pharmacy Depot': 'Karibiti me yat',
    'Connect Specialists': 'Yubu ludito yat',
    'Systems Information': 'Ngec kor lany',
    'Admin Command Matrix': 'Twero pa admin',
    'Systems Hub': 'Sistemu Hub',
    'Clinical Systems Hub': 'Kabedo me lany kwo',
    'Clinical Core': 'Yub me kwo',
    'Diagnostics & Labs': 'Ngolo bur ki Maabara',
    'Clinics & Systems': 'Otit ne Lany',
    'Search System...': 'Yen Lany...',
    'Active System': 'Lany tye katic',
    'Cache Core': 'Cencor me cache',
    'Linguistic Matrix': 'Yub leb piny',
    'Select primary interface dialect': 'Yeri leb i kene',
    'Welcome Dr.': 'Karibu Musawo',
    'Workspace Status: Active': 'Hali: Katic maber',
    'Quick Diagnostics Panel': 'Panel me ngol mapi',
    'Hands-free Listening Active': 'Okoto winjo',
    'Ask Doctorian Anything...': 'Peny Doctorian i kura...',
    'Active Session': 'Ting katic',
    'Settings': 'Apara geyo',
    'Emergency SOS': 'SOS neno mapi',
    'Clinical Systems Information': 'Ngec me yat',
    'Doctorian AI Core': 'Cwiny Doctorian Lango AI',
    'Optimal': 'Ber Maber',
    'Cardiac Flux': 'Kicor me Cwiny',
    'Neural Energy': 'Teko me Kwo',
    'Resets Daily': 'Apara nino dduc',
    'Hydration': 'Okobo Pii',
    'Change UI Language': 'Yub olulimi',
    'Core Operations': 'Tic me Cencor',
    "Doctors' Dashboard": 'Kany me Musawo'
  },
  'Iteso': {
    'Dashboard': 'Ebaandi eupaas',
    'Doctorian Neural Core': 'Omutima loka Doctorian',
    'Genomic Longevity Core': 'Ikaileta loka aijar',
    'Medical Illustrator': 'Airikot nakileta',
    'CognisHub Node': 'Node loka CognisHub',
    'Biomatic Sandbox': 'Akasaduku nako Biomatic',
    'Diagnostic Lab': 'Maabara naka akirukot',
    'Bio-Monitor Console': 'Console naka aijar',
    'Health Progress Trace': 'Aitiit aijar',
    'Vitality Matrix': 'Atorokin naka aijar',
    'Bio-Pharmacy Depot': 'Abisikin naka ekisero',
    'Connect Specialists': 'Aiidudun laka eyaat',
    'Systems Information': 'Ikisila ka asistemu',
    'Admin Command Matrix': 'Apolou ko Admin',
    'Systems Hub': 'Hub loka asistemu',
    'Clinical Systems Hub': 'Clinic loka asistemu',
    'Clinical Core': 'Akeju naka ekisero',
    'Diagnostics & Labs': 'Akiruut ka Maabara',
    'Clinics & Systems': 'Eklinikit ka eSistemu',
    'Search System...': 'Amojun asistemu...',
    'Active System': 'Asistemu naitai',
    'Cache Core': 'Acake kor',
    'Linguistic Matrix': 'Aijul olulimi',
    'Select primary interface dialect': 'Ayer olulimi loka asistemu',
    'Welcome Dr.': 'Yoga Musawo',
    'Workspace Status: Active': 'Eiitai: Elach',
    'Quick Diagnostics Panel': 'Jopo loka akirukot amapi',
    'Hands-free Listening Active': 'Aupokin aitipin',
    'Ask Doctorian Anything...': 'Ingit Doctorian ibore dada...',
    'Active Session': 'Aitai naiton',
    'Settings': 'Aituboorot',
    'Emergency SOS': 'Atoigo SOS',
    'Clinical Systems Information': 'Aituborot naka amedical',
    'Doctorian AI Core': 'Omutima loka Doctorian AI',
    'Optimal': 'Ejokona Bulingo',
    'Cardiac Flux': 'Omutima lok’Aijar',
    'Neural Energy': 'Atorokin naka Aijar',
    'Resets Daily': 'Aituboorot loka nino',
    'Hydration': 'Okunwa Akipi',
    'Change UI Language': 'Aijul olulimi',
    'Core Operations': 'Aitiit naka aijar',
    "Doctors' Dashboard": 'Ebaandi loka Musawo'
  },
  'Lusoga': {
    'Dashboard': 'Ebaandi ya Bulamu',
    'Doctorian Neural Core': 'Omutima gwa Doctorian',
    'Genomic Longevity Core': 'Ekyobukulukuku kya Bulamu',
    'Medical Illustrator': 'Asunira Eddagala',
    'CognisHub Node': 'Kitebe kya CognisHub',
    'Biomatic Sandbox': 'Akasanduko ka Biomatic',
    'Diagnostic Lab': 'Ekebezi lya Obulwaye',
    'Bio-Monitor Console': 'Ekyuma kikeba Obulamu',
    'Health Progress Trace': 'Kwonya Bulamu',
    'Vitality Matrix': 'Amaani ga Bulamu',
    'Bio-Pharmacy Depot': 'Edduuka lya Eddagala',
    'Connect Specialists': 'Yunga ku Bakugu',
    'Systems Information': 'Ebyokumanya Sistemu',
    'Admin Command Matrix': 'Obuyinza bwa Admin',
    'Systems Hub': 'Ekitongole kya Sistemu',
    'Clinical Systems Hub': 'Hub ya Bulamu',
    'Clinical Core': 'Ekitundu kya Clinical Core',
    'Diagnostics & Labs': 'Ebyokukebera ne Maabara',
    'Clinics & Systems': 'Clinica ne Sistemu',
    'Search System...': 'Noonia Sistemu...',
    'Active System': 'Sistemu Ekola',
    'Cache Core': 'Akasige',
    'Linguistic Matrix': 'Kyusa Olulimi',
    'Select primary interface dialect': 'Onda olulimi lw\'oyenda',
    'Welcome Dr.': 'Nsanyuse okukulaba Dr.',
    'Workspace Status: Active': 'Omulimo: Gukola gye',
    'Quick Diagnostics Panel': 'Kukebera kw\'amangu',
    'Hands-free Listening Active': 'Okuwulira kuli ku maanyi',
    'Ask Doctorian Anything...': 'Buuza Doctorian buli kintu...',
    'Active Session': 'Kiseera ekikola',
    'Settings': 'Entegeka',
    'Emergency SOS': 'SOS ya mangu',
    'Clinical Systems Information': 'Ebyokumanya eby\'Eddagala',
    'Doctorian AI Core': 'Omutima gwa Doctorian AI',
    'Optimal': 'Bulungi Inho',
    'Cardiac Flux': 'Okukuba kw’Omutima',
    'Neural Energy': 'Amaani g’Omubiri',
    'Resets Daily': 'Kizibwawo Bulijjo',
    'Hydration': 'Okunywa Amaazzi',
    'Change UI Language': 'Kyusa Olulimi lwa Sistemu',
    'Core Operations': 'Emirimo gy’Ekiini',
    "Doctors' Dashboard": 'Ebaandi y’Omusawo'
  },
  'Lugbara': {
    'Dashboard': 'Tanga be mve',
    'Doctorian Neural Core': 'Bari be Doctorian',
    'Genomic Longevity Core': 'Oca be kile mve',
    'Medical Illustrator': 'Acopi be adi',
    'CognisHub Node': 'Nodo be CognisHub',
    'Biomatic Sandbox': 'Kaso be Biomatic',
    'Diagnostic Lab': 'Mbaara be diagnostic',
    'Bio-Monitor Console': 'Console be okpo',
    'Health Progress Trace': 'Obipi be ada',
    'Vitality Matrix': 'Akpara okpo be',
    'Bio-Pharmacy Depot': 'Kasuro be adi',
    'Connect Specialists': 'Eje drakpi be dda',
    'Systems Information': 'Efofo be sistem',
    'Admin Command Matrix': 'Okpo be admin',
    'Systems Hub': 'Sistem central be',
    'Clinical Systems Hub': 'Klinik be sistem',
    'Clinical Core': 'Core klinik be',
    'Diagnostics & Labs': 'Uvupi ba diagnostic',
    'Clinics & Systems': 'Kliniki be sistem',
    'Search System...': 'Uvupi be sistem...',
    'Active System': 'Edo mve azini',
    'Cache Core': 'Cache be mve',
    'Linguistic Matrix': 'Asupi be ti',
    'Select primary interface dialect': 'Adre ti adipi ba',
    'Welcome Dr.': 'Ali o Musawo',
    'Workspace Status: Active': 'Ozu mve: Edo gwe',
    'Quick Diagnostics Panel': 'Mbaara be uvupi amapi',
    'Hands-free Listening Active': 'Adremve ozu be',
    'Ask Doctorian Anything...': 'Obi Doctorian dri kpi...',
    'Active Session': 'Saawa ozu be',
    'Settings': 'Erepi azini',
    'Emergency SOS': 'Dra be SOS',
    'Clinical Systems Information': 'Efofo be drakpi',
    'Doctorian AI Core': 'Bari be Doctorian AI',
    'Optimal': 'Mve Maber',
    'Cardiac Flux': 'Bari be Doctorian',
    'Neural Energy': 'Akpara okpo be',
    'Resets Daily': 'Erepi niko be',
    'Hydration': 'Unya Iyi',
    'Change UI Language': 'Asupi be ti',
    'Core Operations': 'Ozu mve core',
    "Doctors' Dashboard": 'Tanga be Musawo'
  },
  'Runyoro-Rutooro': {
    'Dashboard': 'Ebaandi y\'eMikorra',
    'Doctorian Neural Core': 'Omutima gwa Doctorian',
    'Genomic Longevity Core': 'Eby\'obusika n\'Obulamuoburaingwa',
    'Medical Illustrator': 'Oshusho y\'Eddagala',
    'CognisHub Node': 'Kitebe kya CognisHub',
    'Biomatic Sandbox': 'Akasanduku ka Biomatic',
    'Diagnostic Lab': 'Kebezi y\'Akeberro',
    'Bio-Monitor Console': 'Ekyuma kikeba Obulamu',
    'Health Progress Trace': 'Okuhondera Obulamu',
    'Vitality Matrix': 'Engarika y\'Obulamu',
    'Bio-Pharmacy Depot': 'Edduuka ly\'Eddagala',
    'Connect Specialists': 'Kwatahanisa n\'Abashaho ba Kugu',
    'Systems Information': 'Ebikwata ha Sistemu',
    'Admin Command Matrix': 'Obuyinza bwa Admin',
    'Systems Hub': 'Ekitongole kya Sistemu',
    'Clinical Systems Hub': 'Kitebe ky\'Eby\'obushaho',
    'Clinical Core': 'Ekitundu ky\'Obushaho',
    'Diagnostics & Labs': 'Kukebera ne Maabara',
    'Clinics & Systems': 'Kliniki ne Sistemu',
    'Search System...': 'Sherreza Sistemu...',
    'Active System': 'Kikora',
    'Cache Core': 'Akasige',
    'Linguistic Matrix': 'Kyusa Olulimi',
    'Select primary interface dialect': 'Onde olulimi Rwawe',
    'Welcome Dr.': 'Kasiibo Dr.',
    'Workspace Status: Active': 'Emikorra: Negyenda Gye',
    'Quick Diagnostics Panel': 'Kukebera kw\'amangu',
    'Hands-free Listening Active': 'Okuhurra kuli ku maanyi',
    'Ask Doctorian Anything...': 'Buuza Doctorian buli kintu...',
    'Active Session': 'Akapatiko Kaseera',
    'Settings': 'Entegereka oburungi',
    'Emergency SOS': 'SOS ya mangu',
    'Clinical Systems Information': 'Enfomo y\'Eddagala',
    'Doctorian AI Core': 'Omutima gwa Doctorian AI',
    'Optimal': 'Kirungi muno',
    'Cardiac Flux': 'Okukuba kw’Omutima',
    'Neural Energy': 'Amaanyi g’Omubiri',
    'Resets Daily': 'Kigarurwaho Bulijo',
    'Hydration': 'Okunywamu Amaizi',
    'Change UI Language': 'Kyusa Olulimi lwa Sistemu',
    'Core Operations': 'Emikorra y’Ekiini',
    "Doctors' Dashboard": 'Ebaandi y’Omushaho'
  },
  'Rukonjo': {
    'Dashboard': 'Ebbende y\'Emibiri',
    'Doctorian Neural Core': 'Omutima gwa Doctorian',
    'Genomic Longevity Core': 'Eriserukya ery\'Obulamu',
    'Medical Illustrator': 'Asusa lyo Eddagala',
    'CognisHub Node': 'Kitebe kya CognisHub',
    'Biomatic Sandbox': 'Akasanduku ko Biomatic',
    'Diagnostic Lab': 'Maabara y\'Erikebera',
    'Bio-Monitor Console': 'Monitor y\'Erilengera',
    'Health Progress Trace': 'Okukwama Obulamu',
    'Vitality Matrix': 'Engabi y\'Obulamu',
    'Bio-Pharmacy Depot': 'Ediru ly\'Eddagala',
    'Connect Specialists': 'Yunga n\'Abakugu b\'Obulamu',
    'Systems Information': 'Ebikwata ha Sistemu',
    'Admin Command Matrix': 'Obuyinza obwo Admin',
    'Systems Hub': 'Ekitongole kyo Sistemu',
    'Clinical Systems Hub': 'Ebbende yo Bulamu',
    'Clinical Core': 'Core yo Bulamu',
    'Diagnostics & Labs': 'Diagnostics ne Maabara',
    'Clinics & Systems': 'Amalwaliro ne Sistemu',
    'Search System...': 'Seza Sistemu...',
    'Active System': 'Ekora lyo',
    'Cache Core': 'Akasige',
    'Linguistic Matrix': 'Akatabo ko Lulimi',
    'Select primary interface dialect': 'Sombola olulimi lwu',
    'Welcome Dr.': 'Wasingya Musawo',
    'Workspace Status: Active': 'Omulimo: Ghukora',
    'Quick Diagnostics Panel': 'Kukebera kw\'omangu',
    'Hands-free Listening Active': 'Eritsipa owatsinga',
    'Ask Doctorian Anything...': 'Bulia Doctorian buli kindu...',
    'Active Session': 'Kaseera ko Molimo',
    'Settings': 'Amategheka',
    'Emergency SOS': 'SOS y\'omangu',
    'Clinical Systems Information': 'Ebikwata ha Ddagala',
    'Doctorian AI Core': 'Omutima gwa Doctorian AI',
    'Optimal': 'Ghilhe Ndolo',
    'Cardiac Flux': 'Okukuba kw’Omutima',
    'Neural Energy': 'Engabi y’Omubiri',
    'Resets Daily': 'Kigarurwaho Bulijo',
    'Hydration': 'Okunywa Amaizi',
    'Change UI Language': 'Kyusa Olulimi lwa Sistemu',
    'Core Operations': 'Emirimo gy’Ekiini',
    "Doctors' Dashboard": 'Ebbende y’Omusawo'
  },
  'Samia': {
    'Dashboard': 'Engalo y\'emilimo',
    'Doctorian Neural Core': 'Omuteyo kwa Doctorian',
    'Genomic Longevity Core': 'Ekikaibeele kya bulamu',
    'Medical Illustrator': 'Omusi sye eddagala',
    'CognisHub Node': 'Ekitebe kya CognisHub',
    'Biomatic Sandbox': 'Akasanduko ka Biomatic',
    'Diagnostic Lab': 'Ekemeero lya bulwaye',
    'Bio-Monitor Console': 'Ekyuma kyola bulamu',
    'Health Progress Trace': 'Okukuunda obulamu',
    'Vitality Matrix': 'Amakani ka bulamu',
    'Bio-Pharmacy Depot': 'Eryoolo lya eddagala',
    'Connect Specialists': 'Khunye n\'abasaho ba makhaba',
    'Systems Information': 'Amang\'ana ka sistemu',
    'Admin Command Matrix': 'Obunikhali bwa Admin',
    'Systems Hub': 'Ekitongole kya Sistemu',
    'Clinical Systems Hub': 'Hub lya bulami',
    'Clinical Core': 'Ekitundu kya Clinical Core',
    'Diagnostics & Labs': 'Diagnostics ne Maabara',
    'Clinics & Systems': 'Amalwalo ne Sistemu',
    'Search System...': 'Nyoola sistemo...',
    'Active System': 'Ekolayo amani',
    'Cache Core': 'Esige',
    'Linguistic Matrix': 'Khusa olulimi',
    'Select primary interface dialect': 'Oonjola olulimi lulala',
    'Welcome Dr.': 'Murembe Musawo',
    'Workspace Status: Active': 'Emilimo: Keekenda bulungi',
    'Quick Diagnostics Panel': 'Khukebera khw\'amangu',
    'Hands-free Listening Active': 'Kuhulira kukhulembeke',
    'Ask Doctorian Anything...': 'Reeba Doctorian buli khindu...',
    'Active Session': 'Ekaari ey\'emilimo',
    'Settings': 'Ametekero',
    'Emergency SOS': 'SOS ya mangu',
    'Clinical Systems Information': 'Amang\'ana ke eddagala',
    'Doctorian AI Core': 'Omuteyo kwa Doctorian AI',
    'Optimal': 'Mulungi muno',
    'Cardiac Flux': 'Okuteera kw’Omuteyo',
    'Neural Energy': 'Amakani g’Omubiri',
    'Resets Daily': 'Khubula buli naye',
    'Hydration': 'Khunywa Amaazi',
    'Change UI Language': 'Khusa olulimi lwa sistu',
    'Core Operations': 'Emilimo gy’ekitebe',
    "Doctors' Dashboard": 'Engalo y’Omusawo'
  },
  'Karamojong': {
    'Dashboard': 'Epeta lotic',
    'Doctorian Neural Core': 'Tau loka Doctorian',
    'Genomic Longevity Core': 'Aponit naka bulamuoburaingwa',
    'Medical Illustrator': 'Egirian loka lamedical',
    'CognisHub Node': 'Kitebe a CognisHub',
    'Biomatic Sandbox': 'Akasaduk naka Biomatic',
    'Diagnostic Lab': 'Maabara naka akirukot',
    'Bio-Monitor Console': 'Epet loting',
    'Health Progress Trace': 'Aiti loka aijar',
    'Vitality Matrix': 'Amoroki naka aijar',
    'Bio-Pharmacy Depot': 'Aropit naka ekisero',
    'Connect Specialists': 'Aiidud ko emuron',
    'Systems Information': 'Ngakiro naka asistem',
    'Admin Command Matrix': 'Apoloy ko Admin',
    'Systems Hub': 'Centr a sistem',
    'Clinical Systems Hub': 'Hub naka emedical',
    'Clinical Core': 'Katik a emedical',
    'Diagnostics & Labs': 'Akiru ka Maabara',
    'Clinics & Systems': 'Amuronit ka asistem',
    'Search System...': 'Aro asistem...',
    'Active System': 'Erai katic',
    'Cache Core': 'Ikaileta',
    'Linguistic Matrix': 'Aijul olulimi',
    'Select primary interface dialect': 'Ayer olulimi loka emedical',
    'Welcome Dr.': 'Mata Emuron',
    'Workspace Status: Active': 'Ekatica: Ejokona',
    'Quick Diagnostics Panel': 'Akir amapi',
    'Hands-free Listening Active': 'Aupoki ekito',
    'Ask Doctorian Anything...': 'Ingit Doctorian ibore dada...',
    'Active Session': 'Kaseera loka tic',
    'Settings': 'Aitelek',
    'Emergency SOS': 'SOS amapi',
    'Clinical Systems Information': 'Ebikwata ka emedical',
    'Doctorian AI Core': 'Tau loka Doctorian AI',
    'Optimal': 'Ejokona Mabor',
    'Cardiac Flux': 'Tau loka Doctorian',
    'Neural Energy': 'Amoroki naka Aijar',
    'Resets Daily': 'Aituboorot loka nino',
    'Hydration': 'Okunywa Ngakipi',
    'Change UI Language': 'Aijul olulimi',
    'Core Operations': 'Epeta lotic core',
    "Doctors' Dashboard": 'Epeta loka Emuron'
  }
};

// Background translation query cache to avoid repeating requests
const pendingTranslations = new Set<string>();

const fetchTranslationInBackground = (text: string, targetLanguage: string) => {
  const cacheKey = `${targetLanguage}:::${text}`;
  if (pendingTranslations.has(cacheKey)) return;
  pendingTranslations.add(cacheKey);

  fetch('/api/public/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLang: targetLanguage })
  })
  .then(res => res.json())
  .then(data => {
    if (data && data.text) {
      const cleanedText = data.text.trim();
      if (
        cleanedText.includes('Clinical Synapse') ||
        cleanedText.includes('Doctorian') ||
        cleanedText.includes('🧠') ||
        cleanedText.includes('🩺') ||
        cleanedText.length > 80
      ) {
        console.warn("[Auto-translate] Bypassed corrupted translation string:", cleanedText);
        return;
      }

      let cache: any = {};
      try {
        cache = JSON.parse(localStorage.getItem("local_translations_cache") || '{}');
      } catch (_) {}

      if (!cache[targetLanguage]) {
        cache[targetLanguage] = {};
      }
      cache[targetLanguage][text] = cleanedText;
      localStorage.setItem("local_translations_cache", JSON.stringify(cache));

      // Trigger page translation traversal re-evaluation
      window.dispatchEvent(new CustomEvent("local_translations_updated", {
        detail: { text, targetLanguage, translation: cleanedText }
      }));
    }
  })
  .catch(err => {
    console.warn("[Auto-translate background fetch bypassed]", text, err);
  })
  .finally(() => {
    setTimeout(() => pendingTranslations.delete(cacheKey), 8000);
  });
};

const triggerMarianOfflineTranslation = (text: string, targetLanguage: string) => {
  const cacheKey = `${targetLanguage}:::${text}`;
  if (pendingTranslations.has(cacheKey)) return;
  pendingTranslations.add(cacheKey);

  runMarianInference(text, targetLanguage)
    .then(translatedText => {
      let cache: any = {};
      try {
        cache = JSON.parse(localStorage.getItem("local_translations_cache") || '{}');
      } catch (_) {}

      if (!cache[targetLanguage]) {
        cache[targetLanguage] = {};
      }
      cache[targetLanguage][text] = translatedText;
      localStorage.setItem("local_translations_cache", JSON.stringify(cache));

      // Trigger page translation traversal re-evaluation
      window.dispatchEvent(new CustomEvent("local_translations_updated", {
        detail: { text, targetLanguage, translation: translatedText }
      }));
    })
    .catch(err => {
      console.error("[MarianMT Offline Pipeline Error]", err);
    })
    .finally(() => {
      setTimeout(() => pendingTranslations.delete(cacheKey), 500); // Fast release for fluid offline translation
    });
};

const simplifiedOfflineTranslations: Record<string, Record<string, string>> = {
  'Luganda': {
    'Home Screen': 'Wwebbulaasi',
    'Talk to Doctor': 'Yogera ne Musawo',
    'Long Life Lab': 'Ebikwatagana ku Nsigo',
    'Body Pictures': 'Ebifaananyi by’Eddagala',
    'Train Doctor': 'Tendeka Musawo',
    'Health Simulator': 'Kipimo ky’Obulamu',
    'Check Illness': 'Kebera Obulwaye',
    'Heart & Pulse': 'Okukuba kw’Omutima',
    'Health History': 'Kalonda w’Obulamu',
    'Body Energy': 'Amaanyi g’Omubiri',
    'Doctor Area': 'Ebikwata ku Basawo',
    'Medicine Store': 'Ettundiro ly’Eddagala',
    'Talk to Experts': 'Yunga ku Bakugu',
    'About App': 'Ebikwata ku Pulogulaamu',
    'Admin Panel': 'Obuyinza obwa Admin',
    'Help Center': 'Okuyambibwa',
    'Privacy Vault': 'Kakebe k’Ebyama',
    'Terms & Data': 'Ebiragiro n’Ebiwandiiko'
  },
  'Swahili': {
    'Home Screen': 'Mwangaza',
    'Talk to Doctor': 'Zungumza na Daktari',
    'Long Life Lab': 'Maabara ya Maisha Marefu',
    'Body Pictures': 'Picha za Mwili',
    'Train Doctor': 'Funza Daktari',
    'Health Simulator': 'Kielelezo cha Afya',
    'Check Illness': 'Chunguza Ugonjwa',
    'Heart & Pulse': 'Moyo na Mapigo',
    'Health History': 'Historia ya Afya',
    'Body Energy': 'Nguvu ya Mwili',
    'Doctor Area': 'Eneo la Madaktari',
    'Medicine Store': 'Duka la Dawa',
    'Talk to Experts': 'Ongea na Wataalamu',
    'About App': 'Kuhusu Programu',
    'Admin Panel': 'Jopo la Utawala',
    'Help Center': 'Kituo cha Msaada',
    'Privacy Vault': 'Eneo la Faragha',
    'Terms & Data': 'Vigezo na Data'
  },
  'Spanish': {
    'Home Screen': 'Inicio',
    'Talk to Doctor': 'Hablar con Médico',
    'Long Life Lab': 'Laboratorio de Vida Larga',
    'Body Pictures': 'Imágenes del Cuerpo',
    'Train Doctor': 'Entrenar Médico',
    'Health Simulator': 'Simulador de Salud',
    'Check Illness': 'Comprobar Enfermedad',
    'Heart & Pulse': 'Corazón y Pulso',
    'Health History': 'Historial de Salud',
    'Body Energy': 'Energía del Cuerpo',
    'Doctor Area': 'Área de Médicos',
    'Medicine Store': 'Farmacia',
    'Talk to Experts': 'Hablar con Expertos',
    'About App': 'Sobre la Aplicación',
    'Admin Panel': 'Panel de Control',
    'Help Center': 'Centro de Ayuda',
    'Privacy Vault': 'Bóveda de Privacidad',
    'Terms & Data': 'Términos y Datos'
  },
  'French': {
    'Home Screen': 'Accueil',
    'Talk to Doctor': 'Parler au Docteur',
    'Long Life Lab': 'Labo Vie Longue',
    'Body Pictures': 'Images du Corps',
    'Train Doctor': 'Former le Docteur',
    'Health Simulator': 'Simulateur de Santé',
    'Check Illness': 'Vérifier la Maladie',
    'Heart & Pulse': 'Cœur et Pouls',
    'Health History': 'Historique de Santé',
    'Body Energy': 'Énergie du Corps',
    'Doctor Area': 'Espace Docteurs',
    'Medicine Store': 'Pharmacie',
    'Talk to Experts': 'Parler aux Experts',
    'About App': 'À Propos de l’App',
    'Admin Panel': 'Panneau d’Administration',
    'Help Center': 'Centre d’Aide',
    'Privacy Vault': 'Coffre de Confidentialité',
    'Terms & Data': 'Conditions et Données'
  },
  'German': {
    'Home Screen': 'Startbildschirm',
    'Talk to Doctor': 'Mit Arzt sprechen',
    'Long Life Lab': 'Labor für langes Leben',
    'Body Pictures': 'Körperbilder',
    'Train Doctor': 'Arzt ausbilden',
    'Health Simulator': 'Gesundheitssimulator',
    'Check Illness': 'Krankheit prüfen',
    'Heart & Pulse': 'Herz & Puls',
    'Health History': 'Gesundheitsverlauf',
    'Body Energy': 'Körperenergie',
    'Doctor Area': 'Arztbereich',
    'Medicine Store': 'Apotheke',
    'Talk to Experts': 'Mit Experten sprechen',
    'About App': 'Über die App',
    'Admin Panel': 'Admin-Bereich',
    'Help Center': 'Hilfe-Center',
    'Privacy Vault': 'Datenschutz-Tresor',
    'Terms & Data': 'Nutzungsbedingungen'
  },
  'Chinese': {
    'Home Screen': '主屏幕',
    'Talk to Doctor': '咨询医生',
    'Long Life Lab': '长寿实验室',
    'Body Pictures': '身体图像',
    'Train Doctor': '训练医生',
    'Health Simulator': '健康模拟器',
    'Check Illness': '检查疾病',
    'Heart & Pulse': '心脏与脉搏',
    'Health History': '健康历史',
    'Body Energy': '身体能量',
    'Doctor Area': '医生区域',
    'Medicine Store': '药房',
    'Talk to Experts': '咨询专家',
    'About App': '关于应用',
    'Admin Panel': '管理面板',
    'Help Center': '帮助中心',
    'Privacy Vault': '隐私保险库',
    'Terms & Data': '条款与数据'
  },
  'Hindi': {
    'Home Screen': 'मुख्य स्क्रीन',
    'Talk to Doctor': 'डॉक्टर से बात करें',
    'Long Life Lab': 'दीर्घायु लैब',
    'Body Pictures': 'शरीर के चित्र',
    'Train Doctor': 'डॉक्टर को सिखाएं',
    'Health Simulator': 'स्वास्थ्य सिम्युलेटर',
    'Check Illness': 'बीमारी की जाँच',
    'Heart & Pulse': 'दिल और धड़कन',
    'Health History': 'स्वास्थ्य इतिहास',
    'Body Energy': 'शरीर की ऊर्जा',
    'Doctor Area': 'डॉक्टर क्षेत्र',
    'Medicine Store': 'दवा की दुकान',
    'Talk to Experts': 'विशेषज्ञों से बात करें',
    'About App': 'ऐप के बारे में',
    'Admin Panel': 'एडमिन पैनल',
    'Help Center': 'सहायता केंद्र',
    'Privacy Vault': 'गोपनीयता तिजोरी',
    'Terms & Data': 'नियम और डेटा'
  },
  'Arabic': {
    'Home Screen': 'الشاشة الرئيسية',
    'Talk to Doctor': 'تحدث مع الطبيب',
    'Long Life Lab': 'مختبر العمر الطويل',
    'Body Pictures': 'صور الجسم',
    'Train Doctor': 'تدريب الطبيب',
    'Health Simulator': 'محاكي الصحة',
    'Check Illness': 'فحص المرض',
    'Heart & Pulse': 'القلب والنبض',
    'Health History': 'تاريخ الصحة',
    'Body Energy': 'طاقة الجسم',
    'Doctor Area': 'منطقة الأطباء',
    'Medicine Store': 'مخزن الأدوية',
    'Talk to Experts': 'تحدث مع الخبراء',
    'About App': 'حول التطبيق',
    'Admin Panel': 'لوحة التحكم',
    'Help Center': 'مركز المساعدة',
    'Privacy Vault': 'خزنة الخصوصية',
    'Terms & Data': 'الشروط والبيانات'
  },
  'Portuguese': {
    'Home Screen': 'Tela Inicial',
    'Talk to Doctor': 'Falar com Médico',
    'Long Life Lab': 'Laboratório de Longevidade',
    'Body Pictures': 'Imagens do Corpo',
    'Train Doctor': 'Treinar Médico',
    'Health Simulator': 'Simulador de Saúde',
    'Check Illness': 'Verificar Doença',
    'Heart & Pulse': 'Coração e Pulso',
    'Health History': 'Histórico de Saúde',
    'Body Energy': 'Energia do Corpo',
    'Doctor Area': 'Área Médica',
    'Medicine Store': 'Farmácia',
    'Talk to Experts': 'Falar com Especialistas',
    'About App': 'Sobre o Aplicativo',
    'Admin Panel': 'Painel Administrativo',
    'Help Center': 'Central de Ajuda',
    'Privacy Vault': 'Cofre de Privacidade',
    'Terms & Data': 'Termos e Dados'
  },
  'Runyankole-Rukiga': {
    'Home Screen': 'Ebaandi y’eMirimo',
    'Talk to Doctor': 'Gamba na Musawo',
    'Long Life Lab': 'Oburamu Obureingwa',
    'Body Pictures': 'Ebishushani by’Omubiri',
    'Train Doctor': 'Tunga Musawo',
    'Health Simulator': 'Akasanduku k’Oburamu',
    'Check Illness': 'Kebera Oburwire',
    'Heart & Pulse': 'Omutima n’Okukuba',
    'Health History': 'Ebyafaayo by’Oburamu',
    'Body Energy': 'Amaanyi g’Omubiri',
    'Doctor Area': 'Ekitundu ky’Abashaho',
    'Medicine Store': 'Eitundiro ry’Eddagala',
    'Talk to Experts': 'Gamba n’Abashaho ba Kugu',
    'About App': 'Ebikwata ha Sistemu',
    'Admin Panel': 'Obushobozi bwa Admin'
  },
  'Acholi-Luo': {
    'Home Screen': 'Pany kin mogo',
    'Talk to Doctor': 'Lok ki Musawo',
    'Long Life Lab': 'Kwan me Nying',
    'Body Pictures': 'Cal me Cogo',
    'Train Doctor': 'Pwony Musawo',
    'Health Simulator': 'Cogo me Biomatic',
    'Check Illness': 'Ngolo bur',
    'Heart & Pulse': 'Cwiny ki Cencor',
    'Health History': 'Kwo pa yat',
    'Body Energy': 'Matrix me kwo',
    'Doctor Area': 'Core me yat',
    'Medicine Store': 'Kabedo me yat',
    'Talk to Experts': 'Kub ki ludito yat',
    'About App': 'Ngec me lany',
    'Admin Panel': 'Twero pa admin'
  },
  'Langi': {
    'Home Screen': 'Kany me ngol',
    'Talk to Doctor': 'Lok i kura ne Musawo',
    'Long Life Lab': 'Kikok kor obola',
    'Body Pictures': 'Cal me obola',
    'Train Doctor': 'Pwony Musawo',
    'Health Simulator': 'Akasanduk me Biomatic',
    'Check Illness': 'Ngolo bur',
    'Heart & Pulse': 'Cwiny ki Monitor',
    'Health History': 'Nino kor kwo',
    'Body Energy': 'Teko me kwo',
    'Doctor Area': 'Yub me kwo',
    'Medicine Store': 'Karibiti me yat',
    'Talk to Experts': 'Yubu ludito yat',
    'About App': 'Ngec kor lany',
    'Admin Panel': 'Twero pa admin'
  },
  'Iteso': {
    'Home Screen': 'Ebaandi eupaas',
    'Talk to Doctor': 'Ingit Musawo',
    'Long Life Lab': 'Ikaileta loka aijar',
    'Body Pictures': 'Ebishushani loka aijar',
    'Train Doctor': 'Aitipin Musawo',
    'Health Simulator': 'Akasaduku nako Biomatic',
    'Check Illness': 'Akirukot',
    'Heart & Pulse': 'Omutima loka aijar',
    'Health History': 'Aitiit aijar',
    'Body Energy': 'Atorokin naka aijar',
    'Doctor Area': 'Clinic loka asistemu',
    'Medicine Store': 'Abisikin naka ekisero',
    'Talk to Experts': 'Aiidudun laka eyaat',
    'About App': 'Ikisila ka asistemu',
    'Admin Panel': 'Apolou ko Admin'
  },
  'Lusoga': {
    'Home Screen': 'Ebaandi ya Bulamu',
    'Talk to Doctor': 'Yogera ne Musawo',
    'Long Life Lab': 'Ekyobukulukuku kya Bulamu',
    'Body Pictures': 'Ebifaananyi bya Bulamu',
    'Train Doctor': 'Tendeka Musawo',
    'Health Simulator': 'Akasanduko ka Biomatic',
    'Check Illness': 'Ekebezi lya Obulwaye',
    'Heart & Pulse': 'Omutima gwa Doctorian',
    'Health History': 'Kwonya Bulamu',
    'Body Energy': 'Amaani ga Bulamu',
    'Doctor Area': 'Hub ya Bulamu',
    'Medicine Store': 'Edduuka lya Eddagala',
    'Talk to Experts': 'Yunga ku Bakugu',
    'About App': 'Ebyokumanya Sistemu',
    'Admin Panel': 'Obuyinza bwa Admin'
  },
  'Lugbara': {
    'Home Screen': 'Tanga be mve',
    'Talk to Doctor': 'Obi Musawo dri',
    'Long Life Lab': 'Oca be kile mve',
    'Body Pictures': 'Ebifaananyi be mve',
    'Train Doctor': 'Mbaara be diagnostic',
    'Health Simulator': 'Kaso be Biomatic',
    'Check Illness': 'Uvupi ba diagnostic',
    'Heart & Pulse': 'Bari be Doctorian',
    'Health History': 'Obipi be ada',
    'Body Energy': 'Akpara okpo be',
    'Doctor Area': 'Klinik be sistem',
    'Medicine Store': 'Kasuro be adi',
    'Talk to Experts': 'Eje drakpi be dda',
    'About App': 'Efofo be sistem',
    'Admin Panel': 'Okpo be admin'
  },
  'Runyoro-Rutooro': {
    'Home Screen': "Ebaandi y'eMikorra",
    'Talk to Doctor': 'Gamba na Musawo',
    'Long Life Lab': "Eby'obusika n'Obulamu",
    'Body Pictures': "Ebishushani by'Eddagala",
    'Train Doctor': 'Tendeka Musawo',
    'Health Simulator': 'Akasanduku ka Biomatic',
    'Check Illness': 'Kebera Oburwire',
    'Heart & Pulse': 'Omutima gwa Doctorian',
    'Health History': 'Okuhondera Obulamu',
    'Body Energy': "Engarika y'Obulamu",
    'Doctor Area': "Kitebe ky'Eby'obushaho",
    'Medicine Store': "Edduuka ly'Eddagala",
    'Talk to Experts': 'Kwatahanisa n’Abashaho',
    'About App': 'Ebikwata ha Sistemu',
    'Admin Panel': 'Obuyinza bwa Admin'
  },
  'Rukonjo': {
    'Home Screen': "Ebbende y'Emibiri",
    'Talk to Doctor': 'Bulia Musawo',
    'Long Life Lab': "Eriserukya ery'Obulamu",
    'Body Pictures': "Ebifaananyi by'Eddagala",
    'Train Doctor': 'Tendeka Musawo',
    'Health Simulator': 'Akasanduku ko Biomatic',
    'Check Illness': "Maabara y'Erikebera",
    'Heart & Pulse': 'Omutima gwa Doctorian',
    'Health History': 'Okukwama Obulamu',
    'Body Energy': "Engabi y'Obulamu",
    'Doctor Area': 'Kitebe kya CognisHub',
    'Medicine Store': "Ediru ly'Eddagala",
    'Talk to Experts': 'Yunga n’Abakugu',
    'About App': 'Ebikwata ha Sistemu',
    'Admin Panel': 'Obuyinza obwo Admin'
  },
  'Samia': {
    'Home Screen': "Engalo y'emilimo",
    'Talk to Doctor': 'Reeba Musawo',
    'Long Life Lab': 'Ekikaibeele kya bulamu',
    'Body Pictures': 'Ebifaananyi bye eddagala',
    'Train Doctor': 'Khusa Musawo',
    'Health Simulator': 'Akasanduko ka Biomatic',
    'Check Illness': 'Ekemeero lya bulwaye',
    'Heart & Pulse': 'Omuteyo kwa Doctorian',
    'Health History': 'Okukuunda obulamu',
    'Body Energy': 'Amakani ka bulamu',
    'Doctor Area': 'Hub lya bulami',
    'Medicine Store': 'Eryoolo lya eddagala',
    'Talk to Experts': 'Khunye n’abasaho',
    'About App': "Amang'ana ka sistemu",
    'Admin Panel': 'Obunikhali bwa Admin'
  },
  'Karamojong': {
    'Home Screen': 'Epeta lotic',
    'Talk to Doctor': 'Ingit Emuron',
    'Long Life Lab': 'Aponit naka bulamuoburaingwa',
    'Body Pictures': 'Ebishushani loka emedical',
    'Train Doctor': 'Aitipin Emuron',
    'Health Simulator': 'Akasaduk naka Biomatic',
    'Check Illness': 'Maabara naka akirukot',
    'Heart & Pulse': 'Tau loka Doctorian',
    'Health History': 'Aiti loka aijar',
    'Body Energy': 'Amoroki naka aijar',
    'Doctor Area': 'Hub naka emedical',
    'Medicine Store': 'Aropit naka ekisero',
    'Talk to Experts': 'Aiidud ko emuron',
    'About App': 'Ngakiro naka asistem',
    'Admin Panel': 'Apoloy ko Admin'
  },
  'Russian': {
    'Home Screen': 'Главный экран',
    'Talk to Doctor': 'Чат с врачом',
    'Long Life Lab': 'Лаборатория долголетия',
    'Body Pictures': 'Иллюстрации тела',
    'Train Doctor': 'Обучить врача',
    'Health Simulator': 'Симулятор здоровья',
    'Check Illness': 'Поиск болезней',
    'Heart & Pulse': 'Сердце и пульс',
    'Health History': 'История здоровья',
    'Body Energy': 'Энергия тела',
    'Doctor Area': 'Кабинет врача',
    'Medicine Store': 'Аптека',
    'Talk to Experts': 'Связь с экспертами',
    'About App': 'О приложении',
    'Admin Panel': 'Панель админа'
  },
  'Japanese': {
    'Home Screen': 'ホーム画面',
    'Talk to Doctor': '医師に相談',
    'Long Life Lab': '長寿研究ラボ',
    'Body Pictures': '体のイラスト',
    'Train Doctor': '医師を訓練する',
    'Health Simulator': '健康シミュレーター',
    'Check Illness': '病気を確認する',
    'Heart & Pulse': '心臓と脈拍',
    'Health History': '健康の履歴',
    'Body Energy': '体のエネルギー',
    'Doctor Area': '医師エリア',
    'Medicine Store': '薬局デポ',
    'Talk to Experts': '専門家に相談',
    'About App': 'アプリについて',
    'Admin Panel': '管理パネル'
  },
  'Korean': {
    'Home Screen': '홈 화면',
    'Talk to Doctor': '의사와 상담',
    'Long Life Lab': '장수 연구소',
    'Body Pictures': '인체 그림',
    'Train Doctor': '의사 훈련',
    'Health Simulator': '건강 시뮬레이터',
    'Check Illness': '질병 확인',
    'Heart & Pulse': '심장 및 맥박',
    'Health History': '건강 기록',
    'Body Energy': '신체 에너지',
    'Doctor Area': '의사 전용 영역',
    'Medicine Store': '약국 저장소',
    'Talk to Experts': '전문가 상담',
    'About App': '앱 정보',
    'Admin Panel': '관리자 패널'
  },
  'Italian': {
    'Home Screen': 'Schermata Home',
    'Talk to Doctor': 'Parla con il Medico',
    'Long Life Lab': 'Laboratorio Longevità',
    'Body Pictures': 'Disegni del Corpo',
    'Train Doctor': 'Addestra il Medico',
    'Health Simulator': 'Simulatore di Salute',
    'Check Illness': 'Trova Malatte',
    'Heart & Pulse': 'Cuore e Pulsazioni',
    'Health History': 'Cronologia Salute',
    'Body Energy': 'Energia del Corpo',
    'Doctor Area': 'Area Medici',
    'Medicine Store': 'Deposito Farmaci',
    'Talk to Experts': 'Parla con Esperti',
    'About App': 'Informazioni App',
    'Admin Panel': 'Pannello Amministratore'
  },
  'Turkish': {
    'Home Screen': 'Ana Ekran',
    'Talk to Doctor': 'Doktorla Konuş',
    'Long Life Lab': 'Uzun Yaşam Laboratuvarı',
    'Body Pictures': 'Vücut Resimleri',
    'Train Doctor': 'Doktoru Eğit',
    'Health Simulator': 'Sağlık Simülatörü',
    'Check Illness': 'Hastalık Kontrolü',
    'Heart & Pulse': 'Kalp ve Nabız',
    'Health History': 'Sağlık Geçmişi',
    'Body Energy': 'Vücut Enerjisi',
    'Doctor Area': 'Doktor Bölgesi',
    'Medicine Store': 'Eczane Deposu',
    'Talk to Experts': 'Uzmanlarla Konuş',
    'About App': 'Uygulama Hakkında',
    'Admin Panel': 'Yönetici Paneli'
  }
};

export const translate = (text: string, selectedLanguage: string): string => {
  const trimmed = text.trim();
  if (!trimmed) return text;

  // Simple quick guard to avoid auto-translating things that are numeric values
  if (/^\d+(\.\d+)?%?$/.test(trimmed)) return text;

  const oldKeyFallbackMap: Record<string, string> = {
    'Home Dashboard': 'Home Screen',
    'AI Consultation': 'Talk to Doctor',
    'Longevity & DNA Lab': 'Long Life Lab',
    'Anatomy Illustrator': 'Body Pictures',
    'Neural Core Trainer': 'Train Doctor',
    'Clinical Hub': 'Clinical Hub (Research & References)',
    'Diagnostic Lab Analyser': 'Check Illness',
    'Real-time Bio-Monitor': 'Heart & Pulse',
    'Clinical History Trace': 'Health History',
    'Vitality Bio-Energy': 'Body Energy',
    'Doctors\' Portal': 'Doctor Area',
    'Clinical Pharmacy': 'Medicine Store',
    'Specialist Referral Network': 'Talk to Experts',
    'System & App Info': 'About App',
    'Admin Command Center': 'Admin Panel'
  };

  const lookupKey = oldKeyFallbackMap[trimmed] || trimmed;
  const langKey = selectedLanguage as LanguageCode;

  // 0. Check Simplified Offline Translations
  if (simplifiedOfflineTranslations[langKey]) {
    const matched = simplifiedOfflineTranslations[langKey][lookupKey];
    if (matched) return matched;
    
    // Case-insensitive check
    const lowerLookup = lookupKey.toLowerCase();
    for (const key of Object.keys(simplifiedOfflineTranslations[langKey])) {
      if (key.toLowerCase() === lowerLookup) {
        return simplifiedOfflineTranslations[langKey][key];
      }
    }
  }

  // English does not require further parsing
  if (selectedLanguage.startsWith('English')) {
    return text;
  }

  const systemTranslations = translations[langKey];
  
  // 1. Check Pre-compiled static translations
  if (systemTranslations) {
    if (lookupKey in systemTranslations) {
      return systemTranslations[lookupKey];
    }

    // Case-insensitive static check
    const lowerLookup = lookupKey.toLowerCase();
    for (const key of Object.keys(systemTranslations)) {
      if (key.toLowerCase() === lowerLookup) {
        return systemTranslations[key];
      }
    }
  }

  // 2. Check local dynamically downloaded translations cache
  let localCache: any = {};
  let cacheModified = false;
  try {
    localCache = JSON.parse(localStorage.getItem("local_translations_cache") || '{}');
  } catch (_) {}

  // Sanitize local cache to discard corrupted, AI-synapsed translations
  for (const lang of Object.keys(localCache)) {
    if (localCache[lang] && typeof localCache[lang] === 'object') {
      for (const key of Object.keys(localCache[lang])) {
        const val = localCache[lang][key];
        if (typeof val === 'string' && (
          val.includes('Clinical Synapse') ||
          val.includes('Doctorian') ||
          val.includes('🧠') ||
          val.includes('🩺') ||
          val.length > 80
        )) {
          delete localCache[lang][key];
          cacheModified = true;
        }
      }
    } else {
      delete localCache[lang];
      cacheModified = true;
    }
  }

  if (cacheModified) {
    try {
      localStorage.setItem("local_translations_cache", JSON.stringify(localCache));
    } catch (_) {}
  }

  if (localCache[selectedLanguage] && localCache[selectedLanguage][trimmed]) {
    return localCache[selectedLanguage][trimmed];
  }

  // 3. Dynamic Prefix Translation (e.g. "Welcome Dr. Jane Doe" -> Translation of "Welcome Dr." + " Jane Doe")
  if (trimmed.toLowerCase().startsWith('welcome dr.')) {
    const welcomeTrans = (systemTranslations && systemTranslations['Welcome Dr.']) || 
                         (localCache[selectedLanguage] && localCache[selectedLanguage]['Welcome Dr.']) || 
                         'Welcome Dr.';
    const doctorName = trimmed.substring(12);
    return `${welcomeTrans} ${doctorName}`;
  }

  // 4. Trigger Dynamic Automatic Background Translation
  if (isMarianMTModeActive()) {
    triggerMarianOfflineTranslation(trimmed, selectedLanguage);
  } else {
    fetchTranslationInBackground(trimmed, selectedLanguage);
  }

  return text;
};

// Immediately clean up and sanitize the localStorage cache on load to remove any previously corrupted dynamic entries
(() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const cachedStr = localStorage.getItem("local_translations_cache");
      if (cachedStr) {
        let cacheObj = JSON.parse(cachedStr);
        let hasPoison = false;

        for (const lang of Object.keys(cacheObj)) {
          if (cacheObj[lang] && typeof cacheObj[lang] === 'object') {
            for (const key of Object.keys(cacheObj[lang])) {
              const val = cacheObj[lang][key];
              if (typeof val === 'string' && (
                val.includes('Clinical Synapse') ||
                val.includes('Doctorian') ||
                val.includes('🧠') ||
                val.includes('🩺') ||
                val.length > 80
              )) {
                hasPoison = true;
                break;
              }
            }
          }
          if (hasPoison) break;
        }

        if (hasPoison) {
          console.warn("[Translations Cleanser] Poisoned translation cache detected! Purging local_translations_cache immediately to restore correct UI.");
          localStorage.removeItem("local_translations_cache");
        }
      }
    } catch (e) {
      console.error("[Translations Cleanser] Failed to cleanse local_translations_cache on startup:", e);
    }
  }
})();

