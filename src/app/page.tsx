"use client";

import { useState, useEffect } from "react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useMenuAnalysis } from "@/hooks/useMenuAnalysis";
import { useCulturalTips } from "@/hooks/useCulturalTips";
import { useMenuExport } from "@/hooks/useMenuExport";
import { useHistory } from "@/hooks/useHistory";
import { Header } from "@/components/Header";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ScanView } from "@/components/ScanView";
import { MenuResultView } from "@/components/MenuResultView";
import { HistoryView } from "@/components/HistoryView";
import type { SavedMenu } from "@/types/menu";

export default function Home() {
  const { targetLang, selectedRegion, setTargetLang, setSelectedRegion } =
    useUserPreferences();
  const analysis = useMenuAnalysis(targetLang, selectedRegion);
  const tips = useCulturalTips(
    selectedRegion,
    targetLang,
    analysis.analyzing,
    analysis.detectedCountry
  );
  const { captureRef, saving, handleSaveImage, handleShare } = useMenuExport(
    analysis.menu
  );
  const { history, saveMenu, deleteMenu } = useHistory();

  const [showHistory, setShowHistory] = useState(false);
  const [viewingFromHistory, setViewingFromHistory] = useState(false);

  // Auto-save when analysis completes
  useEffect(() => {
    if (analysis.menu && !viewingFromHistory) {
      const regionCode =
        analysis.detectedCountry || (selectedRegion === "auto" ? "" : selectedRegion);
      saveMenu(analysis.menu, regionCode, targetLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis.menu]);

  const handleSelectFromHistory = (saved: SavedMenu) => {
    setViewingFromHistory(true);
    setShowHistory(false);
    analysis.loadMenu(saved.menu);
  };

  const handleBack = () => {
    analysis.resetMenu();
    setViewingFromHistory(false);
  };

  return (
    <main className="container" style={{ minHeight: "100vh", padding: "2rem 20px" }}>
      <Header />

      {analysis.error && <ErrorBanner message={analysis.error} />}

      {showHistory ? (
        <HistoryView
          history={history}
          onSelect={handleSelectFromHistory}
          onBack={() => setShowHistory(false)}
          onDelete={deleteMenu}
        />
      ) : !analysis.menu ? (
        <ScanView
          analyzing={analysis.analyzing}
          detectedCountry={analysis.detectedCountry}
          targetLang={targetLang}
          selectedRegion={selectedRegion}
          setTargetLang={setTargetLang}
          setSelectedRegion={setSelectedRegion}
          handleScan={analysis.handleScan}
          handlePaste={analysis.handlePaste}
          handleFileUpload={analysis.handleFileUpload}
          historyCount={history.length}
          onShowHistory={() => setShowHistory(true)}
          tips={tips}
        />
      ) : (
        <MenuResultView
          menu={analysis.menu}
          heroImage={analysis.heroImage}
          heroLoading={analysis.heroLoading}
          heroError={analysis.heroError}
          saving={saving}
          captureRef={captureRef}
          onBack={handleBack}
          onShare={handleShare}
          onSave={handleSaveImage}
          onRetryHero={analysis.retryHeroImage}
        />
      )}
    </main>
  );
}
