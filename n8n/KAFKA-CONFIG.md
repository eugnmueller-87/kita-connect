# Kafka Configuration — GDPR Retention

Broker: `187.127.87.206:19092`

## Required settings (set on broker or per-topic)

```properties
# Retain messages for 24 hours max (GDPR decision: short retention)
log.retention.hours=24
log.retention.check.interval.ms=300000
```

## Per-topic (if broker settings can't be changed globally)

```bash
kafka-configs.sh --bootstrap-server 187.127.87.206:19092 \
  --entity-type topics --entity-name ticket.created \
  --alter --add-config retention.ms=86400000

kafka-configs.sh --bootstrap-server 187.127.87.206:19092 \
  --entity-type topics --entity-name observation.created \
  --alter --add-config retention.ms=86400000

kafka-configs.sh --bootstrap-server 187.127.87.206:19092 \
  --entity-type topics --entity-name notification.created \
  --alter --add-config retention.ms=86400000
```

`retention.ms=86400000` = 24 hours in milliseconds.

## Why 24h

GDPR decision: Kafka is used only as a delivery queue between the app and n8n.
Once n8n has processed the event, the message has no further purpose.
Personal data (names, parent IDs) must not persist longer than necessary.
