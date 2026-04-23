import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { femaleFullFiftyPlus } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${femaleFullFiftyPlus.title}`,
  description: femaleFullFiftyPlus.description,
};

export default function Page() {
  return <ProgramPage program={femaleFullFiftyPlus} basePath="female-checkup" />;
}
