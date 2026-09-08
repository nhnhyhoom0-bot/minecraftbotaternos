import {
  Check,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Info,
  Server,
  ShieldAlert,
  Sparkles,
  Wifi,
  X,
} from 'lucide-react';

interface AternosGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AternosGuideModal({ isOpen, onClose }: AternosGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-zinc-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">دليل تشغيل البوت مع سيرفرات اتيرنوس (Aternos)</h3>
              <p className="text-xs text-zinc-400">خطوات بسيطة لضمان دخول البوت وبقاء السيرفر شغالاً 24/7</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4 text-xs leading-relaxed text-zinc-300">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h4 className="font-semibold text-zinc-100 text-sm mb-1">
                تفعيل خيار (مكرك / Cracked) في اتيرنوس
              </h4>
              <p className="text-zinc-400">
                ادخل إلى لوحة تحكم سيرفرك على موقع <span className="text-emerald-400 font-mono">aternos.org</span> ثم
                اضغط على قائمة <strong>الخيارات (Options)</strong> وقم بتفعيل خيار <strong>Cracked (مكرك)</strong>.
                هذا يسمح للبوت بالدخول بدون قيود تسجيل حساب مايكروسوفت.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h4 className="font-semibold text-zinc-100 text-sm mb-1">
                تأكد أن السيرفر شغال (Online)
              </h4>
              <p className="text-zinc-400">
                اضغط زر <strong>Start (تشغيل)</strong> في اتيرنوس وانتظر حتى يصبح السيرفر باللون الأخضر (Online).
                سيرفرات اتيرنوس لا تسمح بالاتصال ما لم تكن في حالة التشغيل.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h4 className="font-semibold text-zinc-100 text-sm mb-1">
                استخدام الآيبي والبورت الديناميكي (Dynamic Port)
              </h4>
              <p className="text-zinc-400">
                تعطي اتيرنوس لكل سيرفر بورت ديناميكي عند التشغيل (مثلاً: <span className="text-emerald-300 font-mono">yourserver.aternos.me:34125</span>).
                يمكنك كتابة العنوان مع البورت مباشرة في خانة الآيبي وسيقوم البوت باكتشاف البورت تلقائياً!
              </p>
            </div>
          </div>

          {/* Step 4: Anti AFK explanation */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex gap-3 text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-emerald-300 text-sm mb-1">
                كيف يبقي البوت سيرفر اتيرنوس شغالاً 24/7؟
              </h4>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                تقوم اتيرنوس بإغلاق السيرفر إذا لم يتواجد أي لاعب أو إذا كان اللاعب غير نشط (AFK) لأكثر من بضع دقائق.
                ميزة <strong>Anti-AFK</strong> المدمجة في هذا البوت ترسل إشارات حركة، قفز، وتحريك رأس كل عدة ثوانٍ،
                مما يجعل اتيرنوس تعتبر السيرفر نشطاً تماماً وتمنع إغلاقه التلقائي!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            فهمت ذلك، إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
}
