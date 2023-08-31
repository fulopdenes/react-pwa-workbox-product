// const URL = `https://api.slingacademy.com/v1/sample-data/products?offset=5&limit=20`
const URL_INCOMING_MATERIALS = `http://localhost:8080/products/allWithoutHandoverStatus`
const URL_RECEIVED_MATERIALS = `http://localhost:8080/products/allWithHandoverStatus`
const URL_RESET = `http://localhost:8080/products/setAllStoreByAndHandoverStatusToNull`

export const getAllIncomingProductList = async () => {
    try {
        const res = await fetch(URL_INCOMING_MATERIALS);

        if (!res.ok) {
            new Error(`GET request failed with status: ${res.status}`);
        }

        return { success: true, data: await res.json() };
    } catch (error) {
        console.error(`GET getAllIncomingProductList error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

export const getAllReceivedProductList = async () => {
    try {
        const res = await fetch(URL_RECEIVED_MATERIALS);

        if (!res.ok) {
            new Error(`GET request failed with status: ${res.status}`);
        }

        return { success: true, data: await res.json() };
    } catch (error) {
        console.error(`GET getAllReceivedProductList error: ${error.message}`);
        return { success: false, error: error.message };
    }
}
export const resetDatabase = async () => {
    try {
        const res = await fetch(URL_RESET);

        if (!res.ok) {
            new Error(`RESET request failed with status: ${res.status}`);
        }

        return { success: true };
    } catch (error) {
        console.error(`RESET database error: ${error.message}`);
        return { success: false, error: error.message };
    }
}