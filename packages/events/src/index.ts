// ============================================
// PRONTO.IA — Typed Event Bus
// ============================================
// Lightweight typed event emitter for domain events.
// BullMQ integration lives in apps/worker; this package
// defines the event contracts and provides a simple
// in-process bus for local dev / testing.

import { EventEmitter } from 'events';

// ---- Event Definitions ----

export interface WhatsAppInboundEvent {
  type: 'whatsapp.inbound';
  timestamp: Date;
  payload: {
    userId: string;
    phone: string;
    messageText: string;
    messageId: string;
    messageType: 'text' | 'audio' | 'image' | 'document';
    sessionId: string;
  };
}

export interface WhatsAppOutboundEvent {
  type: 'whatsapp.outbound';
  timestamp: Date;
  payload: {
    userId: string;
    phone: string;
    messageText: string;
    messageType: 'text' | 'audio' | 'interactive';
    persona: string;
    sessionId: string;
    lessonId?: string;
    llmCallId?: string;
  };
}

export interface LessonDeliveredEvent {
  type: 'lesson.delivered';
  timestamp: Date;
  payload: {
    userId: string;
    enrollmentId: string;
    lessonId: string;
    dayNumber: number;
    sessionId: string;
  };
}

export interface ExerciseSubmittedEvent {
  type: 'exercise.submitted';
  timestamp: Date;
  payload: {
    userId: string;
    enrollmentId: string;
    lessonId: string;
    responseText: string;
    responseMediaUrl?: string;
  };
}

export interface ExerciseEvaluatedEvent {
  type: 'exercise.evaluated';
  timestamp: Date;
  payload: {
    userId: string;
    enrollmentId: string;
    lessonId: string;
    score: number;
    passed: boolean;
    feedbackText: string;
  };
}

export interface EnrollmentCreatedEvent {
  type: 'enrollment.created';
  timestamp: Date;
  payload: {
    userId: string;
    enrollmentId: string;
    trilhaId: string;
    vertical: string;
    source: string;
  };
}

export interface DailyCheckinEvent {
  type: 'daily.checkin';
  timestamp: Date;
  payload: {
    userId: string;
    enrollmentId: string;
    dayNumber: number;
    mood?: string;
    dailyRevenueCents?: number;
  };
}

export interface LLMCallEvent {
  type: 'llm.call';
  timestamp: Date;
  payload: {
    userId: string;
    model: string;
    persona: string;
    inputTokens: number;
    outputTokens: number;
    costCents: number;
    latencyMs: number;
  };
}

export interface PaymentEvent {
  type: 'payment.completed' | 'payment.failed';
  timestamp: Date;
  payload: {
    userId: string;
    paymentId: string;
    amountCents: number;
    type: string;
    provider: string;
  };
}

export interface LGPDDeleteRequestEvent {
  type: 'lgpd.delete_request';
  timestamp: Date;
  payload: {
    userId: string;
    requestedAt: Date;
  };
}

// ---- Union Type ----

export type ProntoEvent =
  | WhatsAppInboundEvent
  | WhatsAppOutboundEvent
  | LessonDeliveredEvent
  | ExerciseSubmittedEvent
  | ExerciseEvaluatedEvent
  | EnrollmentCreatedEvent
  | DailyCheckinEvent
  | LLMCallEvent
  | PaymentEvent
  | LGPDDeleteRequestEvent;

export type ProntoEventType = ProntoEvent['type'];

// ---- Event Bus ----

type EventHandler<T extends ProntoEvent> = (event: T) => void | Promise<void>;

class ProntoEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  emit<T extends ProntoEvent>(event: T): void {
    this.emitter.emit(event.type, event);
    this.emitter.emit('*', event);
  }

  on<T extends ProntoEvent>(
    type: T['type'],
    handler: EventHandler<T>,
  ): () => void {
    this.emitter.on(type, handler);
    return () => {
      this.emitter.off(type, handler);
    };
  }

  onAny(handler: EventHandler<ProntoEvent>): () => void {
    this.emitter.on('*', handler);
    return () => {
      this.emitter.off('*', handler);
    };
  }

  removeAllListeners(type?: ProntoEventType): void {
    this.emitter.removeAllListeners(type);
  }
}

// Singleton for in-process usage
export const eventBus = new ProntoEventBus();

export { ProntoEventBus };
