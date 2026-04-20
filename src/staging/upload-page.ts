const uploadPageHtml = (baseUrl: string): string => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fakturoid MCP - File Upload</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; color: #333; }
    h1 { font-size: 1.4rem; margin-bottom: 8px; }
    p.subtitle { color: #666; margin-bottom: 24px; font-size: 0.9rem; }
    .drop-zone { border: 2px dashed #ccc; border-radius: 8px; padding: 48px 24px; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
    .drop-zone:hover, .drop-zone.dragover { border-color: #4a90d9; background: #f0f6ff; }
    .drop-zone input { display: none; }
    .drop-zone p { color: #666; margin-bottom: 8px; }
    .drop-zone .browse { color: #4a90d9; text-decoration: underline; cursor: pointer; }
    .result { margin-top: 24px; padding: 16px; border-radius: 8px; display: none; }
    .result.success { background: #e8f5e9; border: 1px solid #a5d6a7; display: block; }
    .result.error { background: #fce4ec; border: 1px solid #ef9a9a; display: block; }
    .ref-id { font-family: monospace; font-size: 1.1rem; font-weight: bold; user-select: all; }
    .copy-btn { margin-top: 8px; padding: 6px 16px; background: #4a90d9; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
    .copy-btn:hover { background: #3a7bc8; }
    .info { margin-top: 8px; font-size: 0.8rem; color: #666; }
    .spinner { display: none; margin-top: 16px; text-align: center; color: #666; }
  </style>
</head>
<body>
  <h1>Fakturoid MCP - File Upload</h1>
  <p class="subtitle">Upload a file to get a reference ID. Give the reference ID to your AI assistant.</p>

  <div class="drop-zone" id="dropZone">
    <p>Drag and drop a file here</p>
    <p>or <span class="browse" id="browseBtn">browse files</span></p>
    <p style="margin-top: 12px; font-size: 0.8rem; color: #999;">PDF, PNG, JPEG, GIF, XML - max 10MB</p>
    <input type="file" id="fileInput" accept=".pdf,.png,.jpg,.jpeg,.gif,.xml">
  </div>

  <div class="spinner" id="spinner">Uploading...</div>

  <div class="result" id="result">
    <p id="resultMessage"></p>
    <p class="ref-id" id="refId"></p>
    <button class="copy-btn" id="copyBtn" style="display:none;">Copy reference ID</button>
    <p class="info" id="fileInfo"></p>
  </div>

  <script>
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const browseBtn = document.getElementById("browseBtn");
    const spinner = document.getElementById("spinner");
    const result = document.getElementById("result");
    const resultMessage = document.getElementById("resultMessage");
    const refIdEl = document.getElementById("refId");
    const copyBtn = document.getElementById("copyBtn");
    const fileInfo = document.getElementById("fileInfo");

    browseBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => { if (e.target.files[0]) uploadFile(e.target.files[0]); });

    dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
    });

    async function uploadFile(file) {
      spinner.style.display = "block";
      result.className = "result";
      resultMessage.textContent = "";
      refIdEl.textContent = "";
      copyBtn.style.display = "none";
      fileInfo.textContent = "";

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("${baseUrl}/upload", { method: "POST", body: formData });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        resultMessage.textContent = "File uploaded successfully!";
        refIdEl.textContent = data.file_ref;
        copyBtn.style.display = "inline-block";
        copyBtn.onclick = () => navigator.clipboard.writeText(data.file_ref);
        fileInfo.textContent = data.filename + " (" + (data.size / 1024).toFixed(1) + " KB) - expires in " + data.expires_in_seconds + "s";
        result.className = "result success";
      } catch (err) {
        resultMessage.textContent = "Error: " + err.message;
        result.className = "result error";
      } finally {
        spinner.style.display = "none";
        fileInput.value = "";
      }
    }
  </script>
</body>
</html>`;

export { uploadPageHtml };
