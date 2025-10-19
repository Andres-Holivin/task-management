import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthActions, useAuthState } from '@/store/auth';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
    const { isAuthenticated } = useAuthState();
    const navigation = useNavigate();
    const {  register: registerUser } = useAuthActions();
    const registerForm = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            fullName: '',
        },
    });

    const handleRegister = async (data: RegisterFormData) => {
        await registerUser(data);
        navigation('/login');
    };


    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create an account
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your details to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                        <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                                    Full Name
                                </label>
                                <Input
                                    id="fullName"
                                    {...registerForm.register('fullName')}
                                    placeholder="John Doe"
                                    className={registerForm.formState.errors.fullName ? 'border-destructive' : ''}
                                />
                                {registerForm.formState.errors.fullName && (
                                    <p className="text-sm text-destructive mt-1">
                                        {registerForm.formState.errors.fullName.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="register-email" className="block text-sm font-medium mb-2">
                                    Email
                                </label>
                                <Input
                                    id="register-email"
                                    type="email"
                                    {...registerForm.register('email')}
                                    placeholder="john@example.com"
                                    className={registerForm.formState.errors.email ? 'border-destructive' : ''}
                                />
                                {registerForm.formState.errors.email && (
                                    <p className="text-sm text-destructive mt-1">
                                        {registerForm.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="register-password" className="block text-sm font-medium mb-2">
                                    Password
                                </label>
                                <Input
                                    id="register-password"
                                    type="password"
                                    {...registerForm.register('password')}
                                    placeholder="••••••••"
                                    className={registerForm.formState.errors.password ? 'border-destructive' : ''}
                                />
                                {registerForm.formState.errors.password && (
                                    <p className="text-sm text-destructive mt-1">
                                        {registerForm.formState.errors.password.message}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={registerForm.formState.isSubmitting}>
                                {registerForm.formState.isSubmitting ? 'Creating account...' : 'Create account'}
                            </Button>
                        </form>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => navigation('/login')}
                            className="text-sm text-primary hover:underline"
                        >Already have an account? Sign in
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
