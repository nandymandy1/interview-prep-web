'use client';

import { useRouter } from 'next/navigation';
import { type FC, type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { BriefcaseBusiness, CalendarDays, Globe2, LoaderCircle, WandSparkles } from 'lucide-react';
import PageContainer from '@/components/common/page-container';
import PageHeader from '@/components/common/page-header';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import CardContent from '@/components/ui/card-content';
import CardDescription from '@/components/ui/card-description';
import CardHeader from '@/components/ui/card-header';
import CardTitle from '@/components/ui/card-title';
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
    <PageContainer className="max-w-3xl">
      <PageHeader
        backHref={APP_ROUTES.dashboard}
        backLabel="Interview kits"
        title="Create interview kit"
        description="We'll research the company, extract role requirements and build your study plan."
      />

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <WandSparkles className="size-4 text-muted-foreground" aria-hidden="true" />
            </span>
            <div>
              <CardTitle>Build your preparation kit</CardTitle>
              <CardDescription>
                Three details — company, timing, and the role itself.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
            <section aria-labelledby="new-kit-company" className="space-y-3">
              <h2
                id="new-kit-company"
                className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
              >
                Company
              </h2>
              <div className="space-y-1.5">
                <Label htmlFor="companyUrl" className="flex items-center gap-1.5">
                  <Globe2 className="size-4 text-muted-foreground" aria-hidden="true" />
                  Company website
                </Label>
                <Input
                  id="companyUrl"
                  type="url"
                  placeholder="https://example.com"
                  required
                  value={companyUrl}
                  onChange={(event) => setCompanyUrl(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  We&apos;ll use this to research the company and hiring context.
                </p>
              </div>
            </section>

            <section aria-labelledby="new-kit-timing" className="space-y-3">
              <h2
                id="new-kit-timing"
                className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
              >
                Interview timing
              </h2>
              <div className="space-y-1.5">
                <Label htmlFor="days" className="flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
                  Days before interview
                </Label>
                <Input
                  id="days"
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={days}
                  onChange={(event) => setDays(Number(event.target.value))}
                />
                <p className="text-xs text-muted-foreground">Choose between 1 and 60 days.</p>
              </div>
            </section>

            <section aria-labelledby="new-kit-jd" className="space-y-3">
              <h2
                id="new-kit-jd"
                className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
              >
                Job description
              </h2>
              <div className="space-y-1.5">
                <Label htmlFor="jd" className="flex items-center gap-1.5">
                  <BriefcaseBusiness className="size-4 text-muted-foreground" aria-hidden="true" />
                  Job description
                </Label>
                <Textarea
                  id="jd"
                  className="min-h-80 resize-y"
                  placeholder="Paste the description exactly as provided by the employer…"
                  required
                  value={jd}
                  onChange={(event) => setJd(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {jd.length.toLocaleString()} characters
                </p>
              </div>
            </section>

            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={createKit.isPending || !jd.trim() || !companyUrl.trim()}
            >
              {createKit.isPending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  Starting research...
                </>
              ) : (
                <>
                  <WandSparkles className="size-4" aria-hidden="true" />
                  Generate interview kit
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default NewKitForm;
