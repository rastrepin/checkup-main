import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { femaleFullFortyFifty } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${femaleFullFortyFifty.title} | check-up.in.ua`,
  description: femaleFullFortyFifty.description,
};

export default function Page() {
  return <ProgramPage program={femaleFullFortyFifty} basePath="female-checkup" />;
}
