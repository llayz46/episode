import { Form, Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLogo from '@/components/app-logo';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OTPField, OTPFieldInput } from '@/components/ui/otp-field';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Code de récupération',
                description:
                    'Confirmez l’accès à votre compte avec l’un de vos codes de récupération.',
                toggleText: 'utiliser un code d’authentification',
            };
        }

        return {
            title: 'Code d’authentification',
            description:
                'Saisissez le code fourni par votre application d’authentification.',
            toggleText: 'utiliser un code de récupération',
        };
    }, [showRecoveryInput]);

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <Head title="Authentification à deux facteurs" />

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
                                    {authConfigContent.title}
                                </p>
                                <p className="mt-1 text-sm text-white/55">
                                    {authConfigContent.description}
                                </p>
                            </div>

                            <Form
                                {...store.form()}
                                className="flex flex-col gap-5"
                                resetOnError
                                resetOnSuccess={!showRecoveryInput}
                            >
                                {({ errors, processing, clearErrors }) => (
                                    <>
                                        {showRecoveryInput ? (
                                            <div className="grid gap-2">
                                                <Input
                                                    autoFocus
                                                    name="recovery_code"
                                                    placeholder="Saisir un code de récupération"
                                                    required
                                                    type="text"
                                                />
                                                <InputError
                                                    message={
                                                        errors.recovery_code
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center gap-3 text-center">
                                                <div className="flex w-full items-center justify-center">
                                                    <OTPField
                                                        aria-label="Code d’authentification"
                                                        disabled={processing}
                                                        length={OTP_MAX_LENGTH}
                                                        name="code"
                                                        value={code}
                                                        onValueChange={setCode}
                                                    >
                                                        {Array.from(
                                                            {
                                                                length: OTP_MAX_LENGTH,
                                                            },
                                                            (_, index) => (
                                                                <OTPFieldInput
                                                                    key={index}
                                                                    aria-label={
                                                                        index ===
                                                                        0
                                                                            ? undefined
                                                                            : `Caractère ${index + 1} sur ${OTP_MAX_LENGTH}`
                                                                    }
                                                                    autoFocus={
                                                                        index ===
                                                                        0
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </OTPField>
                                                </div>
                                                <InputError
                                                    message={errors.code}
                                                />
                                            </div>
                                        )}

                                        <Button
                                            className="mt-2 w-full"
                                            disabled={processing}
                                            type="submit"
                                        >
                                            Continuer
                                        </Button>

                                        <div className="text-center text-sm text-white/55">
                                            ou{' '}
                                            <button
                                                className="cursor-pointer text-white underline decoration-white/30 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current"
                                                type="button"
                                                onClick={() =>
                                                    toggleRecoveryMode(
                                                        clearErrors,
                                                    )
                                                }
                                            >
                                                {authConfigContent.toggleText}
                                            </button>
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
