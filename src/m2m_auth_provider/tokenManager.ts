import { Storage } from './storage';

/**
 * RawTokenI represents a token returns by the OAuth server
 */
export interface RawTokenI {
    /**
     * The access token
     */
    access_token: string,

    /**
     * The number of second before the token expires
     */
    expires_in: number,

    /**
     * A space separated list of scopes
     */
    scope: string

    /**
     * The type of the token
     */
    token_type: string
}

/**
 * TokenI represents a token stored in the storage object
 */
export interface TokenI {
    /**
     * The access token
     */
    access_token: string,

    /**
     * The date of expiration of the token
     */
    expires_at: Date,

    /**
     * An array of scope
     */
    scopes: string[]

    /**
     * The type of the token
     */
    token_type: string
}

/**
 * Token key is the storage key of the token
 */
const TOKEN_KEY = 'token';

/**
 * TokenManager is the token manager used by this authentication provider
 */
export default class TokenManager {
    /**
     * The storage object
     */
    private readonly storage: Storage;

    /**
     * The current token
     */
    private token?: TokenI;

    /**
     * @param storage The object where the tokens are stored
     */
    constructor(storage: Storage) {
        this.storage = storage;

        const rawToken = this.storage.getItem(TOKEN_KEY);
        if (rawToken) {
            try {
                const jsonToken: TokenI = JSON.parse(rawToken);
                jsonToken.expires_at = new Date(jsonToken.expires_at);
                this.token = jsonToken;
            } catch (e) {
                this.storage.removeItem(TOKEN_KEY);
            }
        }
    }

    setToken(token: RawTokenI): void {
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + token.expires_in);
        let scopes: string[] = [];
        if (token.scope.length) {
            scopes = token.scope.split(' ');
        }
        const tokenFormatted: TokenI = {
            access_token: token.access_token,
            expires_at: expiresAt,
            scopes,
            token_type: token.token_type,
        };
        this.storage.setItem(TOKEN_KEY, JSON.stringify(tokenFormatted));
        this.token = tokenFormatted;
    }

    getToken(): TokenI | undefined {
        return this.token;
    }
}
