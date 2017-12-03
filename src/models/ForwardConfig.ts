import * as mongoose from "mongoose";

export type ForwardConfigModel = mongoose.Document & {
    configName: string,
    type: ForwardConfigType,
    s3Config?: {
        accessKeyId: string,
        secretAccessKey: string,
        bucket: string
    },
    dropboxConfig?: {
        accessToken: string,
        folder: string
    },
    ftpConfig?: {
        host: string,
        username: string,
        password: string,
        path: string
    },
    httpConfig?: {
        uri: string,
        authScheme: AuthSchemeType,
        basicAuth?: {
            username: string,
            password: string
        },
        oAuth?: {
            clientId: string,
            clientSecret: string,
            tokenGenURI: string,
            tokenGenMethod: string
        }
    }
};

export enum ForwardConfigType {
    S3 = "S3", DROPBOX = "DROPBOX", FTP = "FTP", HTTP = "HTTP"
}

enum AuthSchemeType {
    BASIC = "BASIC", OAUTH = "OAUTH"
}

const forwardConfigSchema = new mongoose.Schema({
    configName: String,
    type: String,
    s3Config: {
        accessKeyId: String,
        secretAccessKey: String,
        bucket: String
    },
    dropboxConfig: {
        accessToken: String,
        folder: String
    },
    ftpConfig: {
        host: String,
        username: String,
        password: String,
        path: String
    },
    httpConfig: {
        uri: String,
        authScheme: String,
        basicAuth: {
            username: String,
            password: String
        },
        oAuth: {
            clientId: String,
            clientSecret: String,
            tokenGenURI: String,
            tokenGenMethod: String
        }
    }
}, { timestamps: true });

const ForwardConfig = mongoose.model<ForwardConfigModel>("ForwardConfig", forwardConfigSchema);
export default ForwardConfig;