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
import TokenManager from './tokenManager';
import { OAuthException, TokenException } from './error';

/**
 * M2MAuthProvider is the authentication provider for the Reyah api sdk designed for M2M application (Client credentials)
 */
export default class M2MAuthProvider implements AuthProvider {
    /**
     * An axios instance to request the OAuth server
     */
    private readonly requester: AxiosInstance;

    /**
     * An internal token manager, talk to the storage object
     */
    private readonly tokenManager: TokenManager;

    /**
     * Store the storage object
     */
    private readonly storage: Storage;

    /**
     * Store the client id given in the constructor
     */
    private readonly clientId: string;

    /**
     * Store the client secret given in the constructor
     */
    private readonly clientSecret: string;

    /**
     * Store the scopes given in the constructor
     */
    private readonly scopes: string[];

    /**
     * @param clientId Client ID is the id of your OAuth client (should be a number)
     * @param clientSecret Client secret is the secret of your OAuth client
     * @param scopes An optional list of scope (read the Reyah API documentation for more information)
     * @param storage An optional storage object
     */
    constructor(clientId: string, clientSecret: string, scopes: string[] = [], storage: Storage = new NodeStorage()) {
        const config = Reyah.Config.getConfig();
        this.requester = Axios.create({
            baseURL: `${config.auth_protocol}://${config.auth_hostname}/`,
            timeout: 20000,
        });
        this.tokenManager = new TokenManager(storage);
        this.storage = storage;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.scopes = scopes;
    }

    /**
     * Return the name of this auth provider
     */
    public getName() {
        return 'M2MAuthProvider';
    }

    /**
     * The function that will be called at each request
     * @param request The current configuration of the HTTP request
     * @param ctx The context of the execution of the request
     */
    public async applyAuth(request: ReyahRequest, ctx: Context): Promise<void> {
        let token = this.tokenManager.getToken();
        if (
            !token
            || token.expires_at < new Date()
            || (typeof ctx.lastError !== 'undefined' && ctx.lastError instanceof AuthenticationException)
            || !this.compareScope(this.scopes, token.scopes)
        ) {
            await this.getFreshToken();
        }
        token = this.tokenManager.getToken();
        request.setHeader('Authorization', `${token?.token_type} ${token?.access_token}`);
    }

    /**
     * Return a boolean that indicates that this authentication provider can automatically renew the token
     */
    public canBeRenewed(): boolean {
        return true;
    }

    /**
     * Return the date of expiration of the current token
     * @throws *NotAuthenticatedException* If the user is not authenticated
     */
    public getTokenExpiry(): Date {
        const token = this.tokenManager.getToken();
        if (!token) {
            throw new NotAuthenticatedException();
        }
        return token.expires_at;
    }

    /**
     * Return a boolean that indicates if the user is currently logged in on the api
     */
    public isLoggedIn(): boolean {
        const token = this.tokenManager.getToken();
        if (!token) {
            return false;
        }
        return token.expires_at > new Date();
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

    /**
     * @throws *TokenException* If an error happened with the OAuth server
     * @throws *OAuthException* If an unknown error happened while communicating with the OAuth server
     */
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
