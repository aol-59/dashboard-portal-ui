import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "app.name": "Dashboard Portal",
    "app.tagline": "Access your dashboards, analytics, and insights in one place",
    "app.secure_login": "Secure login powered by your organization",
    "nav.home": "Home",
    "nav.portal": "Portal",
    "nav.request_access": "Request Access",
    "nav.access_requests": "Access Requests",
    "nav.dashboards": "Dashboards",
    "nav.admin": "Administration",
    "nav.users": "User Management",
    "nav.access_mgmt": "Access Management",
    "btn.login": "Login",
    "btn.logout": "Logout",
    "btn.submit": "Submit",
    "btn.cancel": "Cancel",
    "btn.approve": "Approve",
    "btn.reject": "Reject",
    "btn.add_user": "Add User",
    "btn.edit": "Edit",
    "btn.save": "Save",
    "btn.delete": "Remove",
    "btn.add_access": "Add Access",
    "btn.request_access": "Request Access",
    "btn.retry": "Retry",
    "welcome.greeting": "Welcome back",
    "welcome.no_entities": "No dashboards yet",
    "welcome.no_entities_desc": "You don't have access to any dashboards. Request access to get started.",
    "portal.entities": "Your Dashboards",
    "request.title": "Request Access",
    "request.select_entities": "Select dashboards to request access",
    "request.reason": "Reason (optional)",
    "request.success": "Access request submitted successfully",
    "request.pending": "Pending",
    "access.title": "Access Requests",
    "access.requester": "Requester",
    "access.entity": "Entity",
    "access.reason": "Reason",
    "access.status": "Status",
    "access.date": "Date",
    "access.actions": "Actions",
    "access.all": "All",
    "access.pending": "Pending",
    "access.approved": "Approved",
    "access.rejected": "Rejected",
    "dashboard.kpi": "KPI",
    "dashboard.chart": "Analytics Chart",
    "dashboard.recent": "Recent Items",
    "admin.name": "Name",
    "admin.email": "Email",
    "admin.department": "Department",
    "admin.role": "Role",
    "admin.status": "Status",
    "admin.last_login": "Last Login",
    "admin.actions": "Actions",
    "admin.active": "Active",
    "admin.inactive": "Inactive",
    "admin.admin": "Admin",
    "admin.display_name": "Display Name",
    "admin.select_entity": "Select Entity",
    "admin.owners": "Owners",
    "admin.viewers": "Viewers",
    "admin.assigned_at": "Assigned At",
    "admin.select_user": "Select User",
    "admin.select_role": "Select Role",
    "admin.owner": "Owner",
    "admin.viewer": "Viewer",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "lang.toggle": "عربي",
  },
  ar: {
    "app.name": "بوابة لوحة القيادة",
    "app.tagline": "الوصول إلى لوحات المعلومات والتحليلات والرؤى في مكان واحد",
    "app.secure_login": "تسجيل دخول آمن مدعوم من مؤسستك",
    "nav.home": "الرئيسية",
    "nav.portal": "البوابة",
    "nav.request_access": "طلب الوصول",
    "nav.access_requests": "طلبات الوصول",
    "nav.dashboards": "لوحات المعلومات",
    "nav.admin": "الإدارة",
    "nav.users": "إدارة المستخدمين",
    "nav.access_mgmt": "إدارة الوصول",
    "btn.login": "تسجيل الدخول",
    "btn.logout": "تسجيل الخروج",
    "btn.submit": "إرسال",
    "btn.cancel": "إلغاء",
    "btn.approve": "موافقة",
    "btn.reject": "رفض",
    "btn.add_user": "إضافة مستخدم",
    "btn.edit": "تعديل",
    "btn.save": "حفظ",
    "btn.delete": "إزالة",
    "btn.add_access": "إضافة وصول",
    "btn.request_access": "طلب الوصول",
    "btn.retry": "إعادة المحاولة",
    "welcome.greeting": "مرحباً بعودتك",
    "welcome.no_entities": "لا توجد لوحات بعد",
    "welcome.no_entities_desc": "ليس لديك وصول لأي لوحة. اطلب الوصول للبدء.",
    "portal.entities": "لوحاتك",
    "request.title": "طلب الوصول",
    "request.select_entities": "اختر اللوحات لطلب الوصول",
    "request.reason": "السبب (اختياري)",
    "request.success": "تم إرسال طلب الوصول بنجاح",
    "request.pending": "قيد الانتظار",
    "access.title": "طلبات الوصول",
    "access.requester": "مقدم الطلب",
    "access.entity": "الكيان",
    "access.reason": "السبب",
    "access.status": "الحالة",
    "access.date": "التاريخ",
    "access.actions": "الإجراءات",
    "access.all": "الكل",
    "access.pending": "قيد الانتظار",
    "access.approved": "موافق عليه",
    "access.rejected": "مرفوض",
    "dashboard.kpi": "مؤشر أداء",
    "dashboard.chart": "مخطط التحليلات",
    "dashboard.recent": "العناصر الأخيرة",
    "admin.name": "الاسم",
    "admin.email": "البريد الإلكتروني",
    "admin.department": "القسم",
    "admin.role": "الدور",
    "admin.status": "الحالة",
    "admin.last_login": "آخر تسجيل دخول",
    "admin.actions": "الإجراءات",
    "admin.active": "نشط",
    "admin.inactive": "غير نشط",
    "admin.admin": "مسؤول",
    "admin.display_name": "الاسم المعروض",
    "admin.select_entity": "اختر الكيان",
    "admin.owners": "المالكون",
    "admin.viewers": "المشاهدون",
    "admin.assigned_at": "تاريخ التعيين",
    "admin.select_user": "اختر المستخدم",
    "admin.select_role": "اختر الدور",
    "admin.owner": "مالك",
    "admin.viewer": "مشاهد",
    "theme.light": "فاتح",
    "theme.dark": "داكن",
    "lang.toggle": "EN",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem("language") as Language) || "en"
  );

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (key: string) => translations[language][key] || key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL: language === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
