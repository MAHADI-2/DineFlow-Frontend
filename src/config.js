const configuredBackendUrl = import.meta.env.VITE_API_URL?.trim();
const developmentBackendUrl = `http://${window.location.hostname}:4000`;

export const BACKEND_URL = (configuredBackendUrl || developmentBackendUrl).replace(/\/+$/, "");
