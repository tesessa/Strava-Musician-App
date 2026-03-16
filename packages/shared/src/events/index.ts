import type { EventType, Visibility } from "../enums";

/**
 * Calendar event (lesson, practice, performance)
 */
export interface Event {
  eventId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location: string;
  reminderMinBefore: number;
  eventType: EventType;
  visibility: Visibility;
}

/**
 * POST /events body
 */
export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  location: string;
  reminderMinBefore: number;
  eventType: EventType;
  visibility: Visibility;
}

/**
 * PATCH /events/:eventId body
 */
export type UpdateEventRequest = Partial<CreateEventRequest>;
