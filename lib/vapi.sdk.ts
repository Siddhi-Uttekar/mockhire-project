import Vapi from "@vapi-ai/web";

// Redirect any requests made by the @vapi-ai/web SDK from
// https://api.vapi.ai/... -> /api/vapi-proxy/..., so the browser
// talks to our Next.js backend (same-origin) and avoids CORS issues.
if (typeof window !== "undefined") {
	const origFetch = window.fetch.bind(window);
	// Patch fetch to rewrite requests to api.vapi.ai to our proxy
	window.fetch = async (input: URL | RequestInfo, init?: RequestInit) => {
		try {
			const url = typeof input === "string" ? input : (input as Request).url;
			if (url.startsWith("https://api.vapi.ai")) {
				const proxied = "/api/vapi-proxy" + url.replace("https://api.vapi.ai", "");
				return origFetch(proxied, init as RequestInit);
			}
			return origFetch(input, init);
		} catch {
				return origFetch(input, init);
			}
	};
}

export const vapi = new Vapi(process.env.VAPI_PUBLIC_KEY!);
