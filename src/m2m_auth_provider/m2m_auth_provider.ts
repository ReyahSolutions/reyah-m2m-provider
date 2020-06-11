import {
    AuthenticationException,
    AuthProvider,
    Context,
    NotAuthenticatedException,
    Reyah,
    ReyahRequest,
} from '@reyah/api-sdk';
import Axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { Storage } from './storage';
import NodeStorage from './node_storage';
import Token from './token';
import { OAuthException, TokenException } from './error';

export default class M2MAuthProvider implements AuthProvider {
    private readonly requester: AxiosInstance;

    private readonly tokenManager: Token;

    private readonly storage: Storage;

    private readonly clientId: string;

    private readonly clientSecret: string;

    private readonly scopes: string[];

    constructor(clientId: string, clientSecret: string, scopes: string[] = [], storage: Storage = new NodeStorage()) {
        const config = Reyah.Config.getConfig();
        config.auth_hostname = 'auth.dev.reyah.eu';
        this.requester = Axios.create({
            baseURL: `${config.auth_protocol}://${config.auth_hostname}/`,
            timeout: 20000,
        });
        this.tokenManager = new Token(storage);
        this.storage = storage;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.scopes = scopes;
    }

    public getName() {
        return 'M2MAuthProvider';
    }

    public async applyAuth(request: ReyahRequest, ctx: Context): Promise<void> {
        let token = this.tokenManager.getToken();
        if (
            !token
            || token.expires_at < new Date()
            || (typeof ctx.lastError !== 'undefined' && ctx.lastError instanceof AuthenticationException)
            || !this.compareScope(this.scopes, token.scopes)
        ) {
            console.log('will get fresh token');
            await this.getFreshToken();
        }
        token = this.tokenManager.getToken();
        request.setHeader('Authorization', `${token?.token_type} ${token?.access_token}`);
    }

    public canBeRenewed(): boolean {
        return true;
    }

    public getTokenExpiry(): Date {
        const token = this.tokenManager.getToken();
        if (!token) {
            throw new NotAuthenticatedException();
        }
        return token.expires_at;
    }

    public isLoggedIn(): boolean {
        return (typeof this.tokenManager.getToken() !== 'undefined');
    }

    private compareScope(listScope: string[], savedScope: string[]): boolean {
        if (listScope.length !== savedScope.length) {
            return false;
        }
        const listScopeSorted = Array.from(new Set(listScope)).sort();
        const savedScopeSorted = Array.from(new Set(savedScope)).sort();
        if (listScopeSorted.length !== savedScopeSorted.length) {
            return false;
        }
        for (const idx in listScopeSorted) {
            const i = parseInt(idx, 10);
            if (listScopeSorted[i] !== savedScopeSorted[i]) {
                return false;
            }
        }
        return true;
    }

    private async getFreshToken(): Promise<void> {
        try {
            const data = new FormData();
            data.append('grant_type', 'client_credentials');
            data.append('client_id', this.clientId);
            data.append('client_secret', this.clientSecret);
            if (this.scopes && this.scopes.length) {
                data.append('scope', this.scopes.join(' '));
            }
            const { data: token } = await this.requester.post('/oauth2/token', data, {
                headers: data.getHeaders(),
            });
            this.tokenManager.setToken(token);
        } catch (e) {
            const body = e.response?.data;
            if (body) {
                throw new TokenException(body.error, body.error_description, body.error_hint);
            } else {
                throw new OAuthException();
            }
        }
    }
}
