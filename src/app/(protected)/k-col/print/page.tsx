'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CrossHSectionCalcResult, WebClass } from '@/lib/calculations/cross-h-column';

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

export default function PrintPage() {
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
    return <div>Loading...</div>;
  }

  const {
    H1, B1, tw1, tf1, r1,
    H2, B2, tw2, tf2, r2,
    steelGrade, Fy, E, nu,
    Lx, Ly, Lb, Kx, Ky, Kz, Cb,
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

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 264px;
          gap: 10px;
          margin-bottom: 8px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8.5px;
        }

        table td, table th {
          padding: 3px 6px;
          border: 1px solid #bbb;
          vertical-align: middle;
        }

        .header-row td {
          background: #e8e8e8;
          font-weight: 600;
        }

        .label-cell {
          background: #f5f5f5;
          font-weight: 500;
          width: 130px;
          color: #333;
        }

        .sub-label {
          padding-left: 20px !important;
          background: #fafafa;
        }

        .value-cell {
          background: white;
        }

        .blue-cell {
          background: #cce0f0;
          text-align: center;
          font-weight: 500;
          color: #1a3a5c;
        }

        .yellow-cell {
          background: #ffffc0;
          text-align: right;
          font-weight: 500;
          padding-right: 8px !important;
        }

        .green-text {
          color: #006600;
          font-weight: bold;
        }

        .red-text {
          color: #cc0000;
          font-weight: bold;
        }

        .diagram-section {
          border: 1px solid #bbb;
          padding: 10px;
          background: #fafafa;
        }

        .diagram-title {
          text-align: center;
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 8px;
          color: #2c4a7c;
        }

        .cross-section {
          position: relative;
          width: 168px;
          height: 168px;
          margin: 0 auto 10px;
          background: white;
          border: 1px solid #ddd;
        }

        .h1-web, .h1-flange-top, .h1-flange-bottom,
        .h2-web, .h2-flange-left, .h2-flange-right {
          position: absolute;
          box-sizing: border-box;
        }

        .h1-web, .h1-flange-top, .h1-flange-bottom {
          background: #a8c8e8;
          border: 1px solid #5588bb;
        }

        .h2-web, .h2-flange-left, .h2-flange-right {
          background: #c8e8a8;
          border: 1px solid #66aa55;
        }

        .dim-label {
          position: absolute;
          font-size: 8px;
          font-weight: bold;
          color: #333;
        }

        .props-table {
          font-size: 9px;
          margin-top: 6px;
        }

        .props-table td {
          padding: 2px 4px;
          border: none;
          background: transparent;
        }

        .props-table .prop-label {
          font-weight: 500;
          color: #555;
          width: 28px;
        }

        .props-table .prop-value {
          text-align: right;
          color: #1a3a5c;
          font-weight: 500;
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

      <div className="header">
        <div className="header-left">
          <div className="logo">K-COL</div>
          <span className="header-title">CROSS H COLUMN CALCULATION DATA</span>
        </div>
        <div className="header-name">NAME: <span>{name || 'K-COL'}</span></div>
      </div>

      <div className="main-grid">
        <div>
          <table>
            <tbody>
              <tr className="header-row">
                <td colSpan={4} style={{ textAlign: 'center' }}>Design Information</td>
              </tr>
              <tr>
                <td className="label-cell">Design Code</td>
                <td className="value-cell" colSpan={3}>KDS 14 31 00 (LRFD), BS 5950-1:2000</td>
              </tr>
              <tr>
                <td className="label-cell">Major Section</td>
                <td className="blue-cell">{H1}×{B1}×{tw1}×{tf1}</td>
                <td className="label-cell">Minor Section</td>
                <td className="blue-cell">{H2}×{B2}×{tw2}×{tf2}</td>
              </tr>
              <tr>
                <td className="label-cell">Add.Plate on Major</td>
                <td className="value-cell" colSpan={3}>Not Supported.</td>
              </tr>
            </tbody>
          </table>

          <table style={{ marginTop: '6px' }}>
            <tbody>
              <tr>
                <td className="label-cell">Steel Material</td>
                <td className="blue-cell" style={{ width: '80px' }}>{steelGrade || 'SM355'}</td>
                <td></td>
                <td className="sub-label">Fy</td>
                <td className="yellow-cell">{fmtI(Fy)}</td>
                <td>MPa</td>
              </tr>
              <tr>
                <td className="sub-label">E</td>
                <td className="yellow-cell">{fmtI(E)}</td>
                <td>MPa</td>
                <td className="sub-label">ν</td>
                <td className="yellow-cell">{nu}</td>
                <td></td>
              </tr>
              <tr>
                <td className="label-cell">Unbraced Length</td>
                <td colSpan={2}></td>
                <td className="label-cell">Effective Length Factor</td>
                <td colSpan={2}></td>
              </tr>
              <tr>
                <td className="sub-label">Lx</td>
                <td className="blue-cell">{fmt(Lx, 3)}</td>
                <td>m</td>
                <td className="sub-label">Kx</td>
                <td className="blue-cell">{Kx}</td>
                <td></td>
              </tr>
              <tr>
                <td className="sub-label">Ly</td>
                <td className="blue-cell">{fmt(Ly, 3)}</td>
                <td>m</td>
                <td className="sub-label">Ky</td>
                <td className="blue-cell">{Ky}</td>
                <td></td>
              </tr>
              <tr>
                <td className="sub-label">Lb</td>
                <td className="blue-cell">{fmt(Lb, 3)}</td>
                <td>m</td>
                <td className="sub-label">Kz</td>
                <td className="blue-cell">{Kz}</td>
                <td></td>
              </tr>
              <tr>
                <td className="label-cell">Lateral Buckling Mod. Factor</td>
                <td className="sub-label">Cb</td>
                <td className="blue-cell">{Cb}</td>
                <td colSpan={3}></td>
              </tr>
              <tr>
                <td className="label-cell" colSpan={6}>Design Load</td>
              </tr>
              <tr>
                <td className="sub-label">Pu</td>
                <td className="yellow-cell">{fmtI(Pu)}</td>
                <td>kN</td>
                <td className="sub-label">Vux</td>
                <td className="yellow-cell">{fmt(Vux)}</td>
                <td>kN</td>
              </tr>
              <tr>
                <td className="sub-label">Mux</td>
                <td className="yellow-cell">{fmt(Mux)}</td>
                <td>kN·m</td>
                <td className="sub-label">Vuy</td>
                <td className="yellow-cell">{fmt(Vuy)}</td>
                <td>kN</td>
              </tr>
              <tr>
                <td className="sub-label">Muy</td>
                <td className="yellow-cell">{fmt(Muy)}</td>
                <td>kN·m</td>
                <td colSpan={3}></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="diagram-section">
          <div className="diagram-title">Section Properties</div>
          <div className="cross-section" id="crossSection">
            <div className="h1-web" style={{ width: `${Math.max(tw1 * (144 / Math.max(H1, H2, B1, B2) * 0.85), 2)}px`, height: `${H1 * (144 / Math.max(H1, H2, B1, B2) * 0.85)}px`, left: `${84 - Math.max(tw1 * (144 / Math.max(H1, H2, B1, B2) * 0.85), 2) / 2}px`, top: `${84 - H1 * (144 / Math.max(H1, H2, B1, B2) * 0.85) / 2}px` }}></div>
            <div className="h1-flange-top" style={{ width: `${B1 * (144 / Math.max(H1, H2, B1, B2) * 0.85)}px`, height: `${Math.max(tf1 * (144 / Math.max(H1, H2, B1, B2) * 0.85), 3)}px`, left: `${84 - B1 * (144 / Math.max(H1, H2, B1, B2) * 0.85) / 2}px`, top: `${84 - H1 * (144 / Math.max(H1, H2, B1, B2) * 0.85) / 2}px` }}></div>
            <div className="h1-flange-bottom" style={{ width: `${B1 * (144 / Math.max(H1, H2, B1, B2) * 0.85)}px`, height: `${Math.max(tf1 * (144 / Math.max(H1, H2, B1, B2) * 0.85), 3)}px`, left: `${84 - B1 * (144 / Math.max(H1, H2, B1, B2) * 0.85) / 2}px`, top: `${84 + H1 * (144 / Math.max(H1, H2, B1, B2) * 0.85) / 2 - Math.max(tf1 * (144 / Math.max(H1, H2, B1, B2) * 0.85), 3)}px` }}></div>
            <div className="h2-web" style={{ width: `${H2 * (144 / Math.max(H1, H2, B1, B2) * 0.85)}px`, height: `${Math.max(tw2 * (144 / Math.max(H1, H2, B1, B2) * 0.85), 2)}px`, left: `${84 - H2 * (144 / Math.max(H1, H2, B1, B2) * 0.85) / 2}px`, top: `${84 - Math.max(tw2 * (144 / Math.max(H1, H2, B1, B2) * 0.85), 2) / 2}px` }}></div>
            <div className="h2-flange-left" style={{ width: `${Math.max(tf2 * (144 / Math.max(H1, H2, B1, B2) * 0.85), 3)}px`, height: `${B2 * (144 / Math.max(H1, H2, B1, B2) * 0.85)}px`, left: `${84 - H2 * (144 / Math.max(H1, H2, B1, B2) * 0.85) / 2}px`, top: `${84 - B2 * (144 / Math.max(H1, H2, B1, B2) * 0.85) / 2}px` }}></div>
            <div className="h2-flange-right" style={{ width: `${Math.max(tf2 * (144 / Math.max(H1, H2, B1, B2) * 0.85), 3)}px`, height: `${B2 * (144 / Math.max(H1, H2, B1, B2) * 0.85)}px`, left: `${84 + H2 * (144 / Math.max(H1, H2, B1, B2) * 0.85) / 2 - Math.max(tf2 * (144 / Math.max(H1, H2, B1, B2) * 0.85), 3)}px`, top: `${84 - B2 * (144 / Math.max(H1, H2, B1, B2) * 0.85) / 2}px` }}></div>
            <div className="dim-label" style={{ right: '-16px', top: '50%', transform: 'translateY(-50%)' }}>H1</div>
            <div className="dim-label" style={{ bottom: '-12px', left: '50%', transform: 'translateX(-50%)' }}>B1</div>
            <div className="dim-label" style={{ left: '-16px', top: '50%', transform: 'translateY(-50%)' }}>H2</div>
          </div>
          <table className="props-table">
            <tbody>
              <tr><td className="prop-label">H1</td><td className="prop-value">{fmt(H1, 1)}</td><td>mm</td><td className="prop-label">H2</td><td className="prop-value">{fmt(H2, 1)}</td><td>mm</td></tr>
              <tr><td className="prop-label">B1</td><td className="prop-value">{fmt(B1, 1)}</td><td>mm</td><td className="prop-label">B2</td><td className="prop-value">{fmt(B2, 1)}</td><td>mm</td></tr>
              <tr><td className="prop-label">tw1</td><td className="prop-value">{fmt(tw1, 1)}</td><td>mm</td><td className="prop-label">tw2</td><td className="prop-value">{fmt(tw2, 1)}</td><td>mm</td></tr>
              <tr><td className="prop-label">tf1</td><td className="prop-value">{fmt(tf1, 1)}</td><td>mm</td><td className="prop-label">tf2</td><td className="prop-value">{fmt(tf2, 1)}</td><td>mm</td></tr>
              <tr><td className="prop-label">r1</td><td className="prop-value">{fmt(r1, 1)}</td><td>mm</td><td className="prop-label">r2</td><td className="prop-value">{fmt(r2, 1)}</td><td>mm</td></tr>
            </tbody>
          </table>
          <table className="props-table" style={{ marginTop: '4px', borderTop: '1px solid #ddd', paddingTop: '4px' }}>
            <tbody>
              <tr><td className="prop-label">Ag</td><td className="prop-value" colSpan={5}>{fmt(results.area, 1)} mm²</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-header">1. SUMMARY</div>
      <table>
        <tbody>
          <tr>
            <td className="label-cell" style={{ width: '140px' }}>Compressive Strength</td>
            <td style={{ width: '100px' }}>Pu / φPn</td>
            <td>=</td>
            <td className="yellow-cell" style={{ width: '60px' }}>{fmtI(Pu)}</td>
            <td>/</td>
            <td className="yellow-cell" style={{ width: '70px' }}>{fmt(results.phi_Pn)}</td>
            <td>=</td>
            <td className="yellow-cell" style={{ width: '55px' }}>{fmt(Pu / results.phi_Pn, 3)}</td>
            <td>&lt;</td>
            <td style={{ width: '50px' }}>1.0</td>
            <td className={Pu / results.phi_Pn > 1.0 ? 'red-text' : 'green-text'}>
              {Pu / results.phi_Pn > 1.0 ? '→ N.G' : '→ O.K'}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="footer">
        <div>
          <span className="footer-logo">SDP licensed K-COL</span>
          <span style={{ marginLeft: '15px' }}>Cross H Official Fabricator by DONG YANG S·Tec</span>
        </div>
        <div>
          <span>Page 1 / 2</span>
          <span style={{ marginLeft: '12px' }}>Calculation Sheet Prepared by 송도파트너스피엠오</span>
          <span style={{ marginLeft: '12px' }}>{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>

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
