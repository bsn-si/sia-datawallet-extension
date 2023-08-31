import {CONFIG} from "~/env";
export const FILE_URL = self.location.origin + "/dist/popup/file";
export const encoder = new TextEncoder();
export const decoder = new TextDecoder();
export const sigCodes = {
    v1: "Encrypted Using Hat.sh",
    v2_symmetric: CONFIG.SIG_V2_SYMMETRIC,
    v2_asymmetric: CONFIG.SIG_V2_ASYMMETRIC,
};
