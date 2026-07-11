import LoginHero from "@/components/features/auth/LoginHero";
import LoginForm from "@/components/features/auth/LoginForm";

export default function Home() {
  return (
    <main className="flex h-screen overflow-hidden flex-col lg:flex-row bg-background lg:overflow-hidden relative selection:bg-primary/20">
      {/* Colonne Gauche - Rose (tertiary) */}
      <div className="w-full lg:w-1/2 min-h-[50vh] lg:h-full shrink-0 relative z-10 overflow-hidden  bg-linear-to-br from-tertiary/10 via-background to-background">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-tertiary/30 blur-[140px] pointer-events-none animate-pulse duration-10000" />
        <LoginHero />
      </div>

      {/* Colonne Droite - Vert (primary) */}
      <div className="w-full lg:w-1/2 min-h-[50vh] lg:h-full shrink-0 relative z-10 overflow-hidden bg-linear-to-bl from-primary/10 via-background to-background">
        <div className="absolute top-1/2 left-1/2 w-64 h-64 shrink-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-bl from-rose-200/20 to-transparent blur-3xl z-10" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-primary/30 blur-[140px] pointer-events-none animate-pulse duration-10000 delay-1000" />
        <LoginForm />
      </div>
    </main>
  );
}
