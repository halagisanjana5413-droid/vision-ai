document.addEventListener("DOMContentLoaded", loadHomePage);

async function loadHomePage() {
    try {
        const response = await fetch("/api/reports");

        if (!response.ok) {
            throw new Error("Could not load reports");
        }

        const reports = await response.json();

        document.getElementById("total-reports").textContent =
            reports.length;

        document.getElementById("cleaned-reports").textContent =
            reports.filter(report => report.status === "Cleaned").length;

        document.getElementById("pending-reports").textContent =
            reports.filter(report => report.status !== "Cleaned").length;

        createMap(reports);
    } catch (error) {
        console.error("Home page error:", error);
    }
}

function createMap(reports) {
    const mapElement = document.getElementById("map");

    if (!mapElement || typeof L === "undefined") {
        return;
    }

    const map = L.map("map").setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    reports.forEach(report => {
        const latitude = Number(report.latitude);
        const longitude = Number(report.longitude);

        if (
            report.latitude !== null &&
            report.latitude !== "" &&
            report.longitude !== null &&
            report.longitude !== "" &&
            Number.isFinite(latitude) &&
            Number.isFinite(longitude) &&
            latitude >= -90 &&
            latitude <= 90 &&
            longitude >= -180 &&
            longitude <= 180
        ) {
            const popup = document.createElement("div");
            const heading = document.createElement("strong");
            const location = document.createElement("div");
            const status = document.createElement("div");

            heading.textContent = `Report #${report.id}`;
            location.textContent = report.location || "Unknown location";
            status.textContent = `Status: ${report.status}`;

            popup.append(heading, location, status);

            L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup(popup);
        }
    });
}