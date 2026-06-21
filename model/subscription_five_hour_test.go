package model

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestPreConsumeUserSubscriptionFiveHourQuota(t *testing.T) {
	truncateTables(t)
	_ = getSubscriptionPlanCache().Purge()
	_ = getSubscriptionPlanInfoCache().Purge()

	now := GetDBTimestamp()
	plan := &SubscriptionPlan{
		Title:                "weekly with five-hour quota",
		PriceAmount:          1,
		Currency:             "USD",
		DurationUnit:         SubscriptionDurationMonth,
		DurationValue:        1,
		Enabled:              true,
		TotalAmount:          1000,
		QuotaResetPeriod:     SubscriptionResetWeekly,
		FiveHourQuotaEnabled: true,
		FiveHourQuota:        300,
	}
	require.NoError(t, DB.Create(plan).Error)

	sub := &UserSubscription{
		UserId:      1001,
		PlanId:      plan.Id,
		AmountTotal: plan.TotalAmount,
		AmountUsed:  0,
		StartTime:   now,
		EndTime:     now + 30*24*3600,
		Status:      "active",
		Source:      "test",
	}
	require.NoError(t, DB.Create(sub).Error)

	res, err := PreConsumeUserSubscription("five-hour-1", sub.UserId, "test-model", 0, 200)
	require.NoError(t, err)
	require.Equal(t, int64(200), res.AmountUsedAfter)

	var stored UserSubscription
	require.NoError(t, DB.First(&stored, sub.Id).Error)
	require.Equal(t, int64(200), stored.AmountUsed)
	require.Equal(t, int64(200), stored.FiveHourAmountUsed)
	require.NotZero(t, stored.FiveHourWindowStart)
	require.Equal(t, stored.FiveHourWindowStart+5*3600, stored.FiveHourNextResetTime)

	_, err = PreConsumeUserSubscription("five-hour-2", sub.UserId, "test-model", 0, 150)
	require.ErrorContains(t, err, "subscription quota insufficient")
	require.NoError(t, DB.First(&stored, sub.Id).Error)
	require.Equal(t, int64(200), stored.AmountUsed)
	require.Equal(t, int64(200), stored.FiveHourAmountUsed)

	require.NoError(t, PostConsumeUserSubscriptionDelta(sub.Id, 50))
	require.NoError(t, DB.First(&stored, sub.Id).Error)
	require.Equal(t, int64(250), stored.AmountUsed)
	require.Equal(t, int64(250), stored.FiveHourAmountUsed)

	err = PostConsumeUserSubscriptionDelta(sub.Id, 100)
	require.ErrorContains(t, err, "subscription 5-hour quota insufficient")
	require.NoError(t, DB.First(&stored, sub.Id).Error)
	require.Equal(t, int64(250), stored.AmountUsed)
	require.Equal(t, int64(250), stored.FiveHourAmountUsed)

	stored.FiveHourWindowStart = now - 5*3600 - 1
	stored.FiveHourNextResetTime = now - 1
	require.NoError(t, DB.Save(&stored).Error)

	res, err = PreConsumeUserSubscription("five-hour-3", sub.UserId, "test-model", 0, 250)
	require.NoError(t, err)
	require.Equal(t, int64(500), res.AmountUsedAfter)
	require.NoError(t, DB.First(&stored, sub.Id).Error)
	require.Equal(t, int64(500), stored.AmountUsed)
	require.Equal(t, int64(250), stored.FiveHourAmountUsed)
	require.NotZero(t, stored.FiveHourWindowStart)
	require.Equal(t, stored.FiveHourWindowStart+5*3600, stored.FiveHourNextResetTime)
}
