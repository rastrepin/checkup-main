import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { maleFullFortyFifty } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${maleFullFortyFifty.title}`,
  description: maleFullFortyFifty.description,
  robots: { index: false, follow: false }, // freeze 09.08.2026 (Ihor) — старий Program Page, поза Типом 5/5a
};

export default function Page() {
  return <ProgramPage program={maleFullFortyFifty} basePath="male-checkup" />;
}
