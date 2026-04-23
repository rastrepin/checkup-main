import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { femaleRegularFiftyPlus } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${femaleRegularFiftyPlus.title}`,
  description: femaleRegularFiftyPlus.description,
};

export default function Page() {
  return <ProgramPage program={femaleRegularFiftyPlus} basePath="female-checkup" />;
}
