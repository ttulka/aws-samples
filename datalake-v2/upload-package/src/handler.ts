import {APIGatewayEvent} from 'aws-lambda';

import {UploadRequest, UploadResponse} from './package-upload.d';
import {PackageUpload} from './package-upload';
import {DlPackageTags} from './tagging/package-tags';
import {DynamoDB, Lambda, S3} from 'aws-sdk';
import {DynamoPackageEntries} from './package-entry/package-entry';
import {S3PackageStorage} from './storage/package-storage';

const dynamo = new DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const lambda = new Lambda({apiVersion: '2015-03-31'});
const s3 = new S3({apiVersion: '2006-03-01', signatureVersion: 'v4'});

export async function handle(request: any) {
    console.log('REQUEST', JSON.stringify(request));
    try {
        validateEnvVariables();

        return request.httpMethod
            ? await apiGatewayResponse(packageUpload(), request)
            : await invocationResponse(packageUpload(), request);

    } catch (err) {
        console.error('ERROR', err);
        throw err;
    }
}

function packageUpload() {
    return new PackageUpload(process.env.PACKAGE_TABLE, process.env.KMS_KEY_ID,
        new DynamoPackageEntries(process.env.PACKAGE_TABLE, process.env.S3_BUCKET, dynamo),
        new DlPackageTags(process.env.TAGGING_LAMBDA, lambda),
        new S3PackageStorage(s3)
    );
}

async function invocationResponse(upload: PackageUpload, request: UploadRequest): Promise<UploadResponse> {
    return await upload.response(request);
}

async function apiGatewayResponse(upload: PackageUpload, event: APIGatewayEvent): Promise<HttpResponse> {
    try {
        const response = await upload.response(uploadRequest(event));
        return httpResponse(200, response);

    } catch (err) {
        return httpResponse(400, err.message);
    }
}

function uploadRequest(event: APIGatewayEvent): UploadRequest {
    return {
        ...JSON.parse(event.body),
        tenantId: event.requestContext && event.requestContext.authorizer && event.requestContext.authorizer.tenantId,
    }
}

function httpResponse(statusCode: number, data: UploadResponse): HttpResponse {
    return {
        isBase64Encoded: false,
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    } as HttpResponse;
}

function validateEnvVariables() {
    if (!process.env.PACKAGE_TABLE) {
        throw new Error('PACKAGE_TABLE environment variable is not defined.');
    }
    if (!process.env.S3_BUCKET) {
        throw new Error('S3_BUCKET environment variable is not defined.');
    }
    if (!process.env.KMS_KEY_ID) {
        throw new Error('KMS_KEY_ID environment variable is not defined.');
    }
    if (!process.env.TAGGING_LAMBDA) {
        throw new Error('TAGGING_LAMBDA environment variable is not defined.');
    }
}

interface HttpResponse {
    statusCode: number,
    headers: { [key: string]: string },
    body?: any,
}