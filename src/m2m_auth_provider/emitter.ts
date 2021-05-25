import { EventEmitter } from 'events';

export class InternalEmitter extends EventEmitter {
    static ON_TOKEN_GENERATED = 'on_token_generated';
}
