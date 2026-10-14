import Link from "@/components/site-link";
import { season2026 } from "@/data/2026/season";
import type { RksDriverRatingSnapshot } from "@/data/2026/driver-ratings";

type Driver = (typeof season2026.drivers)[number];
type ChampionshipContext = { position: number; points: number } | null;

const categories = [
  { key: "pace", label: "PAC", full: "PACE", description: "Relative clean race pace." },
  { key: "peak", label: "PEAK", full: "PEAK", description: "Peak recorded lap performance." },
  { key: "race", label: "RACE", full: "RACE", description: "Official race-result performance relative to the field." },
  { key: "consistency", label: "CONS", full: "CONSISTENCY", description: "Consistency measures variation in representative race pace after extreme statistical outliers are removed." },
  { key: "qualifying", label: "QUAL", full: "QUALIFYING", description: "Qualifying performance relative to the field." },
] as const;

export function DriverRatingCard({
  rating,
  driver,
  championship = null,
  profile = false,
}: {
  rating: RksDriverRatingSnapshot;
  driver: Driver;
  championship?: ChampionshipContext;
  profile?: boolean;
}) {
  const content = <>
    <div className="driver-rating-card-topline">
      <span>RATING RANK <b>#{String(rating.rank).padStart(2, "0")}</b></span>
      <span className={`driver-rating-tier tier-${rating.tier.toLowerCase()}`}><b>{rating.tier}</b> TIER</span>
    </div>
    <div className="driver-rating-card-main">
      <div className="driver-rating-ovr"><small>OVERALL</small><strong>{rating.overall}</strong><span>OVR</span></div>
      <div className="driver-rating-driver"><h3>{driver.name}</h3><span>RKS DRIVER RATING</span></div>
    </div>
    <div className="driver-rating-categories" aria-label="Rating categories">
      {categories.map((category) => (
        <div className="driver-rating-category" key={category.key} role="group" aria-label={`${category.full}: ${rating.categories[category.key]} rating. ${category.description}${category.key === "qualifying" && rating.qualifyingRatingEstimated ? " Estimated rating — official qualifying data unavailable." : ""}`} title={`${category.full}: ${category.description}${category.key === "qualifying" && rating.qualifyingRatingEstimated ? " Estimated rating — official qualifying data unavailable." : ""}`}>
          <span>{category.label}{category.key === "qualifying" && rating.qualifyingRatingEstimated && <i aria-label="Estimated rating">*</i>}</span>
          <b>{rating.categories[category.key]}</b>
        </div>
      ))}
    </div>
    <div className="driver-rating-card-footer">
      <span>{rating.eventSamples} {rating.eventSamples === 1 ? "EVENT" : "EVENTS"}</span>
      <span>AFTER ROUND 02</span>
    </div>
    {rating.qualifyingRatingEstimated && <p className="driver-rating-estimate-note">QUAL* estimated — official qualifying data unavailable.</p>}
    {championship && <div className="driver-rating-championship-context"><span>CHAMPIONSHIP</span><b>P{championship.position} · {championship.points} PTS</b></div>}
  </>;

  return profile
    ? <article className="driver-rating-card driver-rating-card-profile" aria-label={`${driver.name} RKS Driver Rating ${rating.overall}`}>
      {content}
    </article>
    : <Link href={`/drivers/${driver.slug}`} className="driver-rating-card" aria-label={`Open ${driver.name} profile, RKS Driver Rating ${rating.overall}`}>
      {content}
    </Link>;
}
