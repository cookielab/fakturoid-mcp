import type { InboxFile } from "../../src/fakturoid/model/inboxFile";
import { copycat, type Input } from "@snaplet/copycat";

const createInboxFile = (seed: Input, initial: Partial<InboxFile> = {}): InboxFile => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });
	const updatedDate = copycat.dateString(`${seed}_updated`, { min: baseDate });

	const sendToOcr = copycat.bool(`${seed}_send_to_ocr`);
	const ocrStatuses = ["created", "processing", "processing_failed", "processing_rejected", "processed"] as const;
	const hasOcrStatus = sendToOcr && copycat.bool(`${seed}_has_ocr_status`);
	const ocrStatus = hasOcrStatus ? copycat.oneOf(`${seed}_ocr_status`, [...ocrStatuses]) : null;

	const sentToOcrDate = sendToOcr ? copycat.dateString(`${seed}_sent_to_ocr`, { min: baseDate }) : null;
	const ocrCompletedDate =
		ocrStatus === "processed" ? copycat.dateString(`${seed}_ocr_completed`, { min: sentToOcrDate || baseDate }) : null;

	const fileExtensions = ["pdf", "jpg", "jpeg", "png", "tiff", "tif", "gif", "bmp", "webp"] as const;
	const fileTypes = [
		"invoice",
		"receipt",
		"expense_document",
		"contract",
		"delivery_note",
		"purchase_order",
		"payment_slip",
		"tax_document",
		"bank_statement",
		"other_document",
	] as const;

	const extension = copycat.oneOf(`${seed}_extension`, [...fileExtensions]);
	const fileType = copycat.oneOf(`${seed}_file_type`, [...fileTypes]);
	const filename = `${fileType}_${copycat.uuid(`${seed}_filename`).slice(0, 8)}.${extension}`;

	// Calculate realistic file size based on extension
	let minSize: number;
	let maxSize: number;
	if (extension === "pdf") {
		minSize = 50_000; // 50KB
		maxSize = 5_000_000; // 5MB
	} else if (["jpg", "jpeg", "png", "webp"].includes(extension)) {
		minSize = 100_000; // 100KB
		maxSize = 10_000_000; // 10MB
	} else if (["tiff", "tif", "bmp"].includes(extension)) {
		minSize = 500_000; // 500KB
		maxSize = 20_000_000; // 20MB
	} else {
		// gif
		minSize = 50_000; // 50KB
		maxSize = 2_000_000; // 2MB
	}

	const bytesize = copycat.int(`${seed}_bytesize`, { min: minSize, max: maxSize });

	return {
		bytesize: bytesize,
		created_at: baseDate,
		download_url: copycat.url(`${seed}_download_url`),
		filename: filename,
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		ocr_completed_at: ocrCompletedDate,
		ocr_status: ocrStatus,
		send_to_ocr: sendToOcr,
		sent_to_ocr_at: sentToOcrDate,
		updated_at: updatedDate,

		...initial,
	};
};

export { createInboxFile };
