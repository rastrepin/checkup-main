import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { maleFullThirtyForty } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${maleFullThirtyForty.title}`,
  description: maleFullThirtyForty.description,
};

export default function Page() {
  return <ProgramPage program={maleFullThirtyForty} basePath="male-checkup" />;
}
