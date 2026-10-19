const reportForm = document.getElementById("report-form");
const resultBox = document.getElementById("result");
const submitButton = document.getElementById("submit-btn");

reportForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    resultBox.textContent = "";
    resultBox.className = "";

    const photo = document.getElementById("photo").files[0];

    if (!photo) {
        showMessage("Please select a photograph.", true);
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(photo.type)) {
        showMessage("Please upload a JPG, PNG or WebP image.", true);
        return;
    }

    if (photo.size > 5 * 1024 * 1024) {
        showMessage("The image must be smaller than 5 MB.", true);
        return;
    }

    const formData = new FormData(reportForm);

    submitButton.disabled = true;
    submitButton.textContent = "Analyzing photograph...";

    try {
        const response = await fetch("/api/reports", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to submit report.");
        }

        const detections = Array.isArray(data.detections)
            ? data.detections
            : [];

        const message = document.createElement("div");

        const heading = document.createElement("h3");
        heading.textContent = `Report #${data.id} submitted successfully!`;

        const priority = document.createElement("p");
        priority.textContent = `Priority: ${data.priority}`;

        const detectionText = document.createElement("p");

        if (detections.length > 0) {
            detectionText.textContent =
                "AI results: " +
                detections.map(item => {
                    const confidence = Number(item.confidence || 0);
                    return `${item.label} (${Math.round(confidence * 100)}%)`;
                }).join(", ");
        } else {
            detectionText.textContent =
                "No supported objects were detected. Manual review may be needed.";
        }

        message.append(heading, priority, detectionText);

        resultBox.className = "message";
        resultBox.replaceChildren(message);

        reportForm.reset();
    } catch (error) {
        showMessage(error.message, true);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "🤖 Analyze & Submit Report";
    }
});

function showMessage(message, isError) {
    resultBox.textContent = message;
    resultBox.className = isError ? "message error" : "message";
}