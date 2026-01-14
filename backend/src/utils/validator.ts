export function isValidUrl(url: string): boolean {
    try{
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch (err) {
        return false;
    }
}