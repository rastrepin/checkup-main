import { Metadata } from 'next';
import ProgramPage from '@/components/program-page/ProgramPage';
import { maleRegularFortyFifty } from '@/lib/programs/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${maleRegularFortyFifty.title} | check-up.in.ua`,
  description: maleRegularFortyFifty.description,
};

export default function Page() {
  return <ProgramPage program={maleRegularFortyFifty} basePath="male-checkup" />;
}
