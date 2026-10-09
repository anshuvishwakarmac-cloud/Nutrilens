const mongoose = require('mongoose');
const Meal = require('../models/Meal');

// @desc    Get weekly nutrition trends & metrics aggregated via MongoDB pipeline
// @route   GET /api/trends/weekly
// @access  Private
const getWeeklyTrends = async (req, res, next) => {
  try {
    const weeksCount = parseInt(req.query.weeks) || 4;
    const userId = req.user._id;
    const dailyGoal = req.user.profile?.dailyCalorieTarget || 2000;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeksCount * 7);

    // MongoDB Aggregation Pipeline grouping meals by week
    const weeklyPipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          eatenAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$eatenAt' },
            week: { $isoWeek: '$eatenAt' }
          },
          weekStart: { $min: '$eatenAt' },
          totalCalories: { $sum: '$totals.calories' },
          totalProtein: { $sum: '$totals.protein_g' },
          totalCarbs: { $sum: '$totals.carbs_g' },
          totalFat: { $sum: '$totals.fat_g' },
          totalFiber: { $sum: '$totals.fiber_g' },
          totalSugar: { $sum: '$totals.sugar_g' },
          mealsCount: { $sum: 1 },
          uniqueDays: {
            $addToSet: {
              $dateToString: { format: '%Y-%m-%d', date: '$eatenAt' }
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.week': 1 }
      }
    ];

    const aggregatedWeeks = await Meal.aggregate(weeklyPipeline);

    const formattedWeeks = aggregatedWeeks.map((w) => {
      const daysInWeek = Math.max(w.uniqueDays.length, 1);
      const avgCalories = Math.round(w.totalCalories / daysInWeek);
      const goalAdherencePercent = Math.min(
        Math.round((avgCalories / dailyGoal) * 100),
        200
      );

      return {
        year: w._id.year,
        weekNumber: w._id.week,
        weekStart: w.weekStart,
        totalCalories: w.totalCalories,
        avgDailyCalories: avgCalories,
        mealsCount: w.mealsCount,
        activeDaysCount: daysInWeek,
        goalAdherencePercent,
        macroTotals: {
          protein_g: Number(w.totalProtein.toFixed(1)),
          carbs_g: Number(w.totalCarbs.toFixed(1)),
          fat_g: Number(w.totalFat.toFixed(1)),
          fiber_g: Number(w.totalFiber.toFixed(1)),
          sugar_g: Number(w.totalSugar.toFixed(1))
        }
      };
    });

    // Compute Week-over-Week (WoW) change percentage
    let wowChangePercent = 0;
    if (formattedWeeks.length >= 2) {
      const currentWeek = formattedWeeks[formattedWeeks.length - 1].avgDailyCalories;
      const prevWeek = formattedWeeks[formattedWeeks.length - 2].avgDailyCalories;
      if (prevWeek > 0) {
        wowChangePercent = Number(
          (((currentWeek - prevWeek) / prevWeek) * 100).toFixed(1)
        );
      }
    }

    // Overall summary metrics
    const totalRecordedMeals = formattedWeeks.reduce((acc, w) => acc + w.mealsCount, 0);
    const overallAvgCalories = formattedWeeks.length > 0
      ? Math.round(
          formattedWeeks.reduce((acc, w) => acc + w.avgDailyCalories, 0) / formattedWeeks.length
        )
      : 0;

    res.json({
      dailyGoal,
      overallAvgCalories,
      wowChangePercent,
      totalRecordedMeals,
      weeks: formattedWeeks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily aggregated trends between date range
// @route   GET /api/trends/daily
// @access  Private
const getDailyTrends = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const userId = req.user._id;

    const endDate = to ? new Date(to) : new Date();
    const startDate = from ? new Date(from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const dailyPipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          eatenAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$eatenAt' } },
          date: { $first: '$eatenAt' },
          calories: { $sum: '$totals.calories' },
          protein_g: { $sum: '$totals.protein_g' },
          carbs_g: { $sum: '$totals.carbs_g' },
          fat_g: { $sum: '$totals.fat_g' },
          fiber_g: { $sum: '$totals.fiber_g' },
          sugar_g: { $sum: '$totals.sugar_g' },
          mealsCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const days = await Meal.aggregate(dailyPipeline);

    res.json({
      startDate,
      endDate,
      days: days.map((d) => ({
        dateStr: d._id,
        date: d.date,
        calories: d.calories,
        protein_g: Number(d.protein_g.toFixed(1)),
        carbs_g: Number(d.carbs_g.toFixed(1)),
        fat_g: Number(d.fat_g.toFixed(1)),
        fiber_g: Number(d.fiber_g.toFixed(1)),
        sugar_g: Number(d.sugar_g.toFixed(1)),
        mealsCount: d.mealsCount
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeeklyTrends,
  getDailyTrends
};
