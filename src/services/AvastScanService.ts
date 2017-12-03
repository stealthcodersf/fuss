import ScanService from "./ScanService";

export default class AvastScanService implements ScanService {

    scanFiles(files: string[], callback: Function): void {
        const results: any = {};
        for (let i = 0; i < files.length; i++) {
            results[files[i]] = false;
        }
        callback(undefined, results);
    }
}