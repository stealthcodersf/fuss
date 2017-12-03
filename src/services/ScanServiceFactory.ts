import ScanService from "./ScanService";
import { AntiViruses } from "./../models/AntiVirusTier";
import ClamAVScanService from "./ClamAVScanService";
import AvastScanService from "./AvastScanService";
import KasperskyScanService from "./KasperskyScanService";

export default class ScanServiceFactory {

    static getScanService(antiVirus: string): ScanService {
        switch (antiVirus) {
            case AntiViruses.ClamAV :
                return new ClamAVScanService();
            case AntiViruses.Avast :
                return new AvastScanService();
            case AntiViruses.Kaspersky :
                return new KasperskyScanService();
            default :
                throw new Error(`Unsupported anti virus type ${antiVirus}`);
        }
    }
}