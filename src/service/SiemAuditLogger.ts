import crypto from 'node:crypto';

export type SecuritySeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';

export interface SiemSecurityEvent {
  eventId: string;
  timestamp: string;
  severity: SecuritySeverity;
  service: string;
  eventType: string;
  actor: {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    spiffeId?: string;
  };
  details: Record<string, any>;
  prevHash: string;
  entryHash: string;
}

export class SiemAuditLogger {
  private logChain: SiemSecurityEvent[] = [];
  private currentTailHash = '0000000000000000000000000000000000000000000000000000000000000000';
  private hmacKey: string;

  constructor(hmacKey = 'siem-tamper-evident-chain-key-oenexa-banking') {
    this.hmacKey = hmacKey;
  }

  public recordEvent(params: {
    severity: SecuritySeverity;
    service: string;
    eventType: string;
    actor: SiemSecurityEvent['actor'];
    details: Record<string, any>;
  }): SiemSecurityEvent {
    const eventId = `siem_${crypto.randomBytes(12).toString('hex')}`;
    const timestamp = new Date().toISOString();
    const prevHash = this.currentTailHash;

    const eventContent = JSON.stringify({
      eventId,
      timestamp,
      severity: params.severity,
      service: params.service,
      eventType: params.eventType,
      actor: params.actor,
      details: params.details,
      prevHash,
    });

    const entryHash = crypto.createHmac('sha256', this.hmacKey).update(eventContent).digest('hex');

    const event: SiemSecurityEvent = {
      eventId,
      timestamp,
      severity: params.severity,
      service: params.service,
      eventType: params.eventType,
      actor: params.actor,
      details: params.details,
      prevHash,
      entryHash,
    };

    this.logChain.push(event);
    this.currentTailHash = entryHash;

    // In production, emit to SIEM pipeline (e.g. Splunk, OpenSearch, AWS CloudWatch)
    if (params.severity === 'CRITICAL' || params.severity === 'EMERGENCY') {
      console.warn(`[SIEM-ALERT][${params.severity}] ${params.eventType} from ${params.service}:`, params.details);
    }

    return event;
  }

  public verifyChainIntegrity(): { isValid: boolean; brokenAtEventId?: string } {
    let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (const ev of this.logChain) {
      if (ev.prevHash !== expectedPrevHash) {
        return { isValid: false, brokenAtEventId: ev.eventId };
      }

      const eventContent = JSON.stringify({
        eventId: ev.eventId,
        timestamp: ev.timestamp,
        severity: ev.severity,
        service: ev.service,
        eventType: ev.eventType,
        actor: ev.actor,
        details: ev.details,
        prevHash: ev.prevHash,
      });

      const recalculatedHash = crypto.createHmac('sha256', this.hmacKey).update(eventContent).digest('hex');
      if (recalculatedHash !== ev.entryHash) {
        return { isValid: false, brokenAtEventId: ev.eventId };
      }

      expectedPrevHash = ev.entryHash;
    }

    return { isValid: true };
  }

  public getEvents(limit = 100): SiemSecurityEvent[] {
    return this.logChain.slice(-limit);
  }
}
