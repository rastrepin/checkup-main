import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { femaleFullDo30 } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${femaleFullDo30.title} | check-up.in.ua`,
  description: femaleFullDo30.description,
};

export default function Page() {
  return <ProgramPage program={femaleFullDo30} basePath="female-checkup" />;
}
