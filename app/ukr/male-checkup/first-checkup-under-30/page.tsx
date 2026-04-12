import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { maleFullDo30 } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${maleFullDo30.title} | check-up.in.ua`,
  description: maleFullDo30.description,
};

export default function Page() {
  return <ProgramPage program={maleFullDo30} basePath="male-checkup" />;
}
