export default interface ScanService {
    scanFiles(files: string[], callback: Function): void;
}