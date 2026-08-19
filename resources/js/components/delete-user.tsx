import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col gap-6">
            <Heading
                variant="small"
                title="Supprimer le compte"
                description="Supprimez votre compte et toutes ses données"
            />
            <div className="flex flex-col gap-4 rounded-2xl border border-destructive/20 bg-destructive/8 p-5">
                <div className="flex flex-col gap-0.5 text-destructive-foreground">
                    <p className="font-medium">Attention</p>
                    <p className="text-sm">Cette action est irréversible.</p>
                </div>

                <Dialog>
                    <DialogTrigger
                        render={
                            <Button
                                data-test="delete-user-button"
                                variant="destructive"
                            />
                        }
                    >
                        Supprimer le compte
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            Voulez-vous vraiment supprimer votre compte ?
                        </DialogTitle>
                        <DialogDescription>
                            Une fois votre compte supprimé, toutes ses données
                            seront définitivement effacées. Saisissez votre mot
                            de passe pour confirmer cette suppression.
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-6"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="sr-only"
                                        >
                                            Mot de passe
                                        </Label>

                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder="Mot de passe"
                                            autoComplete="current-password"
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <DialogFooter className="gap-2">
                                        <DialogClose
                                            render={
                                                <Button
                                                    onClick={() =>
                                                        resetAndClearErrors()
                                                    }
                                                    variant="secondary"
                                                />
                                            }
                                        >
                                            Annuler
                                        </DialogClose>

                                        <Button
                                            data-test="confirm-delete-user-button"
                                            variant="destructive"
                                            disabled={processing}
                                            type="submit"
                                        >
                                            Supprimer le compte
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
