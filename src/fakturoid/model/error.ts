import { z } from "zod/v4";

const InvalidDataErrorSchema = z.object({
	errors: z.record(z.string().readonly(), z.array(z.string().readonly()).readonly()).readonly(),
});

const GeneralErrorSchema = z.object({
	error: z.string().readonly(),
	error_description: z.string().readonly(),
});

const APIErrorSchema = z.union([InvalidDataErrorSchema, GeneralErrorSchema]);

type APIError = z.infer<typeof APIErrorSchema>;
type InvalidDataError = z.infer<typeof InvalidDataErrorSchema>;
type GeneralError = z.infer<typeof GeneralErrorSchema>;

export { APIErrorSchema };
export type { APIError, InvalidDataError, GeneralError };
