"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, ChevronDown, Menu, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const { language, setLanguage, t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll spy to update active link
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -70% 0px" } // Triggers when section is around top third of screen
    );

    const sectionIds = ["features", "how-it-works", "data-secure", "advantages"];
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { id: "features", label: t("footer_link_features"), href: "#features" },
    { id: "how-it-works", label: t("footer_link_how_it_works"), href: "#how-it-works" },
    { id: "data-secure", label: t("footer_link_security"), href: "#data-secure" },
    { id: "advantages", label: t("footer_link_advantages"), href: "#advantages" },
  ];

  return (
    <header className="fixed top-0 z-50 w-full transition-all duration-300 pointer-events-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 transition-all duration-300">
        <nav
          className={`pointer-events-auto transition-all duration-300 mx-auto flex items-center justify-between ${
            isScrolled
              ? "max-w-6xl py-2.5 px-6 bg-[#0f210e]/75 backdrop-blur-md border border-white/10 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              : "max-w-7xl py-4 px-4 bg-transparent border border-transparent rounded-none"
          }`}
        >
          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <Image
              src="/images/osiris-icon-text.png"
              alt="OSIRIS Logo"
              width={130}
              height={38}
              className="object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>

          {/* CENTER: Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = activeLink === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(link.id)?.scrollIntoView({ behavior: "smooth" });
                    setActiveLink(link.id);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#7BC148]/20 text-[#8CE34A] shadow-inner font-semibold border border-[#7BC148]/30"
                      : "text-gray-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* RIGHT: Language Switcher & Get Started Button */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full transition-all text-xs font-semibold text-white backdrop-blur-sm"
              >
                <Globe className="w-3.5 h-3.5 text-[#8CE34A]" />
                <span className="uppercase tracking-wider">{language}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-200 ${isLangOpen ? "rotate-180" : ""}`} />
              </button>

              {isLangOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsLangOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-32 bg-[#0f210e]/95 border border-white/15 rounded-2xl shadow-xl py-1.5 z-20 overflow-hidden backdrop-blur-xl animate-in fade-in-0 slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => {
                        setLanguage("en");
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-between ${
                        language === "en"
                          ? "text-[#8CE34A] font-semibold bg-white/5"
                          : "text-gray-200"
                      }`}
                    >
                      English
                      {language === "en" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8CE34A]" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("fr");
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-between ${
                        language === "fr"
                          ? "text-[#8CE34A] font-semibold bg-white/5"
                          : "text-gray-200"
                      }`}
                    >
                      Français
                      {language === "fr" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8CE34A]" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Get Started Button */}
            <Link
              href="/login"
              className="bg-gradient-to-r from-[#7BC148] to-[#08704F] hover:from-[#8ce34a] hover:to-[#0a8961] text-white font-semibold text-xs lg:text-sm px-5 py-2 rounded-full shadow-lg shadow-emerald-950/40 hover:shadow-emerald-700/20 active:scale-95 transition-all duration-200 border border-white/20"
            >
              {t("get_started")}
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 bg-white/10 border border-white/15 rounded-full text-xs text-white"
            >
              <Globe className="w-3.5 h-3.5 text-[#8CE34A]" />
              <span className="uppercase">{language}</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="pointer-events-auto md:hidden mt-2 p-4 bg-[#0f210e]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl flex flex-col gap-3 animate-in fade-in-0 slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(link.id)?.scrollIntoView({ behavior: "smooth" });
                  setActiveLink(link.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeLink === link.id
                    ? "bg-[#7BC148]/20 text-[#8CE34A] font-semibold"
                    : "text-gray-200 hover:bg-white/10"
                }`}
              >
                {link.label}
              </a>
            ))}
            
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs text-gray-400">Language / Langue:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage("en")}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      language === "en" ? "bg-[#7BC148] text-white" : "bg-white/10 text-gray-300"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage("fr")}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      language === "fr" ? "bg-[#7BC148] text-white" : "bg-white/10 text-gray-300"
                    }`}
                  >
                    FR
                  </button>
                </div>
              </div>

              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center bg-gradient-to-r from-[#7BC148] to-[#08704F] text-white font-semibold text-sm py-2.5 rounded-full shadow-md mt-1"
              >
                {t("get_started")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
