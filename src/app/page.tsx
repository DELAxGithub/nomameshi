"use client";

import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useMenuAnalysis } from "@/hooks/useMenuAnalysis";
import { useCulturalTips } from "@/hooks/useCulturalTips";
import { useMenuExport } from "@/hooks/useMenuExport";
import { Header } from "@/components/Header";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ScanView } from "@/components/ScanView";
import { MenuResultView } from "@/components/MenuResultView";

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

  return (
    <main className="container" style={{ minHeight: "100vh", padding: "2rem 0" }}>
      <Header />

      {analysis.error && <ErrorBanner message={analysis.error} />}

      {!analysis.menu ? (
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
          onBack={analysis.resetMenu}
          onShare={handleShare}
          onSave={handleSaveImage}
          onRetryHero={analysis.retryHeroImage}
        />
      )}
    </main>
  );
}
