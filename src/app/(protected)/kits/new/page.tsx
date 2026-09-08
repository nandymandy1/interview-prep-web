import type { FC } from 'react';
import type { Metadata } from 'next';
import NewKitForm from '@/components/kits/new-kit-form';

export const metadata: Metadata = {
  title: 'New Interview Kit',
};

const NewKitPage: FC = () => {
  return <NewKitForm />;
};

export default NewKitPage;
