import { EventType, Visibility, Event } from "@strava-musician-app/shared";
import { KodaServerApi } from "../network";

export class EventsService {
    constructor(private readonly server: KodaServerApi) {}

    /** POST /events */
    async createEvent(            
        title: string, 
        description: string, 
        date: string, 
        startTime: string,
        endTime: string,
        isAllDay: boolean,
        location: string,
        reminderMinBefore: number,
        eventType: EventType,
        visibility: Visibility
    ): Promise<Event> {
        return this.server.createEvent({
            title,
            description,
            date,
            startTime,
            endTime,
            isAllDay,
            location,
            reminderMinBefore,
            eventType,
            visibility
        });
    }

    /** GET /events/:month */
    async getEventsForMonth(month: string): Promise<Event[]> {
        return this.getEventsForMonth(month);
    }

    /** GET /events/:eventId */
    async getEvent(eventId: string): Promise<Event> {
        return this.getEvent(eventId);
    }

    /** PATCH /events/:eventId */
    async updateEvent(
        eventId: string,
        title?: string,
        description?: string, 
        date?: string, 
        startTime?: string,
        endTime?: string,
        isAllDay?: boolean,
        location?: string,
        reminderMinBefore?: number,
        eventType?: EventType,
        visibility?: Visibility 
    ): Promise<Event> {
        return this.server.updateEvent(eventId, {
            title,
            description,
            date,
            startTime,
            endTime,
            isAllDay,
            location,
            reminderMinBefore,
            eventType,
            visibility 
        })
    }

    async deleteEvent(eventId: string): Promise<void> {
        return this.deleteEvent(eventId);
    }
}