import { AuthenticationException } from '@reyah/api-sdk';

/**
 * OAuthException is thrown when a error happens while interacting with the OAuth server
 */
export class OAuthException extends AuthenticationException {
    /**
     * Name is the name of the exception
     */
    name: string;

    /**
     * Error is the code of the error as defined in the sections 5.2 and 7.2 of the RFC6749 (https://tools.ietf.org/html/rfc6749)
     */
    error: string;

    /**
     * Error description is a human readable text providing additional information about the error
     */
    error_description: string;

    /**
     * Error hint is an optional human readable text providing information about what to do to fix the error
     */
    error_hint?: string;

    /**
     * @param message An optional error message
     */
    constructor(message?: string) {
        super(message || 'An unexpected error happened while communicating with the OAuth2.0 server');
        this.name = 'OAuthException';
        this.error = 'unknown_error';
        this.error_description = 'An unexpected error happened while communicating with OAuth2.0 server';
        Object.setPrototypeOf(this, OAuthException.prototype);
    }
}

/**
 * TokenException is thrown when an known error happens while communicating with the OAuth server
 */
export class TokenException extends OAuthException {
    constructor(error: string, errorDescription: string, errorHint?: string) {
        super('An error happened during the token exchange');
        this.name = 'TokenException';
        this.error = error;
        this.error_description = errorDescription;
        this.error_hint = errorHint;
        Object.setPrototypeOf(this, TokenException.prototype);
    }
}
