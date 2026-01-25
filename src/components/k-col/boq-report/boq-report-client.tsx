'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BOQColumnItem,
  BOQPlateAggregatedItem,
  BOQRolledHGroup,
  BOQUnitPrices,
  SubMaterialBOQItem,
  ThicknessMergeRules,
  BOQTotals,
} from '@/lib/calculations/boq';
import {
  calculateGroupedBOQ,
  calculatePlateBOQ,
  calculateRolledHBOQ,
  calculateGroupedRolledHBOQ,
  calculateBOQTotalValues,
  calculateSubMaterial,
  calculateGroupedPlateBOQ,
} from '@/actions/boq';

export default function BOQReportClient() {
  const [boqData, setBoqData] = useState<{ items: BOQColumnItem[] } | null>(null);
  const [unitPrices, setUnitPrices] = useState<BOQUnitPrices>({
    mainMaterialSM420: 1900000,
    mainMaterialSM355: 1830000,
    subMaterial: 1900000,
  });
  const [thicknessMergeRules, setThicknessMergeRules] = useState<ThicknessMergeRules>({});

  const [groupingOptions, setGroupingOptions] = useState({
    column: false,
    plate: false,
    rolledH: false,
  });

  const [totals, setTotals] = useState<BOQTotals | null>(null);
  const [displayedItems, setDisplayedItems] = useState<BOQColumnItem[]>([]);
  const [plateBOQ, setPlateBOQ] = useState<BOQPlateAggregatedItem[]>([]);
  const [rolledHBOQ, setRolledHBOQ] = useState<BOQRolledHGroup[]>([]);
  const [subMaterialBOQ, setSubMaterialBOQ] = useState<SubMaterialBOQItem[]>([]);

  const [reportDate, setReportDate] = useState<string>('');
  const [showThicknessMergeModal, setShowThicknessMergeModal] = useState(false);
  const [hasRolledH, setHasRolledH] = useState(false);

  const [newRuleFrom, setNewRuleFrom] = useState<string>('');
  const [newRuleTo, setNewRuleTo] = useState<string>('');
  const [currentThicknesses, setCurrentThicknesses] = useState<number[]>([]);

  useEffect(() => {
    const storedBoqData = localStorage.getItem('boqData');
    const storedUnitPrices = localStorage.getItem('boqUnitPrices');
    const storedThicknessMergeRules = localStorage.getItem('thicknessMergeRules');

    if (storedBoqData) {
      setBoqData(JSON.parse(storedBoqData));
    }
    if (storedUnitPrices) {
      setUnitPrices(JSON.parse(storedUnitPrices));
    }
    if (storedThicknessMergeRules) {
      setThicknessMergeRules(JSON.parse(storedThicknessMergeRules));
    }

    const now = new Date();
    setReportDate(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`
    );
  }, []);

  const calculateBOQ = useCallback(async () => {
    if (!boqData || !boqData.items || boqData.items.length === 0) return;

    const newTotals = await calculateBOQTotalValues(boqData.items, unitPrices);
    setTotals(newTotals);

    let items = boqData.items;
    if (groupingOptions.column) {
      items = await calculateGroupedBOQ(items);
    }
    setDisplayedItems(items);

    let plates = await calculatePlateBOQ(boqData.items, thicknessMergeRules);
    if (groupingOptions.plate) {
      plates = await calculateGroupedPlateBOQ(plates, thicknessMergeRules);
    }
    setPlateBOQ(plates);

    let rolledH = await calculateRolledHBOQ(boqData.items);
    setHasRolledH(rolledH.length > 0);
    if (groupingOptions.rolledH) {
      rolledH = await calculateGroupedRolledHBOQ(rolledH);
    }
    setRolledHBOQ(rolledH);

    const subMaterial = await calculateSubMaterial(newTotals.totalWeight, unitPrices);
    setSubMaterialBOQ(subMaterial);
  }, [boqData, unitPrices, thicknessMergeRules, groupingOptions]);

  useEffect(() => {
    calculateBOQ();
  }, [calculateBOQ]);

  useEffect(() => {
    if (!boqData || !boqData.items) return;

    const thicknesses = new Set<number>();
    boqData.items.forEach((item) => {
      if (item.tw) thicknesses.add(item.tw);
      if (item.tf) thicknesses.add(item.tf);
    });
    setCurrentThicknesses(Array.from(thicknesses).sort((a, b) => a - b));
  }, [boqData]);

  const handleGroupingChange = (type: 'column' | 'plate' | 'rolledH') => {
    setGroupingOptions((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    window.close();
  };

  const handleAddThicknessMergeRule = () => {
    const from = parseFloat(newRuleFrom);
    const to = parseFloat(newRuleTo);

    if (isNaN(from) || isNaN(to) || from <= 0 || to <= 0) {
      alert('유효한 두께를 입력해주세요.');
      return;
    }

    if (from === to) {
      alert('동일한 두께로 통합할 수 없습니다.');
      return;
    }

    setThicknessMergeRules((prev) => ({ ...prev, [from]: to }));
    setNewRuleFrom('');
    setNewRuleTo('');
  };

  const handleRemoveThicknessMergeRule = (from: number) => {
    setThicknessMergeRules((prev) => {
      const newRules = { ...prev };
      delete newRules[from];
      return newRules;
    });
  };

  const handleApplyThicknessMerge = () => {
    localStorage.setItem(
      'thicknessMergeRules',
      JSON.stringify(thicknessMergeRules)
    );
    setShowThicknessMergeModal(false);
    calculateBOQ();
  };

  const handleExportCSV = () => {
    if (!boqData || !boqData.items || boqData.items.length === 0) return;

    let csvContent = '\uFEFF';

    csvContent += '1. 기둥 물량 정리(Cross H) - Auto Find Selection 기능\n';
    csvContent +=
      'No.,기둥명,조합,H(mm),B(mm),tw(mm),tf(mm),단면적(mm²),단중(kg/m),길이(m),길이타입,개수,총 중량(kg),강종,금액(원)\n';

    displayedItems.forEach((item, index) => {
      const totalWeightItem = item.unitWeight * item.length * item.count;
      const weightInTon = totalWeightItem / 1000;
      let columnUnitPrice = unitPrices.mainMaterialSM420;
      if (item.steelGrade.includes('SM355')) {
        columnUnitPrice = unitPrices.mainMaterialSM355;
      }
      const columnAmount = weightInTon * columnUnitPrice;

      csvContent += `${index + 1},"${item.names.join(', ')}",${
        item.combination
      },${item.h},${item.b},${item.tw},${item.tf},${item.area.toFixed(
        2
      )},${item.unitWeight.toFixed(2)},${item.length.toFixed(2)},Type${
        item.lengthType || ''
      },${item.count},${totalWeightItem.toFixed(2)},${item.steelGrade},${
        columnAmount > 0 ? Math.round(columnAmount) : '-'
      }\n`;
    });

    csvContent += `합계,,,,,,,,,,,${totals?.totalCount || 0},${totals?.totalWeight.toFixed(
      2
    ) || 0},,${totals?.totalColumnAmount ? Math.round(totals.totalColumnAmount) : 0}\n\n`;

    csvContent += '2. 주기둥 Built-UP 부재 물량 정리\n';
    csvContent +=
      'No.,Plate 종류(두께 mm),사용부위,폭(mm),두께(mm),단중(kg/m),길이(m),개수,총 중량(kg),강종,비고\n';

    if (plateBOQ.length === 0) {
      csvContent += 'Plate 데이터가 없습니다.\n';
    } else {
      plateBOQ.forEach((plate, index) => {
        csvContent += `${index + 1},${plate.thickness_mm},${plate.usageParts},${plate.avgWidth.toFixed(
          2
        )},${plate.thickness_mm},${plate.unitWeight.toFixed(
          2
        )},${plate.totalLength.toFixed(2)},${plate.totalCount},${plate.totalWeight.toFixed(
          2
        )},${plate.steelGrade},"${plate.mergeInfo || '-'}"\n`;
      });
      csvContent += `합계,,,,,,,${plateBOQ.reduce(
        (sum, p) => sum + p.totalCount,
        0
      )},${plateBOQ.reduce((sum, p) => sum + p.totalWeight, 0).toFixed(2)},,\n\n`;
    }

    if (hasRolledH) {
      csvContent += '3. Rolled H 물량 정리\n';
      csvContent +=
        'No.,기둥번호,단면 규격,길이(m),개수,단중(kg/m),총 중량(kg),강종,비고\n';

      rolledHBOQ.forEach((group, index) => {
        csvContent += `${index + 1},"${group.names.join(', ')}",${
          group.combination
        },${group.length.toFixed(2)},${group.count},${group.unitWeight.toFixed(
          2
        )},${group.totalWeight.toFixed(2)},${group.steelGrade},${
          group.isGrouped ? '그룹핑됨' : '-'
        }\n`;
      });
      csvContent += `합계,,,,${rolledHBOQ.reduce(
        (sum, g) => sum + g.count,
        0
      )},,${rolledHBOQ.reduce((sum, g) => sum + g.totalWeight, 0).toFixed(
        2
      )},,\n\n`;
    }

    csvContent += `${hasRolledH ? '4' : '3'}. 소부재 물량 정리\n`;
    csvContent +=
      'No.,소부재 종류,규격/사양,단위,수량,강종,주기둥부재물량(kg),할증(15%),소부재 단가(원/톤),금액(원),비고\n';

    subMaterialBOQ.forEach((item, index) => {
      csvContent += `${index + 1},${item.type},${item.spec},${item.unit},${
        item.quantity !== null ? item.quantity : '-'
      },${item.steelGrade},${item.mainMaterialWeight.toFixed(
        2
      )},${item.surcharge.toFixed(2)},${item.unitPrice},${Math.round(
        item.amount
      )},${item.remark}\n`;
    });

    csvContent += `합계,,,,${subMaterialBOQ.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    )},,${subMaterialBOQ
      .reduce((sum, item) => sum + item.mainMaterialWeight, 0)
      .toFixed(2)},${subMaterialBOQ
      .reduce((sum, item) => sum + item.surcharge, 0)
      .toFixed(2)},,${Math.round(
      subMaterialBOQ.reduce((sum, item) => sum + item.amount, 0)
    )},\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BOQ_Report_${reportDate.replace(/[: ]/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // TODO: Implement Sub-material modal
  const handleAddSubMaterial = () => {
    console.log('Add Sub-material not implemented yet');
  };

  if (!boqData || !boqData.items || boqData.items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 text-center bg-white rounded-lg shadow-md">
          <p className="text-gray-500">BOQ 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 bg-gray-100 print:p-0 print:bg-white">
      <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-md p-8 print:shadow-none print:p-5">
        <div className="mb-8 text-center pb-5 border-b-3 border-indigo-500">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2.5">
            BOQ (Bill of Quantities)
          </h1>
          <div className="text-sm text-gray-500">공사 수량 산출서</div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 mb-8 p-5 bg-gray-50 rounded-lg">
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-gray-500 mb-1.5">작성일</div>
            <div className="text-base font-semibold text-gray-900">{reportDate}</div>
          </div>
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-gray-500 mb-1.5">
              총 기둥 개수
            </div>
            <div className="text-base font-semibold text-gray-900">
              {totals?.totalCount.toLocaleString() || 0}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-gray-500 mb-1.5">
              총 단면적
            </div>
            <div className="text-base font-semibold text-gray-900">
              {totals?.totalArea.toFixed(2) || 0} mm²
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-gray-500 mb-1.5">총 중량</div>
            <div className="text-base font-semibold text-gray-900">
              {totals?.totalWeight.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || 0}{' '}
              kg
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xs font-semibold text-gray-500 mb-1.5">총 금액</div>
            <div className="text-lg font-bold text-indigo-500">
              {totals?.totalColumnAmount
                ? Math.round(totals.totalColumnAmount).toLocaleString()
                : 0}
              원
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="flex-1 m-0 text-xl font-bold text-indigo-900 pb-2.5 border-b-2 border-indigo-500">
                1. 기둥 물량 정리(Cross H) - Auto Find Selection 기능
              </h2>
            </div>
            <div className="flex justify-end p-2.5 mt-2.5 bg-gray-50 rounded-md">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupingOptions.column}
                  onChange={() => handleGroupingChange('column')}
                  className="w-4.5 h-4.5 cursor-pointer"
                />
                <span>물량 기준 그룹핑 (많은 순 정렬 + 작은 물량 유사 단면 통합)</span>
              </label>
            </div>
          </div>
          <table className="w-full mb-8 text-sm border-collapse">
            <thead>
              <tr className="text-white bg-gradient-to-br from-indigo-500 to-purple-600">
                <th className="p-3 text-center font-semibold border border-gray-200">
                  No.
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  기둥명
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  조합
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  H<br />
                  (mm)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  B<br />
                  (mm)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  tw<br />
                  (mm)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  tf<br />
                  (mm)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  단면적<br />
                  (mm²)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  단중<br />
                  (kg/m)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  길이<br />
                  (m)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  길이타입
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  개수
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  총 중량<br />
                  (kg)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  강종
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  금액<br />
                  (원)
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map((item, index) => {
                const totalWeightItem = item.unitWeight * item.length * item.count;
                const weightInTon = totalWeightItem / 1000;
                let columnUnitPrice = unitPrices.mainMaterialSM420;
                if (item.steelGrade.includes('SM355')) {
                  columnUnitPrice = unitPrices.mainMaterialSM355;
                }
                const columnAmount = weightInTon * columnUnitPrice;

                return (
                  <tr
                    key={index}
                    className="even:bg-gray-50 hover:bg-gray-100"
                  >
                    <td className="p-2.5 text-center border border-gray-200">
                      {index + 1}
                    </td>
                    <td className="p-2.5 text-left border border-gray-200">
                      {item.names.join(', ')}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {item.combination}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {item.h}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {item.b}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {item.tw}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {item.tf}
                    </td>
                    <td className="p-2.5 text-right border border-gray-200">
                      {item.area.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-right border border-gray-200">
                      {item.unitWeight.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-right border border-gray-200">
                      {item.length.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      Type{item.lengthType || ''}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {item.count}
                    </td>
                    <td className="p-2.5 text-right border border-gray-200">
                      {totalWeightItem.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {item.steelGrade}
                    </td>
                    <td className="p-2.5 text-right border border-gray-200">
                      {columnAmount > 0
                        ? Math.round(columnAmount).toLocaleString()
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold text-indigo-900 bg-teal-50">
                <td
                  colSpan={11}
                  className="p-2.5 text-right border-t-2 border-b-2 border-green-500"
                >
                  합계
                </td>
                <td className="p-2.5 text-center border-t-2 border-b-2 border-green-500">
                  {totals?.totalCount.toLocaleString() || 0}
                </td>
                <td className="p-2.5 text-right border-t-2 border-b-2 border-green-500">
                  {totals?.totalWeight.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || 0}
                </td>
                <td className="p-2.5 text-center border-t-2 border-b-2 border-green-500">
                  -
                </td>
                <td className="p-2.5 text-right border-t-2 border-b-2 border-green-500">
                  {totals?.totalColumnAmount
                    ? Math.round(totals.totalColumnAmount).toLocaleString()
                    : 0}
                  원
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-10">
          <div className="mb-4">
            <h2 className="flex-1 m-0 text-xl font-bold text-indigo-900 pb-2.5 border-b-2 border-indigo-500">
              2. 주기둥 Built-UP 부재 물량 정리
            </h2>
            <div className="flex items-center justify-between p-2.5 mt-2.5 bg-gray-50 rounded-md">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupingOptions.plate}
                  onChange={() => handleGroupingChange('plate')}
                  className="w-4.5 h-4.5 cursor-pointer"
                />
                <span>물량 기준 그룹핑 (많은 순 정렬 + 작은 물량 유사 단면 통합)</span>
              </label>
              <button
                onClick={() => setShowThicknessMergeModal(true)}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-md cursor-pointer hover:bg-indigo-600 transition-colors"
              >
                🔧 두께 통합 설정
              </button>
            </div>
          </div>
          <table className="w-full mb-8 text-sm border-collapse">
            <thead>
              <tr className="text-white bg-gradient-to-br from-indigo-500 to-purple-600">
                <th className="p-3 text-center font-semibold border border-gray-200">
                  No.
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  Plate 종류<br />
                  (두께, mm)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  사용부위
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  폭<br />
                  (mm)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  두께<br />
                  (mm)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  단중<br />
                  (kg/m)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  길이<br />
                  (m)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  개수
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  총 중량<br />
                  (kg)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  강종
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  비고
                </th>
              </tr>
            </thead>
            <tbody>
              {plateBOQ.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="p-8 text-center text-gray-400 border border-gray-200"
                  >
                    Plate 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                plateBOQ.map((plate, index) => (
                  <tr
                    key={index}
                    className="even:bg-gray-50 hover:bg-gray-100"
                  >
                    <td className="p-2.5 text-center border border-gray-200">
                      {index + 1}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {plate.thickness_mm}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {plate.usageParts}
                    </td>
                    <td className="p-2.5 text-right border border-gray-200">
                      {plate.avgWidth.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {plate.thickness_mm}
                    </td>
                    <td className="p-2.5 text-right border border-gray-200">
                      {plate.unitWeight.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-right border border-gray-200">
                      {plate.totalLength.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {plate.totalCount}
                    </td>
                    <td className="p-2.5 text-right border border-gray-200">
                      {plate.totalWeight.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {plate.steelGrade}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {plate.mergeInfo || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="font-bold text-indigo-900 bg-teal-50">
                <td
                  colSpan={7}
                  className="p-2.5 text-right border-t-2 border-b-2 border-green-500"
                >
                  합계
                </td>
                <td className="p-2.5 text-center border-t-2 border-b-2 border-green-500">
                  {plateBOQ.reduce((sum, p) => sum + p.totalCount, 0).toLocaleString()}
                </td>
                <td className="p-2.5 text-right border-t-2 border-b-2 border-green-500">
                  {plateBOQ
                    .reduce((sum, p) => sum + p.totalWeight, 0)
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </td>
                <td className="p-2.5 text-center border-t-2 border-b-2 border-green-500">
                  -
                </td>
                <td className="p-2.5 text-center border-t-2 border-b-2 border-green-500">
                  -
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="mt-4 p-3 text-sm text-yellow-800 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
            <strong>Note:</strong> 조정된 Plate 두께는 두께통합설정내에 규칙이
            존재하므로 신규 Auto Find Section을 원하면{' '}
            <span className="font-semibold text-red-600">
              두께통합설정내 규칙을 삭제하고 실행
            </span>
            하시기 바랍니다.
          </div>
        </div>

        {hasRolledH && (
          <div className="mt-10">
            <div className="mb-4">
              <h2 className="flex-1 m-0 text-xl font-bold text-indigo-900 pb-2.5 border-b-2 border-indigo-500">
                3. Rolled H 물량 정리
              </h2>
              <div className="flex justify-end p-2.5 mt-2.5 bg-gray-50 rounded-md">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groupingOptions.rolledH}
                    onChange={() => handleGroupingChange('rolledH')}
                    className="w-4.5 h-4.5 cursor-pointer"
                  />
                  <span>
                    물량 기준 그룹핑 (많은 순 정렬 + 작은 물량 유사 단면 통합)
                  </span>
                </label>
              </div>
            </div>
            <table className="w-full mb-8 text-sm border-collapse">
              <thead>
                <tr className="text-white bg-gradient-to-br from-indigo-500 to-purple-600">
                  <th className="p-3 text-center font-semibold border border-gray-200">
                    No.
                  </th>
                  <th className="p-3 text-center font-semibold border border-gray-200">
                    기둥번호
                  </th>
                  <th className="p-3 text-center font-semibold border border-gray-200">
                    단면 규격
                  </th>
                  <th className="p-3 text-center font-semibold border border-gray-200">
                    길이<br />
                    (m)
                  </th>
                  <th className="p-3 text-center font-semibold border border-gray-200">
                    개수
                  </th>
                  <th className="p-3 text-center font-semibold border border-gray-200">
                    단중<br />
                    (kg/m)
                  </th>
                  <th className="p-3 text-center font-semibold border border-gray-200">
                    총 중량<br />
                    (kg)
                  </th>
                  <th className="p-3 text-center font-semibold border border-gray-200">
                    강종
                  </th>
                  <th className="p-3 text-center font-semibold border border-gray-200">
                    비고
                  </th>
                </tr>
              </thead>
              <tbody>
                {rolledHBOQ.map((group, index) => (
                  <tr
                    key={index}
                    className="even:bg-gray-50 hover:bg-gray-100"
                  >
                    <td className="p-2.5 text-center border border-gray-200">
                      {index + 1}
                    </td>
                    <td className="p-2.5 text-left border border-gray-200">
                      {group.names.join(', ')}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {group.combination}
                    </td>
                    <td className="p-2.5 text-right border border-gray-200">
                      {group.length.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {group.count}
                    </td>
                    <td className="p-2.5 text-right border border-gray-200">
                      {group.unitWeight.toFixed(2)}
                    </td>
                    <td className="p-2.5 text-right border border-gray-200">
                      {group.totalWeight.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {group.steelGrade}
                    </td>
                    <td className="p-2.5 text-center border border-gray-200">
                      {group.isGrouped ? '그룹핑됨' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold text-indigo-900 bg-teal-50">
                  <td
                    colSpan={4}
                    className="p-2.5 text-right border-t-2 border-b-2 border-green-500"
                  >
                    합계
                  </td>
                  <td className="p-2.5 text-center border-t-2 border-b-2 border-green-500">
                    {rolledHBOQ
                      .reduce((sum, g) => sum + g.count, 0)
                      .toLocaleString()}
                  </td>
                  <td className="p-2.5 text-center border-t-2 border-b-2 border-green-500">
                    -
                  </td>
                  <td className="p-2.5 text-right border-t-2 border-b-2 border-green-500">
                    {rolledHBOQ
                      .reduce((sum, g) => sum + g.totalWeight, 0)
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </td>
                  <td className="p-2.5 text-center border-t-2 border-b-2 border-green-500">
                    -
                  </td>
                  <td className="p-2.5 text-center border-t-2 border-b-2 border-green-500">
                    -
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-indigo-900 pb-2.5 border-b-2 border-indigo-500">
            {hasRolledH ? '4. 소부재 물량 정리' : '3. 소부재 물량 정리'}
          </h2>
          <table className="w-full mb-8 text-sm border-collapse">
            <thead>
              <tr className="text-white bg-gradient-to-br from-indigo-500 to-purple-600">
                <th className="p-3 text-center font-semibold border border-gray-200">
                  No.
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  소부재 종류
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  규격/사양
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  단위
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  수량
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  강종
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  주기둥부재물량<br />
                  (kg)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  할증<br />
                  (15%)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  소부재 단가<br />
                  (원/톤)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  금액<br />
                  (원)
                </th>
                <th className="p-3 text-center font-semibold border border-gray-200">
                  비고
                </th>
              </tr>
            </thead>
            <tbody>
              {subMaterialBOQ.map((item, index) => (
                <tr
                  key={index}
                  className="even:bg-gray-50 hover:bg-gray-100"
                >
                  <td className="p-2.5 text-center border border-gray-200">
                    {index + 1}
                  </td>
                  <td className="p-2.5 text-center border border-gray-200">
                    {item.type}
                  </td>
                  <td className="p-2.5 text-center border border-gray-200">
                    {item.spec}
                  </td>
                  <td className="p-2.5 text-center border border-gray-200">
                    {item.unit}
                  </td>
                  <td className="p-2.5 text-center border border-gray-200">
                    {item.quantity !== null ? item.quantity : '-'}
                  </td>
                  <td className="p-2.5 text-center border border-gray-200">
                    {item.steelGrade}
                  </td>
                  <td className="p-2.5 text-right border border-gray-200">
                    {item.mainMaterialWeight.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-2.5 text-right border border-gray-200">
                    {item.surcharge.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-2.5 text-right border border-gray-200">
                    {item.unitPrice.toLocaleString()}
                  </td>
                  <td className="p-2.5 text-right border border-gray-200">
                    {Math.round(item.amount).toLocaleString()}
                  </td>
                  <td className="p-2.5 text-center border border-gray-200">
                    {item.remark}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold text-indigo-900 bg-teal-50">
                <td
                  colSpan={4}
                  className="p-2.5 text-right border-t-2 border-b-2 border-green-500"
                >
                  합계
                </td>
                <td className="p-2.5 text-center border-t-2 border-b-2 border-green-500">
                  {subMaterialBOQ
                    .reduce((sum, item) => sum + (item.quantity || 0), 0)
                    .toLocaleString()}
                </td>
                <td className="p-2.5 text-center border-t-2 border-b-2 border-green-500">
                  -
                </td>
                <td className="p-2.5 text-right border-t-2 border-b-2 border-green-500">
                  {subMaterialBOQ
                    .reduce((sum, item) => sum + item.mainMaterialWeight, 0)
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </td>
                <td className="p-2.5 text-right border-t-2 border-b-2 border-green-500">
                  {subMaterialBOQ
                    .reduce((sum, item) => sum + item.surcharge, 0)
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </td>
                <td className="p-2.5 text-center border-t-2 border-b-2 border-green-500">
                  -
                </td>
                <td className="p-2.5 text-right border-t-2 border-b-2 border-green-500">
                  {Math.round(
                    subMaterialBOQ.reduce((sum, item) => sum + item.amount, 0)
                  ).toLocaleString()}
                </td>
                <td className="p-2.5 text-center border-t-2 border-b-2 border-green-500">
                  -
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex justify-center gap-2.5 mt-8 print:hidden">
          <button
            onClick={handlePrint}
            className="px-6 py-3 text-sm font-semibold text-white bg-green-600 rounded-md cursor-pointer hover:bg-green-700 transition-colors"
          >
            🖨️ 인쇄
          </button>
          <button
            onClick={handleExportCSV}
            className="px-6 py-3 text-sm font-semibold text-white bg-indigo-500 rounded-md cursor-pointer hover:bg-indigo-600 transition-colors"
          >
            📥 CSV 다운로드
          </button>
          <button
            onClick={handleAddSubMaterial}
            className="px-6 py-3 text-sm font-semibold text-white bg-indigo-500 rounded-md cursor-pointer hover:bg-indigo-600 transition-colors"
          >
            ➕ 소부재 추가
          </button>
          <button
            onClick={handleClose}
            className="px-6 py-3 text-sm font-semibold text-white bg-gray-500 rounded-md cursor-pointer hover:bg-gray-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>

      {showThicknessMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black bg-opacity-50">
          <div className="w-full max-w-[700px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-indigo-500">
              <h2 className="m-0 text-2xl font-bold text-indigo-900">
                두께 통합 설정
              </h2>
              <button
                onClick={() => setShowThicknessMergeModal(false)}
                className="flex items-center justify-center w-8 h-8 p-0 text-2xl text-gray-400 bg-transparent border-none cursor-pointer hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <div className="mb-5 p-4 bg-gray-50 rounded-lg">
              <h3 className="mb-4 text-base font-semibold text-gray-600">
                현재 두께 현황
              </h3>
              <div className="max-h-[200px] overflow-y-auto">
                {/* TODO: Implement current thickness list */}
                <p className="text-gray-500">구현 예정</p>
              </div>
            </div>

            <div className="mb-5">
              <h3 className="mb-4 text-base font-semibold text-gray-600">
                두께 통합 규칙 추가
              </h3>
              <div className="flex items-center gap-2.5 mb-4">
                <label className="font-semibold text-gray-600">From:</label>
                <input
                  type="number"
                  placeholder="예: 11"
                  min="1"
                  max="100"
                  step="1"
                  className="w-24 p-2 text-sm border border-gray-300 rounded-md"
                />
                <label className="font-semibold text-gray-600">To:</label>
                <input
                  type="number"
                  placeholder="예: 12"
                  min="1"
                  max="100"
                  step="1"
                  className="w-24 p-2 text-sm border border-gray-300 rounded-md"
                />
                <button className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md cursor-pointer hover:bg-green-700 transition-colors">
                  추가
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-4 text-base font-semibold text-gray-600">
                통합 규칙 목록
              </h3>
              <div className="min-h-[100px] max-h-[200px] overflow-y-auto p-2.5 border border-gray-200 rounded-md">
                {/* TODO: Implement merge rules list */}
                <p className="text-gray-500">구현 예정</p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowThicknessMergeModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-500 rounded-md cursor-pointer hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  // TODO: Implement apply logic
                  setShowThicknessMergeModal(false);
                }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-500 rounded-md cursor-pointer hover:bg-indigo-600 transition-colors"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
