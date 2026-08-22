import { Form } from '@inertiajs/react';
import { Check, Copy, ScanLine } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AlertError from '@/components/alert-error';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPanel,
    DialogTitle,
} from '@/components/ui/dialog';
import { OTPField, OTPFieldInput } from '@/components/ui/otp-field';
import { Spinner } from '@/components/ui/spinner';
import { useAppearance } from '@/hooks/use-appearance';
import { useClipboard } from '@/hooks/use-clipboard';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { confirm } from '@/routes/two-factor';

function GridScanIcon() {
    return (
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border bg-muted shadow-xs/5">
            <ScanLine aria-hidden="true" className="size-5" />
        </div>
    );
}

function TwoFactorSetupStep({
    qrCodeSvg,
    manualSetupKey,
    errors,
}: {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    errors: string[];
}) {
    const { resolvedAppearance } = useAppearance();
    const [copiedText, copy] = useClipboard();
    const IconComponent = copiedText === manualSetupKey ? Check : Copy;

    return (
        <>
            {errors?.length ? (
                <AlertError errors={errors} />
            ) : (
                <div className="flex flex-col gap-5">
                    <div className="mx-auto flex aspect-square w-52 items-center justify-center rounded-2xl border bg-muted p-3 shadow-xs/5">
                        {qrCodeSvg ? (
                            <div
                                className="aspect-square size-full rounded-xl bg-white p-2 [&_svg]:size-full"
                                dangerouslySetInnerHTML={{
                                    __html: qrCodeSvg,
                                }}
                                style={{
                                    filter:
                                        resolvedAppearance === 'dark'
                                            ? 'invert(1) brightness(1.5)'
                                            : undefined,
                                }}
                            />
                        ) : (
                            <Spinner />
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                        ou saisir la clé manuellement
                    </div>

                    {!manualSetupKey ? (
                        <div className="flex h-12 items-center justify-center rounded-xl border bg-muted">
                            <Spinner />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 rounded-xl border bg-muted/48 p-2 ps-3">
                            <code className="min-w-0 flex-1 font-mono text-xs break-all text-foreground">
                                {manualSetupKey}
                            </code>
                            <Button
                                aria-label="Copier la clé de configuration"
                                size="icon"
                                type="button"
                                variant="ghost"
                                onClick={() => copy(manualSetupKey)}
                            >
                                <IconComponent aria-hidden="true" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

function TwoFactorVerificationStep({
    onClose,
    onBack,
}: {
    onClose: () => void;
    onBack: () => void;
}) {
    const [code, setCode] = useState<string>('');
    const pinInputContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => {
            pinInputContainerRef.current?.querySelector('input')?.focus();
        }, 0);
    }, []);

    return (
        <Form
            {...confirm.form()}
            className="contents"
            onSuccess={() => onClose()}
            resetOnError
            resetOnSuccess
        >
            {({
                processing,
                errors,
            }: {
                processing: boolean;
                errors?: { confirmTwoFactorAuthentication?: { code?: string } };
            }) => (
                <>
                    <DialogPanel>
                        <div
                            ref={pinInputContainerRef}
                            className="flex flex-col items-center gap-3 py-2"
                        >
                            <OTPField
                                aria-label="Code d’authentification"
                                disabled={processing}
                                id="otp"
                                length={OTP_MAX_LENGTH}
                                name="code"
                                onValueChange={setCode}
                            >
                                {Array.from(
                                    { length: OTP_MAX_LENGTH },
                                    (_, index) => (
                                        <OTPFieldInput
                                            key={index}
                                            aria-label={
                                                index === 0
                                                    ? undefined
                                                    : `Caractère ${index + 1} sur ${OTP_MAX_LENGTH}`
                                            }
                                            autoFocus={index === 0}
                                        />
                                    ),
                                )}
                            </OTPField>
                            <InputError
                                message={
                                    errors?.confirmTwoFactorAuthentication?.code
                                }
                            />
                        </div>
                    </DialogPanel>

                    <DialogFooter>
                        <div className="grid w-full grid-cols-2 gap-2">
                            <Button
                                disabled={processing}
                                type="button"
                                variant="ghost"
                                onClick={onBack}
                            >
                                Retour
                            </Button>
                            <Button
                                disabled={
                                    processing || code.length < OTP_MAX_LENGTH
                                }
                                type="submit"
                            >
                                Confirmer
                            </Button>
                        </div>
                    </DialogFooter>
                </>
            )}
        </Form>
    );
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    clearSetupData: () => void;
    fetchSetupData: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorSetupModal({
    isOpen,
    onClose,
    requiresConfirmation,
    twoFactorEnabled,
    qrCodeSvg,
    manualSetupKey,
    clearSetupData,
    fetchSetupData,
    errors,
}: Props) {
    const [showVerificationStep, setShowVerificationStep] =
        useState<boolean>(false);

    const modalConfig = useMemo<{
        title: string;
        description: string;
        buttonText: string;
    }>(() => {
        if (twoFactorEnabled) {
            return {
                title: 'Authentification à deux facteurs activée',
                description:
                    'L’authentification à deux facteurs est activée. Scannez le QR code ou saisissez la clé dans votre application d’authentification.',
                buttonText: 'Fermer',
            };
        }

        if (showVerificationStep) {
            return {
                title: 'Vérifier le code d’authentification',
                description:
                    'Saisissez le code à 6 chiffres de votre application d’authentification',
                buttonText: 'Continuer',
            };
        }

        return {
            title: 'Activer l’authentification à deux facteurs',
            description:
                'Pour terminer l’activation, scannez le QR code ou saisissez la clé dans votre application d’authentification',
            buttonText: 'Continuer',
        };
    }, [twoFactorEnabled, showVerificationStep]);

    const resetModalState = useCallback(() => {
        if (twoFactorEnabled) {
            clearSetupData();
        }

        setShowVerificationStep(false);
    }, [clearSetupData, twoFactorEnabled]);

    const handleClose = useCallback(() => {
        resetModalState();
        onClose();
    }, [onClose, resetModalState]);

    const handleModalNextStep = useCallback(() => {
        if (requiresConfirmation) {
            setShowVerificationStep(true);

            return;
        }

        clearSetupData();
        handleClose();
    }, [requiresConfirmation, clearSetupData, handleClose]);

    const fetchSetupDataRef = useRef(fetchSetupData);

    useEffect(() => {
        fetchSetupDataRef.current = fetchSetupData;
    }, [fetchSetupData]);

    useEffect(() => {
        if (isOpen && !qrCodeSvg) {
            fetchSetupDataRef.current();
        }
    }, [isOpen, qrCodeSvg]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-start gap-3">
                        <GridScanIcon />
                        <div className="flex flex-col gap-1">
                            <DialogTitle>{modalConfig.title}</DialogTitle>
                            <DialogDescription>
                                {modalConfig.description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {showVerificationStep ? (
                    <TwoFactorVerificationStep
                        onClose={handleClose}
                        onBack={() => setShowVerificationStep(false)}
                    />
                ) : (
                    <>
                        <DialogPanel>
                            <TwoFactorSetupStep
                                qrCodeSvg={qrCodeSvg}
                                manualSetupKey={manualSetupKey}
                                errors={errors}
                            />
                        </DialogPanel>
                        {!errors.length && (
                            <DialogFooter>
                                <Button
                                    className="w-full"
                                    type="button"
                                    onClick={handleModalNextStep}
                                >
                                    {modalConfig.buttonText}
                                </Button>
                            </DialogFooter>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
