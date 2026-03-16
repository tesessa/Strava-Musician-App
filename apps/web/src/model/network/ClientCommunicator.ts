export class ClientCommunicator {
    private SERVER_URL: string;

    public constructor(SERVER_URL: string) {
        this.SERVER_URL = SERVER_URL;
    }

    public async post<REQ, RES>(
        req: REQ | undefined,
        endpoint: string,
        headers?: Headers
    ): Promise<RES> {
        return this.doRequest<REQ,RES>("POST", endpoint, req, headers);
    }

    public async get<RES>(
        endpoint: string,
        headers?: Headers
    ): Promise<RES> {
        return this.doRequest<undefined, RES>("GET", endpoint, undefined, headers);
    }

    public async put<REQ, RES>(
        req: REQ | undefined,
        endpoint: string,
        headers?: Headers
    ): Promise<RES> {
        return this.doRequest<REQ,RES>("PUT", endpoint, req, headers);
    }

    public async delete<RES>(
        endpoint: string,
        headers?: Headers
    ): Promise<RES> {
        return this.doRequest<undefined, RES>("DELETE", endpoint, undefined, headers);
    }

    private async doRequest<REQ, RES>(
        method: string,
        endpoint: string,
        req?: REQ,
        headers?: Headers
    ): Promise<RES> {
        if (headers && req) {
            headers.append("Content-type", "application/json");
        } else if (req) {
            headers = new Headers({
                "Content-type": "application/json",
            });
        } else if (!headers) {
            headers = new Headers();
        }

        const url = this.getUrl(endpoint);
        const params = this.getParams(method, headers, req ? JSON.stringify(req): undefined);
        console.log(`[ClientCommunicator] ${method} ${url}`);
        if (req) {
            console.log(`[ClientCommunicator] Request body:`, req);
        }


        try {
            const resp: Response = await fetch(url, params);

            console.log(`[ClientCommunicator] Response status: ${resp.status}`);

            if (resp.ok) {
                const contentType = resp.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const response: RES = await resp.json();
                    return response;
                } else {
                    return {} as RES;
                }
            } else {
                let errorMessage = `HTTP ${resp.status}: ${resp.statusText}`;
                try {
                    const error = await resp.json();
                    errorMessage = error.errorMessage || error.message || errorMessage;
                } catch {
            
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error(`[ClientCommunicator] ${method} failed:`, error);
            throw new Error(
                `Client communicator ${method} failed: ${(error as Error).message} with req ${req}`
            );
        }
    }

    private getUrl(endpoint: string) {
        return this.SERVER_URL + endpoint;
    }

    private getParams(
        method: string,
        headers?: Headers,
        body?: BodyInit
    ): RequestInit {
        const params: RequestInit = { 
            method: method,
        };

        if (headers) {
            params.headers = headers;
        }

        if (body) {
            params.body = body;
        }

        return params;
    }
}