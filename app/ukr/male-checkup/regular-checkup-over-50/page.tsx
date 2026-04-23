import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { maleRegularFiftyPlus } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${maleRegularFiftyPlus.title}`,
  description: maleRegularFiftyPlus.description,
};

export default function Page() {
  return <ProgramPage program={maleRegularFiftyPlus} basePath="male-checkup" />;
}
