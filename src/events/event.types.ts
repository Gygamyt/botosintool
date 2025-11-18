/**
 * A standardized, clean format for all events after they have been parsed.
 */
export interface NormalizedEvent {
    type: 'MESSAGE'
        | 'ADDED_TO_SPACE'
        | 'UNKNOWN'
        | 'REMOVED_FROM_SPACE';
    payload: any;
}
