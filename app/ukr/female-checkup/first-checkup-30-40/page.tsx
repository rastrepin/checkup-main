import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { femaleFullThirtyForty } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${femaleFullThirtyForty.title} | check-up.in.ua`,
  description: femaleFullThirtyForty.description,
};

export default function Page() {
  return <ProgramPage program={femaleFullThirtyForty} basePath="female-checkup" />;
}
