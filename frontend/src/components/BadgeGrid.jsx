import { BADGE_DEFINITIONS } from '../utils/badges';
import BadgeCard from './BadgeCard';

export default function BadgeGrid({ badges, progress, userProfile }) {
  // Create a map of earned badges for quick lookup
  const earnedBadgesMap = {};
  badges.forEach(badge => {
    earnedBadgesMap[badge.id || badge.name] = badge;
  });

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      role="list"
      aria-label="Badge collection grid"
    >
      {BADGE_DEFINITIONS.map((badgeDefinition) => {
        const earnedBadge = earnedBadgesMap[badgeDefinition.id];
        const badgeProgress = progress[badgeDefinition.id] || {
          current: 0,
          threshold: badgeDefinition.threshold,
          percentage: 0,
          earned: false
        };

        return (
          <BadgeCard
            key={badgeDefinition.id}
            badge={badgeDefinition}
            earned={earnedBadge ? earnedBadge.earned : null}
            progress={badgeProgress}
            userProfile={userProfile}
          />
        );
      })}
    </div>
  );
}
