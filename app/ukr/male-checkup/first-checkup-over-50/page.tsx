import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { maleFullFiftyPlus } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${maleFullFiftyPlus.title}`,
  description: maleFullFiftyPlus.description,
};

export default function Page() {
  return <ProgramPage program={maleFullFiftyPlus} basePath="male-checkup" />;
}
