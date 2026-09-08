'use client';

import { useRouter } from 'next/navigation';
import { type FC, type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import PageContainer from '@/components/common/page-container';
import PageHeader from '@/components/common/page-header';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import CardContent from '@/components/ui/card-content';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Textarea from '@/components/ui/textarea';
import { APP_ROUTES } from '@/constants';
import { useCreateKit } from '@/hooks/kits/use-kits';
import { getErrorMessage } from '@/lib/error';

const NewKitForm: FC = () => {
  const router = useRouter();
  const createKit = useCreateKit();
  const [jd, setJd] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [days, setDays] = useState(5);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    try {
      const result = await createKit.mutateAsync({ jd, companyUrl, days });
      router.push(APP_ROUTES.kit(result.kitId));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        title="Create interview kit"
        description="Give the application the posting, the company's website, and exactly how many days you have to prepare."
      />

      <Card>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="companyUrl">Company website</Label>
              <Input
                id="companyUrl"
                type="url"
                placeholder="https://example.com"
                required
                value={companyUrl}
                onChange={(event) => setCompanyUrl(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="days">Days before interview</Label>
              <Input
                id="days"
                type="number"
                min={1}
                max={60}
                required
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jd">Job description</Label>
              <Textarea
                id="jd"
                className="min-h-80 resize-y"
                placeholder="Paste the job description here…"
                required
                value={jd}
                onChange={(event) => setJd(event.target.value)}
              />
              <p className="text-muted-foreground text-xs">
                {jd.length.toLocaleString()} characters
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={createKit.isPending || !jd.trim() || !companyUrl.trim()}
              >
                {createKit.isPending ? 'Starting research…' : 'Generate kit'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default NewKitForm;
