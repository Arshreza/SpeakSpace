import Achievement from '../models/Achievement.js';
import Profile from '../models/Profile.js';
import Notification from '../models/Notification.js';
import { calculateLevel, getXPForLevel, isYesterday, isSameDay } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * Award XP to a user, recalculate level, and create a notification if leveled up
 */
const awardXP = async (userId, amount, reason = 'Activity completed') => {
  try {
    const profile = await Profile.findOne({ user: userId });
    if (!profile) return null;

    const oldLevel = profile.level;
    profile.xp += amount;
    profile.level = calculateLevel(profile.xp);

    // Update streak
    const today = new Date();
    if (profile.lastActivityDate) {
      if (isYesterday(profile.lastActivityDate)) {
        profile.streak += 1;
      } else if (!isSameDay(new Date(profile.lastActivityDate), today)) {
        profile.streak = 1;
      }
    } else {
      profile.streak = 1;
    }
    profile.lastActivityDate = today;

    // Update weekly progress
    const weekKey = getWeekString(today);
    const weekEntry = profile.weeklyProgress.find((w) => w.week === weekKey);
    if (weekEntry) {
      weekEntry.xpEarned += amount;
    } else {
      profile.weeklyProgress.push({ week: weekKey, xpEarned: amount, interviewsCompleted: 0 });
      // Keep only last 12 weeks
      if (profile.weeklyProgress.length > 12) {
        profile.weeklyProgress = profile.weeklyProgress.slice(-12);
      }
    }

    await profile.save();

    // Notify on level up
    if (profile.level > oldLevel) {
      await Notification.create({
        user: userId,
        title: '🎉 Level Up!',
        message: `Congratulations! You reached Level ${profile.level}! Keep grinding!`,
        type: 'achievement',
        link: '/dashboard',
        metadata: { oldLevel, newLevel: profile.level },
      });
    }

    // XP earned notification
    await Notification.create({
      user: userId,
      title: `+${amount} XP Earned`,
      message: reason,
      type: 'success',
      link: '/dashboard',
    });

    return profile;
  } catch (error) {
    logger.error(`awardXP error for user ${userId}: ${error.message}`);
    return null;
  }
};

/**
 * Check all active achievements and award any that the user has unlocked
 */
const checkAndAwardAchievements = async (userId) => {
  try {
    const profile = await Profile.findOne({ user: userId });
    if (!profile) return [];

    const achievements = await Achievement.find({ isActive: true });
    const alreadyEarned = profile.achievements.map((a) => a.name);
    const newlyEarned = [];

    for (const achievement of achievements) {
      if (alreadyEarned.includes(achievement.name)) continue;

      let unlocked = false;
      const { type, threshold } = achievement.condition;

      switch (type) {
        case 'interview_count':
          unlocked = profile.interviewCount >= threshold;
          break;
        case 'resume_count':
          unlocked = profile.resumeCount >= threshold;
          break;
        case 'streak_days':
          unlocked = profile.streak >= threshold;
          break;
        case 'xp_threshold':
          unlocked = profile.xp >= threshold;
          break;
        case 'score_threshold':
          // This would need additional data from interviews
          break;
        default:
          break;
      }

      if (unlocked) {
        profile.achievements.push({
          name: achievement.name,
          description: achievement.description,
          earnedAt: new Date(),
        });
        if (!profile.badges.includes(achievement.badgeName)) {
          profile.badges.push(achievement.badgeName);
        }
        profile.xp += achievement.xpReward;
        profile.coins += achievement.coinReward;
        profile.level = calculateLevel(profile.xp);

        newlyEarned.push(achievement);

        // Create notification
        await Notification.create({
          user: userId,
          title: `🏆 Achievement Unlocked: ${achievement.name}`,
          message: `${achievement.description} (+${achievement.xpReward} XP, +${achievement.coinReward} coins)`,
          type: 'achievement',
          link: '/profile',
          metadata: {
            achievementName: achievement.name,
            xpReward: achievement.xpReward,
            coinReward: achievement.coinReward,
          },
        });
      }
    }

    if (newlyEarned.length > 0) {
      await profile.save();
    }

    return newlyEarned;
  } catch (error) {
    logger.error(`checkAndAwardAchievements error for user ${userId}: ${error.message}`);
    return [];
  }
};

/**
 * Get ISO week string helper (local to this service)
 */
function getWeekString(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export { awardXP, checkAndAwardAchievements };
