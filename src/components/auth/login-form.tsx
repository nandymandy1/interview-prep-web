'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FC, type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import CardContent from '@/components/ui/card-content';
import CardDescription from '@/components/ui/card-description';
import CardHeader from '@/components/ui/card-header';
import CardTitle from '@/components/ui/card-title';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import { APP_ROUTES } from '@/constants';
import { useLogin } from '@/hooks/auth/use-auth';
import { getErrorMessage } from '@/lib/error';

const LoginForm: FC = () => {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    try {
      await login.mutateAsync({ email, password });
      router.replace(APP_ROUTES.dashboard);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to continue to your interview kits.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button className="w-full" type="submit" disabled={login.isPending}>
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Need an account?{' '}
          <Link className="font-medium text-foreground underline underline-offset-4" href={APP_ROUTES.register}>
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
