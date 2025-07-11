abstract class AuthenticationStrategy<Configuration extends object = object> {
	protected readonly configuration: Configuration;
	readonly appName: string;
	readonly apiURL: string;

	constructor(configuration: Configuration, appName: string, apiURL: string) {
		this.configuration = configuration;
		this.appName = appName;
		this.apiURL = apiURL;
	}

	abstract getContactEmail(): Promise<string> | string;
	abstract getHeaders(headers: Record<string, string> | Headers): Promise<Headers>;
	abstract getAccessToken(): Promise<string>;
	abstract refreshToken(): Promise<string>;
}

export { AuthenticationStrategy };
