"use client";

import { RegionSelector } from "./RegionSelector";
import { LanguageToggle } from "./LanguageToggle";
import { UploadArea } from "./UploadArea";
import { TipCard } from "./TipCard";

interface Props {
  analyzing: boolean;
  detectedCountry: string | null;
  targetLang: string;
  selectedRegion: string;
  setTargetLang: (code: string) => void;
  setSelectedRegion: (code: string) => void;
  handleScan: () => void;
  handlePaste: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tips: {
    tipIndex: number;
    goNextTip: () => void;
    handleTipTouchStart: (e: React.TouchEvent) => void;
    handleTipTouchEnd: (e: React.TouchEvent) => void;
    getTipText: (countryCode: string | null) => string;
    tipCountryFlag?: string;
    tipCountryLabel?: string;
  };
}

export function ScanView({
  analyzing,
  detectedCountry,
  targetLang,
  selectedRegion,
  setTargetLang,
  setSelectedRegion,
  handleScan,
  handlePaste,
  handleFileUpload,
  tips,
}: Props) {
  const tipCountryCode = analyzing
    ? detectedCountry
    : selectedRegion === "auto"
      ? null
      : selectedRegion;

  return (
    <div
      className="animate-fade-in"
      style={{ display: "flex", flexDirection: "column", gap: "24px" }}
    >
      {/* Region & Language selectors */}
      <div style={{ display: "flex", gap: "10px" }}>
        <RegionSelector
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          analyzing={analyzing}
        />
        <LanguageToggle
          targetLang={targetLang}
          setTargetLang={setTargetLang}
          analyzing={analyzing}
        />
      </div>

      {/* Upload Area */}
      <UploadArea
        analyzing={analyzing}
        handleScan={handleScan}
        handlePaste={handlePaste}
        handleFileUpload={handleFileUpload}
      />

      {/* Tips Section */}
      <TipCard
        tipIndex={tips.tipIndex}
        tipText={tips.getTipText(tipCountryCode)}
        countryFlag={
          analyzing ? (detectedCountry ? tips.tipCountryFlag : undefined) : tips.tipCountryFlag
        }
        countryLabel={
          analyzing ? tips.tipCountryLabel : tips.tipCountryLabel
        }
        analyzing={analyzing}
        onNext={tips.goNextTip}
        onTouchStart={tips.handleTipTouchStart}
        onTouchEnd={tips.handleTipTouchEnd}
      />
    </div>
  );
}
