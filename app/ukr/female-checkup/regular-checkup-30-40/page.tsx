import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { femaleRegularThirtyForty } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${femaleRegularThirtyForty.title}`,
  description: femaleRegularThirtyForty.description,
};

export default function Page() {
  return <ProgramPage program={femaleRegularThirtyForty} basePath="female-checkup" />;
}
