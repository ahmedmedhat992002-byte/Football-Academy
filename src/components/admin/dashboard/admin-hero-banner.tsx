import React from "react";
import Image from "next/image";
import { Shield } from "lucide-react";

interface AdminHeroBannerProps {
  userName: string;
}

export function AdminHeroBanner({ userName }: AdminHeroBannerProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Main Stadium Hero Banner (8 cols / ~70%) */}
      <div className="lg:col-span-8 relative min-h-[220px] md:min-h-[240px] rounded-2xl overflow-hidden shadow-md flex items-center bg-[#0c1219] border border-amber-500/25">
        {/* Background Image with Obsidian & Gold Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-stadium.jpg"
            alt="ملعب الأكاديمية"
            fill
            priority
            className="object-cover object-center mix-blend-overlay opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070d14] via-[#0d1622]/95 to-[#070d14]/95" />
        </div>

        {/* Banner Inner Content */}
        <div className="relative z-10 w-full p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          {/* Right Side (RTL start): Welcome & Title */}
          <div className="text-start space-y-2 max-w-md">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-amber-500/20 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold text-amber-300 border border-amber-500/30">
              <Shield className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="truncate">مرحباً بك يا {userName}</span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full ring-2 ring-amber-400 overflow-hidden bg-black shrink-0 shadow-lg shadow-amber-500/25">
                <Image
                  src="/images/logo.png"
                  alt="FIFA FC ACADEMY"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-400 tracking-wider font-sans">
                  FIFA FC ACADEMY
                </h2>
                <span className="text-[10px] sm:text-[11px] text-amber-300/90 font-bold block">
                  لوحة التحكم والإدارة المركزية
                </span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              تتيح لك متابعة أهم الإحصائيات، الحضور، المراكز، والتقارير العامة.
            </p>
          </div>

          {/* Left Side (RTL end): Inspirational Quote */}
          <div className="text-start md:text-end self-end md:self-center border-t md:border-t-0 md:border-s border-amber-500/30 pt-3 md:pt-0 md:ps-6">
            <p className="text-xs md:text-sm font-semibold text-white/90 leading-relaxed">
              النجاح لا يأتي صدفة ..
              <br />
              <span className="font-bold text-white">&quot;بل من الانضباط والعمل المستمر&quot;</span>
            </p>
            <div className="mt-2 h-1 w-12 bg-amber-400 rounded-full md:ms-auto" />
          </div>
        </div>
      </div>

      {/* Side Card: Player #10 Motivation (4 cols / ~30%) */}
      <div className="lg:col-span-4 relative min-h-[220px] md:min-h-[240px] rounded-2xl overflow-hidden shadow-md bg-[#0e171f] flex flex-col justify-end p-6 group">
        {/* Background Player Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/player-10.jpg"
            alt="لاعب كرة قدم رقم 10"
            fill
            priority
            className="object-cover object-top brightness-90 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        {/* Overlaid Motto */}
        <div className="relative z-10 text-start space-y-1">
          <p className="text-lg font-black text-white tracking-wide">
            الانضباط
          </p>
          <p className="text-base font-extrabold text-amber-400">
            &quot;يصنع الفرق&quot;
          </p>
          <div className="h-1 w-10 bg-amber-400 rounded-full mt-1" />
        </div>
      </div>
    </div>
  );
}
