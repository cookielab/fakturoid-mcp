import { AuthenticationStrategy } from "../../src/auth/strategy";

class TestStrategy extends AuthenticationStrategy<{}> {
	constructor() {
		super({}, "TestApp", "https://test.example");
	}

	getContactEmail(): Promise<string> | string {
		return "test@example.com";
	}

	async getHeaders(headers: Record<string, string> | Headers): Promise<Headers> {
		const initEntries = headers instanceof Headers ? Object.fromEntries(headers.entries()) : headers;

		return new Headers({
			...initEntries,
			Authorization: `Bearer ${await this.getAccessToken()}`,
		});
	}

	getAccessToken(): Promise<string> {
		return Promise.resolve("test-token");
	}

	refreshToken(): Promise<string> {
		return Promise.resolve("test-token");
	}
}

export { TestStrategy };
