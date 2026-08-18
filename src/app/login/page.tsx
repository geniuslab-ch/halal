"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") ?? "login";
  const nextUrl = searchParams.get("next") ?? "/";

  const [isLogin, setIsLogin] = useState(mode !== "register");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect.");
        setLoading(false);
        return;
      }

      router.push(nextUrl);
      router.refresh();
    } else {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur lors de l'inscription.");
        setLoading(false);
        return;
      }

      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 hero-mesh hv-texture-dark flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-10 right-10 h-40 w-40 rounded-full bg-green/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-60 w-60 rounded-full bg-pine-mid/20 blur-3xl" />
        <div className="relative text-center">
          <div className="relative mx-auto h-32 w-32 mb-6">
            <Image src="/logo.svg" alt="Halal Vaud" fill className="object-contain" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-4">
            Halal <span style={{ color: "#81C784" }}>Vaud</span>
          </h1>
          <p className="text-white/70 text-lg max-w-sm">
            Trouvez des produits halal près de chez vous, et à quel prix !
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              { icon: "🛒", title: "Commandez", desc: "En livraison depuis votre boutique favorite" },
              { icon: "🏷️", title: "Comparez", desc: "Les meilleurs prix du canton" },
              { icon: "📍", title: "Découvrez", desc: "16+ boutiques halal vérifiées" },
              { icon: "✅", title: "Certifié", desc: "Produits 100% halal garantis" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-white/10 p-4">
                <span className="text-2xl">{item.icon}</span>
                <p className="mt-1 font-semibold text-white text-sm">{item.title}</p>
                <p className="text-xs text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-bg">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <div className="relative h-16 w-16">
              <Image src="/logo.svg" alt="Halal Vaud" fill className="object-contain" />
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-paper p-8 shadow-lg">
            <div className="flex rounded-2xl border border-line bg-bg p-1 mb-8">
              <button
                onClick={() => { setIsLogin(true); setError(""); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  isLogin
                    ? "gradient-brand text-white shadow"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(""); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  !isLogin
                    ? "gradient-brand text-white shadow"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                Créer un compte
              </button>
            </div>

            <h2 className="font-display text-2xl font-bold text-pine mb-2">
              {isLogin ? "Bon retour !" : "Rejoignez-nous"}
            </h2>
            <p className="text-sm text-ink-soft mb-8">
              {isLogin
                ? "Connectez-vous pour commander et accéder à vos commandes."
                : "Créez votre compte gratuit pour commander en livraison."}
            </p>

            {error && (
              <div className="mb-6 rounded-xl bg-red-soft border border-red-200 px-4 py-3 text-sm font-medium text-hv-red">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
                    <input
                      type="text"
                      placeholder="Jean Dupont"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full rounded-xl border border-line bg-bg py-3 pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft focus:border-green focus:ring-2 focus:ring-green/20 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
                  <input
                    type="email"
                    placeholder="vous@exemple.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full rounded-xl border border-line bg-bg py-3 pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft focus:border-green focus:ring-2 focus:ring-green/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={isLogin ? "Votre mot de passe" : "Au moins 8 caractères"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={isLogin ? 1 : 8}
                    className="w-full rounded-xl border border-line bg-bg py-3 pl-10 pr-12 text-sm text-ink placeholder:text-ink-soft focus:border-green focus:ring-2 focus:ring-green/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3.5 text-base rounded-xl mt-2"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Se connecter" : "Créer mon compte"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-ink-soft">
              En continuant, vous acceptez nos{" "}
              <Link href="/terms" className="text-pine hover:underline">conditions d&apos;utilisation</Link>{" "}et notre{" "}
              <Link href="/privacy" className="text-pine hover:underline">politique de confidentialité</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
