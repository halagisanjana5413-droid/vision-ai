const reportsList = document.getElementById("reports-list");
const dashboardMessage = document.getElementById("dashboard-message");

document.getElementById("refresh-btn").addEventListener(
    "click",
    loadReports
);

async function loadReports() {
    reportsList.textContent = "Loading reports...";

    try {
        const response = await fetch("/api/reports");

        if (!response.ok) {
            throw new Error("Unable to load reports.");
        }

        const reports = await response.json();

        reportsList.replaceChildren();

        if (reports.length === 0) {
            reportsList.textContent =
                "No reports yet. Submit your first litter report!";
            return;
        }

        reports.forEach(report => {
            const card = document.createElement("article");
            card.className = "report-card";

            const image = document.createElement("img");
            image.src = report.image_url;
            image.alt = "Litter report photograph";
            image.loading = "lazy";

            const title = document.createElement("h3");
            title.textContent = `Report #${report.id}`;

            const location = document.createElement("p");
            location.textContent =
                `📍 ${report.location || "Location not provided"}`;

            const description = document.createElement("p");
            description.textContent =
                report.description || "No description provided.";

            const priority = document.createElement("p");
            priority.textContent = `Priority: ${report.priority}`;

            const statusBadge = document.createElement("span");
            statusBadge.className = "badge";

            if (report.status === "Cleaned") {
                statusBadge.classList.add("cleaned");
            } else if (report.status === "In Progress") {
                statusBadge.classList.add("progress");
            }

            statusBadge.textContent = report.status;

            const statusSelect = document.createElement("select");

            ["Pending", "In Progress", "Cleaned"].forEach(status => {
                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;
                option.selected = status === report.status;
                statusSelect.appendChild(option);
            });

            const updateButton = document.createElement("button");
            updateButton.className = "button-small";
            updateButton.textContent = "Update Status";

            updateButton.addEventListener("click", () => {
                updateStatus(report.id, statusSelect.value);
            });

            const cleanupHeading = document.createElement("p");
            cleanupHeading.textContent = "After-cleanup photograph:";

            const cleanupInput = document.createElement("input");
            cleanupInput.type = "file";
            cleanupInput.accept = "image/jpeg,image/png,image/webp";
            cleanupInput.setAttribute("aria-label", "After-cleanup photo");

            const uploadButton = document.createElement("button");
            uploadButton.className = "button-small";
            uploadButton.textContent = "Upload Evidence";

            uploadButton.addEventListener("click", () => {
                uploadCleanup(report.id, cleanupInput.files[0]);
            });

            card.append(
                image,
                title,
                location,
                description,
                priority,
                statusBadge,
                document.createElement("br"),
                statusSelect,
                updateButton,
                cleanupHeading,
                cleanupInput,
                uploadButton
            );

            if (report.cleanup_image_url) {
                const evidenceHeading = document.createElement("h4");
                evidenceHeading.textContent = "Cleanup Evidence";

                const evidenceImage = document.createElement("img");
                evidenceImage.src = report.cleanup_image_url;
                evidenceImage.alt = "After-cleanup evidence";
                evidenceImage.loading = "lazy";

                card.append(evidenceHeading, evidenceImage);
            }

            reportsList.appendChild(card);
        });
    } catch (error) {
        reportsList.textContent = error.message;
    }
}

async function updateStatus(id, status) {
    try {
        const response = await fetch(`/api/reports/${id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Could not update status.");
        }

        showMessage(`Report #${id} status updated.`);
        await loadReports();
    } catch (error) {
        showMessage(error.message, true);
    }
}

async function uploadCleanup(id, photo) {
    if (!photo) {
        showMessage("Please select an after-cleanup photograph.", true);
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(photo.type)) {
        showMessage("Please use JPG, PNG or WebP format.", true);
        return;
    }

    if (photo.size > 5 * 1024 * 1024) {
        showMessage("The photograph must be smaller than 5 MB.", true);
        return;
    }

    const formData = new FormData();
    formData.append("photo", photo);

    try {
        const response = await fetch(
            `/api/reports/${id}/cleanup`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Could not upload evidence.");
        }

        showMessage(`Cleanup evidence saved for report #${id}.`);
        await loadReports();
    } catch (error) {
        showMessage(error.message, true);
    }
}

function showMessage(message, isError = false) {
    dashboardMessage.textContent = message;
    dashboardMessage.className = isError ? "message error" : "message";
}

loadReports();