import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { maleRegularDo30 } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${maleRegularDo30.title}`,
  description: maleRegularDo30.description,
};

export default function Page() {
  return <ProgramPage program={maleRegularDo30} basePath="male-checkup" />;
}
