import { Form, Head } from '@inertiajs/react';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import AppLogo from '@/components/app-logo';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirmer le mot de passe" />

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
                                    Vérification requise
                                </p>
                                <p className="mt-1 text-sm text-white/55">
                                    Confirmez votre mot de passe pour accéder à
                                    cette zone sécurisée.
                                </p>
                            </div>

                            <PasskeyVerify
                                routes={{
                                    options: confirmOptions(),
                                    submit: confirmStore(),
                                }}
                                label="Confirmer avec une clé d’accès"
                                loadingLabel="Confirmation…"
                                separator="Ou confirmer avec un mot de passe"
                            />

                            <Form
                                {...store.form()}
                                className="flex flex-col gap-5"
                                resetOnSuccess={['password']}
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">
                                                Mot de passe
                                            </Label>
                                            <PasswordInput
                                                autoComplete="current-password"
                                                autoFocus
                                                id="password"
                                                name="password"
                                                placeholder="Mot de passe"
                                                required
                                                tabIndex={1}
                                            />

                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <Button
                                            className="mt-2 w-full"
                                            data-test="confirm-password-button"
                                            disabled={processing}
                                            tabIndex={2}
                                            type="submit"
                                        >
                                            {processing && <Spinner />}
                                            Confirmer le mot de passe
                                        </Button>
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
