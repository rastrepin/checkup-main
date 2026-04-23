import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { maleRegularThirtyForty } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${maleRegularThirtyForty.title}`,
  description: maleRegularThirtyForty.description,
};

export default function Page() {
  return <ProgramPage program={maleRegularThirtyForty} basePath="male-checkup" />;
}
