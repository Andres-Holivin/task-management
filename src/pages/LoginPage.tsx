import { Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthActions, useAuthState } from '@/store/auth';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
    const { isAuthenticated } = useAuthState();
    const { login, register: registerUser } = useAuthActions();
    const navigation = useNavigate();

    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const handleLogin = async (data: LoginFormData) => {
        await login(data);
    };

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Welcome back
                    </CardTitle>
                    <CardDescription className="text-center">Enter your credentials to access your tasks
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    
                        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                            <div>
                                <label htmlFor="login-email" className="block text-sm font-medium mb-2">
                                    Email
                                </label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    {...loginForm.register('email')}
                                    placeholder="john@example.com"
                                    className={loginForm.formState.errors.email ? 'border-destructive' : ''}
                                />
                                {loginForm.formState.errors.email && (
                                    <p className="text-sm text-destructive mt-1">
                                        {loginForm.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="login-password" className="block text-sm font-medium mb-2">
                                    Password
                                </label>
                                <Input
                                    id="login-password"
                                    type="password"
                                    {...loginForm.register('password')}
                                    placeholder="••••••••"
                                    className={loginForm.formState.errors.password ? 'border-destructive' : ''}
                                />
                                {loginForm.formState.errors.password && (
                                    <p className="text-sm text-destructive mt-1">
                                        {loginForm.formState.errors.password.message}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                                {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => navigation('/register')}
                            className="text-sm text-primary hover:underline"
                        >Don't have an account? Create one
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
