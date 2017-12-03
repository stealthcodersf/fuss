import ScanService from "./ScanService";
import * as clamscan from "clamscan";

export default class ClamAVScanService implements ScanService {

    private clamOptions: any = {
        clamscan: {
            path: "/usr/local/bin/clamscan",
            scan_archives: true,
            db: undefined,
            active: true
        },
        clamdscan: {
            path: "/usr/local/bin/clamdscan",
            config_file: "/usr/local/etc/clamav/clamd.conf",
            multiscan: true,
            reload_db: false,
            active: true
        }
    };

    scanFiles(files: string[], callback: Function): void {
        const clam = clamscan(this.clamOptions);
        const results: any = {};
        clam.scan_files(files, (err: Error) => {
            if (err) callback(err);
            else callback(undefined, results);
        }, (err: Error, file: string, result: boolean) => {
            if (err) results[file] = true;
            else results[file] = result;
        });
    }
}