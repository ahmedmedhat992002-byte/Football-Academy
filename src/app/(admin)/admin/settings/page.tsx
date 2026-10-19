"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Shield,
  User,
  Bell,
  Palette,
  Globe,
  Database,
  Save,
  CheckCircle2,
  Camera,
} from "lucide-react";
import { AvatarUploader } from "@/components/ui/avatar-uploader";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [academyName, setAcademyName] = useState("FIFA FC ACADEMY");
  const [managerName, setManagerName] = useState("حسام الدين خالد");
  const [email, setEmail] = useState("hossameldinkhaled244@gmail.com");
  const [phone, setPhone] = useState("01000419832");
  const [userAvatar, setUserAvatar] = useState<string>("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAvatar = localStorage.getItem("academy_user_avatar");
      if (savedAvatar) setUserAvatar(savedAvatar);
      const savedManager = localStorage.getItem("academy_manager_name");
      if (savedManager) setManagerName(savedManager);
      const savedEmail = localStorage.getItem("academy_manager_email");
      if (savedEmail) setEmail(savedEmail);
      const savedPhone = localStorage.getItem("academy_manager_phone");
      if (savedPhone) setPhone(savedPhone);
    }
  }, []);

  const handleAvatarChange = (newAvatar: string) => {
    setUserAvatar(newAvatar);
    if (typeof window !== "undefined") {
      if (newAvatar) {
        localStorage.setItem("academy_user_avatar", newAvatar);
      } else {
        localStorage.removeItem("academy_user_avatar");
      }
      window.dispatchEvent(new Event("academy_avatar_changed"));
    }
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      if (userAvatar) localStorage.setItem("academy_user_avatar", userAvatar);
      localStorage.setItem("academy_manager_name", managerName);
      localStorage.setItem("academy_manager_email", email);
      localStorage.setItem("academy_manager_phone", phone);
      window.dispatchEvent(new Event("academy_avatar_changed"));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
        <div className="text-start space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/20 px-2.5 py-0.5 text-xs font-semibold text-slate-300 border border-slate-500/30">
            <Settings className="h-3 w-3" />
            <span>إعدادات النظام</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black">
            الإعدادات العامة للأكاديمية
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            إدارة بيانات الأكاديمية والتفضيلات العامة وحسابات المسؤولين
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Academy Information */}
          <Card className="p-6 border-slate-200/80">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
                <Shield className="h-5 w-5" />
              </div>
              <div className="text-start">
                <h3 className="text-sm font-extrabold text-slate-900">معلومات الأكاديمية</h3>
                <p className="text-xs text-slate-500">البيانات الأساسية والتعريفية</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-start">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">اسم الأكاديمية</label>
                <Input
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  className="text-start"
                />
              </div>
              <div className="text-start">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">اسم المدير المسؤول</label>
                <Input
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="text-start"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-start">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                    className="text-start"
                  />
                </div>
                <div className="text-start">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">رقم الهاتف</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    className="text-start"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-6 border-slate-200/80">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Palette className="h-5 w-5" />
              </div>
              <div className="text-start">
                <h3 className="text-sm font-extrabold text-slate-900">التفضيلات العامة</h3>
                <p className="text-xs text-slate-500">اللغة والسمة وتفضيلات العرض</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 text-start">
                  <Globe className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">اللغة</p>
                    <p className="text-[10px] text-slate-500">لغة العرض الأساسية</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-amber-500/15 text-amber-500 border border-amber-500/30 font-bold">
                  العربية
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 text-start">
                  <Bell className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">الإشعارات</p>
                    <p className="text-[10px] text-slate-500">تلقي إشعارات الحضور والمتأخرات</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-amber-500/15 text-amber-500 border border-amber-500/30 font-bold">
                  مفعّل
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 text-start">
                  <Database className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">وضع التخزين</p>
                    <p className="text-[10px] text-slate-500">تخزين محلي أو سحابي</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 font-bold">
                  سحابي (Supabase)
                </Badge>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 animate-in fade-in-50">
                <CheckCircle2 className="h-4 w-4" />
                تم حفظ التغييرات بنجاح
              </span>
            )}
            <Button onClick={handleSave} className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-black px-6 shadow-md">
              <Save className="h-4 w-4 me-2" />
              حفظ الإعدادات
            </Button>
          </div>
        </div>

        {/* Side Info Panel */}
        <div className="space-y-4">
          <Card className="p-5 border-slate-200/80 text-start space-y-3 bg-gradient-to-b from-[#121820] to-[#0a0f15] text-white border-amber-500/30">
            <div className="flex items-center gap-2 pb-3 border-b border-amber-500/20">
              <Shield className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-extrabold text-white">شعار FIFA FC ACADEMY الرسمي</h3>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl text-center">
              <div className="relative w-24 h-24 rounded-full ring-2 ring-amber-400 overflow-hidden bg-black shadow-2xl shadow-amber-500/30 mb-2">
                <Image src="/images/logo.png" alt="FIFA FC ACADEMY" fill className="object-cover" />
              </div>
              <span className="font-black text-amber-400 text-sm tracking-wider">FIFA FC ACADEMY</span>
              <span className="text-[10px] text-amber-400 font-bold">الشعار المعتمد في كافة المنظومة</span>
            </div>
          </Card>

          <Card className="p-5 border-slate-200/80 text-start">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-extrabold text-slate-900">حساب المسؤول والصورة الشخصية</h3>
            </div>
            <div className="mt-4 space-y-4">
              <AvatarUploader
                value={userAvatar}
                onChange={handleAvatarChange}
                label="الصورة الشخصية"
                sublabel="ارفع صورتك أو اختر أيقونة رياضية لحسابك"
                size="md"
              />

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs">
                  <p className="font-extrabold text-slate-900">{managerName}</p>
                  <p className="text-[10px] text-amber-700 font-semibold">مدير النظام والأكاديمية</p>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2">
                آخر تسجيل دخول: اليوم — الساعة 10:30 ص
              </div>
            </div>
          </Card>

          <Card className="p-5 border-slate-200/80 text-start">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">معلومات النظام</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">إصدار النظام</span>
                <span className="font-bold text-slate-800">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">إطار العمل</span>
                <span className="font-bold text-slate-800">Next.js</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">قاعدة البيانات</span>
                <span className="font-bold text-slate-800">Supabase</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
