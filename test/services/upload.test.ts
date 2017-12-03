import {} from "jest";
import * as sinon from "sinon";
import UploadService from "../../src/services/UploadService";
import Application, {ApplicationModel} from "../../src/models/Application";
import {File} from "multiparty";
import ScanResult, {ScanResultModel} from "../../src/models/ScanResult";
import AntiVirusTier, { AntiVirusTierModel } from "../../src/models/AntiVirusTier";
import ClamAVScanService from "../../src/services/ClamAVScanService";

describe("Upload Service tests", () => {

    describe("createScanResults() tests", () => {
        it("createScanResults() with no files should yield an error", () => {
            const uploadService: UploadService = new UploadService("123456789", []);
            expect.assertions(1);
            return uploadService.createScanResults().catch((err: Error) => {
                expect(err.message).toMatch("No files specified for scanning");
            });
        });

        it("createScanResults() with an invalid application id should yield an error", () => {
            sinon.stub(Application, "findById").resolves();
            const file: File = {fieldName: "upload", originalFileName: "Test.txt", path: "/tmp/fuss/Test.txt", size: 372, headers: {}};
            const uploadService: UploadService = new UploadService("5a125ed3cfdbd43a8c42a83e", [file]);
            expect.assertions(1);
            return uploadService.createScanResults().catch((err: Error) => {
                expect(err.message).toMatch("Application config for app id 5a125ed3cfdbd43a8c42a83e not found");
            });
        });

        it("createScanResults() with a valid application and files works", () => {
            const application: ApplicationModel = new Application({
                _id: "123456789",
                name: "Test Application"
            });
            sinon.stub(Application, "findById").resolves(application);
            const file: File = {fieldName: "upload", originalFileName: "Test.txt", path: "/tmp/fuss/Test.txt", size: 372, headers: {}};
            const uploadService: UploadService = new UploadService("123456789", [file]);
            const scanResult = new ScanResult({
                application: application,
                fileName: file.path,
                originalFileName: file.originalFileName,
                fileSize: file.size,
                scans: [],
                quarantined: false,
                forwarded: false,
                processingErrors: []
            });
            sinon.stub(ScanResult, "create").resolves([scanResult]);
            expect.assertions(2);
            return uploadService.createScanResults().then((scanResults: ScanResultModel[]) => {
                expect(scanResults).toHaveLength(1);
                expect(scanResults[0]).toEqual(scanResult);
            });
        });

        afterEach( () => {
            try {
                Application.findById.restore();
                ScanResult.create.restore();
            } catch (err) {
                // Do nothing
            }
        });
    });

    describe("scanFiles() tests", () => {
       it("scanFiles() with invalid input", () => {
          const uploadService = new UploadService("123456789", []);
          expect.assertions(1);
          return uploadService.scanFiles(undefined).catch((err) => {
              expect(err.message).toMatch("Invalid input to scan files function");
          });
       });

       it("scanFiles() with valid input should update scan results", () => {
           const file: File = {fieldName: "upload", originalFileName: "Test.txt", path: "/tmp/fuss/Test.txt", size: 372, headers: {}};
           const uploadService: UploadService = new UploadService("123456789", [file]);
           const scanResult = new ScanResult({
               application: {
                   _id: "123456789",
                   name: "Test Application"
               },
               fileName: file.path,
               originalFileName: file.originalFileName,
               fileSize: file.size,
               scans: [],
               quarantined: false,
               forwarded: false,
               processingErrors: []
           });
           const antiViruses: AntiVirusTierModel = new AntiVirusTier({
                antiViruses: ["ClamAV"]
           });
           sinon.stub(UploadService.prototype, "getAntiVirusTier").resolves(antiViruses);
           const fileName: string = "/tmp/fuss/Test.txt";
           const args = {};
           args[fileName] = false;
           sinon.stub(ClamAVScanService.prototype, "scanFiles").yields(undefined, args);
           expect.assertions(4);
           return uploadService.scanFiles([scanResult]).then((scanResults: ScanResultModel[]) => {
              expect(scanResults).toHaveLength(1);
              expect(scanResults[0].scans).toHaveLength(1);
              expect(scanResults[0].scans[0].av).toEqual("ClamAV");
              expect(scanResults[0].scans[0].result).toEqual(false);
           });
       });

       afterEach(() => {
            try {
                UploadService.prototype.getAntiVirusTier.restore();
                ClamAVScanService.prototype.scanFiles.restore();
            } catch (err) {
                // Do nothing
            }
       });
    });
});