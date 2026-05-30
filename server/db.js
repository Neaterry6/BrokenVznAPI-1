import { createSign } from 'crypto';
const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const DEFAULT_FIREBASE_CONFIG = {
    projectId: 'vanea-5ffea',
    appId: '1:204067098240:web:38eebcd5541a3552b6a065',
    apiKey: 'AIzaSyBAFBmQz3Li_8vLTcsgDh9Emc5Zd-8_ITM',
    authDomain: 'vanea-5ffea.firebaseapp.com',
    firestoreDatabaseId: 'ai-studio-25b3cfd4-bfd2-4e9b-bdf2-e02bb831ab34',
    storageBucket: 'vanea-5ffea.firebasestorage.app',
    messagingSenderId: '204067098240',
    measurementId: '',
};
let firestore;
let attemptedInit = false;
function base64Url(input) {
    return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function parseServiceAccount() {
    const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (rawJson) {
        const account = JSON.parse(rawJson);
        if (account.private_key)
            account.private_key = account.private_key.replace(/\\n/g, '\n');
        return account;
    }
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        return {
            project_id: process.env.FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
    }
    return undefined;
}
function toFirestoreValue(value) {
    if (value === null || value === undefined)
        return { nullValue: null };
    if (value instanceof Date)
        return { timestampValue: value.toISOString() };
    if (typeof value === 'string')
        return { stringValue: value };
    if (typeof value === 'boolean')
        return { booleanValue: value };
    if (typeof value === 'number')
        return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    if (Array.isArray(value))
        return { arrayValue: { values: value.map(toFirestoreValue) } };
    if (typeof value === 'object') {
        return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, val]) => [key, toFirestoreValue(val)])) } };
    }
    return { stringValue: String(value) };
}
function fromFirestoreValue(value) {
    if (!value || typeof value !== 'object')
        return undefined;
    if ('nullValue' in value)
        return null;
    if ('stringValue' in value)
        return value.stringValue;
    if ('booleanValue' in value)
        return value.booleanValue;
    if ('integerValue' in value)
        return Number(value.integerValue);
    if ('doubleValue' in value)
        return value.doubleValue;
    if ('timestampValue' in value)
        return new Date(value.timestampValue);
    if ('arrayValue' in value)
        return (value.arrayValue.values || []).map(fromFirestoreValue);
    if ('mapValue' in value)
        return fromFirestoreFields(value.mapValue.fields || {});
    return undefined;
}
function fromFirestoreFields(fields) {
    return Object.fromEntries(Object.entries(fields || {}).map(([key, value]) => [key, fromFirestoreValue(value)]));
}
export class FirestoreRestClient {
    projectId;
    databaseId;
    apiKey;
    serviceAccount;
    accessToken;
    accessTokenExpiresAt = 0;
    constructor(options) {
        this.projectId = options.projectId;
        this.databaseId = options.databaseId || '(default)';
        this.apiKey = options.apiKey;
        this.serviceAccount = options.serviceAccount;
    }
    get baseUrl() {
        return `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/${encodeURIComponent(this.databaseId)}/documents`;
    }
    async getAccessToken() {
        if (this.apiKey)
            return undefined;
        if (!this.serviceAccount?.client_email || !this.serviceAccount.private_key) {
            throw new Error('Firebase service account credentials are incomplete');
        }
        if (this.accessToken && Date.now() < this.accessTokenExpiresAt - 60_000) {
            return this.accessToken;
        }
        const now = Math.floor(Date.now() / 1000);
        const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
        const payload = base64Url(JSON.stringify({
            iss: this.serviceAccount.client_email,
            scope: FIRESTORE_SCOPE,
            aud: TOKEN_URL,
            exp: now + 3600,
            iat: now,
        }));
        const unsigned = `${header}.${payload}`;
        const signature = createSign('RSA-SHA256').update(unsigned).sign(this.serviceAccount.private_key);
        const jwt = `${unsigned}.${base64Url(signature)}`;
        const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
        });
        if (!response.ok) {
            throw new Error(`Firebase token request failed: ${response.status} ${await response.text()}`);
        }
        const data = await response.json();
        this.accessToken = data.access_token;
        this.accessTokenExpiresAt = Date.now() + data.expires_in * 1000;
        return this.accessToken;
    }
    async request(path, init = {}) {
        const token = await this.getAccessToken();
        const url = new URL(`${this.baseUrl}${path}`);
        if (this.apiKey)
            url.searchParams.set('key', this.apiKey);
        const response = await fetch(url, {
            ...init,
            headers: {
                ...(init.body ? { 'content-type': 'application/json' } : {}),
                ...(token ? { authorization: `Bearer ${token}` } : {}),
                ...(init.headers || {}),
            },
        });
        if (!response.ok)
            throw new Error(`Firestore REST error ${response.status}: ${await response.text()}`);
        if (response.status === 204)
            return undefined;
        return response.json();
    }
    documentPath(collection, id) {
        return `/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`;
    }
    async getDoc(collection, id) {
        try {
            const doc = await this.request(this.documentPath(collection, id));
            return this.documentToData(doc);
        }
        catch (error) {
            if (String(error?.message || '').includes('404'))
                return undefined;
            throw error;
        }
    }
    async setDoc(collection, id, data) {
        const updateMask = Object.keys(data).map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`).join('&');
        const suffix = `${this.documentPath(collection, id)}${updateMask ? `?${updateMask}` : ''}`;
        return this.request(suffix, { method: 'PATCH', body: JSON.stringify({ fields: this.dataToFields(data) }) });
    }
    async query(collection, where, options = {}) {
        const structuredQuery = {
            from: [{ collectionId: collection }],
            limit: options.limit || 100,
        };
        if (where) {
            structuredQuery.where = {
                fieldFilter: {
                    field: { fieldPath: where.field },
                    op: where.op || 'EQUAL',
                    value: toFirestoreValue(where.value),
                },
            };
        }
        if (options.orderBy) {
            structuredQuery.orderBy = [{ field: { fieldPath: options.orderBy }, direction: options.direction || 'ASCENDING' }];
        }
        const url = new URL(`${this.baseUrl}:runQuery`);
        if (this.apiKey)
            url.searchParams.set('key', this.apiKey);
        const token = await this.getAccessToken();
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                ...(token ? { authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ structuredQuery }),
        });
        if (!response.ok)
            throw new Error(`Firestore query error ${response.status}: ${await response.text()}`);
        const rows = await response.json();
        return rows.map((row) => row.document ? this.documentToData(row.document) : undefined).filter(Boolean);
    }
    dataToFields(data) {
        return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, toFirestoreValue(value)]));
    }
    documentToData(doc) {
        const id = String(doc.name || '').split('/').pop();
        return { _id: id, ...fromFirestoreFields(doc.fields || {}) };
    }
}

export async function verifyFirebaseIdToken(idToken) {
    if (!idToken || typeof idToken !== 'string') {
        throw new Error('Firebase ID token is required');
    }
    const apiKey = process.env.FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey;
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.users?.[0]) {
        throw new Error(data.error?.message || 'Invalid Firebase ID token');
    }
    const firebaseUser = data.users[0];
    return {
        uid: firebaseUser.localId,
        email: firebaseUser.email || '',
        emailVerified: Boolean(firebaseUser.emailVerified),
        displayName: firebaseUser.displayName || firebaseUser.email || '',
        photoURL: firebaseUser.photoUrl || '',
        providerUserInfo: firebaseUser.providerUserInfo || [],
    };
}

export const connectDB = async () => {
    if (attemptedInit && firestore)
        return firestore;
    attemptedInit = true;
    try {
        const serviceAccount = parseServiceAccount();
        const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount?.project_id || DEFAULT_FIREBASE_CONFIG.projectId;
        const apiKey = process.env.FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey;
        const databaseId = process.env.FIRESTORE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID || DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId;
        if (!projectId || (!apiKey && !serviceAccount)) {
            console.warn('Firebase credentials not found. Using in-memory storage fallback.');
            return undefined;
        }
        firestore = new FirestoreRestClient({ projectId, apiKey, serviceAccount, databaseId });
        console.log('Firebase Firestore REST client configured successfully');
        return firestore;
    }
    catch (error) {
        console.error('Firebase connection error:', error);
        console.warn('Continuing with in-memory storage fallback for development');
        firestore = undefined;
        return undefined;
    }
};
export const getFirestore = () => firestore;
export default { connectDB, getFirestore };
