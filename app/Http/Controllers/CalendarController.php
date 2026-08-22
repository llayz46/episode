<?php

namespace App\Http\Controllers;

use App\Actions\Calendar\BuildCalendar;
use App\Http\Requests\CalendarMonthRequest;
use App\Models\User;
use Carbon\CarbonImmutable;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class CalendarController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(CalendarMonthRequest $request, BuildCalendar $calendar): InertiaResponse
    {
        /** @var User $user */
        $user = $request->user();
        $month = CarbonImmutable::parse(
            ($request->string('month')->value() ?: now()->format('Y-m')).'-01',
        )->startOfMonth();

        return Inertia::render('calendar', [
            ...$calendar->handle($user, $month),
            'view' => $request->string('view')->value() ?: 'month',
        ]);
    }
}
