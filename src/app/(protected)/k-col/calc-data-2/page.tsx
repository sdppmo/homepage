'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { CrossHSectionCalcResult } from '@/lib/calculations/cross-h-column';

interface PrintData {
  H1: number;
  B1: number;
  tw1: number;
  tf1: number;
  r1: number;
  H2: number;
  B2: number;
  tw2: number;
  tf2: number;
  r2: number;
  steelGrade: string;
  Fy: number;
  E: number;
  nu: number;
  Lx: number;
  Ly: number;
  Lb: number;
  Kx: number;
  Ky: number;
  Kz: number;
  Cb: number;
  Pu: number;
  Mux: number;
  Muy: number;
  Vux: number;
  Vuy: number;
  name: string;
  results: CrossHSectionCalcResult;
}

export default function CalcData2Page() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<PrintData | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataParam));
        setData(parsedData);
      } catch (error) {
        console.error('Failed to parse print data:', error);
      }
    }
  }, [searchParams]);

  if (!data) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const {
    Pu, Mux, Muy, Vux, Vuy,
    name,
    results
  } = data;

  const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtI = (n: number) => Math.round(n).toLocaleString('en-US');

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { padding: 0; background: white; }
          .print-page { width: 210mm; height: 297mm; box-shadow: none; margin: 0; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          .watermark {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            color: rgba(44, 74, 124, 0.15) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        @media screen {
          body { padding: 10px; background: #f0f0f0; }
          .print-page {
            width: 210mm;
            height: 297mm;
            margin: 0 auto 10px;
            background: white;
            padding: 6mm 8mm;
            position: relative;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            page-break-after: always;
            overflow: hidden;
          }
        }

        .print-page {
          font-family: 'Malgun Gothic', 'Segoe UI', Arial, sans-serif;
          font-size: 9px;
          line-height: 1.3;
        }

        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 56px;
          font-weight: bold;
          color: rgba(44, 74, 124, 0.40);
          white-space: nowrap;
          pointer-events: none;
          z-index: 1;
          font-family: 'Georgia', 'Times New Roman', serif;
          letter-spacing: 6px;
        }

        .header {
          background: linear-gradient(135deg, #2c4a7c, #4a6fa5);
          color: white;
          padding: 8px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          border-radius: 2px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          width: 32px;
          height: 32px;
          background: white;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #2c4a7c;
          font-size: 7px;
        }

        .header-title {
          font-size: 13px;
          font-weight: bold;
          letter-spacing: 0.5px;
        }

        .header-name {
          font-size: 11px;
          font-weight: 500;
        }

        .green-text {
          color: #006600;
          font-weight: bold;
        }

        .red-text {
          color: #cc0000;
          font-weight: bold;
        }

        .section-header {
          background: linear-gradient(135deg, #2c4a7c, #4a6fa5);
          color: white;
          padding: 4px 10px;
          font-weight: bold;
          font-size: 10px;
          margin: 10px 0 6px 0;
          border-radius: 2px;
        }

        .subsection-header {
          font-weight: bold;
          font-size: 9px;
          margin: 6px 0 4px 8px;
          color: #2c4a7c;
          border-bottom: 1px solid #ccc;
          padding-bottom: 2px;
        }

        .sub-subsection {
          font-weight: 600;
          font-size: 8.5px;
          margin: 5px 0 3px 16px;
          color: #444;
        }

        .calc-row {
          display: flex;
          align-items: center;
          padding: 2px 0;
          margin-left: 15px;
          font-size: 8.5px;
        }

        .calc-formula {
          width: 260px;
          color: #333;
        }

        .calc-eq {
          width: 15px;
          text-align: center;
        }

        .calc-value {
          background: #ffffc0;
          padding: 2px 6px;
          text-align: right;
          min-width: 55px;
          border: 1px solid #ccc;
          font-weight: 500;
        }

        .calc-unit {
          margin-left: 4px;
          color: #666;
          min-width: 50px;
        }

        .calc-compare {
          margin-left: 8px;
          color: #444;
        }

        .calc-result {
          margin-left: 8px;
          font-weight: bold;
        }

        .footer {
          position: absolute;
          bottom: 6mm;
          left: 8mm;
          right: 8mm;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 7px;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 4px;
        }

        .footer-logo {
          font-weight: bold;
          color: #2c4a7c;
        }
      `}</style>

      <div className="print-page">
        <div className="watermark">SongDo Partners</div>
        <div className="header">
          <div className="header-left">
            <div className="logo">K-COL</div>
            <span className="header-title">Cross H Column Calculation Data</span>
          </div>
          <div className="header-name">NAME: <span>{name || 'K-COL'}</span></div>
        </div>

        <div className="section-header">2. Compressive Strength</div>
        <div className="subsection-header">Plate-Thickness ratio for Compression</div>
        <div className="calc-row">
          <span className="calc-formula">λcfr = 0.56 √(E / Fy)</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.lcfr)}</span>
        </div>
        <div className="calc-row">
          <span className="calc-formula">λcf = B2 / 2 / tf2</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.lcf)}</span>
          <span className="calc-unit"></span>
          <span className="calc-compare">&lt; λcfr = <span>{fmt(results.lcfr)}</span></span>
          <span className={`calc-result ${results.isSlenderFlange ? 'red-text' : 'green-text'}`}>
            {results.isSlenderFlange ? '→ Slender' : '→ Non-Slender'}
          </span>
        </div>
        <div className="calc-row">
          <span className="calc-formula">λcwr = 1.49 √(E / Fy)</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.lwr)}</span>
        </div>
        <div className="calc-row">
          <span className="calc-formula">λcw = (H2 - 2(tf2+r2) - tw2) / 2 / tw2</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.lw2)}</span>
          <span className="calc-unit"></span>
          <span className="calc-compare">&lt; λcwr = <span>{fmt(results.lwr)}</span></span>
          <span className={`calc-result ${results.isSlenderWeb ? 'red-text' : 'green-text'}`}>
            {results.isSlenderWeb ? '→ Slender' : '→ Non-Slender'}
          </span>
        </div>

        <div className="subsection-header">Compressive Strength</div>
        <div className="calc-row">
          <span className="calc-formula">φc = 0.9</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">0.9</span>
        </div>
        <div className="calc-row">
          <span className="calc-formula">φcPn = φc × Ag × Fcr / 1000</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.phi_Pn)}</span>
          <span className="calc-unit">kN</span>
          <span className="calc-compare">&gt; Pu = <span>{fmtI(Pu)}</span></span>
          <span className={`calc-result ${results.isCompressiveNG ? 'red-text' : 'green-text'}`}>
            {results.isCompressiveNG ? '→ N.G' : '→ O.K'}
          </span>
        </div>

        <div className="section-header">3. Flexural Strength</div>
        
        <div className="subsection-header">Major Axis</div>
        <div className="sub-subsection">Plate-Thickness ratio for Flexure</div>
        <div className="calc-row">
          <span className="calc-formula">λffp = 0.38 √(E / Fy)</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.lfp)}</span>
        </div>
        <div className="calc-row">
          <span className="calc-formula">λffr = 1.00 √(E / Fy)</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.lfr)}</span>
        </div>
        <div className="calc-row">
          <span className="calc-formula">λff1 = B1 / 2 / tf1</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.lf1)}</span>
          <span className="calc-unit"></span>
          <span className="calc-compare">
            {results.lf1 <= results.lfp ? `< λffp = ${fmt(results.lfp)}` : results.lf1 <= results.lfr ? `> λffp = ${fmt(results.lfp)}` : `> λffr = ${fmt(results.lfr)}`}
          </span>
          <span className={`calc-result ${results.flange1Class === 'Compact' ? 'green-text' : 'red-text'}`}>
            → {results.flange1Class}
          </span>
        </div>
        <div className="calc-row">
          <span className="calc-formula">λfwp = 3.76 √(E / Fy)</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.lwp)}</span>
        </div>
        <div className="calc-row">
          <span className="calc-formula">λfwr = 5.70 √(E / Fy)</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.lwr)}</span>
        </div>
        <div className="calc-row">
          <span className="calc-formula">λfw1 = (H1-2(tf1+r1)-tw1)/2/tw1</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.lw1)}</span>
          <span className="calc-unit"></span>
          <span className="calc-compare">
            {results.lw1 <= results.lwp ? `< λfwp = ${fmt(results.lwp)}` : results.lw1 <= results.lwr ? `> λfwp = ${fmt(results.lwp)}` : `> λfwr = ${fmt(results.lwr)}`}
          </span>
          <span className={`calc-result ${results.web1Class === 'Compact' ? 'green-text' : 'red-text'}`}>
            → {results.web1Class}
          </span>
        </div>

        <div className="sub-subsection">Section Yielding Strength</div>
        <div className="calc-row">
          <span className="calc-formula">φbMnx</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.phi_Mnx)}</span>
          <span className="calc-unit">kN·m</span>
          <span className="calc-compare">{results.phi_Mnx > Mux ? `> Mux = ${fmt(Mux)}` : `< Mux = ${fmt(Mux)}`}</span>
          <span className={`calc-result ${results.phi_Mnx > Mux ? 'green-text' : 'red-text'}`}>
            {results.phi_Mnx > Mux ? '→ O.K' : '→ N.G'}
          </span>
        </div>

        <div className="subsection-header">Minor Axis</div>
        <div className="sub-subsection">Plate-Thickness ratio for Flexure</div>
        <div className="calc-row">
          <span className="calc-formula">λff2 = B2 / 2 / tf2</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.lf2)}</span>
          <span className="calc-unit"></span>
          <span className="calc-compare">
            {results.lf2 <= results.lfp ? `< λffp = ${fmt(results.lfp)}` : results.lf2 <= results.lfr ? `> λffp = ${fmt(results.lfp)}` : `> λffr = ${fmt(results.lfr)}`}
          </span>
          <span className={`calc-result ${results.flange2Class === 'Compact' ? 'green-text' : 'red-text'}`}>
            → {results.flange2Class}
          </span>
        </div>
        <div className="calc-row">
          <span className="calc-formula">λfw2 = (H2-2(tf2+r2)-tw2)/2/tw2</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.lw2)}</span>
          <span className="calc-unit"></span>
          <span className="calc-compare">
            {results.lw2 <= results.lwp ? `< λfwp = ${fmt(results.lwp)}` : results.lw2 <= results.lwr ? `> λfwp = ${fmt(results.lwp)}` : `> λfwr = ${fmt(results.lwr)}`}
          </span>
          <span className={`calc-result ${results.web2Class === 'Compact' ? 'green-text' : 'red-text'}`}>
            → {results.web2Class}
          </span>
        </div>

        <div className="sub-subsection">Section Yielding Strength</div>
        <div className="calc-row">
          <span className="calc-formula">φbMny</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.phi_Mny)}</span>
          <span className="calc-unit">kN·m</span>
          <span className="calc-compare">{results.phi_Mny > Muy ? `> Muy = ${fmt(Muy)}` : `< Muy = ${fmt(Muy)}`}</span>
          <span className={`calc-result ${results.phi_Mny > Muy ? 'green-text' : 'red-text'}`}>
            {results.phi_Mny > Muy ? '→ O.K' : '→ N.G'}
          </span>
        </div>

        <div className="section-header">4. P-M-M Combination Check</div>
        <div className="calc-row" style={{ marginTop: '6px' }}>
          <span className="calc-formula">Pu / φcPn</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(Pu / results.phi_Pn, 3)}</span>
          <span className="calc-unit"></span>
          <span className="calc-compare">{Pu / results.phi_Pn >= 0.2 ? '> 0.20' : '< 0.20'}</span>
        </div>
        <div className="calc-row">
          <span className="calc-formula">Pu/φPn + 8/9×(Mux/φMnx + Muy/φMny)</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.ratio_pmm, 3)}</span>
          <span className="calc-unit"></span>
          <span className="calc-compare">&lt; 1.000</span>
          <span className={`calc-result ${results.ratio_pmm <= 1.0 ? 'green-text' : 'red-text'}`}>
            {results.ratio_pmm <= 1.0 ? '→ O.K' : '→ N.G'}
          </span>
        </div>

        <div className="section-header">5. Shear Strength</div>
        
        <div className="subsection-header">Major Axis</div>
        <div className="sub-subsection">Shear Strength, φVn</div>
        <div className="calc-row">
          <span className="calc-formula">φvwVny</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.phi_Vny)}</span>
          <span className="calc-unit">kN</span>
          <span className="calc-compare">&gt; Vuy = <span>{fmt(Vuy)}</span></span>
          <span className={`calc-result ${results.phi_Vny > Vuy ? 'green-text' : 'red-text'}`}>
            {results.phi_Vny > Vuy ? '→ O.K' : '→ N.G'}
          </span>
        </div>

        <div className="subsection-header">Minor Axis</div>
        <div className="sub-subsection">Shear Strength, φVn</div>
        <div className="calc-row">
          <span className="calc-formula">φvwVnx</span>
          <span className="calc-eq">=</span>
          <span className="calc-value">{fmt(results.phi_Vnx)}</span>
          <span className="calc-unit">kN</span>
          <span className="calc-compare">&gt; Vux = <span>{fmt(Vux)}</span></span>
          <span className={`calc-result ${results.phi_Vnx > Vux ? 'green-text' : 'red-text'}`}>
            {results.phi_Vnx > Vux ? '→ O.K' : '→ N.G'}
          </span>
        </div>

        <div className="footer">
          <div>
            <span className="footer-logo">SDP licensed K-COL</span>
            <span style={{ marginLeft: '15px' }}>Cross H Official Fabricator by DONG YANG S·Tec</span>
          </div>
          <div>
            <span>Page 2 / 2</span>
            <span style={{ marginLeft: '12px' }}>Calculation Sheet Prepared by 송도파트너스피엠오</span>
            <span style={{ marginLeft: '12px' }}>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </>
  );
}
