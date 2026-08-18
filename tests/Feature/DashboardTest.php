<?php

use App\Models\User;

test('guests are redirected to the login page from the home page', function () {
    $response = $this->get(route('home'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the home page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('home'));
    $response->assertOk();
});

test('the previous dashboard URL redirects to the home page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard'))->assertRedirectToRoute('home');
});

test('authenticated users can visit the button gallery', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('buttons'))->assertSuccessful();
});
