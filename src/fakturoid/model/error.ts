import { z } from "zod/v3";

const InvalidDataErrorSchema = z.object({
	errors: z.record(z.string(), z.array(z.string())),
});

const GeneralErrorSchema = z.object({
	error: z.string(),
	error_description: z.string(),
});

const APIErrorSchema = z.union([InvalidDataErrorSchema, GeneralErrorSchema]);

type APIError = z.infer<typeof APIErrorSchema>;
type InvalidDataError = z.infer<typeof InvalidDataErrorSchema>;
type GeneralError = z.infer<typeof GeneralErrorSchema>;

export { APIErrorSchema };
export type { APIError, InvalidDataError, GeneralError };
