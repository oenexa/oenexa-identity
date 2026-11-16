/**
 * Standalone Identity Events & CNCF CloudEvents v1.0 Spec
 */
export interface CloudEvent<T = Record<string, unknown>> {
  specversion: '1.0';
  id: string;
  source: string;
  type: string;
  time: string;
  datacontenttype: string;
  subject?: string;
  correlationid?: string;
  causationid?: string;
  data: T;
}

export const EventTypes = {
  IDENTITY_USER_REGISTERED: 'com.oenexa.identity.user.registered.v1',
  IDENTITY_USER_AUTHENTICATED: 'com.oenexa.identity.user.authenticated.v1',
  IDENTITY_SESSION_REVOKED: 'com.oenexa.identity.session.revoked.v1',
} as const;

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  tier: 'TIER_0' | 'TIER_1' | 'TIER_2' | 'TIER_3';
  createdAt: string;
}

export interface UserAuthenticatedPayload {
  userId: string;
  sessionId: string;
  ipAddress: string;
  mfaVerified: boolean;
}

export function createCloudEvent<T>(params: {
  type: string;
  source: string;
  data: T;
  subject?: string;
  correlationId?: string;
  causationId?: string;
}): CloudEvent<T> {
  return {
    specversion: '1.0',
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    source: params.source,
    type: params.type,
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    subject: params.subject,
    correlationid: params.correlationId,
    causationid: params.causationId,
    data: params.data,
  };
}
