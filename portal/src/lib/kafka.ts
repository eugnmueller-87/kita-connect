import { Kafka } from 'kafkajs'

const kafka = new Kafka({
  clientId: 'kita-connect-portal',
  brokers: [process.env.KAFKA_BROKER ?? '187.127.87.206:19092'],
})

const producer = kafka.producer()
let connected = false

export async function publishEvent(topic: string, payload: Record<string, unknown>): Promise<void> {
  try {
    if (!connected) {
      await producer.connect()
      connected = true
    }
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }) }],
    })
  } catch {
    // Fail open — Kafka unavailable should never block the user action
  }
}
