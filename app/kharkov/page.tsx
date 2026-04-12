import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { CheckupProgram, ClinicBranch } from '@/lib/types';
import QuizWrapper from '@/components/quiz/QuizWrapper';
import ProgramCatalogRu from '@/components/city/ProgramCatalogRu';
import FaqBlock from '@/components/ci