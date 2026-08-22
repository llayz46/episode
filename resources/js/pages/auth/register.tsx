import { Form, Head } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Créer un compte" />
            <main className="dark relative min-h-svh overflow-hidden bg-neutral-950 text-white">
                <img
                    alt=""
                    className="absolute inset-0 size-full object-cover object-[58%_center] opacity-50"
                    src="/images/login_background.webp"
                />
                <div className="absolute inset-0 bg-black/45" />
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-black/65" />

                <div className="relative mx-auto grid min-h-svh w-full max-w-[1600px] grid-cols-1 gap-10 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-28 lg:px-12 lg:py-8">
                    <section className="flex min-h-[46svh] flex-col lg:min-h-0">
                        <AppLogo className="text-white" />

                        <div className="my-auto max-w-2xl py-12 lg:py-0">
                            <h1 className="font-heading text-5xl font-semibold tracking-[-0.07em] sm:text-6xl lg:text-7xl">
                                Tout ce que vous aimez mérite son moment.
                            </h1>
                            <p className="mt-6 max-w-lg text-base leading-7 text-white/60">
                                Retrouver une série, anticiper une sortie ou
                                commencer un film : Episode garde le fil pour
                                vous.
                            </p>
                        </div>
                    </section>

                    <aside className="flex items-center lg:justify-end">
                        <div className="w-full rounded-3xl border border-white/12 bg-black/35 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-6">
                            <div className="mb-6">
                                <p className="font-heading text-2xl font-semibold tracking-[-0.045em]">
                                    Créer un compte
                                </p>
                                <p className="mt-1 text-sm text-white/55">
                                    Votre collection commence ici.
                                </p>
                            </div>

                            <Form
                                {...store.form()}
                                resetOnSuccess={[
                                    'password',
                                    'password_confirmation',
                                ]}
                                disableWhileProcessing
                                className="flex flex-col gap-5"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-5">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">
                                                    Nom
                                                </Label>
                                                <Input
                                                    autoComplete="name"
                                                    autoFocus
                                                    id="name"
                                                    name="name"
                                                    placeholder="Nom complet"
                                                    required
                                                    tabIndex={1}
                                                    type="text"
                                                />
                                                <InputError
                                                    message={errors.name}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="email">
                                                    Adresse e-mail
                                                </Label>
                                                <Input
                                                    autoComplete="email"
                                                    id="email"
                                                    name="email"
                                                    placeholder="email@example.com"
                                                    required
                                                    tabIndex={2}
                                                    type="email"
                                                />
                                                <InputError
                                                    message={errors.email}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password">
                                                    Mot de passe
                                                </Label>
                                                <PasswordInput
                                                    autoComplete="new-password"
                                                    id="password"
                                                    name="password"
                                                    passwordrules={
                                                        passwordRules
                                                    }
                                                    placeholder="Mot de passe"
                                                    required
                                                    tabIndex={3}
                                                />
                                                <InputError
                                                    message={errors.password}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password_confirmation">
                                                    Confirmer le mot de passe
                                                </Label>
                                                <PasswordInput
                                                    autoComplete="new-password"
                                                    id="password_confirmation"
                                                    name="password_confirmation"
                                                    passwordrules={
                                                        passwordRules
                                                    }
                                                    placeholder="Confirmer le mot de passe"
                                                    required
                                                    tabIndex={4}
                                                />
                                                <InputError
                                                    message={
                                                        errors.password_confirmation
                                                    }
                                                />
                                            </div>

                                            <Button
                                                className="mt-2 w-full"
                                                data-test="register-user-button"
                                                disabled={processing}
                                                tabIndex={5}
                                                type="submit"
                                            >
                                                {processing && <Spinner />}
                                                Créer un compte
                                            </Button>
                                        </div>

                                        <div className="text-center text-sm text-white/55">
                                            Vous avez déjà un compte ?{' '}
                                            <TextLink
                                                className="text-white"
                                                href={login()}
                                                tabIndex={6}
                                            >
                                                Se connecter
                                            </TextLink>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </div>
                    </aside>
                </div>
            </main>
        </>
    );
}
