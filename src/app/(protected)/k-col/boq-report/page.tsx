import { Metadata } from 'next';
import BOQReportClient from '@/components/k-col/boq-report/boq-report-client';

export const metadata: Metadata = {
  title: 'BOQ 산출서 - K-COL',
  description: 'K-COL 강구조 기둥 물량 산출서',
};

export default function BOQReportPage() {
  return <BOQReportClient />;
}
