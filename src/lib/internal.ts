export class OAuthManager {
    public authenticated = false;

    public internalGenerateRoute: string;

    private authWindow: WindowProxy | null = null;
    private pollTime: number;
    private listeners: {};
    private remoteUri: string | undefined;

    constructor(apiRoute?: string, polltime?: number) {
        this.internalGenerateRoute = apiRoute || '/api/login';
        this.pollTime = polltime || 250;
        this.listeners = {};
    };

    static poll(ms: number) {
        return new Promise<'POLL'>((resolve) =>
            window.setTimeout(() => resolve('POLL'), ms),
        );
    }

    async setAuth(state: boolean) {
        this.authenticated = state;
    }

    async generateRemoteUri(methodOverride?: string) {
        const response = await fetch(this.internalGenerateRoute, {
            method: methodOverride || 'GET'
        });

        const body = await response.json();
	    if (!response.ok) {
	    	console.error('[!] OAuth2 login failed: ', body);

	    	// TODO: other handler stuff ...
	    	return 'URI_GEN_FAIL';
	    };

        this.remoteUri = body.message;
        return 'URI_GEN_OKAY';
    }

    async runRemoteOAuth(client: Window) {
        if (!this.remoteUri) return;
        const opts = 'width=550,height=800';
        this.authWindow = window.open(this.remoteUri, '_window', opts);
    }

    async flowComplete(client: Window) {
        await OAuthManager.poll(this.pollTime);
    }
}

const generateOauth = async () => {

    const manager = new OAuthManager();
    const uriOkay = await manager.generateRemoteUri();

    if (uriOkay === 'URI_GEN_OKAY') {
        const oauthOkay = await manager.runRemoteOAuth(window);
    }

    return;
};

export { generateOauth };
