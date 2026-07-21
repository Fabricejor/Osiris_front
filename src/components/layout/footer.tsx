"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[var(--hero-background)] text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1.5fr] gap-12 lg:gap-8 mb-12">
          
          {/* Column 1: Logo & Info */}
          <div className="flex flex-col space-y-6">
            <Link href="/" className="inline-block relative w-64 h-20">
              <Image 
                src="/images/Osiris Splash Screen.PNG" 
                alt="Osiris Logo" 
                fill 
                className="object-contain object-left" 
                sizes="256px"
              />
            </Link>
            <p className="text-white/70 text-sm max-w-sm">
              {t("footer_subtitle")}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-lg font-semibold text-white">
              {t("footer_platform")}
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="text-white/70 hover:text-[#7bc148] transition-colors text-sm">
                  {t("footer_link_features")}
                </a>
              </li>
              <li>
                <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="text-white/70 hover:text-[#7bc148] transition-colors text-sm">
                  {t("footer_link_how_it_works")}
                </a>
              </li>
              <li>
                <a href="#data-secure" onClick={(e) => scrollToSection(e, "data-secure")} className="text-white/70 hover:text-[#7bc148] transition-colors text-sm">
                  {t("footer_link_security")}
                </a>
              </li>
              <li>
                <a href="#advantages" onClick={(e) => scrollToSection(e, "advantages")} className="text-white/70 hover:text-[#7bc148] transition-colors text-sm">
                  {t("footer_link_advantages")}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-lg font-semibold text-white">
              {t("footer_contact")}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/70 text-sm">
                <Mail className="w-5 h-5 shrink-0" />
                <a href="mailto:hello@quantumsoul.org" className="hover:text-white transition-colors">
                  hello@quantumsoul.org
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/70 text-sm">
                <Phone className="w-5 h-5 shrink-0" />
                <a href="tel:+221771234567" className="hover:text-white transition-colors">
                  +221 77 123 45 67
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/70 text-sm">
                <MapPin className="w-5 h-5 shrink-0" />
                <span>Dakar, Senegal</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-white/50 text-xs sm:text-sm">
            <span>{t("footer_copyright")}</span>
            <span className="hidden sm:inline">•</span>
            <span className="font-semibold text-white/70">{t("footer_collab")}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-white/50 text-xs sm:text-sm">
            <Link href="#" className="hover:text-white transition-colors">
              {t("footer_privacy")}
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              {t("footer_terms")}
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              {t("footer_cookies")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
