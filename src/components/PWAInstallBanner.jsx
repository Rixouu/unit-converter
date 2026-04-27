import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const STORAGE_INSTALLED = "unit-converter-pwa-installed";
const STORAGE_SNOOZE_UNTIL = "unit-converter-pwa-install-snooze-until";
const IOS_FALLBACK_MS = 1800;
const SNOOZE_MS = 21 * 24 * 60 * 60 * 1000;

function isStandaloneDisplay() {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: window-controls-overlay)").matches) {
    return true;
  }
  const nav = window.navigator;
  return nav.standalone === true;
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iphone|ipod|ipad/i.test(ua)) return true;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    return true;
  }
  return false;
}

function iosBrowserFlavor() {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/CriOS\//i.test(ua) || /EdgiOS\//i.test(ua) || /OPiOS\//i.test(ua)) {
    return "chrome";
  }
  if (/FxiOS\//i.test(ua)) return "firefox";
  if (
    /Safari/i.test(ua) &&
    /Mobile\//i.test(ua) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//i.test(ua)
  ) {
    return "safari";
  }
  return "other";
}

function pwaIosBodyKey(flavor) {
  switch (flavor) {
    case "safari":
      return "pwa.bannerIosBodySafari";
    case "chrome":
      return "pwa.bannerIosBodyChrome";
    case "firefox":
      return "pwa.bannerIosBodyFirefox";
    default:
      return "pwa.bannerIosBodyGeneric";
  }
}

function readInstalledFlag() {
  try {
    return localStorage.getItem(STORAGE_INSTALLED) === "1";
  } catch {
    return false;
  }
}

function readSnoozed() {
  try {
    const raw = localStorage.getItem(STORAGE_SNOOZE_UNTIL);
    if (!raw) return false;
    const until = Number(raw);
    return Number.isFinite(until) && Date.now() < until;
  } catch {
    return false;
  }
}

function writeSnooze() {
  try {
    localStorage.setItem(STORAGE_SNOOZE_UNTIL, String(Date.now() + SNOOZE_MS));
  } catch {
    /* ignore */
  }
}

function writeInstalled() {
  try {
    localStorage.setItem(STORAGE_INSTALLED, "1");
  } catch {
    /* ignore */
  }
}

export function PwaInstallBanner() {
  const { t } = useTranslation();
  const [deferred, setDeferred] = useState(null);
  const deferredRef = useRef(null);
  const [iosHint, setIosHint] = useState(false);
  const [iosFlavor, setIosFlavor] = useState("other");
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    deferredRef.current = deferred;
  }, [deferred]);

  useEffect(() => {
    if (iosHint && typeof navigator !== "undefined") {
      setIosFlavor(iosBrowserFlavor());
    }
  }, [iosHint]);

  const dismiss = useCallback(() => {
    writeSnooze();
    setDeferred(null);
    setIosHint(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandaloneDisplay()) return;
    if (readInstalledFlag()) return;
    if (readSnoozed()) return;

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setIosHint(false);
    };

    const onAppInstalled = () => {
      writeInstalled();
      setDeferred(null);
      setIosHint(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    const timer = window.setTimeout(() => {
      if (deferredRef.current) return;
      if (isStandaloneDisplay()) return;
      if (readInstalledFlag() || readSnoozed()) return;
      if (isIosDevice()) setIosHint(true);
    }, IOS_FALLBACK_MS);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
      window.clearTimeout(timer);
    };
  }, []);

  const showChrome = deferred != null;
  const showIos = iosHint && !showChrome;
  const visible = showChrome || showIos;

  const onInstallClick = async () => {
    if (!deferred || installing) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setInstalling(false);
      setDeferred(null);
    }
  };

  if (!visible) return null;

  const origin = typeof window !== "undefined" ? window.location.host : "";

  const shellClass =
    "fixed left-3 right-3 top-[max(0.5rem,env(safe-area-inset-top,0px))] z-50 rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-4";

  if (showIos) {
    return (
      <div className={shellClass} role="region" aria-label={t("pwa.bannerAria")}>
        <div className="grid grid-cols-[3rem_1fr_2rem] items-start gap-4">
          <img
            src="/web-app-manifest-192x192.png"
            alt=""
            width={48}
            height={48}
            className="rounded-xl border border-zinc-100 shadow-sm"
          />
          <div className="min-w-0">
            <p className="text-base font-semibold text-zinc-900 leading-tight">
              {t("pwa.bannerTitleIos")}
            </p>
            <p className="mt-1 text-xs text-zinc-500 leading-snug">
              {t("pwa.bannerSubtitleIos")}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="flex h-8 w-8 items-center justify-center justify-self-end rounded-lg text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors"
            aria-label={t("pwa.bannerDismissAria")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
        <div className="mt-4 border-t border-zinc-100 pt-3">
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {t("pwa.bannerIosStepsLabel")}
          </p>
          <p className="mt-2 text-center text-xs text-zinc-600 px-4">
            {t(pwaIosBodyKey(iosFlavor))}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={shellClass} role="region" aria-label={t("pwa.bannerAria")}>
      <div className="grid grid-cols-[3rem_1fr_auto_auto] items-center gap-4">
        <img
          src="/web-app-manifest-192x192.png"
          alt=""
          width={48}
          height={48}
          className="rounded-xl border border-zinc-100 shadow-sm"
        />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-zinc-900 leading-tight">
            {t("pwa.bannerTitleInstall")}
          </p>
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {t("pwa.bannerSubtitle")}
          </p>
        </div>
        <button
          type="button"
          disabled={installing}
          onClick={() => void onInstallClick()}
          className="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold bg-[#E91E63] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {installing ? t("pwa.bannerInstalling") : t("pwa.bannerInstall")}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors"
          aria-label={t("pwa.bannerDismissAria")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
