export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface AuthContext {
  userId: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  coordinates: GeoCoordinates;
  timestamp: number;
  isKnownDevice: boolean;
  failedAttemptsLast15m: number;
}

export interface RiskEvaluationResult {
  riskScore: number; // 0 (Zero Risk) to 100 (Maximum Risk)
  tier: 'LOW' | 'MEDIUM' | 'HIGH';
  action: 'ALLOW' | 'CHALLENGE_MFA' | 'BLOCK_AND_ALERT';
  triggers: string[];
  geoVelocityKmH?: number;
}

export class RiskBasedAuthEngine {
  private lastKnownSessions = new Map<string, { coordinates: GeoCoordinates; timestamp: number }>();
  private readonly EARTH_RADIUS_KM = 6371;
  private readonly IMPOSSIBLE_SPEED_THRESHOLD_KMH = 900; // Commercial jet speed boundary

  public evaluate(context: AuthContext): RiskEvaluationResult {
    let score = 0;
    const triggers: string[] = [];

    // 1. Device Trust
    if (!context.isKnownDevice) {
      score += 25;
      triggers.push('UNKNOWN_DEVICE_FINGERPRINT');
    }

    // 2. Brute Force Velocity Check
    if (context.failedAttemptsLast15m >= 5) {
      score += 50;
      triggers.push(`EXCESSIVE_FAILED_LOGINS_${context.failedAttemptsLast15m}`);
    } else if (context.failedAttemptsLast15m >= 2) {
      score += 15;
      triggers.push('RECENT_FAILED_ATTEMPTS');
    }

    // 3. Impossible Travel / Geo-Velocity
    let computedSpeedKmH: number | undefined;
    const prev = this.lastKnownSessions.get(context.userId);
    if (prev) {
      const distanceKm = this.calculateHaversineDistance(prev.coordinates, context.coordinates);
      const timeDiffHours = (context.timestamp - prev.timestamp) / (1000 * 60 * 60);

      if (timeDiffHours > 0) {
        computedSpeedKmH = distanceKm / timeDiffHours;
        if (computedSpeedKmH > this.IMPOSSIBLE_SPEED_THRESHOLD_KMH && distanceKm > 100) {
          score += 75; // Impossible travel is an immediate critical threshold breach
          triggers.push(`IMPOSSIBLE_TRAVEL_${Math.round(computedSpeedKmH)}_KMH`);
        } else if (distanceKm > 500 && timeDiffHours < 2) {
          score += 30;
          triggers.push(`RAPID_GEO_RELOCATION_${Math.round(distanceKm)}_KM`);
        }
      }
    }

    // 4. IP / Tor / Datacenter heuristics
    if (context.ipAddress.startsWith('10.') || context.ipAddress.startsWith('192.168.')) {
      // Internal trusted VPC or local subnet
    } else if (context.ipAddress === '0.0.0.0') {
      score += 40;
      triggers.push('ANOMALOUS_IP_ORIGIN');
    }

    // Record session for future velocity comparisons if not completely blocked
    const normalizedScore = Math.min(100, Math.max(0, score));

    let tier: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let action: 'ALLOW' | 'CHALLENGE_MFA' | 'BLOCK_AND_ALERT' = 'ALLOW';

    if (normalizedScore >= 70) {
      tier = 'HIGH';
      action = 'BLOCK_AND_ALERT';
    } else if (normalizedScore >= 30) {
      tier = 'MEDIUM';
      action = 'CHALLENGE_MFA';
    } else {
      tier = 'LOW';
      action = 'ALLOW';
    }

    if (action !== 'BLOCK_AND_ALERT') {
      this.lastKnownSessions.set(context.userId, {
        coordinates: context.coordinates,
        timestamp: context.timestamp,
      });
    }

    return {
      riskScore: normalizedScore,
      tier,
      action,
      triggers,
      geoVelocityKmH: computedSpeedKmH,
    };
  }

  private calculateHaversineDistance(c1: GeoCoordinates, c2: GeoCoordinates): number {
    const dLat = this.deg2rad(c2.latitude - c1.latitude);
    const dLon = this.deg2rad(c2.longitude - c1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(c1.latitude)) *
        Math.cos(this.deg2rad(c2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_KM * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
