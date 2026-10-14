import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Award, ArrowUpRight } from "lucide-react";

export function CoachEvaluationPromo() {
  return (
    <div className="rounded-2xl bg-slate-900 p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-start space-y-1">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-400" />
          تقييم المهارات الشهري للاعبين
        </h3>
        <p className="text-xs text-slate-300">
          يمكنك اعتماد درجات المهارة البدنية والفنية والتكتيكية مباشرة من خلال شاشة التقييمات
        </p>
      </div>

      <Link href="/coach/evaluations">
        <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 h-10 shadow-lg cursor-pointer">
          إدخال التقييمات الشهرية
          <ArrowUpRight className="h-4 w-4 ms-1.5" />
        </Button>
      </Link>
    </div>
  );
}
