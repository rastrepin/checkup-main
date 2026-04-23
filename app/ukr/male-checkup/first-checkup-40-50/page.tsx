import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { maleFullFortyFifty } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${maleFullFortyFifty.title}`,
  description: maleFullFortyFifty.description,
};

export default function Page() {
  return <ProgramPage program={maleFullFortyFifty} basePath="male-checkup" />;
}
