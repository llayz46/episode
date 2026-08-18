<?php

use App\Models\User;

test('authentication and validation errors are displayed in French', function () {
    $this->post(route('login.store'), [
        'email' => 'unknown@example.com',
        'password' => 'invalid-password',
    ])->assertSessionHasErrors([
        'email' => 'Ces identifiants ne correspondent pas à nos enregistrements.',
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [])
        ->assertSessionHasErrors([
            'name' => 'Le champ nom est obligatoire.',
            'email' => 'Le champ adresse e-mail est obligatoire.',
        ]);
});

test('password reset statuses are displayed in French', function () {
    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email])
        ->assertSessionHas('status', 'Le lien de réinitialisation a été envoyé par e-mail.');
});
