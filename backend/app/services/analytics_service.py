import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, text, desc

from app.models.analytics import AnalyticsEvent
from app.models.trip import Trip
from app.schemas.analytics import (
    AnalyticsEventCreate,
    AdminAnalyticsSummary,
    PopularDestinationMetric,
    DailyTrendMetric
)

logger = logging.getLogger("navix.analytics")


class AnalyticsService:
    """
    First-party privacy-safe analytics service.
    Aggregates operational and product insights without storing PII,
    exact form queries, or authorization credentials.
    """

    def record_event(self, db: Session, payload: AnalyticsEventCreate) -> AnalyticsEvent:
        event_id = f"evt_{uuid.uuid4().hex[:12]}"
        event = AnalyticsEvent(
            id=event_id,
            event_type=payload.event_type,
            route=payload.route,
            anonymous_session_id=payload.anonymous_session_id,
            safe_metadata=payload.metadata
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    def get_admin_summary(self, db: Session) -> AdminAnalyticsSummary:
        # 1. Total Events
        total_events = db.query(func.count(AnalyticsEvent.id)).scalar() or 0

        if total_events == 0:
            # Check trips table as fallback baseline
            saved_trips_count = db.query(func.count(Trip.trip_id)).scalar() or 0
            return AdminAnalyticsSummary(
                total_events=0,
                total_page_views=0,
                total_planner_starts=0,
                total_completed_plans=0,
                planner_completion_rate=0.0,
                total_saved_trips=saved_trips_count,
                total_story_views=0,
                total_destination_views=0,
                popular_destinations=[],
                daily_activity_trend=[],
                has_data=saved_trips_count > 0
            )

        # 2. Counts by Event Type
        event_counts = dict(
            db.query(AnalyticsEvent.event_type, func.count(AnalyticsEvent.id))
            .group_by(AnalyticsEvent.event_type)
            .all()
        )

        page_views = event_counts.get("PAGE_VIEW", 0)
        planner_starts = event_counts.get("PLANNER_STARTED", 0)
        planner_completions = event_counts.get("PLANNER_COMPLETED", 0)
        story_views = event_counts.get("STORY_VIEW", 0)
        destination_views = event_counts.get("DESTINATION_VIEW", 0)
        trips_saved_events = event_counts.get("TRIP_SAVED", 0)

        # Also get saved trips from trips table if higher
        db_trips_count = db.query(func.count(Trip.trip_id)).scalar() or 0
        total_saved_trips = max(trips_saved_events, db_trips_count)

        completion_rate = (
            round((planner_completions / planner_starts) * 100, 1)
            if planner_starts > 0 else 0.0
        )

        # 3. Popular Destinations (derived from safe_metadata->>'destination' or ->>'slug')
        popular_destinations: List[PopularDestinationMetric] = []
        try:
            # Extract destination from metadata JSON safely
            rows = db.execute(text("""
                SELECT
                    COALESCE(safe_metadata->>'destination', safe_metadata->>'slug', 'General') as dest,
                    count(*) as cnt
                FROM analytics_events
                WHERE event_type IN ('DESTINATION_VIEW', 'PLANNER_STARTED', 'PLANNER_COMPLETED')
                  AND safe_metadata IS NOT NULL
                  AND (safe_metadata->>'destination' IS NOT NULL OR safe_metadata->>'slug' IS NOT NULL)
                GROUP BY dest
                ORDER BY cnt DESC
                LIMIT 5;
            """)).fetchall()

            for r in rows:
                if r[0] and r[0].strip():
                    popular_destinations.append(PopularDestinationMetric(
                        destination=r[0].strip().title(),
                        views=int(r[1])
                    ))
        except Exception as e:
            logger.warning(f"Error computing popular destinations: {e}")

        # 4. Daily Activity Trend for the last 14 days
        daily_trend: List[DailyTrendMetric] = []
        try:
            fourteen_days_ago = datetime.utcnow() - timedelta(days=14)
            daily_rows = db.execute(text("""
                SELECT
                    TO_CHAR(created_at, 'YYYY-MM-DD') as day,
                    count(*) as cnt
                FROM analytics_events
                WHERE created_at >= :since
                GROUP BY day
                ORDER BY day ASC;
            """), {"since": fourteen_days_ago}).fetchall()

            for dr in daily_rows:
                daily_trend.append(DailyTrendMetric(date=dr[0], count=int(dr[1])))
        except Exception as e:
            logger.warning(f"Error computing daily activity trend: {e}")

        return AdminAnalyticsSummary(
            total_events=total_events,
            total_page_views=page_views,
            total_planner_starts=planner_starts,
            total_completed_plans=planner_completions,
            planner_completion_rate=completion_rate,
            total_saved_trips=total_saved_trips,
            total_story_views=story_views,
            total_destination_views=destination_views,
            popular_destinations=popular_destinations,
            daily_activity_trend=daily_trend,
            has_data=True
        )

    def purge_old_events(self, db: Session, retention_days: int = 30) -> int:
        """Purge events older than retention window to prevent unbounded table growth."""
        cutoff = datetime.utcnow() - timedelta(days=retention_days)
        deleted = db.query(AnalyticsEvent).filter(AnalyticsEvent.created_at < cutoff).delete()
        db.commit()
        return deleted


analytics_service = AnalyticsService()
