import { AuthenticationException } from '@reyah/api-sdk';

export class OAuthException extends AuthenticationException {
    name: string;

    error: string;

    error_description: string;

    error_hint?: string;

    constructor(message?: string) {
        super(message || 'An unexpected error happened while communicating with the OAuth2.0 server');
        this.name = 'OAuthException';
        this.error = 'unknown_error';
        this.error_description = 'An unexpected error happened while communicating with OAuth2.0 server';
        Object.setPrototypeOf(this, OAuthException.prototype);
    }
}

export class TokenException extends OAuthException {
    name: string;

    error: string;

    error_description: string;

    error_hint?: string;

    constructor(error: string, errorDescription: string, errorHint?: string) {
        super('An error happened during the token exchange');
        this.name = 'TokenException';
        this.error = error;
        this.error_description = errorDescription;
        this.error_hint = errorHint;
        Object.setPrototypeOf(this, TokenException.prototype);
    }
}
