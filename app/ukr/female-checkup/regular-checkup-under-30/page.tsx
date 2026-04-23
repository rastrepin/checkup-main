import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { femaleRegularDo30 } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${femaleRegularDo30.title} | check-up.in.ua`,
  description: femaleRegularDo30.description,
};

export default function Page() {
  return <ProgramPage program={femaleRegularDo30} basePath="female-checkup" />;
}
