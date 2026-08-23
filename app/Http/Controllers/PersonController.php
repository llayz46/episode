<?php

namespace App\Http\Controllers;

use App\Actions\Tmdb\ShowPerson;
use App\Models\Person;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PersonController extends Controller
{
    public function show(Person $person, ShowPerson $showPerson): InertiaResponse
    {
        return Inertia::render('people/show', [
            'person' => $showPerson->handle($person),
        ]);
    }
}
