import { Storage } from './storage';

export interface RawTokenI {
    access_token: string,
    expires_in: number,
    scope: string
    token_type: string
}

export interface TokenI {
    access_token: string,
    expires_at: Date,
    scopes: string[]
    token_type: string
}

const TOKEN_KEY = 'token';

export default class Token {
    private readonly storage: Storage;

    private token?: TokenI;

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
