package model

import (
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestCalcNextResetTimeWeeklyUsesPurchaseDate(t *testing.T) {
	location := time.FixedZone("UTC+8", 8*60*60)
	purchasedAt := time.Date(2026, time.June, 21, 11, 55, 32, 0, location)
	plan := &SubscriptionPlan{QuotaResetPeriod: SubscriptionResetWeekly}

	next := calcNextResetTime(purchasedAt, plan, 0)
	require.Equal(
		t,
		time.Date(2026, time.June, 28, 11, 55, 32, 0, location).Unix(),
		next,
	)

	following := calcNextResetTime(time.Unix(next, 0).In(location), plan, 0)
	require.Equal(
		t,
		time.Date(2026, time.July, 5, 11, 55, 32, 0, location).Unix(),
		following,
	)
}

func TestCalcNextResetTimeWeeklyRespectsSubscriptionEnd(t *testing.T) {
	location := time.FixedZone("UTC+8", 8*60*60)
	purchasedAt := time.Date(2026, time.June, 21, 11, 55, 32, 0, location)
	plan := &SubscriptionPlan{QuotaResetPeriod: SubscriptionResetWeekly}
	endsBeforeReset := time.Date(2026, time.June, 28, 11, 55, 31, 0, location)

	require.Zero(t, calcNextResetTime(purchasedAt, plan, endsBeforeReset.Unix()))
}
